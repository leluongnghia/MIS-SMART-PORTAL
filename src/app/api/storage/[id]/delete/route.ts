import { NextResponse } from 'next/server';
import { softDeleteFile } from '@/src/libs/server/file-service';
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) { try { const { id } = await context.params; return NextResponse.json({ success: true, ...(await softDeleteFile(id)) }); } catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: 400 }); } }
