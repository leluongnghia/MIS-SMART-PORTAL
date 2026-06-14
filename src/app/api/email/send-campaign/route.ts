import { NextResponse } from 'next/server';
import { hasSmtpConfig, sendMailWithFallback } from '../../../../libs/server/notification';

export async function POST(request: Request) {
  const { recipients, subject, html, text, campaignName } = await request.json();
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return NextResponse.json({ status: 'error', error: 'Recipients array is required.' }, { status: 400 });
  }
  if (!subject || (!html && !text)) {
    return NextResponse.json({ status: 'error', error: 'Subject and email content are required.' }, { status: 400 });
  }

  const normalizedRecipients = recipients
    .map((item: any) => ({
      email: String(item.email || '').trim(),
      name: String(item.name || item.parentName || '').trim(),
    }))
    .filter((item: any) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email));

  if (normalizedRecipients.length === 0) {
    return NextResponse.json({ status: 'error', error: 'No valid recipient email found.' }, { status: 400 });
  }

  const maxPerRun = Math.max(1, parseInt(process.env.MAX_CAMPAIGN_EMAILS_PER_RUN || '20', 10));
  const recipientsToSend = normalizedRecipients.slice(0, maxPerRun);

  if (!hasSmtpConfig()) {
    return NextResponse.json({
      status: 'success',
      provider: 'ConsoleLogOnly',
      processed: recipientsToSend.length,
      remaining: Math.max(0, normalizedRecipients.length - recipientsToSend.length),
      warning: `SMTP is not configured. Campaign ${campaignName || ''} was logged only.`,
      sent: [],
      failed: [],
    });
  }

  const sent: any[] = [];
  const failed: any[] = [];
  for (const recipient of recipientsToSend) {
    try {
      const result = await sendMailWithFallback({ to: recipient.email, subject, html, text });
      sent.push({ email: recipient.email, provider: result.provider, messageId: (result as any).messageId });
    } catch (error: any) {
      failed.push({ email: recipient.email, error: error.message || String(error) });
    }
  }

  return NextResponse.json({
    status: 'success',
    provider: 'SMTP',
    processed: recipientsToSend.length,
    remaining: Math.max(0, normalizedRecipients.length - recipientsToSend.length),
    sent,
    failed,
  });
}
