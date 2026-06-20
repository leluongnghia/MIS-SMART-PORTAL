import { NextResponse } from 'next/server';
import { db, schema } from '../../../../../libs/server/db';
import { crmStageToLeadStatus, dbLeadToCrmLead, normalizeCrmLead } from '../../../../../libs/server/crm';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import { notifyAdmissionLeadAssigned } from '@/src/libs/server/notification-center';

export async function POST(request: Request) {
  const payload = await request.json();
  const studentName = String(payload.studentName || payload.student_name || payload.name || '').trim();
  const parentName = String(payload.parentName || payload.parent_name || payload.contactName || '').trim();
  const phone = String(payload.phone || payload.mobile || payload.parentPhone || '').trim();

  if (!studentName || !parentName || !phone) {
    return NextResponse.json({
      status: 'error',
      error: 'studentName, parentName and phone are required.',
    }, { status: 400 });
  }

  const lead = normalizeCrmLead({
    ...payload,
    id: `intake_${Date.now()}`,
    studentName,
    parentName,
    phone,
    campaign: payload.campaign || payload.campaignName || payload.utm_campaign || 'Website tuyển sinh',
    stage: 'NEW_LEAD',
  });
  const now = new Date();

  const [created] = await db.insert(schema.leads).values({
    id: lead.id,
    leadCode: lead.leadCode,
    fullName: lead.studentName,
    parentName: lead.parentName,
    phone: lead.phone,
    email: lead.email || null,
    source: lead.source || 'website',
    grade: lead.grade || 'Lớp 10',
    status: crmStageToLeadStatus(lead.stage) as any,
    notes: lead.notes || null,
    payload: lead,
    updatedAt: now,
  }).returning();

  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    leadId: created.id,
    type: 'intake',
    title: 'Lead intake queued from public form/API',
    description: lead.notes || null,
    payload: lead,
    activityAt: now,
    updatedAt: now,
  });

  const actor = await getCurrentActor().catch(() => null);
  await notifyAdmissionLeadAssigned(created, actor).catch(error => console.error('notifyAdmissionLeadAssigned failed:', error));

  return NextResponse.json({
    status: 'success',
    lead: dbLeadToCrmLead(created),
    queueSize: 1,
  }, { status: 201 });
}
