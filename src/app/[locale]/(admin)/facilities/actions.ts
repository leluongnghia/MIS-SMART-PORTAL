'use server';

import { db } from '@/src/libs/server/db';
import {
  facilitiesLocations,
  facilitiesAssets,
  facilitiesRepairRequests,
  facilitiesMaintenanceLogs,
  facilitiesHandoverLogs,
  facilitiesPurchaseRequests,
  facilitiesPurchaseItems,
  facilitiesInventoryChecks,
  facilitiesInventoryCheckItems,
} from '@/src/models/Schema';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';
import { getCurrentActor, canManageFacilities, canCreatePurchaseRequest, canApprovePurchaseRequest } from '@/src/libs/server/auth-helper';
import { 
  facilitiesSupplies, facilitiesSupplyTransactions,
  facilitiesSuppliers, facilitiesWarranties,
  facilitiesSafetyChecks, facilitiesBookingRequests,
  facilitiesRenovationProjects, facilitiesSlaSettings 
} from '@/src/models/Schema';

// ==============================
// TỔNG QUAN
// ==============================
export async function getFacilitiesOverview() {
  const user = await getCurrentActor();
  if (!user) throw new Error('Unauthorized');
  
  try {
    const totalLocations = await db.select({ count: sql<number>`count(*)` }).from(facilitiesLocations);
    const totalAssets = await db.select({ count: sql<number>`count(*)` }).from(facilitiesAssets);
    const pendingRepairs = await db.select({ count: sql<number>`count(*)` }).from(facilitiesRepairRequests).where(or(eq(facilitiesRepairRequests.status, 'NEW'), eq(facilitiesRepairRequests.status, 'PROCESSING')));
    const pendingPurchases = await db.select({ count: sql<number>`count(*)` }).from(facilitiesPurchaseRequests).where(eq(facilitiesPurchaseRequests.status, 'SUBMITTED'));

    return {
      success: true,
      data: {
        locations: Number(totalLocations[0]?.count || 0),
        assets: Number(totalAssets[0]?.count || 0),
        pendingRepairs: Number(pendingRepairs[0]?.count || 0),
        pendingPurchases: Number(pendingPurchases[0]?.count || 0),
      }
    };
  } catch (error) {
    console.error('Error fetching facilities overview:', error);
    return { success: false, error: 'Lỗi khi tải tổng quan' };
  }
}

