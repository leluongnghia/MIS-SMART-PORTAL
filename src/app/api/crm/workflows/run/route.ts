import { NextResponse } from 'next/server';
import { db, schema } from '../../../../../libs/server/db';
import { dbLeadToCrmLead, leadStatusToCrmStage } from '../../../../../libs/server/crm';
import { requireCrmLeadAccess } from '../../../../../libs/server/crm-permissions';
import { permissionErrorResponse } from '../../../../../libs/server/permission-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const leadId = String(body?.leadId || '');
    const lead = await requireCrmLeadAccess(leadId, 'crm.workflow.run');

    const workflow = String(body?.workflow || 'AUTO_STAGE_WORKFLOW');
    const stage = leadStatusToCrmStage(lead.status);
    const crmLead = dbLeadToCrmLead(lead);
    const now = new Date();
    const planned = [];

    if (stage === 'ENTRANCE_TEST_REGISTERED') {
      planned.push(['Send entrance test schedule', 'EMAIL', crmLead.email ? 'SENT' : 'SKIPPED']);
      planned.push(['Prepare Zalo OA test reminder', 'ZALO', 'PENDING']);
    } else if (stage === 'TEST_COMPLETED') {
      planned.push(['Send test result and scholarship proposal', 'EMAIL', crmLead.email ? 'SENT' : 'SKIPPED']);
    } else if (stage === 'SEAT_RESERVED') {
      planned.push(['Send reservation confirmation and enrollment checklist', 'EMAIL', crmLead.email ? 'SENT' : 'SKIPPED']);
    } else if (stage === 'DOCUMENTS_PENDING') {
      planned.push(['Check enrollment document readiness', 'SYSTEM', 'SENT']);
    } else {
      planned.push([`No automatic action for ${stage}`, 'SYSTEM', 'SKIPPED']);
    }

    const logs = await db.insert(schema.crmWorkflowLogs).values(planned.map(([name, channel, status]) => ({
      id: `wf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      leadId,
      name,
      channel,
      status,
      payload: { workflow, stage },
      updatedAt: now,
    }))).returning();

    await db.insert(schema.leadActivities).values(logs.map(log => ({
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      leadId,
      type: 'workflow',
      title: log.name,
      description: `${log.channel}: ${log.status}`,
      payload: { workflow, workflowLogId: log.id },
      activityAt: now,
      updatedAt: now,
    })));

    return NextResponse.json({ status: 'success', workflow, logs });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
