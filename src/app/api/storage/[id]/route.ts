import { NextResponse } from 'next/server';
import { attachFileToEntity, getFileById, updateFileMetadata } from '@/src/libs/server/file-service';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try { const { id } = await context.params; return NextResponse.json({ success: true, item: await getFileById(id) }); }
  catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Unauthorized' ? 401 : error.message === 'Not found' ? 404 : 500 }); }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try { const { id } = await context.params; const body = await request.json(); const item = body?.attach ? await attachFileToEntity(id, body.attach) : await updateFileMetadata(id, body); return NextResponse.json({ success: true, item }); }
  catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Unauthorized' ? 401 : error.message === 'Not found' ? 404 : 400 }); }
}
