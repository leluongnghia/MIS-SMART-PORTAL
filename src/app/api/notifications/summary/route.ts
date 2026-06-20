import { NextResponse } from 'next/server';
import { getNotifications, getUnreadNotificationCount } from '@/src/libs/server/notification-center';

export async function GET() {
  try {
    const [counts, list] = await Promise.all([
      getUnreadNotificationCount(),
      getNotifications({ status: 'unread', page: 1, pageSize: 6 }),
    ]);
    return NextResponse.json({
      status: 'success',
      total: counts.total,
      tasks: counts.tasks,
      directives: counts.approvals,
      announcements: counts.admissions,
      urgent: counts.urgent,
      latest: list.items.map(item => ({ id: item.id, type: item.module.toLowerCase(), title: item.title, href: item.targetUrl || '/dashboard' })),
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[notifications/summary] DB error:', error);
    return NextResponse.json({ status: 'error', error: 'Không tải được badge thông báo' }, { status: 500 });
  }
}
