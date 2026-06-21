'use server';

import { db, schema } from '@/src/libs/server/db';
import { getCurrentActor, canViewSystemSettings, canUpdateSystemSettings, canViewSecretSetting, canManageIntegrationSettings, canManageSecuritySettings, canViewAuditLogs, writeAuditLog } from '@/src/libs/server/auth-helper';
import { and, desc, eq, gte, ilike, inArray, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';

const DEFAULT_SETTINGS = [
  // school_info
  { key: 'school_info:name', value: 'Trường Tiểu học & THCS MIS', group: 'school_info', label: 'Tên trường', description: 'Tên chính thức của trường' },
  { key: 'school_info:short_name', value: 'MIS', group: 'school_info', label: 'Tên viết tắt', description: 'Tên viết tắt của trường' },
  { key: 'school_info:code', value: 'MIS-001', group: 'school_info', label: 'Mã trường', description: 'Mã số trường học' },
  { key: 'school_info:logo_url', value: '', group: 'school_info', label: 'Logo trường', description: 'Ảnh logo chính thức của trường' },
  { key: 'school_info:address', value: 'Lô TH2, Khu đô thị mới Dịch Vọng, Cầu Giấy, Hà Nội', group: 'school_info', label: 'Địa chỉ', description: 'Địa chỉ trụ sở chính' },
  { key: 'school_info:hotline_general', value: '024 1234 5678', group: 'school_info', label: 'Hotline chung', description: 'Hotline liên hệ chung' },
  { key: 'school_info:hotline', value: '024 1234 5678', group: 'school_info', label: 'Hotline tuyển sinh', description: 'Hotline hỗ trợ tuyển sinh' },
  { key: 'school_info:email', value: 'info@mis.edu.vn', group: 'school_info', label: 'Email trường', description: 'Hòm thư điện tử chính thức' },
  { key: 'school_info:website', value: 'https://mis.edu.vn', group: 'school_info', label: 'Website', description: 'Trang thông tin điện tử' },
  { key: 'school_info:representative_name', value: 'Thầy PGS.TS. Nguyễn Văn Minh', group: 'school_info', label: 'Người đại diện', description: 'Tên người đại diện pháp luật' },
  { key: 'school_info:representative_title', value: 'Chủ tịch Hội đồng Trường', group: 'school_info', label: 'Chức danh người đại diện', description: 'Chức vụ người đại diện' },
  { key: 'school_info:report_signature_name', value: 'Nguyễn Văn Minh', group: 'school_info', label: 'Chữ ký hiển thị', description: 'Tên chữ ký trên báo cáo' },
  { key: 'school_info:timezone', value: 'Asia/Ho_Chi_Minh', group: 'school_info', label: 'Múi giờ', description: 'Múi giờ mặc định của hệ thống' },
  { key: 'school_info:default_language', value: 'vi', group: 'school_info', label: 'Ngôn ngữ mặc định', description: 'Ngôn ngữ giao diện mặc định' },

  // academics
  { key: 'academics:default_year', value: '2026-2027', group: 'academics', label: 'Năm học mặc định', description: 'Năm học hiện tại hệ thống' },
  { key: 'academics:default_semester', value: 'SEM1', group: 'academics', label: 'Học kỳ mặc định', description: 'Học kỳ hiện tại hệ thống' },
  { key: 'academics:academic_year_start', value: '2026-08-15', group: 'academics', label: 'Ngày bắt đầu năm học', description: 'Thời gian khai giảng' },
  { key: 'academics:academic_year_end', value: '2027-05-31', group: 'academics', label: 'Ngày kết thúc năm học', description: 'Thời gian kết thúc năm học' },
  { key: 'academics:semester_start', value: '2026-08-15', group: 'academics', label: 'Ngày bắt đầu học kỳ', description: 'Thời gian bắt đầu học kỳ hiện tại' },
  { key: 'academics:semester_end', value: '2026-12-31', group: 'academics', label: 'Ngày kết thúc học kỳ', description: 'Thời gian kết thúc học kỳ hiện tại' },
  { key: 'academics:grade_levels', value: 'Lớp 1, Lớp 2, Lớp 3, Lớp 4, Lớp 5, Lớp 6, Lớp 7, Lớp 8, Lớp 9, Lớp 10, Lớp 11, Lớp 12', group: 'academics', label: 'Danh sách khối lớp', description: 'Các khối lớp đang giảng dạy' },
  { key: 'academics:default_max_students', value: '35', group: 'academics', label: 'Sĩ số tối đa mặc định', description: 'Số học sinh tối đa mỗi lớp' },
  { key: 'academics:working_days', value: 'Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6', group: 'academics', label: 'Ngày làm việc trong tuần', description: 'Lịch học tập và làm việc' },
  { key: 'academics:summer_break_start', value: '2026-06-01', group: 'academics', label: 'Bắt đầu nghỉ hè', description: 'Ngày bắt đầu nghỉ hè' },
  { key: 'academics:summer_break_end', value: '2026-08-14', group: 'academics', label: 'Kết thúc nghỉ hè', description: 'Ngày kết thúc nghỉ hè' },
  { key: 'academics:summer_break_note', value: 'Học sinh nghỉ hè từ cuối tháng 5 đến đầu tháng 8.', group: 'academics', label: 'Ghi chú nghỉ hè', description: 'Thông tin thêm về lịch nghỉ hè' },
  { key: 'academics:student_code_rule', value: 'HS[YYYY][XXXX]', group: 'academics', label: 'Quy tắc mã học sinh', description: 'Quy tắc sinh mã học sinh tự động' },
  { key: 'academics:lead_code_rule', value: 'LD-[YYYY]-[XXXX]', group: 'academics', label: 'Quy tắc mã tuyển sinh', description: 'Quy tắc sinh mã hồ sơ tuyển sinh' },

  // email
  { key: 'email:enabled', value: 'false', group: 'email', label: 'Bật gửi email hệ thống', description: 'Bật/tắt toàn bộ chức năng gửi email tự động' },
  { key: 'email:smtp_host', value: '', group: 'email', label: 'SMTP Host', description: 'Địa chỉ máy chủ SMTP (vd: smtp.gmail.com)' },
  { key: 'email:smtp_port', value: '587', group: 'email', label: 'SMTP Port', description: 'Cổng kết nối SMTP (587/465/25)' },
  { key: 'email:smtp_secure', value: 'false', group: 'email', label: 'SMTP Secure (TLS)', description: 'Bật TLS/SSL cho kết nối SMTP' },
  { key: 'email:smtp_user', value: '', group: 'email', label: 'SMTP Username', description: 'Tên đăng nhập tài khoản SMTP' },
  { key: 'email:smtp_password', value: '', group: 'email', label: 'SMTP Password', description: 'Mật khẩu tài khoản SMTP', isSecret: true },
  { key: 'email:from_email', value: '', group: 'email', label: 'Email gửi đi mặc định', description: 'Địa chỉ email hiển thị là người gửi' },
  { key: 'email:from_name', value: 'MIS Smart Portal', group: 'email', label: 'Tên người gửi', description: 'Tên hiển thị trong hộp thư đến' },
  { key: 'email:test_email', value: '', group: 'email', label: 'Email nhận test', description: 'Địa chỉ nhận email kiểm tra kết nối' },

  // email_notifications
  { key: 'email_notifications:on_lead_created', value: 'false', group: 'email_notifications', label: 'Gửi email khi tạo lead', description: 'Gửi email xác nhận khi tiếp nhận hồ sơ tuyển sinh mới' },
  { key: 'email_notifications:on_appointment_booked', value: 'false', group: 'email_notifications', label: 'Gửi email hẹn tư vấn', description: 'Gửi email nhắc lịch hẹn tư vấn cho phụ huynh' },
  { key: 'email_notifications:on_seat_reserved', value: 'false', group: 'email_notifications', label: 'Gửi email đặt chỗ thành công', description: 'Gửi email xác nhận đặt chỗ giữ vị trí' },
  { key: 'email_notifications:on_enrolled', value: 'false', group: 'email_notifications', label: 'Gửi email xác nhận nhập học', description: 'Gửi email chúc mừng và hướng dẫn nhập học' },
  { key: 'email_notifications:on_internal_alert', value: 'false', group: 'email_notifications', label: 'Gửi thông báo nội bộ', description: 'Gửi email thông báo nội bộ quan trọng cho nhân sự' },

  // payment_qr
  { key: 'payment_qr:enabled', value: 'false', group: 'payment_qr', label: 'Bật QR thanh toán tuyển sinh', description: 'Bật/tắt chức năng tạo QR thanh toán cho hồ sơ tuyển sinh' },
  { key: 'payment_qr:bank_name', value: 'Vietcombank', group: 'payment_qr', label: 'Ngân hàng nhận tiền', description: 'Tên ngân hàng của tài khoản nhận thanh toán' },
  { key: 'payment_qr:bank_code', value: 'VCB', group: 'payment_qr', label: 'Mã ngân hàng', description: 'Mã swift/code của ngân hàng' },
  { key: 'payment_qr:bank_bin', value: '970436', group: 'payment_qr', label: 'BIN ngân hàng', description: 'Mã BIN dùng để tạo VietQR (vd: 970436 = Vietcombank)' },
  { key: 'payment_qr:account_number', value: '', group: 'payment_qr', label: 'Số tài khoản', description: 'Số tài khoản ngân hàng nhận thanh toán' },
  { key: 'payment_qr:account_name', value: '', group: 'payment_qr', label: 'Tên chủ tài khoản', description: 'Tên chủ tài khoản (in hoa, không dấu)' },
  { key: 'payment_qr:transfer_template', value: 'MIS-{LEAD_CODE}-{STUDENT_NAME}', group: 'payment_qr', label: 'Mẫu nội dung chuyển khoản', description: 'Template sinh nội dung CK. Biến: {LEAD_CODE}, {STUDENT_NAME}, {PARENT_NAME}, {PHONE}, {PAYMENT_TYPE}' },
  { key: 'payment_qr:transaction_prefix', value: 'MIS', group: 'payment_qr', label: 'Prefix mã giao dịch', description: 'Tiền tố mã giao dịch để phân biệt nguồn thanh toán' },
  { key: 'payment_qr:default_reservation_amount', value: '5000000', group: 'payment_qr', label: 'Số tiền đặt chỗ mặc định', description: 'Số tiền đặt chỗ giữ vị trí (VNĐ)' },
  { key: 'payment_qr:default_enrollment_amount', value: '0', group: 'payment_qr', label: 'Số tiền nhập học mặc định', description: 'Số tiền nhập học lần đầu (0 = không áp dụng)' },
  { key: 'payment_qr:confirmation_mode', value: 'manual', group: 'payment_qr', label: 'Chế độ xác nhận thanh toán', description: 'manual = thủ công, auto = tự động đổi trạng thái sau xác nhận' },
  { key: 'payment_qr:note', value: '', group: 'payment_qr', label: 'Ghi chú thanh toán', description: 'Ghi chú hiển thị trên phiếu thanh toán' },

  // security
  { key: 'security:min_password_length', value: '8', group: 'security', label: 'Độ dài mật khẩu tối thiểu', description: 'Số ký tự tối thiểu của mật khẩu' },
  { key: 'security:require_uppercase', value: 'true', group: 'security', label: 'Yêu cầu chữ hoa', description: 'Mật khẩu phải có chữ hoa' },
  { key: 'security:require_lowercase', value: 'true', group: 'security', label: 'Yêu cầu chữ thường', description: 'Mật khẩu phải có chữ thường' },
  { key: 'security:require_number', value: 'true', group: 'security', label: 'Yêu cầu số', description: 'Mật khẩu phải có số' },
  { key: 'security:require_special_char', value: 'false', group: 'security', label: 'Yêu cầu ký tự đặc biệt', description: 'Mật khẩu phải có ký tự đặc biệt' },
  { key: 'security:max_login_attempts', value: '5', group: 'security', label: 'Số lần đăng nhập sai tối đa', description: 'Số lần sai trước khi khóa tài khoản' },
  { key: 'security:lockout_minutes', value: '15', group: 'security', label: 'Thời gian khóa tài khoản', description: 'Số phút khóa sau khi sai nhiều lần' },
  { key: 'security:password_rotation_days', value: '0', group: 'security', label: 'Chu kỳ đổi mật khẩu', description: 'Số ngày yêu cầu đổi mật khẩu (0 = tắt)' },
  { key: 'security:session_timeout_minutes', value: '480', group: 'security', label: 'Thời gian hết hạn session', description: 'Session timeout theo phút' },
  { key: 'security:auto_logout_idle', value: 'true', group: 'security', label: 'Tự động đăng xuất khi không hoạt động', description: 'Bật/tắt idle logout' },
  { key: 'security:idle_timeout_minutes', value: '60', group: 'security', label: 'Thời gian idle tối đa', description: 'Số phút không hoạt động trước khi logout' },
  { key: 'security:allow_multiple_sessions', value: 'true', group: 'security', label: 'Cho phép nhiều thiết bị', description: 'Cho phép đăng nhập nhiều thiết bị' },
  { key: 'security:require_reauth_sensitive', value: 'true', group: 'security', label: 'Yêu cầu đăng nhập lại khi sửa cấu hình nhạy cảm', description: 'Re-auth cho cấu hình nhạy cảm' },

  // user_switcher
  { key: 'user_switcher:enabled', value: 'true', group: 'user_switcher', label: 'Bật chế độ đổi user', description: 'Cho phép đổi user demo' },
  { key: 'user_switcher:allow_in_production', value: 'false', group: 'user_switcher', label: 'Cho phép trong production', description: 'Không khuyến nghị bật ở môi trường thật' },
  { key: 'user_switcher:admin_only', value: 'true', group: 'user_switcher', label: 'Chỉ Admin được đổi user', description: 'Chỉ Admin hệ thống được dùng switcher' },
  { key: 'user_switcher:log_switching', value: 'true', group: 'user_switcher', label: 'Ghi audit khi đổi user', description: 'Ghi nhật ký mỗi lần đổi user' },
];

async function ensureDefaultsExist() {
  const settings = await db.query.systemSettings.findMany();
  const existingKeys = settings.map(s => s.key);
  const missingSettings = DEFAULT_SETTINGS.filter(d => !existingKeys.includes(d.key));
  if (missingSettings.length > 0) {
    const now = new Date();
    await db.insert(schema.systemSettings).values(
      missingSettings.map(s => ({
        key: s.key,
        value: s.value,
        group: s.group,
        label: s.label,
        description: s.description,
        isSecret: Boolean((s as any).isSecret),
        isEditable: true,
        createdAt: now,
        updatedAt: now
      }))
    ).onConflictDoNothing();
  }
}

export async function getSettings() {
  const actor = await getCurrentActor();
  if (!actor || !canViewSystemSettings(actor)) throw new Error('Unauthorized');

  await ensureDefaultsExist();
  const settings = await db.query.systemSettings.findMany();

  // Mask secrets unless authorized explicitly
  const canViewSecrets = canViewSecretSetting(actor);

  return settings.map(s => ({
    ...s,
    value: (s.isSecret && !canViewSecrets) ? '••••••••' : s.value
  }));
}

export async function saveSettings(updates: { key: string; value: string }[]) {
  const actor = await getCurrentActor();
  if (!actor || !canUpdateSystemSettings(actor)) throw new Error('Unauthorized');

  const currentSettings = await db.query.systemSettings.findMany();
  let updatedCount = 0;

  for (const update of updates) {
    const setting = currentSettings.find(s => s.key === update.key);
    if (!setting) continue;
    if (!setting.isEditable) continue;

    // Ignore if they just submit the masked value back
    if (setting.isSecret && update.value === '••••••••') continue;
    
    // Ignore if value hasn't changed
    if (setting.value === update.value) continue;

    await db.update(schema.systemSettings)
      .set({
        value: update.value,
        updatedBy: actor.id,
        updatedAt: new Date()
      })
      .where(eq(schema.systemSettings.key, update.key));

    updatedCount++;

    await writeAuditLog(actor.id, 'UPDATE_SETTING', 'SYSTEM_SETTING', update.key, {
      beforeValue: setting.isSecret ? '••••••••' : setting.value,
      afterValue: setting.isSecret ? '••••••••' : update.value
    });
  }

  revalidatePath('/[locale]/(admin)/system-data/settings', 'page');
  return { success: true, updatedCount };
}

async function getSchoolProfileSettings() {
  const actor = await getCurrentActor();
  if (!actor || !canViewSystemSettings(actor)) throw new Error('Unauthorized');
  
  await ensureDefaultsExist();
  const settings = await db.query.systemSettings.findMany({
    where: eq(schema.systemSettings.group, 'school_info')
  });
  return settings;
}

async function updateSchoolProfileSettings(updates: { key: string; value: string }[]) {
  return saveSettings(updates);
}

async function getAcademicSettings() {
  const actor = await getCurrentActor();
  if (!actor || !canViewSystemSettings(actor)) throw new Error('Unauthorized');
  
  await ensureDefaultsExist();
  const settings = await db.query.systemSettings.findMany({
    where: eq(schema.systemSettings.group, 'academics')
  });
  return settings;
}

async function updateAcademicSettings(updates: { key: string; value: string }[]) {
  return saveSettings(updates);
}

export async function uploadSchoolLogo(base64Data: string) {
  const actor = await getCurrentActor();
  if (!actor || !canUpdateSystemSettings(actor)) throw new Error('Unauthorized');

  if (!base64Data.startsWith('data:image/')) {
    throw new Error('Định dạng ảnh logo không hợp lệ.');
  }

  await db.update(schema.systemSettings)
    .set({
      value: base64Data,
      updatedBy: actor.id,
      updatedAt: new Date()
    })
    .where(eq(schema.systemSettings.key, 'school_info:logo_url'));

  await writeAuditLog(actor.id, 'UPDATE_LOGO', 'SYSTEM_SETTING', 'school_info:logo_url');

  revalidatePath('/[locale]/(admin)/system-data/settings', 'page');
  return { success: true };
}

export async function getIntegrationSettings() {
  const actor = await getCurrentActor();
  if (!actor || !canViewSystemSettings(actor)) throw new Error('Unauthorized');

  await ensureDefaultsExist();
  const settings = await db.query.systemSettings.findMany({
    where: inArray(schema.systemSettings.group, ['email', 'email_notifications', 'payment_qr'])
  });

  const canViewSecrets = canViewSecretSetting(actor);
  return settings.map(s => ({
    ...s,
    value: (s.isSecret && !canViewSecrets) ? '••••••••' : s.value
  }));
}

export async function updateIntegrationSettings(updates: { key: string; value: string }[]) {
  const actor = await getCurrentActor();
  if (!actor || !canManageIntegrationSettings(actor)) throw new Error('Unauthorized: chỉ Admin mới được cập nhật cấu hình kết nối');
  return saveSettings(updates);
}

export async function sendTestEmail(testEmailAddress: string) {
  const actor = await getCurrentActor();
  if (!actor || !canManageIntegrationSettings(actor)) throw new Error('Unauthorized');

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(testEmailAddress)) {
    throw new Error('Địa chỉ email nhận test không đúng định dạng.');
  }

  // Load SMTP config from DB
  const smtpSettings = await db.query.systemSettings.findMany({
    where: inArray(schema.systemSettings.group, ['email'])
  });
  const cfg = Object.fromEntries(smtpSettings.map(s => [s.key, s.value]));

  if (cfg['email:enabled'] !== 'true') {
    throw new Error('Hệ thống email chưa được bật. Vui lòng bật và lưu cấu hình trước.');
  }
  if (!cfg['email:smtp_host']) throw new Error('Chưa cấu hình SMTP Host.');
  if (!cfg['email:smtp_user']) throw new Error('Chưa cấu hình SMTP Username.');
  if (!cfg['email:smtp_password']) throw new Error('Chưa cấu hình SMTP Password.');
  if (!cfg['email:from_email']) throw new Error('Chưa cấu hình Email gửi đi.');

  const transporter = nodemailer.createTransport({
    host: cfg['email:smtp_host'],
    port: parseInt(cfg['email:smtp_port'] || '587', 10),
    secure: cfg['email:smtp_secure'] === 'true',
    auth: {
      user: cfg['email:smtp_user'],
      pass: cfg['email:smtp_password'],
    },
  });

  await transporter.sendMail({
    from: `"${cfg['email:from_name'] || 'MIS Smart Portal'}" <${cfg['email:from_email']}>`,
    to: testEmailAddress,
    subject: 'Kiểm tra cấu hình email – MIS SMART PORTAL',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="color:#4f46e5;margin-bottom:8px">✅ Cấu hình email hoạt động!</h2>
        <p style="color:#475569">Đây là email kiểm tra từ hệ thống <strong>MIS SMART PORTAL</strong>.</p>
        <p style="color:#475569">Nếu bạn nhận được email này, cấu hình SMTP đã được thiết lập thành công.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
        <p style="color:#94a3b8;font-size:12px">Email này được gửi tự động từ hệ thống. Vui lòng không trả lời.</p>
      </div>
    `,
  });

  return { success: true, message: `Email kiểm tra đã gửi đến ${testEmailAddress}` };
}

export async function generateTestPaymentQr(params: {
  leadCode: string;
  studentName: string;
  parentName?: string;
  phone?: string;
  amount: number;
  paymentType: 'reservation' | 'enrollment';
}) {
  const actor = await getCurrentActor();
  if (!actor || !canViewSystemSettings(actor)) throw new Error('Unauthorized');

  const qrSettings = await db.query.systemSettings.findMany({
    where: inArray(schema.systemSettings.group, ['payment_qr'])
  });
  const cfg = Object.fromEntries(qrSettings.map(s => [s.key, s.value]));

  if (!cfg['payment_qr:account_number']) {
    throw new Error('Chưa cấu hình Số tài khoản ngân hàng. Vui lòng nhập số tài khoản trước.');
  }
  if (!cfg['payment_qr:bank_bin']) {
    throw new Error('Chưa cấu hình BIN ngân hàng.');
  }

  const paymentTypeLabel = params.paymentType === 'reservation' ? 'DATCHO' : 'NHAPHOC';
  const template = cfg['payment_qr:transfer_template'] || 'MIS-{LEAD_CODE}-{STUDENT_NAME}';
  const transferContent = template
    .replace('{LEAD_CODE}', params.leadCode)
    .replace('{STUDENT_NAME}', params.studentName.toUpperCase().replace(/\s+/g, ''))
    .replace('{PARENT_NAME}', (params.parentName || '').toUpperCase().replace(/\s+/g, ''))
    .replace('{PHONE}', params.phone || '')
    .replace('{PAYMENT_TYPE}', paymentTypeLabel)
    .substring(0, 50); // VietQR addInfo max 50 chars

  const accountName = encodeURIComponent(cfg['payment_qr:account_name'] || '');
  const addInfo = encodeURIComponent(transferContent);
  const qrUrl = `https://img.vietqr.io/image/${cfg['payment_qr:bank_bin']}-${cfg['payment_qr:account_number']}-compact2.png?amount=${params.amount}&addInfo=${addInfo}&accountName=${accountName}`;

  return {
    success: true,
    qrUrl,
    transferContent,
    bankName: cfg['payment_qr:bank_name'],
    accountNumber: cfg['payment_qr:account_number'],
    accountName: cfg['payment_qr:account_name'],
    amount: params.amount,
    paymentType: params.paymentType,
  };
}

export async function testSmtpConnection() {
  return sendTestEmail('test@example.com').catch(e => { throw e; });
}

export async function getSecuritySettings() {
  const actor = await getCurrentActor();
  if (!actor || !canViewSystemSettings(actor)) throw new Error('Unauthorized');
  await ensureDefaultsExist();
  return db.query.systemSettings.findMany({ where: inArray(schema.systemSettings.group, ['security']) });
}

export async function updateSecuritySettings(updates: { key: string; value: string }[]) {
  const actor = await getCurrentActor();
  if (!actor || !canManageSecuritySettings(actor)) throw new Error('Unauthorized: chỉ Admin được cập nhật bảo mật');
  const allowed = updates.filter(u => u.key.startsWith('security:'));
  await saveSettings(allowed);
  await writeAuditLog(actor.id, 'UPDATE_SECURITY_SETTINGS', 'SYSTEM_SECURITY', 'security', { after: allowed, module: 'system_settings' });
  return { success: true, updatedCount: allowed.length };
}

export async function getUserSwitcherSettings() {
  const actor = await getCurrentActor();
  if (!actor || !canViewSystemSettings(actor)) throw new Error('Unauthorized');
  await ensureDefaultsExist();
  return db.query.systemSettings.findMany({ where: inArray(schema.systemSettings.group, ['user_switcher']) });
}

export async function updateUserSwitcherSettings(updates: { key: string; value: string }[]) {
  const actor = await getCurrentActor();
  if (!actor || !canManageSecuritySettings(actor)) throw new Error('Unauthorized: chỉ Admin được cập nhật Demo mode');
  const allowed = updates.filter(u => u.key.startsWith('user_switcher:'));
  await saveSettings(allowed);
  await writeAuditLog(actor.id, 'UPDATE_USER_SWITCHER_SETTINGS', 'SYSTEM_SECURITY', 'user_switcher', { after: allowed, module: 'system_settings' });
  return { success: true, updatedCount: allowed.length };
}

export async function getAuditLogs(filters: { actor?: string; module?: string; action?: string; success?: string; from?: string; to?: string } = {}) {
  const actor = await getCurrentActor();
  if (!actor || !canViewAuditLogs(actor)) throw new Error('Unauthorized');

  const conditions = [];
  if (filters.action) conditions.push(ilike(schema.auditLogs.action, `%${filters.action}%`));
  if (filters.module) conditions.push(ilike(schema.auditLogs.entityType, `%${filters.module}%`));
  if (filters.actor) conditions.push(eq(schema.auditLogs.actorId, filters.actor));
  if (filters.from) conditions.push(gte(schema.auditLogs.createdAt, new Date(filters.from)));
  if (filters.to) conditions.push(lte(schema.auditLogs.createdAt, new Date(filters.to)));

  const logs = await db.select().from(schema.auditLogs)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.auditLogs.createdAt))
    .limit(100);

  return filters.success
    ? logs.filter(log => String((log.metadata as any)?.success ?? true) === filters.success)
    : logs;
}
