import { NextResponse } from 'next/server';
import { appendCrmWorkflowLog, crmStore } from '../../../../../libs/server/crm';

export async function POST(request: Request) {
  const body = await request.json();
  const lines = Array.isArray(body?.rows)
    ? body.rows.map((item: any) => JSON.stringify(item))
    : String(body?.text || body?.csv || '').split(/\r?\n/).filter(Boolean);

  const matches: any[] = [];
  crmStore.payments.forEach((payment, paymentId) => {
    const matchedLine = lines.find((line: string) =>
      line.toUpperCase().includes(String(payment.code).toUpperCase()) ||
      (line.includes(String(payment.amount)) && line.toUpperCase().includes(String(payment.leadId).toUpperCase()))
    );
    if (!matchedLine || payment.status === 'MATCHED') return;
    const matchedPayment = {
      ...payment,
      status: 'MATCHED',
      matchedAt: new Date().toISOString(),
      statementRef: matchedLine,
    };
    crmStore.payments.set(paymentId, matchedPayment);
    const lead = crmStore.leads.get(payment.leadId);
    if (lead) {
      const nextStage = payment.type === 'RESERVATION' ? 'SEAT_RESERVED' : 'DOCUMENTS_PENDING';
      crmStore.leads.set(payment.leadId, { ...lead, stage: nextStage, updatedAt: new Date().toISOString() });
      appendCrmWorkflowLog(payment.leadId, `Payment reconciled: ${payment.code}`);
    }
    matches.push(matchedPayment);
  });

  return NextResponse.json({ status: 'success', matchedCount: matches.length, matches });
}
