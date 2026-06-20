import { NextRequest, NextResponse } from 'next/server';
import { listFiles, uploadFileToStorage } from '@/src/libs/server/file-service';

export async function GET(request: NextRequest) {
  try {
    const p = request.nextUrl.searchParams;
    const data = await listFiles({ module: p.get('module') || 'ALL', status: p.get('status') || undefined, visibility: p.get('visibility') || 'ALL', entityType: p.get('entityType') || undefined, entityId: p.get('entityId') || undefined, q: p.get('q') || undefined, includeDeleted: p.get('includeDeleted') === 'true', page: Number(p.get('page') || 1), pageSize: Number(p.get('pageSize') || 50) });
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'STORAGE_LIST_FAILED' }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const item = await uploadFileToStorage(await request.formData());
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'STORAGE_UPLOAD_FAILED' }, { status: error.message === 'Unauthorized' ? 401 : 400 });
  }
}
