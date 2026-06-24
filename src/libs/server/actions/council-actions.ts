"use server";

import { db, schema } from "@/src/libs/server/db";
import { getCurrentActor } from "@/src/libs/server/auth-helper";
import { revalidatePath } from "next/cache";

export async function createDirective(data: {
  title: string;
  category: string;
  urgency: string;
  content: string;
}) {
  const actor = await getCurrentActor();
  if (!actor) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const id = crypto.randomUUID();
    await db.insert(schema.directives).values({
      id,
      title: data.title,
      category: data.category,
      urgency: data.urgency,
      senderId: actor.id,
      payload: { content: data.content },
    });
    
    revalidatePath("/[locale]/(admin)/dashboard/council", "page");
    return { success: true, data: id };
  } catch (error: any) {
    console.error("Failed to create directive:", error);
    return { success: false, error: error.message };
  }
}

export async function createRisk(data: {
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
}) {
  const actor = await getCurrentActor();
  if (!actor) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const id = crypto.randomUUID();
    await db.insert(schema.risks).values({
      id,
      title: data.title,
      severity: data.severity,
      status: "open",
      payload: { description: data.description, reporterId: actor.id },
    });

    revalidatePath("/[locale]/(admin)/dashboard/council", "page");
    return { success: true, data: id };
  } catch (error: any) {
    console.error("Failed to create risk:", error);
    return { success: false, error: error.message };
  }
}

export async function createMeetingEvent(data: {
  title: string;
  date: string; // ISO date
  department: string;
}) {
  const actor = await getCurrentActor();
  if (!actor) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const id = crypto.randomUUID();
    await db.insert(schema.events).values({
      id,
      title: data.title,
      date: new Date(data.date),
      department: data.department,
      payload: { isMeeting: true, organizerId: actor.id },
    });

    revalidatePath("/[locale]/(admin)/dashboard/council", "page");
    return { success: true, data: id };
  } catch (error: any) {
    console.error("Failed to create meeting event:", error);
    return { success: false, error: error.message };
  }
}
