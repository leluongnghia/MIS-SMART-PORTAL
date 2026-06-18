/**
 * payment-service.ts
 * Service dùng chung để sinh QR thanh toán tuyển sinh.
 * Module Tuyển sinh import và gọi các hàm này khi cần tạo QR đặt chỗ / nhập học.
 */
import { db, schema } from './db';
import { inArray } from 'drizzle-orm';

export type PaymentType = 'reservation' | 'enrollment';

export interface AdmissionPaymentParams {
  leadCode: string;
  studentName: string;
  parentName?: string;
  phone?: string;
  amount: number;
  paymentType: PaymentType;
}

export interface PaymentQrResult {
  qrUrl: string;
  transferContent: string;
  bankName: string;
  bankBin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  paymentType: PaymentType;
}

/** Load payment QR config từ system_settings */
async function loadPaymentQrConfig(): Promise<Record<string, string>> {
  const settings = await db.query.systemSettings.findMany({
    where: inArray(schema.systemSettings.group, ['payment_qr']),
  });
  return Object.fromEntries(settings.map(s => [s.key, s.value]));
}

/**
 * Sinh nội dung chuyển khoản từ template cấu hình.
 * Template hỗ trợ biến: {LEAD_CODE}, {STUDENT_NAME}, {PARENT_NAME}, {PHONE}, {PAYMENT_TYPE}
 */
export function generateAdmissionPaymentContent(
  template: string,
  params: AdmissionPaymentParams
): string {
  const paymentTypeLabel = params.paymentType === 'reservation' ? 'DATCHO' : 'NHAPHOC';
  return template
    .replace('{LEAD_CODE}', params.leadCode)
    .replace('{STUDENT_NAME}', params.studentName.toUpperCase().replace(/\s+/g, ''))
    .replace('{PARENT_NAME}', (params.parentName || '').toUpperCase().replace(/\s+/g, ''))
    .replace('{PHONE}', params.phone || '')
    .replace('{PAYMENT_TYPE}', paymentTypeLabel)
    .substring(0, 50); // VietQR addInfo tối đa 50 ký tự
}

/**
 * Tạo VietQR URL cho một hồ sơ tuyển sinh.
 * Mỗi lead có nội dung chuyển khoản riêng, tránh nhầm lẫn.
 *
 * @example
 * // Khi lead vào stage SEAT_RESERVED:
 * const qr = await generateAdmissionPaymentQr({
 *   leadCode: 'LD-2026-ABC123',
 *   studentName: 'Nguyễn Văn An',
 *   parentName: 'Nguyễn Văn Bình',
 *   phone: '0901234567',
 *   amount: 5000000,
 *   paymentType: 'reservation',
 * });
 */
export async function generateAdmissionPaymentQr(
  params: AdmissionPaymentParams
): Promise<PaymentQrResult> {
  const cfg = await loadPaymentQrConfig();

  if (!cfg['payment_qr:account_number']) {
    throw new Error('Chưa cấu hình số tài khoản ngân hàng cho QR thanh toán.');
  }
  if (!cfg['payment_qr:bank_bin']) {
    throw new Error('Chưa cấu hình BIN ngân hàng.');
  }

  const template = cfg['payment_qr:transfer_template'] || 'MIS-{LEAD_CODE}-{STUDENT_NAME}';
  const transferContent = generateAdmissionPaymentContent(template, params);

  const accountName = encodeURIComponent(cfg['payment_qr:account_name'] || '');
  const addInfo = encodeURIComponent(transferContent);
  const qrUrl = `https://img.vietqr.io/image/${cfg['payment_qr:bank_bin']}-${cfg['payment_qr:account_number']}-compact2.png?amount=${params.amount}&addInfo=${addInfo}&accountName=${accountName}`;

  return {
    qrUrl,
    transferContent,
    bankName: cfg['payment_qr:bank_name'] || '',
    bankBin: cfg['payment_qr:bank_bin'],
    accountNumber: cfg['payment_qr:account_number'],
    accountName: cfg['payment_qr:account_name'] || '',
    amount: params.amount,
    paymentType: params.paymentType,
  };
}

/**
 * Tạo payment request object chuẩn cho một lead.
 * Module Tuyển sinh gọi hàm này để chuẩn bị QR đặt chỗ hoặc nhập học.
 */
export async function createAdmissionPaymentRequest(
  lead: {
    leadCode: string;
    fullName: string;
    parentName?: string | null;
    phone: string;
  },
  type: PaymentType
): Promise<PaymentQrResult & { leadCode: string }> {
  const cfg = await loadPaymentQrConfig();

  const defaultAmount =
    type === 'reservation'
      ? parseInt(cfg['payment_qr:default_reservation_amount'] || '5000000', 10)
      : parseInt(cfg['payment_qr:default_enrollment_amount'] || '0', 10);

  const result = await generateAdmissionPaymentQr({
    leadCode: lead.leadCode,
    studentName: lead.fullName,
    parentName: lead.parentName || undefined,
    phone: lead.phone,
    amount: defaultAmount,
    paymentType: type,
  });

  return { ...result, leadCode: lead.leadCode };
}
