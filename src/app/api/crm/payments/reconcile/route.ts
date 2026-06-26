import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db, schema } from '../../../../../libs/server/db';
import { dbPaymentTypeToCrm } from '../../../../../libs/server/crm';
import { requireCrmLeadAccess } from '../../../../../libs/server/crm-permissions';
import { permissionErrorResponse, requirePermission } from '../../../../../libs/server/permission-service';

export async function POST(request: Request) {
  try {
    await requirePermission('crm.payment.reconcile');

    const body = await request.json();
    const lines = Array.isArray(body?.rows)
      ? body.rows.map((item: any) => JSON.stringify(item))
      : String(body?.text || body?.csv || '').split(/\r?\n/).filter(Boolean);

    const pendingPayments = await db.select().from(schema.payments).where(eq(schema.payments.status, 'pending'));
    const matches: any[] = [];
    const now = new Date();

    for (const payment of pendingPayments) {
      await requireCrmLeadAccess(payment.leadId, 'crm.payment.reconcile');

      const code = String((payment.payload as any)?.code || payment.transferContent || '');
      const matchedLine = lines.find((line: string) =>
        line.toUpperCase().includes(code.toUpperCase()) ||
        (line.includes(String(payment.amount)) && line.toUpperCase().includes(String(payment.leadId).toUpperCase()))
      );
      if (!matchedLine) continue;

      const [matchedPayment] = await db.update(schema.payments)
        .set({
          status: 'paid',
          paidAt: now,
          payload: { ...(payment.payload as any), statementRef: matchedLine, matchedAt: now.toISOString() },
          updatedAt: now,
        })
        .where(eq(schema.payments.id, payment.id))
        .returning();

      const nextStatus = payment.type === 'seat_reservation' ? 'seat_reserved' : 'docs_submitted';
      await db.update(schema.leads)
        .set({ status: nextStatus as any, updatedAt: now })
        .where(eq(schema.leads.id, payment.leadId));

      await db.insert(schema.leadActivities).values({
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        leadId: payment.leadId,
        type: 'payment_reconciled',
        title: `Payment reconciled: ${code}`,
        description: matchedLine,
        payload: { paymentId: payment.id, code },
        activityAt: now,
        updatedAt: now,
      });

      matches.push({
        id: matchedPayment.id,
        leadId: matchedPayment.leadId,
        type: dbPaymentTypeToCrm(matchedPayment.type),
        code,
        amount: matchedPayment.amount,
        status: 'MATCHED',
        matchedAt: now.toISOString(),
        statementRef: matchedLine,
      });
    }

    return NextResponse.json({ status: 'success', matchedCount: matches.length, matches });
  } catch (error) {
    return permissionErrorResponse(error);
  }
}
