import { NextResponse } from 'next/server';
import { archiveFile } from '@/src/libs/server/file-service';
export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) { try { const { id } = await context.params; return NextResponse.json({ success: true, ...(await archiveFile(id)) }); } catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: 400 }); } }
