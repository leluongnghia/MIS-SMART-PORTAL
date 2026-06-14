import { NextResponse } from 'next/server';
import { appendCrmWorkflowLog, crmStore } from '../../../../../libs/server/crm';

export async function POST(request: Request) {
  const body = await request.json();
  const leadId = String(body?.leadId || '');
  const lead = crmStore.leads.get(leadId);
  if (!lead) {
    return NextResponse.json({ status: 'error', error: 'CRM lead not found.' }, { status: 404 });
  }

  const workflow = String(body?.workflow || 'AUTO_STAGE_WORKFLOW');
  const logs = [];
  if (lead.stage === 'ENTRANCE_TEST_REGISTERED') {
    logs.push(appendCrmWorkflowLog(leadId, 'Send entrance test schedule', 'EMAIL', lead.email ? 'SENT' : 'SKIPPED'));
    logs.push(appendCrmWorkflowLog(leadId, 'Prepare Zalo OA test reminder', 'ZALO', 'PENDING'));
  } else if (lead.stage === 'TEST_COMPLETED') {
    logs.push(appendCrmWorkflowLog(leadId, 'Send test result and scholarship proposal', 'EMAIL', lead.email ? 'SENT' : 'SKIPPED'));
  } else if (lead.stage === 'SEAT_RESERVED') {
    logs.push(appendCrmWorkflowLog(leadId, 'Send reservation confirmation and enrollment checklist', 'EMAIL', lead.email ? 'SENT' : 'SKIPPED'));
  } else if (lead.stage === 'DOCUMENTS_PENDING') {
    logs.push(appendCrmWorkflowLog(leadId, 'Check enrollment document readiness', 'SYSTEM', 'SENT'));
  } else {
    logs.push(appendCrmWorkflowLog(leadId, `No automatic action for ${lead.stage}`, 'SYSTEM', 'SKIPPED'));
  }

  return NextResponse.json({ status: 'success', workflow, logs });
}
