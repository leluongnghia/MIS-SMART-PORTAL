import { NextResponse } from 'next/server';
import { sendMailWithFallback } from '../../../../libs/server/notification';

export async function POST(request: Request) {
  const { to, subject, message, useAdmissionsSmtp } = await request.json();
  const receiver = process.env.TEST_RECEIVER_EMAIL || to;
  if (!receiver) {
    return NextResponse.json({ status: 'error', error: 'Missing recipient email.' }, { status: 400 });
  }

  try {
    const result = await sendMailWithFallback({
      to: receiver,
      subject: subject || 'MIS Smart Portal - Kiểm thử SMTP',
      html: `<div style="font-family:Arial,sans-serif"><h2>MIS Smart Portal</h2><p>${message || 'Email kiểm thử được gửi từ phần Cài đặt hệ thống.'}</p></div>`,
      useAdmissionsSmtp,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error.message || 'Error sending SMTP test email' }, { status: 500 });
  }
}
