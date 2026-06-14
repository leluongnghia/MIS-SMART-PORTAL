import { NextResponse } from 'next/server';
import { appendCrmWorkflowLog, buildVietQrUrl, crmStore, getBankConfig, normalizeCrmLead } from '../../../../../libs/server/crm';

export async function POST(request: Request) {
  const body = await request.json();
  const leadId = String(body?.leadId || body?.id || '');
  const existing = crmStore.leads.get(leadId) || normalizeCrmLead(body?.lead || body || {});
  if (!existing.studentName || !existing.phone) {
    return NextResponse.json({ status: 'error', error: 'A valid leadId or lead payload is required.' }, { status: 400 });
  }
  crmStore.leads.set(existing.id, existing);

  const bank = getBankConfig();
  const paymentType = String(body?.type || 'RESERVATION').toUpperCase() === 'ENROLLMENT' ? 'ENROLLMENT' : 'RESERVATION';
  const code = paymentType === 'RESERVATION'
    ? `${bank.reservationPrefix}_${existing.leadCode}`
    : `${bank.enrollmentPrefix}_${existing.enrollmentCode}`;
  const amount = Number(body?.amount || (paymentType === 'RESERVATION' ? existing.reservationFee : existing.baseTuitionFee));
  const payment = {
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    leadId: existing.id,
    type: paymentType,
    code,
    amount,
    status: 'PENDING',
    bankBin: bank.bankBin,
    bankAccountNo: bank.bankAccountNo,
    bankAccountName: bank.bankAccountName,
    createdAt: new Date().toISOString(),
  };
  const withQr = { ...payment, vietQrUrl: buildVietQrUrl(payment) };
  crmStore.payments.set(withQr.id, withQr);
  appendCrmWorkflowLog(existing.id, `Created VietQR ${code}`);

  return NextResponse.json({ status: 'success', payment: withQr }, { status: 201 });
}
