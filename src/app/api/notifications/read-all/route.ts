import { NextResponse } from 'next/server';
import { markAllNotificationsAsRead } from '@/src/libs/server/notification-center';

export async function PATCH() {
  try {
    await markAllNotificationsAsRead();
    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error?.message || 'Không đánh dấu được thông báo' }, { status: error?.message === 'UNAUTHORIZED' ? 401 : 500 });
  }
}
