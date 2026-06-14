'use server';

import { db, schema } from '@/src/libs/server/db';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getPayments() {
  // Fetch payments joined with leads to display candidate information
  const paymentList = await db
    .select({
      payment: schema.payments,
      lead: {
        id: schema.leads.id,
        leadCode: schema.leads.leadCode,
        fullName: schema.leads.fullName,
      },
    })
    .from(schema.payments)
    .innerJoin(schema.leads, eq(schema.payments.leadId, schema.leads.id))
    .orderBy(desc(schema.payments.createdAt));

  return paymentList;
}

export async function getLeadsForPayment() {
  return await db
    .select({
      id: schema.leads.id,
      leadCode: schema.leads.leadCode,
      fullName: schema.leads.fullName,
      status: schema.leads.status,
    })
    .from(schema.leads)
    .orderBy(desc(schema.leads.createdAt));
}

export async function createPayment({
  leadId,
  type,
  amount,
}: {
  leadId: string;
  type: 'seat_reservation' | 'tuition' | 'admission_fee';
  amount: number;
}) {
  const leadList = await db
    .select()
    .from(schema.leads)
    .where(eq(schema.leads.id, leadId))
    .limit(1);
  const lead = leadList[0];

  if (!lead) {
    throw new Error('Lead not found');
  }

  // Generate transfer content according to type and lead code
  // Seat reservation: SEAT-L000001
  // Enrollment: ENROLL-L000001
  let prefix = 'PAY';
  if (type === 'seat_reservation') {
    prefix = 'SEAT';
  } else if (type === 'tuition') {
    prefix = 'ENROLL';
  } else if (type === 'admission_fee') {
    prefix = 'ADMISSION';
  }

  const transferContent = `${prefix}-${lead.leadCode}`;
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  await db.insert(schema.payments).values({
    id: paymentId,
    leadId,
    type,
    status: 'pending',
    amount,
    currency: 'VND',
    transferContent,
    payload: {},
  });

  // Log activity on the lead
  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    leadId,
    type: 'payment_created',
    title: 'Yêu cầu thanh toán được tạo',
    description: `Đã tạo yêu cầu thanh toán ${type === 'seat_reservation' ? 'Giữ chỗ' : type === 'tuition' ? 'Học phí' : 'Lệ phí tuyển sinh'} với số tiền ${amount.toLocaleString('vi-VN')} đ`,
    activityAt: new Date(),
    payload: {},
  });

  revalidatePath('/[locale]/payments', 'page');
  revalidatePath(`/[locale]/leads/${leadId}`, 'page');
  return { success: true, paymentId };
}

export async function confirmPayment(paymentId: string) {
  const existingList = await db
    .select()
    .from(schema.payments)
    .where(eq(schema.payments.id, paymentId))
    .limit(1);
  const payment = existingList[0];

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status === 'paid') {
    return { success: true };
  }

  // Update payment status
  await db
    .update(schema.payments)
    .set({
      status: 'paid',
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.payments.id, paymentId));

  // Update Lead Status accordingly:
  // If payment is for seat_reservation -> seat_reserved
  // If payment is for tuition -> payment_confirmed or enrolled
  const leadList = await db
    .select()
    .from(schema.leads)
    .where(eq(schema.leads.id, payment.leadId))
    .limit(1);
  const lead = leadList[0];

  if (lead) {
    let newStatus = lead.status;
    if (payment.type === 'seat_reservation') {
      newStatus = 'seat_reserved';
    } else if (payment.type === 'tuition') {
      newStatus = 'payment_confirmed';
    }

    if (newStatus !== lead.status) {
      const fromStatus = lead.status;
      await db
        .update(schema.leads)
        .set({
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(schema.leads.id, lead.id));

      // Log pipeline history
      await db.insert(schema.leadPipeline).values({
        id: `pipe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        leadId: lead.id,
        fromStatus,
        toStatus: newStatus,
        changedAt: new Date(),
        note: `Cập nhật trạng thái sau khi xác nhận thanh toán thành công`,
        payload: {},
      });

      // Log activity
      await db.insert(schema.leadActivities).values({
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        leadId: lead.id,
        type: 'pipeline',
        title: 'Trạng thái cập nhật (Thanh toán)',
        description: `Trạng thái tự động cập nhật từ ${fromStatus} sang ${newStatus} sau khi xác nhận thanh toán.`,
        activityAt: new Date(),
        payload: {},
      });
    }
  }

  revalidatePath('/[locale]/payments', 'page');
  if (lead) {
    revalidatePath(`/[locale]/leads/${lead.id}`, 'page');
  }
  return { success: true };
}
