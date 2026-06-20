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

export async function createInventoryCheck(data: any, items: any[]) {
  const user = await getCurrentActor();
  if (!user || !canManageFacilities(user)) throw new Error('Unauthorized');

  try {
    const checkId = `INV-${Date.now()}`;
    const newCheck = await db.insert(facilitiesInventoryChecks).values({
      ...data,
      id: checkId,
      code: `KIE-${new Date().getFullYear()}-${Math.floor(Math.random()*10000)}`,
      createdById: user.id,
      createdByName: user.name,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    }).returning();

    if (items && items.length > 0) {
      await db.insert(facilitiesInventoryCheckItems).values(
        items.map(item => ({
          ...item,
          id: `INI-${Math.random().toString(36).substr(2, 9)}`,
          inventoryCheckId: checkId,
        }))
      );
    }

    return { success: true, data: newCheck[0] };
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

export async function createSupply(data: any) {
  const user = await getCurrentActor();
  if (!user || !canManageFacilities(user)) throw new Error('Unauthorized');

  try {
    const newSupply = await db.insert(facilitiesSupplies).values({
      ...data,
      id: `SUP-${Date.now()}`,
    }).returning();
    return { success: true, data: newSupply[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSupplyQuantity(id: string, quantity: number, type: 'IMPORT' | 'EXPORT' | 'ADJUST', reason?: string) {
  const user = await getCurrentActor();
  if (!user || !canManageFacilities(user)) throw new Error('Unauthorized');

  try {
    const supply = await db.select().from(facilitiesSupplies).where(eq(facilitiesSupplies.id, id));
    if (!supply[0]) throw new Error('Supply not found');

    let newQuantity = supply[0].currentQuantity;
    if (type === 'IMPORT') newQuantity += quantity;
    else if (type === 'EXPORT') newQuantity -= quantity;
    else if (type === 'ADJUST') newQuantity = quantity;

    if (newQuantity < 0) throw new Error('Số lượng tồn không đủ');

    const updated = await db.update(facilitiesSupplies)
      .set({ 
        currentQuantity: newQuantity, 
        status: newQuantity === 0 ? 'OUT_OF_STOCK' : newQuantity <= supply[0].minimumQuantity ? 'LOW_STOCK' : 'IN_STOCK',
        lastImportedAt: type === 'IMPORT' ? new Date() : supply[0].lastImportedAt
      })
      .where(eq(facilitiesSupplies.id, id))
      .returning();

    await db.insert(facilitiesSupplyTransactions).values({
      id: `TRX-${Date.now()}`,
      supplyId: id,
      type,
      quantity,
      reason,
      performedById: user.id,
      performedByName: user.name,
    });

    return { success: true, data: updated[0] };
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
    const data = await db.select().from(facilitiesHandoverLogs).orderBy(desc(facilitiesHandoverLogs.createdAt));
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createHandover(data: any) {
  const user = await getCurrentActor();
  if (!user || !canManageFacilities(user)) throw new Error('Unauthorized');

  try {
    const newHandover = await db.insert(facilitiesHandoverLogs).values({
      ...data,
      id: `HND-${Date.now()}`,
      code: `GIAO-${new Date().getFullYear()}-${Math.floor(Math.random()*10000)}`,
      handedOverById: user.id,
      handedOverByName: user.name,
    }).returning();
    return { success: true, data: newHandover[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function returnHandover(id: string, conditionOnReturn: string) {
  const user = await getCurrentActor();
  if (!user || !canManageFacilities(user)) throw new Error('Unauthorized');

  try {
    const updated = await db.update(facilitiesHandoverLogs)
      .set({ 
        status: 'RETURNED', 
        actualReturnDate: new Date(),
        conditionOnReturn 
      })
      .where(eq(facilitiesHandoverLogs.id, id))
      .returning();
    return { success: true, data: updated[0] };
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
