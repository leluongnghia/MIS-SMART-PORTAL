import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '5mb' }));

// Initialize Gemini SDK with named parameter
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API routes FIRST
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!apiKey,
    hasSmtpConfig: hasSmtpConfig(),
  });
});

// 1. Summarize Reports API
app.post('/api/gemini/summarize-report', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ status: 'error', error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const { reports } = req.body;
  if (!reports || !Array.isArray(reports) || reports.length === 0) {
    return res.status(400).json({ status: 'error', error: 'No reports provided for summarization.' });
  }

  try {
    const prompt = `Bạn là một trợ lý AI phân tích hiệu suất học đường cao cấp tại Trường Đa Trí Tuệ MIS Hà Nội.
Hãy đọc báo cáo/minh chứng thực hiện nhiệm vụ dưới đây của các cán bộ, giáo viên và viết một bản tóm tắt điều hành chuyên nghiệp (Executive Summary) cho Ban Giám hiệu.

Bản tóm tắt cần bằng tiếng Việt, có bố cục cực kỳ mạch lạc và trình bày dạng các thẻ/bullet points tinh giản:
1. ĐÁNH GIÁ TỔNG QUAN (1 câu tóm tắt xu hướng nổi bật của tiến độ hành chính & học vụ).
2. THÀNH TỰU ĐÁNH GIÁ CAO (Các điểm sáng hoàn thành tốt, đúng hạn hoặc chất lượng vượt trội kèm tên người thực hiện).
3. ĐIỂM NGHẼN & TỒN ĐỌNG (Các rủi ro chậm trễ, minh chứng chưa đầy đủ hoặc vướng mắc cần giải quyết).
4. ĐỀ XUẤT CHỈ ĐẠO TIẾP THEO (Tối đa 3 hành động cụ thể, mang tính thực hóa cho Ban Giám hiệu quyết định phê duyệt).

Thông tin báo cáo chi tiết:
${reports
  .map(
    (rep: any, idx) => `
Báo cáo #${idx + 1}:
- Nhiệm vụ: ${rep.title}
- Người thực hiện: ${rep.assignedName} (${rep.assignedRole})
- Phòng ban/Tổ: ${rep.workspaceName}
- Minh chứng thực tế đã nộp: ${rep.evidence}
- Độ ưu tiên: ${rep.priority}
`
  )
  .join('\n')}

Hãy trả về kết quả bằng định dạng văn bản Markdown chuẩn, ngắn gọn nhưng đầy đủ chiều sâu thông tin, văn phong trang trọng, khách quan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ status: 'success', summary: response.text });
  } catch (error: any) {
    console.error('Gemini error in summarize-report:', error);
    res.status(500).json({ status: 'error', error: error.message || 'Error communicating with Gemini' });
  }
});

// 2. Early Warning & Task Congestion API
app.post('/api/gemini/early-warning', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ status: 'error', error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ status: 'error', error: 'No tasks provided for bottleneck scanning.' });
  }

  try {
    const prompt = `Bạn là chuyên gia quản trị KPI & OKR học đường tại Trường Đa Trí Tuệ MIS.
Hãy phân tích danh sách các việc chưa hoàn thành sau, phát hiện các điểm nghẽn học vụ (bottlenecks) và đưa ra các cảnh báo sớm kèm giải pháp xử lý.

Cảnh báo cần tóm gọn bằng tiếng Việt, ngắn gọn phù hợp với bảng tin trật tự vận hành (Dashboard warning widget):
- Cảnh báo nhân sự bị quá tải (Ai có nhiều việc CAO đang đọng?).
- Cảnh báo sát hạn chót hoặc đã quá hạn học vụ.
- Đề xuất phân phối lại tài nguyên hoặc giãn hạn cụ thể cho từng bộ phận.

Danh sách việc cần quét:
${tasks
  .map(
    (t: any, idx) => `
Nhiệm vụ #${idx + 1}:
- Tên việc: ${t.title}
- Người phụ trách: ${t.assignedName}
- Phòng ban/Tổ: ${t.workspaceId}
- Tiến trình hiện tại: ${t.status}
- Độ ưu tiên: ${t.priority}
- Hạn chót: ${t.deadline}
`
  )
  .join('\n')}

Hãy trả về kết quả phân tích ngắn gọn, súc tích bằng Markdown (dùng đậm nhạt và các dấu cảnh báo ⚠️, 🚨 một cách tinh tế).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ status: 'success', warning: response.text });
  } catch (error: any) {
    console.error('Gemini error in early-warning:', error);
    res.status(500).json({ status: 'error', error: error.message || 'Error communicating with Gemini' });
  }
});

