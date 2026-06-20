import { NextResponse } from 'next/server';
import { getUnreadNotificationCount } from '@/src/libs/server/notification-center';

export async function GET() {
  try {
    const counts = await getUnreadNotificationCount();
    return NextResponse.json({ status: 'success', ...counts });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error?.message || 'Không tải được badge' }, { status: error?.message === 'UNAUTHORIZED' ? 401 : 500 });
  }
}
