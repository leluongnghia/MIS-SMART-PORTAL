"use server";

import { db, schema } from "@/src/libs/server/db";
import { getCurrentActor } from "@/src/libs/server/auth-helper";
import { eq, desc, and, isNull, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getServiceTickets(filters?: { status?: string; serviceGroup?: string; departmentScope?: string }) {
  const conditions = [];
  if (filters?.status) conditions.push(eq(schema.serviceTickets.status, filters.status));
  
  if (filters?.serviceGroup) {
    conditions.push(eq(schema.serviceTickets.serviceGroup, filters.serviceGroup));
  } else if (filters?.departmentScope) {
    // Nếu có departmentScope nhưng không chỉ định rõ serviceGroup, giới hạn theo scope
    const scopes = filters.departmentScope.split(',').map(s => s.trim());
    if (scopes.length > 0) {
      conditions.push(inArray(schema.serviceTickets.serviceGroup, scopes));
    }
  }

  // Soft-delete filter
  conditions.push(isNull(schema.serviceTickets.deletedAt));

  const tickets = await db
    .select()
    .from(schema.serviceTickets)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.serviceTickets.createdAt));

  return tickets;
}

export async function getServiceTicket(id: string) {
  const tickets = await db
    .select()
    .from(schema.serviceTickets)
    .where(eq(schema.serviceTickets.id, id))
    .limit(1);
    
  return tickets[0] || null;
}

export async function updateServiceTicketStatus(ticketId: string, newStatus: string) {
  const user = await getCurrentActor();
  if (!user) throw new Error('Unauthorized');
  
  // Check valid transition logic if needed
  if (['CONFIRMED_CLOSED', 'REJECTED'].includes(newStatus) && user.role !== 'SCHOOL_SERVICE_OPERATIONS_MANAGER' && user.role !== 'ADMIN') {
    throw new Error('Chỉ Trưởng phòng mới có quyền phê duyệt đóng hoặc từ chối ticket.');
  }

  const oldTicket = await getServiceTicket(ticketId);
  if (!oldTicket) throw new Error('Ticket not found');

  await db.transaction(async (tx) => {
    // Cập nhật trạng thái
    await tx.update(schema.serviceTickets)
      .set({ 
        status: newStatus,
        updatedAt: new Date()
      })
      .where(eq(schema.serviceTickets.id, ticketId));
      
    // Ghi log hoạt động
    await tx.insert(schema.serviceTicketActivities).values({
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      ticketId,
      actorId: user.id,
      actorName: user.name || user.email,
      action: 'status_change',
      fromStatus: oldTicket.status,
      toStatus: newStatus,
      content: `Chuyển trạng thái từ ${oldTicket.status} sang ${newStatus}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  revalidatePath('/vi/school-services');
  revalidatePath('/en/school-services');
  return { success: true };
}

export async function addServiceTicketActivity(ticketId: string, content: string) {
  const user = await getCurrentActor();
  if (!user) throw new Error('Unauthorized');

  await db.insert(schema.serviceTicketActivities).values({
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    ticketId,
    actorId: user.id,
    actorName: user.name || user.email,
    action: 'comment',
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath('/vi/school-services');
  revalidatePath('/en/school-services');
  return { success: true };
}
