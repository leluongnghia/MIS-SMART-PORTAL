import { NextResponse } from 'next/server';
import { sendMailWithFallback } from '../../../../libs/server/notification';

export async function POST(request: Request) {
  const { studentName, parentName, parentEmail, testDate, testTime } = await request.json();
  if (!studentName || !parentName || !parentEmail || !testDate || !testTime) {
    return NextResponse.json({ status: 'error', error: 'Missing required test invitation details.' }, { status: 400 });
  }

  try {
    const result = await sendMailWithFallback({
      to: parentEmail,
      subject: `THƯ MỜI KHẢO SÁT NĂNG LỰC - HS: ${studentName}`,
      html: `<div><p>Kính gửi phụ huynh ${parentName},</p><p>Mời học sinh <b>${studentName}</b> tham gia khảo sát ngày ${testDate} lúc ${testTime}.</p></div>`,
    });
    return NextResponse.json({ status: 'success', ...result });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error.message || 'Error sending test invitation email' }, { status: 500 });
  }
}
