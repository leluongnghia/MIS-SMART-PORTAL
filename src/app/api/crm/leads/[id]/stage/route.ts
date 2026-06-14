import { NextResponse } from 'next/server';
import { appendCrmWorkflowLog, crmStore, normalizeCrmStage } from '../../../../../../libs/server/crm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const existing = crmStore.leads.get(id);
  if (!existing) {
    return NextResponse.json({ status: 'error', error: 'CRM lead not found.' }, { status: 404 });
  }

  const body = await request.json();
  const stage = normalizeCrmStage(body?.stage);
  const next = {
    ...existing,
    stage,
    lostReason: stage === 'LOST' ? String(body?.lostReason || existing.lostReason || '') : existing.lostReason,
    updatedAt: new Date().toISOString(),
  };
  crmStore.leads.set(id, next);
  const log = appendCrmWorkflowLog(id, `Stage changed to ${stage}`);
  return NextResponse.json({ status: 'success', lead: next, workflowLog: log });
}
