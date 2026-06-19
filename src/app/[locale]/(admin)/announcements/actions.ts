"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInitialData() {
  try {
    const data = await db.select().from(schema.announcements).where(isNull(schema.announcements.deletedAt));
    return { data };
  } catch (e) {
    console.error("getInitialData announcements failed:", e);
    return { data: [] };
  }
}

export async function createAnnouncement(formData: {
  title: string;
  content: string;
  senderName: string;
  senderTitle: string;
  senderAvatar?: string;
  targetRoles: string[];
  isMeeting: boolean;
  meetingTime?: string;
  meetingLocation?: string;
}) {
  try {
    const id = `ann_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date();

    const payload = {
      id,
      title: formData.title,
      content: formData.content,
      senderName: formData.senderName,
      senderTitle: formData.senderTitle,
      senderAvatar: formData.senderAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      createdAt: now.toISOString(),
      targetRoles: formData.targetRoles,
      isMeeting: formData.isMeeting,
      meetingTime: formData.meetingTime,
      meetingLocation: formData.meetingLocation,
      acknowledgedBy: [],
    };

    await db.insert(schema.announcements).values({
      id,
      title: formData.title,
      senderName: formData.senderName,
      isMeeting: formData.isMeeting,
      payload,
    });

    revalidatePath("/[locale]/announcements", "page");
    return { success: true };
  } catch (e: any) {
    console.error("createAnnouncement failed:", e);
    return { success: false, error: e.message };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await db.update(schema.announcements).set({ deletedAt: new Date(), deletedBy: 'system', updatedAt: new Date() }).where(eq(schema.announcements.id, id));
    revalidatePath("/[locale]/announcements", "page");
    return { success: true };
  } catch (e: any) {
    console.error("deleteAnnouncement failed:", e);
    return { success: false, error: e.message };
  }
}
