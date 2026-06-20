import { NextResponse } from 'next/server';
import { archiveNotification } from '@/src/libs/server/notification-center';

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await archiveNotification(decodeURIComponent(id));
    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : error?.message === 'NOT_FOUND' ? 404 : 500;
    return NextResponse.json({ status: 'error', error: error?.message || 'Không lưu trữ được thông báo' }, { status });
  }
}
