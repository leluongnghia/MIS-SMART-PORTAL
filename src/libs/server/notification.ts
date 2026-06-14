import nodemailer from 'nodemailer';

export const smtpConfig = {
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

export function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function getNotificationConfigStatus() {
  return {
    gemini: {
      configured: Boolean(process.env.GEMINI_API_KEY),
      requiredEnv: ['GEMINI_API_KEY'],
    },
    smtp: {
      configured: hasSmtpConfig(),
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

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

export async function sendMailWithFallback(mailOptions: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const from = process.env.EMAIL_FROM || '"MIS Smart Portal" <noreply@mis.edu.vn>';
  const receiver = process.env.TEST_RECEIVER_EMAIL || mailOptions.to;

  if (hasSmtpConfig()) {
    const transporter = nodemailer.createTransport(smtpConfig);
    await withTimeout(transporter.verify(), 10000, 'SMTP verify');
    const info = await withTimeout(
      transporter.sendMail({ ...mailOptions, from, to: receiver }),
      15000,
      'SMTP email send',
    );
    return { status: 'success', provider: 'SMTP', messageId: info.messageId, to: receiver };
  }

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
    const info = await withTimeout(
      transporter.sendMail({ ...mailOptions, from, to: receiver }),
      15000,
      'Ethereal email send',
    );
    return {
      status: 'success',
      provider: 'Ethereal',
      previewUrl: nodemailer.getTestMessageUrl(info),
      warning: 'SMTP is not configured. A test email was generated with Ethereal.',
    };
  } catch (error: any) {
    return {
      status: 'success',
      provider: 'ConsoleLogOnly',
      warning: error?.message || 'SMTP is not configured. Email was logged only.',
    };
  }
}
