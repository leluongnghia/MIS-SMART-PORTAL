import { NextResponse } from 'next/server';
import { appendCrmWorkflowLog, crmStore, normalizeCrmLead } from '../../../../../libs/server/crm';

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

  crmStore.leadIntakeQueue.unshift(lead);
  crmStore.leads.set(lead.id, lead);
  appendCrmWorkflowLog(lead.id, 'Lead intake queued from public form/API');
  if (crmStore.leadIntakeQueue.length > 200) crmStore.leadIntakeQueue.pop();

  return NextResponse.json({
    status: 'success',
    lead,
    queueSize: crmStore.leadIntakeQueue.length,
  }, { status: 201 });
}
