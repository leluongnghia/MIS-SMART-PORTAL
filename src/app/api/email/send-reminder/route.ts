import { NextResponse } from 'next/server';
import { sendMailWithFallback } from '../../../../libs/server/notification';

export async function POST(request: Request) {
  const { taskTitle, taskDescription, assigneeName, assigneeEmail, deadline, type } = await request.json();
  if (!taskTitle || !assigneeName || !assigneeEmail || !deadline || !type) {
    return NextResponse.json({ status: 'error', error: 'Missing required task details for email reminder.' }, { status: 400 });
  }

  try {
    const isOverdue = type === 'OVERDUE';
    const result = await sendMailWithFallback({
      to: assigneeEmail,
      subject: isOverdue ? `CẢNH BÁO: ${taskTitle} đã quá hạn` : `NHẮC NHỞ: ${taskTitle} sắp đến hạn`,
      html: `<div><h2>${taskTitle}</h2><p>${taskDescription || ''}</p><p>Người phụ trách: ${assigneeName}</p><p>Hạn: ${deadline}</p></div>`,
    });
    return NextResponse.json({ status: 'success', ...result });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error.message || 'Error sending email notification' }, { status: 500 });
  }
}
