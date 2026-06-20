import { NextResponse } from 'next/server';
import { createNotification, getNotifications } from '@/src/libs/server/notification-center';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const result = await getNotifications({
      status: (url.searchParams.get('status') as any) || 'all',
      module: url.searchParams.get('module') || 'all',
      severity: url.searchParams.get('severity') || 'all',
      q: url.searchParams.get('q') || '',
      page: Number(url.searchParams.get('page') || 1),
      pageSize: Number(url.searchParams.get('pageSize') || 10),
    });
    return NextResponse.json({ status: 'success', ...result });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error?.message || 'Không tải được thông báo' }, { status: error?.message === 'UNAUTHORIZED' ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await createNotification(payload);
    return NextResponse.json({ status: 'success', notification: result }, { status: 201 });
  } catch (error: any) {
    const code = error?.message === 'FORBIDDEN' ? 403 : error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ status: 'error', error: error?.message || 'Không tạo được thông báo' }, { status: code });
  }
}
