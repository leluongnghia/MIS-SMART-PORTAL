import { NextResponse } from 'next/server';
import { getNotificationConfigStatus } from '../../../../../libs/server/notification';

export async function POST(request: Request) {
  const { title, content, audience, labels, scheduledAt, articleUrl } = await request.json();
  if (!title || !content) {
    return NextResponse.json({ status: 'error', error: 'Broadcast title and content are required.' }, { status: 400 });
  }

  const config = getNotificationConfigStatus().zalo;
  return NextResponse.json({
    status: 'success',
    provider: 'ZaloOA-Broadcast-Manual',
    configured: config.configured,
    draft: {
      id: `zalo_broadcast_${Date.now()}`,
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
}
