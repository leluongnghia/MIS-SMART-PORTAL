import { NextResponse } from 'next/server';
import { getCurrentActor, writeAuditLog } from '../../../../../libs/server/auth-helper';
import { buildVietQrUrl, crmPaymentTypeToDb, dbLeadToCrmLead, getBankConfig, normalizeCrmLead } from '../../../../../libs/server/crm';
import { requireCrmLeadAccess } from '../../../../../libs/server/crm-permissions';
import { db, schema } from '../../../../../libs/server/db';
import { permissionErrorResponse, requirePermission } from '../../../../../libs/server/permission-service';
import { notifyAdmissionPaymentUpdated } from '@/src/libs/server/notification-center';

function normalizeTransferPart(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ä‘/g, 'd')
    .replace(/Ä/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
    .slice(0, 40);
}

function buildTransferContent(leadCode: string, studentName: string, paymentType: string) {
  return `MIS-${normalizeTransferPart(leadCode)}-${normalizeTransferPart(studentName)}-${normalizeTransferPart(paymentType)}`;
}

export async function POST(request: Request) {
  try {
    await requirePermission('crm.payment.create');

    const actor = await getCurrentActor();
    if (!actor) {
      return NextResponse.json({ status: 'error', error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const leadId = String(body?.leadId || body?.id || '');
    const dbLead = leadId ? await requireCrmLeadAccess(leadId, 'crm.payment.create') : null;
    const existing: any = dbLead ? dbLeadToCrmLead(dbLead) : normalizeCrmLead(body?.lead || body || {});

    if (!existing.studentName || !existing.phone) {
      return NextResponse.json({ status: 'error', error: 'A valid leadId or lead payload is required.' }, { status: 400 });
    }

    let persistedLead = dbLead;
    if (!persistedLead) {
      await requirePermission('crm.lead.create');
      [persistedLead] = await db.insert(schema.leads).values({
        id: existing.id,
        leadCode: existing.leadCode,
        fullName: existing.studentName,
        parentName: existing.parentName || null,
        phone: existing.phone,
        email: existing.email || null,
        source: existing.source || 'website',
        grade: existing.grade || 'Lop 10',
        status: 'received',
        assignedUserId: actor.id,
        notes: existing.notes || null,
        payload: existing,
        updatedAt: new Date(),
      }).returning();
    }

    const bank = getBankConfig();
    const crmType = String(body?.type || 'RESERVATION').toUpperCase() === 'ENROLLMENT' ? 'ENROLLMENT' : 'RESERVATION';
    const amount = Number(body?.amount || (crmType === 'RESERVATION' ? existing.reservationFee : existing.baseTuitionFee));
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ status: 'error', error: 'So tien thanh toan khong hop le.' }, { status: 400 });
    }

    const code = buildTransferContent(persistedLead.leadCode, existing.studentName || persistedLead.fullName, crmType);
    const now = new Date();

    const [payment] = await db.insert(schema.payments).values({
      id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      leadId: persistedLead.id,
      type: crmPaymentTypeToDb(crmType) as any,
      status: 'pending',
      amount,
      transferContent: code,
      payload: { code, bank, crmType, createdBy: actor.id },
      updatedAt: now,
    }).returning();

    await db.insert(schema.leadActivities).values({
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      leadId: persistedLead.id,
      type: 'payment_created',
      title: `Created VietQR ${code}`,
      payload: { paymentId: payment.id, code, amount, actorId: actor.id },
      activityAt: now,
      updatedAt: now,
    });

    await writeAuditLog(actor.id, 'CREATE_VIETQR', 'PAYMENT', payment.id, {
      leadId: persistedLead.id,
      code,
      amount,
      crmType,
      module: 'crm',
    });
    await notifyAdmissionPaymentUpdated({ ...payment, code }, actor)
      .catch(error => console.error('notifyAdmissionPaymentUpdated failed:', error));

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
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