// ==============================
// KHU VỰC / PHÒNG BAN (LOCATIONS)
// ==============================
export async function getLocations() {
  try {
    const data = await db.select().from(facilitiesLocations).orderBy(desc(facilitiesLocations.createdAt));
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createLocation(data: any) {
  const user = await getCurrentActor();
  if (!user || !canManageFacilities(user)) throw new Error('Unauthorized');

  try {
    const newLocation = await db.insert(facilitiesLocations).values({
      ...data,
      id: `LOC-${Date.now()}`,
    }).returning();
    return { success: true, data: newLocation[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==============================
// THIẾT BỊ / TÀI SẢN (ASSETS)
// ==============================
export async function getAssets() {
  try {
    const data = await db.select().from(facilitiesAssets).orderBy(desc(facilitiesAssets.createdAt));
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createAsset(data: any) {
  const user = await getCurrentActor();
  if (!user || !canManageFacilities(user)) throw new Error('Unauthorized');

  try {
    const newAsset = await db.insert(facilitiesAssets).values({
      ...data,
      id: `AST-${Date.now()}`,
    }).returning();
    return { success: true, data: newAsset[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==============================
// YÊU CẦU SỬA CHỮA (REPAIRS)
// ==============================
export async function getRepairRequests() {
  try {
    const data = await db.select().from(facilitiesRepairRequests).orderBy(desc(facilitiesRepairRequests.createdAt));
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createRepairRequest(data: any) {
  const user = await getCurrentActor();
  if (!user) throw new Error('Unauthorized');

  try {
    const newReq = await db.insert(facilitiesRepairRequests).values({
      ...data,
      id: `REP-${Date.now()}`,
      requestedById: user.id,
      requestedByName: user.name,
    }).returning();
    return { success: true, data: newReq[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateRepairStatus(id: string, status: string, resolutionNote?: string) {
  const user = await getCurrentActor();
  if (!user || !canManageFacilities(user)) throw new Error('Unauthorized');

  try {
    const updated = await db.update(facilitiesRepairRequests)
      .set({ status, resolutionNote, completedAt: status === 'DONE' ? new Date() : null })
      .where(eq(facilitiesRepairRequests.id, id))
      .returning();
    return { success: true, data: updated[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==============================
// MUA SẮM (PURCHASES)
// ==============================
export async function getPurchaseRequests() {
  try {
    const data = await db.select().from(facilitiesPurchaseRequests).orderBy(desc(facilitiesPurchaseRequests.createdAt));
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPurchaseItems(purchaseRequestId: string) {
  try {
    const data = await db.select().from(facilitiesPurchaseItems).where(eq(facilitiesPurchaseItems.purchaseRequestId, purchaseRequestId));
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createPurchaseRequest(data: any, items: any[]) {
  const user = await getCurrentActor();
  if (!user || !canCreatePurchaseRequest(user)) throw new Error('Unauthorized');

  try {
    const reqId = `PUR-${Date.now()}`;
    const newReq = await db.insert(facilitiesPurchaseRequests).values({
      ...data,
      id: reqId,
      code: `PRQ-${new Date().getFullYear()}-${Math.floor(Math.random()*10000)}`,
      requestedById: user.id,
      requestedByName: user.name,
      status: 'SUBMITTED',
    }).returning();

    if (items && items.length > 0) {
      await db.insert(facilitiesPurchaseItems).values(
        items.map(item => ({
          ...item,
          id: `PIT-${Math.random().toString(36).substr(2, 9)}`,
          purchaseRequestId: reqId,
        }))
      );
    }

    return { success: true, data: newReq[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approvePurchaseRequest(id: string, isApproved: boolean, rejectedReason?: string) {
  const user = await getCurrentActor();
  if (!user || !canApprovePurchaseRequest(user)) throw new Error('Unauthorized');

  try {
    const updated = await db.update(facilitiesPurchaseRequests)
      .set({ 
        status: isApproved ? 'APPROVED' : 'REJECTED', 
        approvedById: isApproved ? user.id : null,
        approvedByName: isApproved ? user.name : null,
        approvedAt: isApproved ? new Date() : null,
        rejectedReason: !isApproved ? rejectedReason : null
      })
      .where(eq(facilitiesPurchaseRequests.id, id))
      .returning();
    return { success: true, data: updated[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==============================
// KIỂM KÊ (INVENTORY)
// ==============================
export async function getInventoryChecks() {
  try {
    const data = await db.select().from(facilitiesInventoryChecks).orderBy(desc(facilitiesInventoryChecks.createdAt));
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==============================
// VẬT TƯ TIÊU HAO (SUPPLIES)
// ==============================
export async function getSupplies() {
  try {
    const data = await db.select().from(facilitiesSupplies).orderBy(desc(facilitiesSupplies.createdAt));
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==============================
// NHÀ CUNG CẤP & BẢO HÀNH (SUPPLIERS & WARRANTIES)
// ==============================
export async function getSuppliers() {
  try {
    const data = await db.select().from(facilitiesSuppliers).orderBy(desc(facilitiesSuppliers.createdAt));
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==============================
// AN TOÀN - PCCC - VỆ SINH (SAFETY CHECKS)
// ==============================
export async function getSafetyChecks() {
  try {
    const data = await db.select().from(facilitiesSafetyChecks).orderBy(desc(facilitiesSafetyChecks.createdAt));
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==============================
// BÀN GIAO / MƯỢN / ĐẶT LỊCH (BOOKINGS)
// ==============================
export async function getBookings() {
  try {
    const data = await db.select().from(facilitiesBookingRequests).orderBy(desc(facilitiesBookingRequests.createdAt));
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==============================
// DỰ ÁN CẢI TẠO LỚN (RENOVATION PROJECTS)
// ==============================
export async function getRenovationProjects() {
  try {
    const data = await db.select().from(facilitiesRenovationProjects).orderBy(desc(facilitiesRenovationProjects.createdAt));
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
