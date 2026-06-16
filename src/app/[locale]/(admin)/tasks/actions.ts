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
