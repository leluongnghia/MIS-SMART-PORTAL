'use server';

import { db, schema } from '@/src/libs/server/db';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { type LeadStatus } from '../leads/actions';

export async function getAdmissionsData() {
  const allLeads = await db.select().from(schema.leads);
  const allUsers = await db.select().from(schema.users);
  
  // Fetch activities to display the last activity date for each lead
  const allActivities = await db
    .select()
    .from(schema.leadActivities)
    .orderBy(desc(schema.leadActivities.activityAt));

  return {
    leads: allLeads,
    users: allUsers,
    activities: allActivities,
  };
}

export async function updateLeadStatusKanban(
  leadId: string,
  toStatus: LeadStatus,
  note?: string
) {
  const existing = await db
    .select()
    .from(schema.leads)
    .where(eq(schema.leads.id, leadId))
    .limit(1);
  const lead = existing[0];

  if (!lead) {
    throw new Error('Lead not found');
  }

  const fromStatus = lead.status;
  if (fromStatus === toStatus) return { success: true };

  await db
    .update(schema.leads)
    .set({
      status: toStatus,
      updatedAt: new Date(),
    })
    .where(eq(schema.leads.id, leadId));

  // Log pipeline change
  await db.insert(schema.leadPipeline).values({
    id: `pipe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId,
    fromStatus,
    toStatus,
    changedAt: new Date(),
    note: note || `Status updated via Kanban board from ${fromStatus} to ${toStatus}`,
    payload: {},
  });

  // Log activity
  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId,
    type: 'pipeline',
    title: 'Status Updated',
    description: `Lead status updated via Kanban board to ${toStatus}`,
    activityAt: new Date(),
    payload: {},
  });

  revalidatePath('/[locale]/admissions', 'page');
  revalidatePath('/[locale]/leads', 'page');
  revalidatePath(`/[locale]/leads/${leadId}`, 'page');
  return { success: true };
}
