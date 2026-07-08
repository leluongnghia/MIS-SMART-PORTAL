"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCommunicationCampaigns() {
  try {
    const data = await db.select().from(schema.communicationCampaigns).where(isNull(schema.communicationCampaigns.deletedAt));
    return { data };
  } catch (e: any) {
    console.error("getCommunicationCampaigns failed:", e);
    return { data: [] };
  }
}

export async function createCampaign(formData: any) {
  try {
    const id = 'camp_' + Math.random().toString(36).substring(2, 11);
    
    await db.insert(schema.communicationCampaigns).values({
      id,
      title: formData.title,
      objective: formData.objective,
      audience: formData.audience || [],
      channels: formData.channels || [],
      startAt: formData.startAt ? new Date(formData.startAt) : null,
      endAt: formData.endAt ? new Date(formData.endAt) : null,
      managerId: formData.managerId,
      status: formData.status || 'draft',
      content: formData.content,
      payload: {
        postSchedule: formData.postSchedule || [],
        attachments: formData.attachments || []
      }
    });
    
    revalidatePath('/[locale]/events', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Create campaign failed:", e);
    return { success: false, error: e.message };
  }
}

export async function updateCampaignStatus(campaignId: string, newStatus: string) {
  try {
    await db.update(schema.communicationCampaigns)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(schema.communicationCampaigns.id, campaignId));
    revalidatePath('/[locale]/events', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Update campaign status failed:", e);
    return { success: false, error: e.message };
  }
}

export async function updateCampaignSchedule(campaignId: string, postSchedule: any[]) {
  try {
    const campaign = await db.select().from(schema.communicationCampaigns).where(eq(schema.communicationCampaigns.id, campaignId)).limit(1);
    if (!campaign || campaign.length === 0) throw new Error("Campaign not found");
    const existingPayload = campaign[0].payload as any;
    
    await db.update(schema.communicationCampaigns)
      .set({ 
        payload: { ...existingPayload, postSchedule }, 
        updatedAt: new Date() 
      })
      .where(eq(schema.communicationCampaigns.id, campaignId));
      
    revalidatePath('/[locale]/events', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Update campaign schedule failed:", e);
    return { success: false, error: e.message };
  }
}

export async function updateCampaignMetrics(campaignId: string, metrics: any) {
  try {
    await db.update(schema.communicationCampaigns)
      .set({ 
        metrics, 
        updatedAt: new Date() 
      })
      .where(eq(schema.communicationCampaigns.id, campaignId));
      
    revalidatePath('/[locale]/events', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Update campaign metrics failed:", e);
    return { success: false, error: e.message };
  }
}