// 3. Voice to Task API (Natural Language to Task Fields Converter)
app.post('/api/gemini/voice-to-task', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ status: 'error', error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const { promptText, usersContext, workspacesContext } = req.body;
  if (!promptText || typeof promptText !== 'string') {
    return res.status(400).json({ status: 'error', error: 'Prompt text is required.' });
  }

  try {
    const systemInstruction = `Bạn là Trợ lý phân tích văn bản học thuật thông minh của Hệ thống Đa Trí Tuệ MIS.
Hãy chuyển đoạn văn bản (hoặc lời phiên âm giọng nói) của người dùng thành cấu trúc một công việc hoàn chỉnh theo quy tắc:
- Title: Tiêu đề công việc cô đọng, viết hoa chữ đầu.
- Description: Mô tả chi tiết yêu cầu công việc được gợi ý từ nội dung.
- Priority: Nhận diện 'CAO', 'TRUNG_BINH', hoặc 'THAP' (mặc định 'TRUNG_BINH').
- Tag: Gán phân loại thẻ phù hợp ('Chuyên môn', 'Báo cáo', 'Hội họp', 'Hoạt động', 'Đại hội', 'Đột xuất').
- Deadline: Nhận diện ngày cụ thể (định dạng YYYY-MM-DD). Nếu người dùng nói "trước thứ sáu tuần sau" hoặc "ngày 15 tháng 6", hãy đổi sang ngày dạng YYYY-MM-DD dựa trên năm nay là 2026. Mặc định là '2026-06-15' nếu không nhận diện được.
- WorkspaceId: Dựa trên thông tin workspaces được cung cấp, tìm ID của tổ/phòng ban phù hợp nhất (ví dụ: "Ngữ Văn" -> 'VAN', "Toán Tin" -> 'TOAN_TIN', "Hành chính" -> 'HANH_CHINH', "BGH" -> 'BGH').
- AssignedId: Tên nhân sự được nói tới (ví dụ: "cô Nhàn", "thầy Nam", "cô Liên") hãy ánh xạ chính xác sang ID của người dùng trong dữ liệu nhân sự được cung cấp (ví dụ: "Cô Lê Thị Thanh Nhàn" -> 'user_nhan', "Thầy Trần Hoàng Nam" -> 'user_nam'). Nếu không nhắc ai, hãy chọn ID của tổ trưởng hoặc người phù hợp, hoặc mặc định người đầu tiên trong tổ.

Thông tin nhân sự hợp lệ (Users):
${JSON.stringify(usersContext || [])}

Thông tin tổ/phòng ban hợp lệ (Workspaces):
${JSON.stringify(workspacesContext || [])}

Bạn bắt buộc phải tuân thủ schema JSON đầu ra.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Phân tích câu lệnh giao việc này và gán thuộc tính phù hợp: "${promptText}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['title', 'description', 'priority', 'workspaceId', 'assignedId', 'tag', 'deadline'],
          properties: {
            title: {
              type: Type.STRING,
              description: 'Tiêu đề ngắn gọn của công việc học vụ',
            },
            description: {
              type: Type.STRING,
              description: 'Nội dung hướng dẫn chi tiết và yêu cầu tiến trình thực tế',
            },
            priority: {
              type: Type.STRING,
              description: 'Độ ưu tiên cao nhất phù hợp: CAO, TRUNG_BINH, THAP',
            },
            workspaceId: {
              type: Type.STRING,
              description: 'Mã phòng ban tổ chuyên môn phù hợp nhất',
            },
            assignedId: {
              type: Type.STRING,
              description: 'ID người thừa hành nhiệm vụ được phân công',
            },
            tag: {
              type: Type.STRING,
              description: 'Tag phân loại: Chuyên môn, Báo cáo, Hội họp, Hoạt động, Đại hội, Đột xuất',
            },
            deadline: {
              type: Type.STRING,
              description: 'Ngày hạn chót định dạng YYYY-MM-DD',
            },
          },
        },
      },
    });

    const taskResult = JSON.parse(response.text);
    res.json({ status: 'success', task: taskResult });
  } catch (error: any) {
    console.error('Gemini error in voice-to-task:', error);
    res.status(500).json({ status: 'error', error: error.message || 'Error processing speech command' });
  }
});

// 4. Summarize Daily Tasks for Teacher API
app.post('/api/gemini/summarize-daily-tasks', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ status: 'error', error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const { tasks, teacherName } = req.body;
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ status: 'error', error: 'No tasks provided.' });
  }

  try {
    const prompt = `Bạn là trợ lý AI thông minh điều hành của Trường Đa Trí Tuệ MIS.
Hãy tóm tắt ngắn gọn các công việc chưa hoàn thành của giáo viên ${teacherName || 'này'} vào cuối ngày hôm nay để giúp lên kế hoạch và ưu tiên cho ngày mai.

Danh sách các công việc còn tồn đọng:
${tasks
  .map(
    (t: any, idx) => `
- Việc #${idx + 1}: ${t.title} (Trạng thái: ${t.status}, Hạn chót: ${t.deadline}, Độ ưu tiên: ${t.priority})`
  )
  .join('\n')}

Yêu cầu tóm tắt bằng tiếng Việt thân thiện, khích lệ, chia làm 2 phần nhỏ (tối đa 4-5 dòng):
1. Ưu tiên cao hoặc sát hạn nộp cần xử lý gấp.
2. Gợi ý lịch làm việc tóm tắt hoặc lời động viên cho ngày mai.

Không dùng định dạng quá phức tạp, chỉ cần xuống dòng gọn gàng, có chứa emoji (ví dụ: 🎯, ⏰, ✨).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ status: 'success', summary: response.text });
  } catch (error: any) {
    console.error('Gemini error in summarize-daily-tasks:', error);
    res.status(500).json({ status: 'error', error: error.message || 'Error communicating with Gemini' });
  }
});

