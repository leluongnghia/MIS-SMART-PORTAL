import { NextResponse } from 'next/server';
import { approveApprovalRequest } from '@/src/libs/server/approval-engine';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const item = await approveApprovalRequest(id, body.comment);
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : error.message === 'NOT_FOUND' ? 404 : 400;
    return NextResponse.json({ success: false, error: error.message || 'APPROVAL_APPROVE_FAILED' }, { status });
  }
}
