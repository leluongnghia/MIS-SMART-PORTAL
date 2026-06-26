"use server";

import { revalidatePath } from "next/cache";
import { db, schema } from "@/src/libs/server/db";
import { getCurrentActor } from "@/src/libs/server/auth-helper";
import { eq } from "drizzle-orm";

export async function createAcademicTask(data: any) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error("Unauthorized");

  await db.insert(schema.tasks).values({
    id: crypto.randomUUID(),
    title: data.title,
    description: data.description,
    workspaceId: actor.workspaceId || "SYSTEM",
    assignedId: data.assignedId,
    assignedName: data.assignedName,
    status: "TODO",
    priority: data.priority || "NORMAL",
    deadline: data.deadline,
    tag: "BGH_TASK",
    payload: {
      category: data.category,
      department: data.department,
      followerId: data.followerId,
      fileUrl: data.fileUrl,
      type: "ACADEMIC",
    },
  });

  revalidatePath("/(admin)/dashboard", "page");
  revalidatePath("/(admin)/dashboard/academic", "page");
  return { success: true };
}

export async function approveLessonPlan(planId: string, action: "approve" | "reject" | "return", note?: string) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error("Unauthorized");

  const { requirePermission } = await import('@/src/libs/server/permission-service');
  await requirePermission('academic.lesson_plan.approve');

  const statusMap = {
    approve: "approved",
    reject: "rejected",
    return: "draft"
  } as const;

  await db.update(schema.lessonPlans)
    .set({ 
      status: statusMap[action],
      approvedBy: actor.id,
      approvedAt: new Date(),
      reviewNote: note || null
    })
    .where(eq(schema.lessonPlans.id, planId));

  revalidatePath("/(admin)/dashboard", "page");
  revalidatePath("/(admin)/dashboard/academic", "page");
  return { success: true };
}

export async function createScheduleChangeRequest(data: any) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error("Unauthorized");

  await db.insert(schema.approvalRequests).values({
    id: crypto.randomUUID(),
    module: "ACADEMIC",
    entityType: "SCHEDULE_CHANGE",
    entityId: crypto.randomUUID(),
    title: `Yêu cầu đổi lịch dạy: ${data.className} - ${data.subject}`,
    description: data.reason,
    status: "PENDING",
    requesterId: actor.id,
    requesterName: actor.name,
    payload: {
      className: data.className,
      subject: data.subject,
      currentPeriod: data.currentPeriod,
      currentDate: data.currentDate,
      changeType: data.changeType, // Đổi tiết, Đổi giáo viên, Dạy thay...
      newTime: data.newTime,
      substituteTeacher: data.substituteTeacher,
      urgency: "HIGH",
    },
  });

  revalidatePath("/(admin)/dashboard", "page");
  revalidatePath("/(admin)/dashboard/academic", "page");
  return { success: true };
}

export async function createAcademicReport(data: any) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error("Unauthorized");

  await db.insert(schema.serviceTickets).values({
    id: crypto.randomUUID(),
    code: `AR-${Date.now().toString().slice(-6)}`,
    title: `Báo cáo: ${data.reportType}`,
    serviceGroup: "academic",
    priority: data.level === "Khẩn cấp" ? "urgent" : data.level === "Cần theo dõi" ? "high" : "normal",
    description: data.content,
    reportedBy: actor.name,
    reporterId: actor.id,
    status: "NEW",
    payload: {
      reportType: data.reportType,
      reportTime: data.reportTime,
      relatedClass: data.relatedClass,
      fileUrl: data.fileUrl,
      handler: data.handler
    },
  });

  revalidatePath("/(admin)/dashboard", "page");
  revalidatePath("/(admin)/dashboard/academic", "page");
  return { success: true };
}