// SMTP configuration for email reminders
const smtpConfig = {
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
};

const crmLeadIntakeQueue: any[] = [];

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getNotificationConfigStatus() {
  const smtpReady = hasSmtpConfig();
  return {
    gemini: {
      configured: Boolean(apiKey),
      requiredEnv: ['GEMINI_API_KEY'],
    },
    smtp: {
      configured: smtpReady,
      host: process.env.SMTP_HOST || '',
      port: process.env.SMTP_PORT || '587',
      secure: process.env.SMTP_SECURE === 'true',
      userConfigured: Boolean(process.env.SMTP_USER),
      passConfigured: Boolean(process.env.SMTP_PASS),
      from: process.env.EMAIL_FROM || '"MIS Smart Portal" <noreply@mis.edu.vn>',
      testReceiverConfigured: Boolean(process.env.TEST_RECEIVER_EMAIL),
      requiredEnv: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'],
    },
    zalo: {
      configured: Boolean(process.env.ZALO_OA_ID && process.env.ZALO_ACCESS_TOKEN),
      oaIdConfigured: Boolean(process.env.ZALO_OA_ID),
      appIdConfigured: Boolean(process.env.ZALO_APP_ID),
      appSecretConfigured: Boolean(process.env.ZALO_APP_SECRET),
      accessTokenConfigured: Boolean(process.env.ZALO_ACCESS_TOKEN),
      refreshTokenConfigured: Boolean(process.env.ZALO_REFRESH_TOKEN),
      defaultAudience: process.env.ZALO_DEFAULT_AUDIENCE || 'Người quan tâm OA',
      requiredEnv: ['ZALO_OA_ID', 'ZALO_APP_ID', 'ZALO_APP_SECRET', 'ZALO_ACCESS_TOKEN', 'ZALO_REFRESH_TOKEN'],
    },
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

app.get('/api/notification/config-status', (req, res) => {
  res.json({
    status: 'success',
    config: getNotificationConfigStatus(),
  });
});

app.post('/api/email/send-test', async (req, res) => {
  const { to, subject, message } = req.body;
  const receiver = process.env.TEST_RECEIVER_EMAIL || to;

  if (!receiver) {
    return res.status(400).json({ status: 'error', error: 'Missing recipient email.' });
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"MIS Smart Portal" <noreply@mis.edu.vn>',
    to: receiver,
    subject: subject || 'MIS Smart Portal - Kiểm thử SMTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background:#4f46e5;color:white;padding:20px;">
          <h2 style="margin:0;">MIS Smart Portal</h2>
          <p style="margin:6px 0 0;">Kiểm thử cấu hình SMTP</p>
        </div>
        <div style="padding:20px;color:#0f172a;">
          <p>${message || 'Email kiểm thử được gửi từ phần Cài đặt hệ thống.'}</p>
          <p style="font-size:13px;color:#64748b;">Nếu nhận được email này, SMTP đã hoạt động.</p>
        </div>
      </div>
    `,
  };

  try {
    if (hasSmtpConfig()) {
      const transporter = nodemailer.createTransport(smtpConfig);
      await withTimeout(transporter.verify(), 10000, 'SMTP verify');
      const info = await withTimeout(transporter.sendMail(mailOptions), 15000, 'SMTP test email send');
      return res.json({ status: 'success', provider: 'SMTP', messageId: info.messageId, to: receiver });
    }

    const testAccount = await withTimeout(nodemailer.createTestAccount(), 8000, 'Ethereal test account creation');
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    const info = await withTimeout(transporter.sendMail(mailOptions), 15000, 'Ethereal SMTP test send');
    const previewUrl = nodemailer.getTestMessageUrl(info);
    return res.json({
      status: 'success',
      provider: 'Ethereal',
      previewUrl,
      warning: 'SMTP thật chưa được cấu hình; hệ thống đã tạo email kiểm thử Ethereal.',
    });
  } catch (error: any) {
    console.error('Email error in send-test:', error);
    res.status(500).json({ status: 'error', error: error.message || 'Error sending SMTP test email' });
  }
});

app.post('/api/email/send-campaign', async (req, res) => {
  const { recipients, subject, html, text, campaignName } = req.body;

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ status: 'error', error: 'Recipients array is required.' });
  }
  if (!subject || (!html && !text)) {
    return res.status(400).json({ status: 'error', error: 'Subject and email content are required.' });
  }

  const normalizedRecipients = recipients
    .map((item: any) => ({
      email: String(item.email || '').trim(),
      name: String(item.name || item.parentName || '').trim(),
    }))
    .filter((item: any) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email));

  if (normalizedRecipients.length === 0) {
    return res.status(400).json({ status: 'error', error: 'No valid recipient email found.' });
  }

  const maxPerRun = Math.max(1, parseInt(process.env.MAX_CAMPAIGN_EMAILS_PER_RUN || '20', 10));
  const recipientsToSend = normalizedRecipients.slice(0, maxPerRun);

  if (!hasSmtpConfig()) {
    console.log('------------------------------------------------------------');
    console.log(`[SMTP MOCK CAMPAIGN] ${campaignName || 'Email campaign'}`);
    console.log(`Subject: ${subject}`);
    console.log(`Recipients: ${recipientsToSend.map((item: any) => item.email).join(', ')}`);
    console.log('------------------------------------------------------------');
    return res.json({
      status: 'success',
      provider: 'ConsoleLogOnly',
      processed: recipientsToSend.length,
      remaining: Math.max(0, normalizedRecipients.length - recipientsToSend.length),
      warning: 'SMTP is not configured. Campaign was logged on the server only.',
      sent: [],
      failed: [],
    });
  }

  const sent: any[] = [];
  const failed: any[] = [];

  try {
    const transporter = nodemailer.createTransport(smtpConfig);
    await withTimeout(transporter.verify(), 10000, 'SMTP campaign verify');

    for (const recipient of recipientsToSend) {
      try {
        const info = await withTimeout(
          transporter.sendMail({
            from: process.env.EMAIL_FROM || '"MIS Smart Portal" <noreply@mis.edu.vn>',
            to: recipient.email,
            subject,
            html,
            text,
          }),
          15000,
          `SMTP campaign send to ${recipient.email}`
        );
        sent.push({ email: recipient.email, messageId: info.messageId });
      } catch (error: any) {
        failed.push({ email: recipient.email, error: error.message || String(error) });
      }
    }

    res.json({
      status: 'success',
      provider: 'SMTP',
      processed: recipientsToSend.length,
      remaining: Math.max(0, normalizedRecipients.length - recipientsToSend.length),
      sent,
      failed,
    });
  } catch (error: any) {
    console.error('Email error in send-campaign:', error);
    res.status(500).json({ status: 'error', error: error.message || 'Error sending email campaign' });
  }
});

app.post('/api/zalo/broadcast/prepare', async (req, res) => {
  const { title, content, audience, labels, scheduledAt, articleUrl } = req.body;

  if (!title || !content) {
    return res.status(400).json({ status: 'error', error: 'Broadcast title and content are required.' });
  }

  const config = getNotificationConfigStatus().zalo;
  const draftId = `zalo_broadcast_${Date.now()}`;
  res.json({
    status: 'success',
    provider: 'ZaloOA-Broadcast-Manual',
    configured: config.configured,
    draft: {
      id: draftId,
      title,
      content,
      audience: audience || process.env.ZALO_DEFAULT_AUDIENCE || 'Người quan tâm OA',
      labels: Array.isArray(labels) ? labels : [],
      scheduledAt: scheduledAt || '',
      articleUrl: articleUrl || '',
      createdAt: new Date().toISOString(),
    },
    nextSteps: [
      'Duyệt nội dung trong MIS Smart Portal.',
      'Đăng bài viết hoặc nội dung tương ứng trên Zalo OA.',
      'Vào Broadcast của Zalo OA, chọn nhóm người quan tâm/nhãn phù hợp và đặt lịch gửi.',
      'Cập nhật lại log gửi trong MIS sau khi OA xác nhận.',
    ],
  });
});

app.post('/api/crm/leads/intake', (req, res) => {
  const payload = req.body || {};
  const studentName = String(payload.studentName || payload.student_name || payload.name || '').trim();
  const parentName = String(payload.parentName || payload.parent_name || payload.contactName || '').trim();
  const phone = String(payload.phone || payload.mobile || payload.parentPhone || '').trim();

  if (!studentName || !parentName || !phone) {
    return res.status(400).json({
      status: 'error',
      error: 'studentName, parentName and phone are required.',
    });
  }

  const intakeLead = {
    id: `intake_${Date.now()}`,
    studentName,
    parentName,
    phone,
    email: String(payload.email || payload.parentEmail || '').trim(),
    grade: String(payload.grade || payload.className || 'Lớp 10').trim(),
    source: String(payload.source || payload.utm_source || 'Website').trim(),
    campaignName: String(payload.campaignName || payload.utm_campaign || 'Website tuyển sinh').trim(),
    notes: String(payload.notes || payload.message || 'Lead nhận từ web form/API tuyển sinh').trim(),
    rawPayload: payload,
    receivedAt: new Date().toISOString(),
    status: 'QUEUED',
  };

  crmLeadIntakeQueue.unshift(intakeLead);
  if (crmLeadIntakeQueue.length > 200) crmLeadIntakeQueue.pop();

  res.status(201).json({
    status: 'success',
    lead: intakeLead,
    queueSize: crmLeadIntakeQueue.length,
  });
});

app.get('/api/crm/leads/intake-queue', (req, res) => {
  res.json({
    status: 'success',
    leads: crmLeadIntakeQueue,
    count: crmLeadIntakeQueue.length,
  });
});

// Helper function to send email notification
async function sendEmailNotification({
  taskTitle,
  taskDescription,
  assigneeName,
  assigneeEmail,
  deadline,
  type
}: {
  taskTitle: string;
  taskDescription: string;
  assigneeName: string;
  assigneeEmail: string;
  deadline: string;
  type: 'OVERDUE' | 'NEAR_DEADLINE';
}) {
  const isOverdue = type === 'OVERDUE';
  const subject = isOverdue
    ? `🚨 CẢNH BÁO: Nhiệm vụ "${taskTitle}" ĐÃ QUÁ HẠN!`
    : `⏰ NHẮC NHỞ: Nhiệm vụ "${taskTitle}" SẮP ĐẾN HẠN CHÓT!`;

  const bannerColor = isOverdue ? '#ef4444' : '#f59e0b';
  const badgeText = isOverdue ? 'ĐÃ QUÁ HẠN' : 'SẮP ĐẾN HẠN';
  
  const receiver = process.env.TEST_RECEIVER_EMAIL || assigneeEmail;

  const htmlContent = `
    <div style="font-family: 'Be Vietnam Pro', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: ${bannerColor}; color: white; padding: 24px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">MIS SMART PORTAL</h2>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Hệ thống Cảnh báo & Điều hành Học đường</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
        <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Chào <strong>${assigneeName}</strong>,</p>
        
        <p style="font-size: 15px; line-height: 1.6;">Bạn có một nhiệm vụ cần lưu ý trên cổng thông tin điều hành:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid ${bannerColor}; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <div style="margin-bottom: 8px;">
            <span style="background-color: ${isOverdue ? '#fef2f2' : '#fffbeb'}; color: ${bannerColor}; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace;">
              ${badgeText}
            </span>
          </div>
          <h3 style="margin: 4px 0 8px 0; font-size: 16px; color: #0f172a; font-weight: 700;">${taskTitle}</h3>
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569; line-height: 1.5;">${taskDescription || 'Không có mô tả chi tiết.'}</p>
          <p style="margin: 0; font-size: 13px; color: #64748b;">
            <strong>Hạn chót:</strong> <span style="color: #ef4444; font-weight: 600;">${deadline}</span>
          </p>
        </div>

        <p style="font-size: 15px; line-height: 1.6;">Vui lòng truy cập cổng thông tin và cập nhật tiến độ công việc hoặc nộp báo cáo chuyên môn kèm minh chứng thực tế đúng hạn.</p>
        
        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
            Đi tới MIS Smart Portal
          </a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0;">Email này được gửi tự động từ Hệ thống Quản trị Trường Đa Trí Tuệ MIS.</p>
        <p style="margin: 4px 0 0 0;">© 2026 Trường Đa Trí Tuệ MIS. All rights reserved.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"MIS Smart Portal" <noreply@mis.edu.vn>',
    to: receiver,
    subject,
    html: htmlContent,
  };

  if (hasSmtpConfig()) {
    const transporter = nodemailer.createTransport(smtpConfig);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Reminder sent via SMTP to ${receiver}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, provider: 'SMTP' };
  } else {
    console.log('------------------------------------------------------------');
    console.log(`[SMTP MOCK EMAIL ALERT] To: ${receiver}`);
    console.log(`Subject: ${subject}`);
    console.log(`Task: ${taskTitle}`);
    console.log(`Deadline: ${deadline}`);
    console.log('------------------------------------------------------------');

    try {
      const testAccount = await withTimeout(nodemailer.createTestAccount(), 8000, 'Ethereal test account creation');
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      const info = await withTimeout(transporter.sendMail(mailOptions), 15000, 'Ethereal reminder email send');
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Email Service] Preview URL: ${previewUrl}`);
      return { success: true, previewUrl, provider: 'Ethereal' };
    } catch (err) {
      console.warn('[Email Service] Failed to generate Ethereal Email test account, logged only to console.');
      return { success: true, provider: 'ConsoleLogOnly' };
    }
  }
}

type ReminderType = 'OVERDUE' | 'NEAR_DEADLINE';

type ReminderTask = {
  id: string;
  title: string;
  description?: string;
  assignedId: string;
  assignedName: string;
  deadline: string;
  status: string;
  nearDeadlineReminderSent?: boolean;
  overdueReminderSent?: boolean;
  lastNearDeadlineReminderDate?: string;
  lastOverdueReminderDate?: string;
};

type ReminderUser = {
  id: string;
  email?: string;
};

type ReminderCandidate = {
  task: ReminderTask;
  type: ReminderType;
  assigneeEmail: string;
};

type RegisteredReminderSource = {
  tasks: ReminderTask[];
  users: ReminderUser[];
  nearDeadlineDays: number;
  registeredAt: number;
};

let registeredReminderSource: RegisteredReminderSource | null = null;
const reminderRunMemory = new Set<string>();

function getLocalDateString(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function daysUntilDeadline(deadline: string, todayStr: string) {
  const deadlineTime = new Date(`${deadline}T00:00:00`).getTime();
  const todayTime = new Date(`${todayStr}T00:00:00`).getTime();
  return Math.ceil((deadlineTime - todayTime) / (1000 * 60 * 60 * 24));
}

function findReminderCandidates(
  tasks: ReminderTask[],
  users: ReminderUser[],
  nearDeadlineDays: number,
  todayStr = getLocalDateString()
): ReminderCandidate[] {
  return tasks
    .filter(task => task && task.id && task.status !== 'HOAN_THANH' && task.deadline)
    .map(task => {
      const diffDays = daysUntilDeadline(task.deadline, todayStr);
      const type: ReminderType | null = diffDays < 0
        ? 'OVERDUE'
        : diffDays <= nearDeadlineDays
          ? 'NEAR_DEADLINE'
          : null;

      if (!type) return null;

      const lastReminderDate = type === 'OVERDUE'
        ? task.lastOverdueReminderDate
        : task.lastNearDeadlineReminderDate;

      const legacySent = type === 'OVERDUE'
        ? task.overdueReminderSent
        : task.nearDeadlineReminderSent;

      if (lastReminderDate === todayStr) return null;
      if (legacySent && !lastReminderDate) return null;

      const dedupeKey = `${todayStr}:${type}:${task.id}`;
      if (reminderRunMemory.has(dedupeKey)) return null;

      const user = users.find(u => u.id === task.assignedId);
      const assigneeEmail = user?.email || `${task.assignedId}@mis.edu.vn`;
      return { task, type, assigneeEmail };
    })
    .filter((candidate): candidate is ReminderCandidate => Boolean(candidate));
}

async function sendDeadlineReminderBatch({
  tasks,
  users,
  nearDeadlineDays = 2,
  markMemory = true,
  maxPerRun = parseInt(process.env.MAX_EMAIL_REMINDERS_PER_RUN || '5', 10),
}: {
  tasks: ReminderTask[];
  users: ReminderUser[];
  nearDeadlineDays?: number;
  markMemory?: boolean;
  maxPerRun?: number;
}) {
  const todayStr = getLocalDateString();
  const candidates = findReminderCandidates(tasks, users, nearDeadlineDays, todayStr);
  const candidatesToSend = candidates.slice(0, Math.max(1, maxPerRun));
  const sent: Array<{ taskId: string; type: ReminderType; reminderDate: string; provider?: string; previewUrl?: string }> = [];
  const failed: Array<{ taskId: string; type: ReminderType; error: string }> = [];

  for (const candidate of candidatesToSend) {
    try {
      const result = await sendEmailNotification({
        taskTitle: candidate.task.title,
        taskDescription: candidate.task.description || '',
        assigneeName: candidate.task.assignedName,
        assigneeEmail: candidate.assigneeEmail,
        deadline: candidate.task.deadline,
        type: candidate.type,
      });

      if (markMemory) {
        reminderRunMemory.add(`${todayStr}:${candidate.type}:${candidate.task.id}`);
      }

      sent.push({
        taskId: candidate.task.id,
        type: candidate.type,
        reminderDate: todayStr,
        provider: result.provider,
        previewUrl: typeof result.previewUrl === 'string' ? result.previewUrl : undefined,
      });
    } catch (error: any) {
      failed.push({
        taskId: candidate.task.id,
        type: candidate.type,
        error: error?.message || String(error),
      });
    }
  }

  return {
    todayStr,
    scanned: tasks.length,
    candidates: candidates.length,
    processed: candidatesToSend.length,
    remaining: Math.max(0, candidates.length - candidatesToSend.length),
    sent,
    failed,
  };
}

// 5. Send Email Reminder API
app.post('/api/email/send-reminder', async (req, res) => {
  const { taskTitle, taskDescription, assigneeName, assigneeEmail, deadline, type } = req.body;

  if (!taskTitle || !assigneeName || !assigneeEmail || !deadline || !type) {
    return res.status(400).json({ status: 'error', error: 'Missing required task details for email reminder.' });
  }

  try {
    const result = await sendEmailNotification({
      taskTitle,
      taskDescription,
      assigneeName,
      assigneeEmail,
      deadline,
      type,
    });
    res.json({ status: 'success', ...result });
  } catch (error: any) {
    console.error('Email error in send-reminder:', error);
    res.status(500).json({ status: 'error', error: error.message || 'Error sending email notification' });
  }
});

// 5b. Send Admissions Result & Scholarship Email to Parent API
app.post('/api/email/send-admissions-result', async (req, res) => {
  const { studentName, parentName, parentEmail, testScore, scholarshipInfo, stage } = req.body;

  if (!studentName || !parentName || !parentEmail) {
    return res.status(400).json({ status: 'error', error: 'Missing required admissions details.' });
  }

  const subject = `✨ THÔNG BÁO KẾT QUẢ KHẢO SÁT NĂNG LỰC ĐẦU VÀO - HS: ${studentName}`;
  const receiver = parentEmail;

  const htmlContent = `
    <div style="font-family: 'Be Vietnam Pro', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #4f46e5; color: white; padding: 24px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 850; letter-spacing: -0.02em;">HỆ THỐNG GIÁO DỤC ĐA TRÍ TUỆ MIS</h2>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Hội Đồng Tuyển Sinh Thông Báo</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
        <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Kính gửi Phụ huynh học sinh <strong>${parentName}</strong>,</p>
        
        <p style="font-size: 15px; line-height: 1.6;">Hội đồng Tuyển sinh Trường Đa Trí Tuệ MIS xin trân trọng thông báo kết quả khảo sát năng lực đầu vào và thông tin xét duyệt học bổng của học sinh <strong>${studentName}</strong>:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b; width: 40%;"><strong>Học sinh:</strong></td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${studentName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b;"><strong>Kết quả test năng lực:</strong></td>
              <td style="padding: 8px 0; color: #7c3aed; font-weight: bold; font-size: 15px;">${testScore || 'Đang chờ cập nhật'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b;"><strong>Thông tin học bổng:</strong></td>
              <td style="padding: 8px 0; color: #d97706; font-weight: bold;">${scholarshipInfo || 'Không nhận học bổng'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;"><strong>Trạng thái hồ sơ:</strong></td>
              <td style="padding: 8px 0; color: #4f46e5; font-weight: bold;">${stage || 'Đang xử lý'}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 15px; line-height: 1.6;">Quy trình hoàn tất hồ sơ tiếp theo của học sinh:</p>
        <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 13.5px; color: #475569; line-height: 1.6;">
          1. <strong>Xác nhận giữ chỗ</strong>: Hoàn thành phí giữ chỗ ưu đãi tuyển sinh sớm.<br/>
          2. <strong>Nộp hồ sơ học bạ gốc</strong>: Bổ sung Học bạ gốc THCS/Tiểu học, bản sao Giấy khai sinh và 3 ảnh 3x4 tại văn phòng tuyển sinh trường.<br/>
          3. <strong>Nhận biên chế lớp</strong>: Đóng học phí đợt 1 và nhận đồng phục, sách giáo khoa chuẩn bị cho năm học mới.
        </div>

        <div style="text-align: center; margin: 32px 0 12px 0;">
          <a href="http://localhost:3000" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
            Cổng Thông Tin Tuyển Sinh MIS
          </a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0;">Mọi thắc mắc vui lòng liên hệ Ban Tuyển sinh qua Hotline: <strong>024.1234.5678</strong> hoặc gửi phản hồi tới email này.</p>
        <p style="margin: 4px 0 0 0;">© 2026 Trường Đa Trí Tuệ MIS. All rights reserved.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Tuyển sinh MIS" <noreply@mis.edu.vn>',
    to: receiver,
    subject,
    html: htmlContent,
  };

  try {
    if (hasSmtpConfig()) {
      const transporter = nodemailer.createTransport(smtpConfig);
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Admissions notice sent via SMTP to ${receiver}. Message ID: ${info.messageId}`);
      res.json({ status: 'success', provider: 'SMTP', messageId: info.messageId });
    } else {
      console.log('------------------------------------------------------------');
      console.log(`[SMTP MOCK ADMISSIONS EMAIL] To: ${receiver}`);
      console.log(`Subject: ${subject}`);
      console.log(`Student: ${studentName} | Score: ${testScore} | Scholarship: ${scholarshipInfo}`);
      console.log('------------------------------------------------------------');

      try {
        const testAccount = await withTimeout(nodemailer.createTestAccount(), 8000, 'Ethereal test account creation');
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        });

        const info = await withTimeout(transporter.sendMail(mailOptions), 15000, 'Ethereal admissions email send');
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`[Email Service] Admissions Preview URL: ${previewUrl}`);
        res.json({ status: 'success', provider: 'Ethereal', previewUrl });
      } catch (err: any) {
        console.warn(`[Email Service] Admissions test email fallback: ${err?.message || err}`);
        res.json({
          status: 'success',
          provider: 'ConsoleLogOnly',
          warning: 'SMTP is not configured and Ethereal test email is unavailable; message was logged on the server only.',
        });
      }
    }
  } catch (error: any) {
    console.error('Email error in send-admissions-result:', error);
    res.status(500).json({ status: 'error', error: error.message || 'Error sending admissions email notification' });
  }
});

// 5c. Send Test Invitation Email to Parent API
app.post('/api/email/send-test-invite', async (req, res) => {
  const { studentName, parentName, parentEmail, testDate, testTime } = req.body;

  if (!studentName || !parentName || !parentEmail || !testDate || !testTime) {
    return res.status(400).json({ status: 'error', error: 'Missing required test invitation details.' });
  }

  const subject = `📧 THƯ MỜI THAM GIA KHẢO SÁT NĂNG LỰC ĐẦU VÀO - HS: ${studentName}`;
  const receiver = parentEmail;

  const htmlContent = `
    <div style="font-family: 'Be Vietnam Pro', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #4f46e5; color: white; padding: 24px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 850; letter-spacing: -0.02em;">HỆ THỐNG GIÁO DỤC ĐA TRÍ TUỆ MIS</h2>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Thư Mời Khảo Sát Năng Lực Đầu Vào</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
        <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Kính gửi Phụ huynh học sinh <strong>${parentName}</strong>,</p>
        
        <p style="font-size: 15px; line-height: 1.6;">Hội đồng Tuyển sinh Trường Đa Trí Tuệ MIS xin trân trọng kính mời học sinh <strong>${studentName}</strong> tham gia đợt khảo sát đánh giá năng lực đầu vào với lịch hẹn chi tiết như sau:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b; width: 40%;"><strong>Học sinh:</strong></td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${studentName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b;"><strong>Ngày làm bài test:</strong></td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: bold; font-size: 14.5px;">${testDate}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b;"><strong>Thời gian làm bài:</strong></td>
              <td style="padding: 8px 0; color: #7c3aed; font-weight: bold; font-size: 14.5px;">${testTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;"><strong>Địa điểm làm bài:</strong></td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">Phòng Khảo thí - Văn phòng Tuyển sinh MIS</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 15px; line-height: 1.6;"><strong>Lưu ý dành cho phụ huynh & học sinh:</strong></p>
        <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 13px; color: #475569; line-height: 1.6;">
          - Học sinh vui lòng có mặt trước giờ kiểm tra 15 phút.<br/>
          - Mang theo đồ dùng học tập cần thiết (Bút chì, bút mực, thước kẻ).<br/>
          - Kết quả kiểm tra sẽ được Hội đồng tuyển sinh thông báo trực tiếp qua Email/Cổng thông tin phụ huynh sau 3 ngày làm việc.
        </div>

        <div style="text-align: center; margin: 32px 0 12px 0;">
          <a href="http://localhost:3000" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
            Cổng Thông Tin Tuyển Sinh MIS
          </a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0;">Mọi thắc mắc vui lòng liên hệ Ban Tuyển sinh qua Hotline: <strong>024.1234.5678</strong>.</p>
        <p style="margin: 4px 0 0 0;">© 2026 Trường Đa Trí Tuệ MIS. All rights reserved.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Tuyển sinh MIS" <noreply@mis.edu.vn>',
    to: receiver,
    subject,
    html: htmlContent,
  };

  try {
    if (hasSmtpConfig()) {
      const transporter = nodemailer.createTransport(smtpConfig);
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Test invitation sent via SMTP to ${receiver}. Message ID: ${info.messageId}`);
      res.json({ status: 'success', provider: 'SMTP', messageId: info.messageId });
    } else {
      console.log('------------------------------------------------------------');
      console.log(`[SMTP MOCK TEST INVITATION] To: ${receiver}`);
      console.log(`Subject: ${subject}`);
      console.log(`Student: ${studentName} | Date: ${testDate} | Time: ${testTime}`);
      console.log('------------------------------------------------------------');

      try {
        const testAccount = await withTimeout(nodemailer.createTestAccount(), 8000, 'Ethereal test account creation');
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        });

        const info = await withTimeout(transporter.sendMail(mailOptions), 15000, 'Ethereal test invitation email send');
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`[Email Service] Test Invitation Preview URL: ${previewUrl}`);
        res.json({ status: 'success', provider: 'Ethereal', previewUrl });
      } catch (err: any) {
        console.warn(`[Email Service] Test invitation email fallback: ${err?.message || err}`);
        res.json({
          status: 'success',
          provider: 'ConsoleLogOnly',
          warning: 'SMTP is not configured and Ethereal test email is unavailable; message was logged on the server only.',
        });
      }
    }
  } catch (error: any) {
    console.error('Email error in send-test-invite:', error);
    res.status(500).json({ status: 'error', error: error.message || 'Error sending test invitation email' });
  }
});



// 6. Batch deadline reminder API
app.post('/api/email/run-deadline-reminders', async (req, res) => {
  const { tasks, users, nearDeadlineDays = 2, registerSource = true } = req.body;

  if (!Array.isArray(tasks) || !Array.isArray(users)) {
    return res.status(400).json({ status: 'error', error: 'tasks and users arrays are required.' });
  }

  try {
    if (registerSource) {
      registeredReminderSource = {
        tasks,
        users,
        nearDeadlineDays,
        registeredAt: Date.now(),
      };
    }

    const result = await sendDeadlineReminderBatch({
      tasks,
      users,
      nearDeadlineDays,
    });

    res.json({ status: 'success', ...result });
  } catch (error: any) {
    console.error('Email error in run-deadline-reminders:', error);
    res.status(500).json({ status: 'error', error: error.message || 'Error running deadline reminders' });
  }
});

setInterval(() => {
  if (!registeredReminderSource) return;

  sendDeadlineReminderBatch({
    tasks: registeredReminderSource.tasks,
    users: registeredReminderSource.users,
    nearDeadlineDays: registeredReminderSource.nearDeadlineDays,
  }).then(result => {
    if (result.sent.length > 0 || result.failed.length > 0) {
      console.log('[Email Service] Scheduled reminder run result:', result);
    }
  }).catch(error => {
    console.error('[Email Service] Scheduled reminder run failed:', error);
  });
}, 1000 * 60 * 60 * 6);

// Vite server / Static build setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        }
      },
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server starting on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer();
