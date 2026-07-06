"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq, desc, and, lt, isNull, inArray } from "drizzle-orm";
import { getCurrentActor } from "@/src/libs/server/auth-helper";
import { revalidatePath } from "next/cache";

const SLA_HOURS: Record<string, number> = { normal: 48, high: 24, urgent: 4 };

const CATEGORY_TO_DEPT: Record<string, string[]> = {
  TUYEN_SINH_PR: ["admissions", "pr", "events"],
  CSVC: ["facilities"],
  SERVICES: ["services", "transport", "meals", "health"],
  ACADEMIC: ["academic"],
};

export async function getTickets(filters?: { status?: string; priority?: string; category?: string; assignedTo?: string }) {
  const actor = await getCurrentActor();
  const conditions = [];

  // Soft-delete filter
  conditions.push(isNull(schema.parentTickets.deletedAt));

  // Client Filters
  if (filters?.status) conditions.push(eq(schema.parentTickets.status, filters.status));
  if (filters?.priority) conditions.push(eq(schema.parentTickets.priority, filters.priority));
  if (filters?.category) conditions.push(eq(schema.parentTickets.category, filters.category));
  if (filters?.assignedTo) conditions.push(eq(schema.parentTickets.assignedTo, filters.assignedTo));

  // Role-based Access Control (RBAC) Filtering
  if (actor) {
    const isBghOrAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN" || actor.workspaceId === "BGH";
    
    if (!isBghOrAdmin) {
      if (actor.role === "PARENT" || actor.role === "STUDENT") {
        // Parents/Students only see tickets they created
        conditions.push(eq(schema.parentTickets.parentName, actor.name));
      } else if (actor.role === "MANAGER") {
        // Department Head: sees department-specific categories
        const allowedCategories = CATEGORY_TO_DEPT[actor.workspaceId || ""] || [];
        if (allowedCategories.length > 0) {
          conditions.push(inArray(schema.parentTickets.category, allowedCategories));
        }
      } else {
        // Staff/Handler: sees tickets assigned to them
        conditions.push(eq(schema.parentTickets.assignedTo, actor.id));
      }
    }
  }

  const tickets = await db
    .select({
      id: schema.parentTickets.id,
      studentId: schema.parentTickets.studentId,
      parentName: schema.parentTickets.parentName,
      parentPhone: schema.parentTickets.parentPhone,
      category: schema.parentTickets.category,
      subject: schema.parentTickets.subject,
      description: schema.parentTickets.description,
      priority: schema.parentTickets.priority,
      status: schema.parentTickets.status,
      assignedTo: schema.parentTickets.assignedTo,
      firstRespondedAt: schema.parentTickets.firstRespondedAt,
      resolvedAt: schema.parentTickets.resolvedAt,
      satisfactionRating: schema.parentTickets.satisfactionRating,
      createdAt: schema.parentTickets.createdAt,
      updatedAt: schema.parentTickets.updatedAt,
      assigneeName: schema.users.name,
    })
    .from(schema.parentTickets)
    .leftJoin(schema.users, eq(schema.parentTickets.assignedTo, schema.users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.parentTickets.createdAt));

  const now = new Date();
  return tickets.map(t => {
    const slaH = SLA_HOURS[t.priority] ?? 48;
    const createdAt = new Date(t.createdAt);
    const hoursElapsed = (now.getTime() - createdAt.getTime()) / 3_600_000;
    const isOpen = t.status === "open" || t.status === "received" || t.status === "in_progress" || t.status === "reopened";
    return {
      ...t,
      slaBreached: isOpen && hoursElapsed > slaH,
      hoursElapsed: Math.round(hoursElapsed),
      slaHours: slaH,
    };
  });
}

