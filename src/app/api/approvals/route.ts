import { NextRequest, NextResponse } from 'next/server';
import { createApprovalRequest, getApprovalRequests } from '@/src/libs/server/approval-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await getApprovalRequests({
      status: (searchParams.get('status') || 'ALL') as any,
      module: (searchParams.get('module') || 'ALL') as any,
      mine: searchParams.get('mine') === 'true',
      page: Number(searchParams.get('page') || 1),
      pageSize: Number(searchParams.get('pageSize') || 50),
    });
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'APPROVALS_GET_FAILED' }, { status: error.message === 'UNAUTHORIZED' ? 401 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const item = await createApprovalRequest(body);
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, error: error.message || 'APPROVAL_CREATE_FAILED' }, { status });
  }
}
