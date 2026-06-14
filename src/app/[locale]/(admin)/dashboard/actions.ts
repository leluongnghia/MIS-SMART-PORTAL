'use server';

import { db, schema } from '@/src/libs/server/db';
import { eq, and } from 'drizzle-orm';

export async function getDashboardStats() {
  const allLeads = await db.select().from(schema.leads);
  const paidPayments = await db
    .select()
    .from(schema.payments)
    .where(eq(schema.payments.status, 'paid'));

  const totalLeadsCount = allLeads.length;

  const newLeads = allLeads.filter(l => l.status === 'received').length;
  
  // Active leads: consulting, test_scheduled, test_participated, seat_reserved, docs_submitted
  const activeStatuses = ['consulting', 'test_scheduled', 'test_participated', 'seat_reserved', 'docs_submitted'];
  const activeLeads = allLeads.filter(l => activeStatuses.includes(l.status)).length;
  
  const appsSubmitted = allLeads.filter(l => l.status === 'docs_submitted').length;
  const seatReserved = allLeads.filter(l => l.status === 'seat_reserved').length;
  const enrolled = allLeads.filter(l => l.status === 'enrolled').length;

  // Seat reservation revenue
  const seatReservationRevenue = paidPayments
    .filter(p => p.type === 'seat_reservation')
    .reduce((sum, p) => sum + p.amount, 0);

  // Conversion rate (Enrolled / Total Leads)
  const conversionRate = totalLeadsCount > 0 ? (enrolled / totalLeadsCount) * 100 : 0;

  // Get recent 5 leads to showcase on dashboard
  const recentLeads = [...allLeads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return {
    kpis: {
      newLeads,
      activeLeads,
      appsSubmitted,
      seatReserved,
      enrolled,
      seatReservationRevenue,
      conversionRate,
    },
    recentLeads,
  };
}