export async function getStaffUsers() {
  return await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      role: schema.users.role,
      title: schema.users.title,
    })
    .from(schema.users)
    .where(isNull(schema.users.deletedAt))
    .orderBy(schema.users.name);
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
    status: "open",
    priority: data.priority ?? "normal",
  });

  await db.insert(schema.parentTicketActivities).values({
    id: `ACT-${Date.now()}`,
    ticketId: id,
    actorName: data.parentName,
    action: "create",
    content: `Đã tạo ticket mới với chủ đề: ${data.subject}`,
    meta: {},
  });

  revalidatePath("/[locale]/(admin)/tickets", "page");
  return { id };
}

export async function assignTicket(ticketId: string, assignedToId: string, actorName: string) {
  const [targetUser] = await db
    .select({ name: schema.users.name })
    .from(schema.users)
    .where(eq(schema.users.id, assignedToId))
    .limit(1);

  const assigneeName = targetUser?.name || "Nhân viên";

  await db
    .update(schema.parentTickets)
    .set({ 
      assignedTo: assignedToId, 
      status: "received", 
      firstRespondedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(schema.parentTickets.id, ticketId));

  await db.insert(schema.parentTicketActivities).values({
    id: `ACT-${Date.now()}`,
    ticketId,
    actorName,
    action: "assign",
    content: `Phân công xử lý cho ${assigneeName}`,
    meta: { assignedToId, assigneeName },
  });

  revalidatePath("/[locale]/(admin)/tickets", "page");
}

export async function updateTicketStatus(ticketId: string, status: string, actorName: string, note?: string) {
  const updates: any = { status, updatedAt: new Date() };
  if (status === "resolved") {
    updates.resolvedAt = new Date();
  }

  await db
    .update(schema.parentTickets)
    .set(updates)
    .where(eq(schema.parentTickets.id, ticketId));

  let actionText = "Cập nhật trạng thái";
  if (status === "received") actionText = "Đã tiếp nhận yêu cầu";
  else if (status === "in_progress") actionText = "Bắt đầu xử lý ticket";
  else if (status === "pending_response") actionText = "Yêu cầu phản hồi từ người gửi";
  else if (status === "pending_approval") actionText = "Gửi yêu cầu chờ duyệt";
  else if (status === "resolved") actionText = "Hoàn thành xử lý ticket";
  else if (status === "cancelled") actionText = "Đã hủy bỏ ticket";

  await db.insert(schema.parentTicketActivities).values({
    id: `ACT-${Date.now()}`,
    ticketId,
    actorName,
    action: "status_change",
    content: note ? `${actionText} (${note})` : actionText,
    meta: { status },
  });

  revalidatePath("/[locale]/(admin)/tickets", "page");
}

export async function reopenTicket(ticketId: string, actorName: string, reason: string) {
  await db
    .update(schema.parentTickets)
    .set({ 
      status: "reopened", 
      resolvedAt: null, 
      updatedAt: new Date() 
    })
    .where(eq(schema.parentTickets.id, ticketId));

  await db.insert(schema.parentTicketActivities).values({
    id: `ACT-${Date.now()}`,
    ticketId,
    actorName,
    action: "reopen",
    content: `Mở lại ticket. Lý do: ${reason}`,
    meta: {},
  });

  revalidatePath("/[locale]/(admin)/tickets", "page");
}

export async function addTicketComment(ticketId: string, actorName: string, content: string) {
  await db.insert(schema.parentTicketActivities).values({
    id: `ACT-${Date.now()}`,
    ticketId,
    actorName,
    action: "comment",
    content,
    meta: {},
  });

  revalidatePath("/[locale]/(admin)/tickets", "page");
}

export async function getTicketActivities(ticketId: string) {
  return await db
    .select()
    .from(schema.parentTicketActivities)
    .where(eq(schema.parentTicketActivities.ticketId, ticketId))
    .orderBy(desc(schema.parentTicketActivities.createdAt));
}

export async function getSlaBreaches() {
  const all = await getTickets({ status: "open" });
  return all.filter(t => t.slaBreached);
}
