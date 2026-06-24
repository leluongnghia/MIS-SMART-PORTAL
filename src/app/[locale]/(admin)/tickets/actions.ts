"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq, desc, and, lt, isNull } from "drizzle-orm";

const SLA_HOURS: Record<string, number> = { normal: 48, high: 24, urgent: 4 };

export async function getTickets(filters?: { status?: string; priority?: string; category?: string }) {
  const conditions = [];
  if (filters?.status) conditions.push(eq(schema.parentTickets.status, filters.status));
  if (filters?.priority) conditions.push(eq(schema.parentTickets.priority, filters.priority));
  if (filters?.category) conditions.push(eq(schema.parentTickets.category, filters.category));
  // Soft-delete filter
  conditions.push(isNull(schema.parentTickets.deletedAt));

  const tickets = await db
    .select()
    .from(schema.parentTickets)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.parentTickets.createdAt));

  // Attach SLA breach flag
  const now = new Date();
  return tickets.map(t => {
    const slaH = SLA_HOURS[t.priority] ?? 48;
    const createdAt = new Date(t.createdAt);
    const hoursElapsed = (now.getTime() - createdAt.getTime()) / 3_600_000;
    const isOpen = t.status === 'open' || t.status === 'in_progress';
    return {
      ...t,
      slaBreached: isOpen && hoursElapsed > slaH,
      hoursElapsed: Math.round(hoursElapsed),
      slaHours: slaH,
    };
  });
}

export async function createTicket(data: {
  studentId?: string;
  parentName: string;
  parentPhone?: string;
  category: string;
  subject: string;
  description?: string;
  priority?: string;
}) {
  const id = `TKT-${Date.now()}`;
  await db.insert(schema.parentTickets).values({
    id,
    ...data,
    status: 'open',
    priority: data.priority ?? 'normal',
  });
  return { id };
}

export async function assignTicket(ticketId: string, assignedTo: string, actorName: string) {
  await db
    .update(schema.parentTickets)
    .set({ assignedTo, status: 'in_progress', firstRespondedAt: new Date() })
    .where(eq(schema.parentTickets.id, ticketId));

  await db.insert(schema.parentTicketActivities).values({
    id: `ACT-${Date.now()}`,
    ticketId,
    actorName,
    action: 'assign',
    content: `Phân công xử lý cho ${assignedTo}`,
    meta: { assignedTo },
  });
}

export async function resolveTicket(ticketId: string, actorName: string, content: string, rating?: number) {
  await db
    .update(schema.parentTickets)
    .set({ status: 'resolved', resolvedAt: new Date(), satisfactionRating: rating })
    .where(eq(schema.parentTickets.id, ticketId));

  await db.insert(schema.parentTicketActivities).values({
    id: `ACT-${Date.now()}`,
    ticketId,
    actorName,
    action: 'resolve',
    content,
    meta: { rating },
  });
}

export async function addTicketComment(ticketId: string, actorName: string, content: string) {
  await db.insert(schema.parentTicketActivities).values({
    id: `ACT-${Date.now()}`,
    ticketId,
    actorName,
    action: 'comment',
    content,
    meta: {},
  });
}

export async function getTicketActivities(ticketId: string) {
  return db
    .select()
    .from(schema.parentTicketActivities)
    .where(eq(schema.parentTicketActivities.ticketId, ticketId))
    .orderBy(desc(schema.parentTicketActivities.createdAt));
}

export async function getSlaBreaches() {
  const all = await getTickets({ status: 'open' });
  return all.filter(t => t.slaBreached);
}
