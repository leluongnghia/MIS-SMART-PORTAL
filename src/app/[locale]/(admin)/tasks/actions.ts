"use server";

import { db, schema } from "@/src/libs/server/db";
import { getCurrentActor, writeAuditLog } from "@/src/libs/server/auth-helper";
import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const COMPLETED_STATUSES = new Set(["HOAN_THANH", "completed", "done", "closed"]);
const STAFF_ALLOWED_STATUS_UPDATES = new Set(["DANG_TIEN_HANH", "in_progress", "CHO_DUYET", "pending_approval"]);

function sameScope(actor: any, row: { workspaceId?: string | null; assignedId?: string | null }) {
  if (actor.role === "ADMIN" || actor.workspaceId === "BGH") return true;
  if (actor.role === "MANAGER") return Boolean(row.workspaceId && row.workspaceId === actor.workspaceId);
  return row.assignedId === actor.id;
}

export async function getInitialData() {
  const actor = await getCurrentActor();
  if (!actor) return { data: [], workspaces: [], users: [], actor: null };

  try {
    const [data, workspaces, users] = await Promise.all([
      db.select().from(schema.tasks).where(isNull(schema.tasks.deletedAt)),
      db.select().from(schema.workspaces),
      db.select().from(schema.users),
    ]);

    const scopedData = data.filter((task) => sameScope(actor, task));
    const scopedUsers = actor.role === "ADMIN" || actor.workspaceId === "BGH"
      ? users
      : users.filter((user) => user.workspaceId === actor.workspaceId || user.id === actor.id);
    const scopedWorkspaces = actor.role === "ADMIN" || actor.workspaceId === "BGH"
      ? workspaces
      : workspaces.filter((workspace) => workspace.id === actor.workspaceId);

    return { data: scopedData, workspaces: scopedWorkspaces, users: scopedUsers, actor };
  } catch (e) {
    return { data: [], workspaces: [], users: [], actor };
  }
}

export async function createTask(formData: {
  title: string;
  description?: string;
  workspaceId: string;
  assignedId: string;
  priority: string;
  deadline?: string;
  tag?: string;
}) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  if (actor.role === "STAFF") {
    await writeAuditLog(actor.id, "CREATE_TASK_DENIED", "TASK", "new", { success: false, reason: "STAFF cannot create tasks" });
    return { success: false, error: "Bạn không có quyền tạo công việc." };
  }

  if (actor.role !== "ADMIN" && actor.workspaceId !== "BGH" && formData.workspaceId !== actor.workspaceId) {
    await writeAuditLog(actor.id, "CREATE_TASK_DENIED", "TASK", "new", { success: false, workspaceId: formData.workspaceId });
    return { success: false, error: "Bạn không có quyền tạo công việc ngoài đơn vị của mình." };
  }

  try {
    const id = `task_${Math.random().toString(36).substring(2, 9)}`;
    const userResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, formData.assignedId))
      .limit(1);
    const assignedUser = userResult[0];

    if (!assignedUser) return { success: false, error: "Người phụ trách không tồn tại." };
    if (actor.role !== "ADMIN" && actor.workspaceId !== "BGH" && assignedUser.workspaceId !== actor.workspaceId) {
      return { success: false, error: "Không thể giao việc cho người ngoài đơn vị." };
    }

    await db.insert(schema.tasks).values({
      id,
      title: formData.title,
      description: formData.description || "",
      workspaceId: formData.workspaceId,
      assignedId: formData.assignedId,
      assignedName: assignedUser.name || "Chưa phân công",
      status: "todo",
      priority: formData.priority,
      deadline: formData.deadline || null,
      tag: formData.tag || null,
      payload: { createdBy: actor.id },
    });

    await writeAuditLog(actor.id, "CREATE_TASK", "TASK", id, { title: formData.title, assignedId: formData.assignedId });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTaskStatus(taskId: string, status: string) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  try {
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
    if (!task || task.deletedAt) return { success: false, error: "Task không tồn tại." };
    if (!sameScope(actor, task)) {
      await writeAuditLog(actor.id, "UPDATE_TASK_STATUS_DENIED", "TASK", taskId, { success: false, status });
      return { success: false, error: "Bạn không có quyền cập nhật công việc này." };
    }
    if (actor.role === "STAFF" && !STAFF_ALLOWED_STATUS_UPDATES.has(status)) {
      return { success: false, error: "Bạn không có quyền chuyển sang trạng thái này." };
    }

    await db
      .update(schema.tasks)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.tasks.id, taskId));

    await writeAuditLog(actor.id, "UPDATE_TASK_STATUS", "TASK", taskId, { before: { status: task.status }, after: { status } });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function seedTasks(seedData: any[]) {
  const actor = await getCurrentActor();
  if (!actor || actor.role !== "ADMIN" || process.env.NODE_ENV === "production") {
    return { success: false, error: "Seed chỉ dành cho Admin trong môi trường dev." };
  }

  try {
    const existing = await db.select({ id: schema.tasks.id }).from(schema.tasks).limit(6);
    if (existing.length > 5) return { success: true, message: "Already seeded" };

    const workspaces = await db.select({ id: schema.workspaces.id }).from(schema.workspaces).limit(1);
    const users = await db.select({ id: schema.users.id, name: schema.users.name }).from(schema.users).limit(1);

    const defaultWorkspaceId = workspaces[0]?.id || "workspace_1";
    const defaultUserId = users[0]?.id || actor.id;
    const defaultUserName = users[0]?.name || actor.name;

    for (const task of seedData) {
      await db.insert(schema.tasks).values({
        id: `task_${Math.random().toString(36).substring(2, 9)}`,
        title: task.title,
        description: `Seed data task for ${task.dept}`,
        workspaceId: defaultWorkspaceId,
        assignedId: defaultUserId,
        assignedName: defaultUserName,
        status: task.status,
        priority: task.priority,
        deadline: new Date(Date.now() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
        tag: task.tag,
        payload: { seededBy: actor.id },
      });
    }

    await writeAuditLog(actor.id, "SEED_TASKS", "TASK", "bulk", { count: seedData.length });
    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
