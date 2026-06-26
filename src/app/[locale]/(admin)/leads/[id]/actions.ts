'use server';

import { db, schema } from '@/src/libs/server/db';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { type LeadStatus } from '../actions';
import { requireCrmLeadAccess } from '@/src/libs/server/crm-permissions';

export async function getLeadDetail(id: string) {
  await requireCrmLeadAccess(id, 'crm.lead.view');
  const leadList = await db
    .select()
    .from(schema.leads)
    .where(eq(schema.leads.id, id))
    .limit(1);
  const lead = leadList[0];

  if (!lead) {
    return null;
  }

  const activities = await db
    .select()
    .from(schema.leadActivities)
    .where(eq(schema.leadActivities.leadId, id))
    .orderBy(desc(schema.leadActivities.activityAt));

  const pipeline = await db
    .select()
    .from(schema.leadPipeline)
    .where(eq(schema.leadPipeline.leadId, id))
    .orderBy(desc(schema.leadPipeline.changedAt));

  const leadPayments = await db
    .select()
    .from(schema.payments)
    .where(eq(schema.payments.leadId, id))
    .orderBy(desc(schema.payments.createdAt));

  const leadDocuments = await db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.leadId, id))
    .orderBy(desc(schema.documents.createdAt));

  return {
    lead,
    activities,
    pipeline,
    payments: leadPayments,
    documents: leadDocuments,
  };
}

export async function updateLeadProfile(
  id: string,
  data: {
    fullName: string;
    parentName?: string;
    phone: string;
    email?: string;
    source: string;
    grade: string;
    notes?: string;
    // Student Details
    dateOfBirth?: Date | null;
    currentClass?: string | null;
    currentSchool?: string | null;
    address?: string | null;
    enrollmentSystem?: string | null;
    // Test Details
    testDate?: Date | null;
    testTime?: string | null;
    mathScore?: number | null;
    englishScore?: number | null;
    vietnameseScore?: number | null;
    // Financial & Discount Details
    scholarshipPercent?: number | null;
    periodDiscountPercent?: number | null;
    siblingDiscountPercent?: number | null;
    staffDiscountPercent?: number | null;
    otherDiscountPercent?: number | null;
    finalTuition?: number | null;
    seatReservationFee?: number | null;
    additionalFee?: number | null;
    seatReservationDate?: Date | null;
    // Post-Enrollment Details
    nationalStudentId?: string | null;
    insuranceId?: string | null;
    moetStudentId?: string | null;
    siblingsInfo?: any | null;
  }
) {
  await requireCrmLeadAccess(id, 'crm.lead.update');
  await db
    .update(schema.leads)
    .set({
      fullName: data.fullName,
      parentName: data.parentName || null,
      phone: data.phone,
      email: data.email || null,
      source: data.source,
      grade: data.grade,
      notes: data.notes || null,

      // Student Details
      dateOfBirth: data.dateOfBirth || null,
      currentClass: data.currentClass || null,
      currentSchool: data.currentSchool || null,
      address: data.address || null,
      enrollmentSystem: data.enrollmentSystem || null,

      // Test Details
      testDate: data.testDate || null,
      testTime: data.testTime || null,
      mathScore: data.mathScore || null,
      englishScore: data.englishScore || null,
      vietnameseScore: data.vietnameseScore || null,

      // Financial & Discount Details
      scholarshipPercent: data.scholarshipPercent || null,
      periodDiscountPercent: data.periodDiscountPercent || null,
      siblingDiscountPercent: data.siblingDiscountPercent || null,
      staffDiscountPercent: data.staffDiscountPercent || null,
      otherDiscountPercent: data.otherDiscountPercent || null,
      finalTuition: data.finalTuition || null,
      seatReservationFee: data.seatReservationFee || null,
      additionalFee: data.additionalFee || null,
      seatReservationDate: data.seatReservationDate || null,

      // Post-Enrollment Details
      nationalStudentId: data.nationalStudentId || null,
      insuranceId: data.insuranceId || null,
      moetStudentId: data.moetStudentId || null,
      siblingsInfo: data.siblingsInfo || null,
      
      updatedAt: new Date(),
    })
    .where(eq(schema.leads.id, id));

  // Log activity
  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId: id,
    type: 'update',
    title: 'Lead Profile Updated',
    description: 'Updated profile details',
    activityAt: new Date(),
    payload: {},
  });

  revalidatePath(`/[locale]/leads/${id}`, 'page');
  revalidatePath('/[locale]/leads', 'page');
  return { success: true };
}

export async function sendLeadEmail(
  leadId: string,
  data: {
    subject: string;
    body: string;
    toEmail: string;
  }
) {
  await requireCrmLeadAccess(leadId, 'crm.workflow.run');
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  let sent = false;
  let errorMsg = '';

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Phòng Tuyển sinh MIS" <${smtpUser}>`,
        to: data.toEmail,
        subject: data.subject,
        html: data.body,
      });
      sent = true;
    } catch (e: any) {
      console.error('Error sending real email:', e);
      errorMsg = e.message || 'Unknown SMTP error';
    }
  }

  // Log activity
  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId,
    type: 'email',
    title: sent ? `Đã gửi Email: ${data.subject}` : `Đã ghi nhận Email (Giả lập): ${data.subject}`,
    description: `Gửi tới: ${data.toEmail}\n\nNội dung:\n${data.body.replace(/<[^>]*>/g, '')}\n\nTrạng thái: ${sent ? 'Thành công' : 'Giả lập (Chưa cấu hình SMTP)'}${errorMsg ? ` - Lỗi: ${errorMsg}` : ''}`,
    activityAt: new Date(),
    payload: {
      toEmail: data.toEmail,
      subject: data.subject,
      body: data.body,
      sentReal: sent,
      smtpError: errorMsg,
    },
  });

  // Log workflow log
  await db.insert(schema.crmWorkflowLogs).values({
    id: `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId,
    name: `Email: ${data.subject}`,
    channel: 'EMAIL',
    status: sent ? 'SENT' : 'MOCKED',
    payload: { error: errorMsg },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath(`/[locale]/leads/${leadId}`, 'page');
  return { success: true, sentReal: sent };
}

export async function addConsultationActivity(
  leadId: string,
  data: {
    title: string;
    description?: string;
  }
) {
  await requireCrmLeadAccess(leadId, 'crm.lead.update');
  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId,
    type: 'consultation',
    title: data.title,
    description: data.description || null,
    activityAt: new Date(),
    payload: {},
  });

  revalidatePath(`/[locale]/leads/${leadId}`, 'page');
  return { success: true };
}

export async function updateLeadPipelineStatus(
  leadId: string,
  toStatus: LeadStatus,
  note?: string
) {
  await requireCrmLeadAccess(leadId, 'crm.lead.stage.update');
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
    note: note || `Status updated from ${fromStatus} to ${toStatus}`,
    payload: {},
  });

  // Log activity
  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId,
    type: 'pipeline',
    title: 'Status Updated',
    description: `Lead status updated to ${toStatus}`,
    activityAt: new Date(),
    payload: {},
  });

  revalidatePath(`/[locale]/leads/${leadId}`, 'page');
  revalidatePath('/[locale]/leads', 'page');
  return { success: true };
}
