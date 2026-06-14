import { NextResponse } from 'next/server';
import { sendMailWithFallback } from '../../../../libs/server/notification';

export async function POST(request: Request) {
  const { studentName, parentName, parentEmail, testScore, scholarshipInfo, stage } = await request.json();
  if (!studentName || !parentName || !parentEmail) {
    return NextResponse.json({ status: 'error', error: 'Missing required admissions details.' }, { status: 400 });
  }

  try {
    const result = await sendMailWithFallback({
      to: parentEmail,
      subject: `THÔNG BÁO KẾT QUẢ KHẢO SÁT - HS: ${studentName}`,
      html: `<div><p>Kính gửi phụ huynh ${parentName},</p><p>Học sinh: <b>${studentName}</b></p><p>Điểm: ${testScore || 'Chưa cập nhật'}</p><p>Học bổng: ${scholarshipInfo || 'Không'}</p><p>Trạng thái: ${stage || ''}</p></div>`,
    });
    return NextResponse.json({ status: 'success', ...result });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error.message || 'Error sending admissions email notification' }, { status: 500 });
  }
}
