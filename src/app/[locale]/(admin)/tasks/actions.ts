"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInitialData() {
  try {
    const data = await db.select().from(schema.tasks);
    const workspaces = await db.select().from(schema.workspaces);
    const users = await db.select().from(schema.users);
    return { data, workspaces, users };
  } catch (e) {
    return { data: [], workspaces: [], users: [] };
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
  try {
    const id = `task_${Math.random().toString(36).substring(2, 9)}`;
    
    // Tìm tên người phụ trách
    const userResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, formData.assignedId))
      .limit(1);
    
    const assignedName = userResult[0]?.name || "Chưa phân công";

    await db.insert(schema.tasks).values({
      id,
      title: formData.title,
      description: formData.description || "",
      workspaceId: formData.workspaceId,
      assignedId: formData.assignedId,
      assignedName,
      status: "todo",
      priority: formData.priority,
      deadline: formData.deadline || null,
      tag: formData.tag || null,
      payload: {},
    });

    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTaskStatus(taskId: string, status: string) {
  try {
    await db
      .update(schema.tasks)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.tasks.id, taskId));

    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function seedTasks(seedData: any[]) {
  try {
    const existing = await db.select({ id: schema.tasks.id }).from(schema.tasks).limit(1);
    if (existing.length > 5) return { success: true, message: 'Already seeded' };

    // Find default workspace and user to assign
    const workspaces = await db.select({ id: schema.workspaces.id }).from(schema.workspaces).limit(1);
    const users = await db.select({ id: schema.users.id, name: schema.users.name }).from(schema.users).limit(1);

    const defaultWorkspaceId = workspaces[0]?.id || 'workspace_1';
    const defaultUserId = users[0]?.id || 'user_1';
    const defaultUserName = users[0]?.name || 'Admin';

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
        payload: {},
      });
    }

    revalidatePath("/[locale]/tasks", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
