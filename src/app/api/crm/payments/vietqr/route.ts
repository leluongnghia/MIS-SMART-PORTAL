import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db, schema } from '../../../../../libs/server/db';
import { buildVietQrUrl, crmPaymentTypeToDb, dbLeadToCrmLead, normalizeCrmLead } from '../../../../../libs/server/crm';
import { getBankConfig } from '../../../../../libs/server/crm';

export async function POST(request: Request) {
  const body = await request.json();
  const leadId = String(body?.leadId || body?.id || '');
  const [dbLead] = leadId
    ? await db.select().from(schema.leads).where(eq(schema.leads.id, leadId)).limit(1)
    : [];
  const existing: any = dbLead ? dbLeadToCrmLead(dbLead) : normalizeCrmLead(body?.lead || body || {});

  if (!existing.studentName || !existing.phone) {
    return NextResponse.json({ status: 'error', error: 'A valid leadId or lead payload is required.' }, { status: 400 });
  }

  let persistedLead = dbLead;
  if (!persistedLead) {
    [persistedLead] = await db.insert(schema.leads).values({
      id: existing.id,
      leadCode: existing.leadCode,
      fullName: existing.studentName,
      parentName: existing.parentName || null,
      phone: existing.phone,
      email: existing.email || null,
      source: existing.source || 'website',
      grade: existing.grade || 'Lớp 10',
      status: 'received',
      notes: existing.notes || null,
      payload: existing,
      updatedAt: new Date(),
    }).returning();
  }

  const bank = getBankConfig();
  const crmType = String(body?.type || 'RESERVATION').toUpperCase() === 'ENROLLMENT' ? 'ENROLLMENT' : 'RESERVATION';
  const code = crmType === 'RESERVATION'
    ? `${bank.reservationPrefix}_${persistedLead.leadCode}`
    : `${bank.enrollmentPrefix}_${existing.enrollmentCode || persistedLead.leadCode}`;
  const amount = Number(body?.amount || (crmType === 'RESERVATION' ? existing.reservationFee : existing.baseTuitionFee));
  const now = new Date();

  const [payment] = await db.insert(schema.payments).values({
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    leadId: persistedLead.id,
    type: crmPaymentTypeToDb(crmType) as any,
    status: 'pending',
    amount,
    transferContent: code,
    payload: { code, bank, crmType },
    updatedAt: now,
  }).returning();

  await db.insert(schema.leadActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    leadId: persistedLead.id,
    type: 'payment_created',
    title: `Created VietQR ${code}`,
    payload: { paymentId: payment.id, code, amount },
    activityAt: now,
    updatedAt: now,
  });

  const responsePayment = {
    id: payment.id,
    leadId: payment.leadId,
    type: crmType,
    code,
    amount: payment.amount,
    status: 'PENDING',
    bankBin: bank.bankBin,
    bankAccountNo: bank.bankAccountNo,
    bankAccountName: bank.bankAccountName,
    createdAt: payment.createdAt,
  };

  return NextResponse.json({
    status: 'success',
    payment: { ...responsePayment, vietQrUrl: buildVietQrUrl(responsePayment) },
  }, { status: 201 });
}
