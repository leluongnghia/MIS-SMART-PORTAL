import { NextResponse } from 'next/server';
import { getApprovalHistory, getApprovalRequestById } from '@/src/libs/server/approval-engine';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const item = await getApprovalRequestById(id);
    const history = await getApprovalHistory(id);
    return NextResponse.json({ success: true, item, history });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : error.message === 'NOT_FOUND' ? 404 : 500;
    return NextResponse.json({ success: false, error: error.message || 'APPROVAL_GET_FAILED' }, { status });
  }
}
