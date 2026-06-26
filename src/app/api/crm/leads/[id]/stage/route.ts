import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db, schema } from '../../../../../../libs/server/db';
import { crmStageToLeadStatus, dbLeadToCrmLead, normalizeCrmStage } from '../../../../../../libs/server/crm';
import { requireCrmLeadAccess } from '../../../../../../libs/server/crm-permissions';
import { permissionErrorResponse } from '../../../../../../libs/server/permission-service';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const stage = normalizeCrmStage(body?.stage);
    const status = crmStageToLeadStatus(stage);
    const now = new Date();

    const existing = await requireCrmLeadAccess(id, 'crm.lead.stage.update');

    const [updatedLead] = await db.update(schema.leads)
      .set({
        status: status as any,
        notes: stage === 'LOST' ? String(body?.lostReason || existing.notes || '') : existing.notes,
        updatedAt: now,
      })
      .where(eq(schema.leads.id, id))
      .returning();

    await db.insert(schema.leadPipeline).values({
      id: `pipe_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      leadId: id,
      fromStatus: existing.status,
      toStatus: status as any,
      note: String(body?.note || body?.lostReason || ''),
      payload: { requestedStage: stage },
      changedAt: now,
      updatedAt: now,
    });

    const [log] = await db.insert(schema.leadActivities).values({
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      leadId: id,
      type: 'stage_change',
      title: `Stage changed to ${stage}`,
      description: String(body?.note || body?.lostReason || ''),
      payload: { fromStatus: existing.status, toStatus: status, requestedStage: stage },
      activityAt: now,
      updatedAt: now,
    }).returning();

    return NextResponse.json({ status: 'success', lead: dbLeadToCrmLead(updatedLead), workflowLog: log });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
