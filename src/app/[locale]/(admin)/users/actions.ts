"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq, and, or, like, desc, sql, ne, inArray, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { 
  getCurrentActor, 
  isAdminTruong, 
  isTruongPhong, 
  writeAuditLog 
} from "@/src/libs/server/auth-helper";
import { canManageUser, canAssignRole, canAssignDataScope } from "./users.permissions";
import { UserRole, UserStatus, DataScope } from "./users.types";

export async function checkAccess() {
  const actor = await getCurrentActor();
  if (!actor) return { authorized: false, reason: "UNAUTHORIZED" };
  // Only Admin, Chairman, BGH and Manager can access
  const allowed = ['ADMIN', 'CHAIRMAN', 'BGH', 'MANAGER'];
  if (!allowed.includes(actor.role)) {
    return { authorized: false, reason: "FORBIDDEN" };
  }
  return { authorized: true, actor };
}

export async function getUsersList(params: {
  search?: string;
  roleFilter?: string;
  deptFilter?: string;
  jobTitleFilter?: string;
  statusFilter?: string;
  dataScopeFilter?: string;
  twoFactorFilter?: string; // 'all' | 'enabled' | 'disabled'
  lastLoginFilter?: string; // 'all' | 'today' | '7days' | '30days' | 'never'
  page?: number;
  pageSize?: number;
  showTrash?: boolean;
}) {
  const check = await checkAccess();
  if (!check.authorized) {
    throw new Error("Unauthorized access to users list");
  }

  const actor = check.actor!;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  let conditions: any[] = [];

  // Enforce role-based department restrictions for Trưởng phòng (MANAGER)
  if (actor.role === 'MANAGER') {
    if (actor.departmentId) {
      conditions.push(eq(schema.users.departmentId, actor.departmentId));
    } else {
      return { users: [], totalCount: 0, totalPages: 0, departments: [] };
    }
    conditions.push(ne(schema.users.status, 'DELETED'));
  } else {
    // Admin, Chairman, BGH can view deleted users under "Đã xóa" tab
    if (params.showTrash) {
      conditions.push(eq(schema.users.status, 'DELETED'));
    } else {
      conditions.push(ne(schema.users.status, 'DELETED'));
    }
  }

  // search filter
  if (params.search) {
    const searchPattern = `%${params.search}%`;
    conditions.push(
      or(
        like(schema.users.name, searchPattern),
        like(schema.users.email, searchPattern),
        like(schema.users.phone, searchPattern)
      )
    );
  }

  // role filter
  if (params.roleFilter) {
    conditions.push(eq(schema.users.role, params.roleFilter));
  }

  // department filter
  if (params.deptFilter) {
    conditions.push(eq(schema.users.departmentId, params.deptFilter));
  }

  // job title filter
  if (params.jobTitleFilter) {
    conditions.push(eq(schema.users.title, params.jobTitleFilter));
  }

  // status filter
  if (params.statusFilter && params.statusFilter !== 'DELETED') {
    conditions.push(eq(schema.users.status, params.statusFilter));
  }

  // data scope filter
  if (params.dataScopeFilter) {
    conditions.push(eq(schema.users.dataScope, params.dataScopeFilter));
  }

  // 2FA filter
  if (params.twoFactorFilter === 'enabled') {
    conditions.push(eq(schema.users.twoFactorEnabled, true));
  } else if (params.twoFactorFilter === 'disabled') {
    conditions.push(eq(schema.users.twoFactorEnabled, false));
  }

  // last login filter
  if (params.lastLoginFilter && params.lastLoginFilter !== 'all') {
    const now = new Date();
    if (params.lastLoginFilter === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      conditions.push(gte(schema.users.lastLoginAt, startOfDay));
    } else if (params.lastLoginFilter === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      conditions.push(gte(schema.users.lastLoginAt, sevenDaysAgo));
    } else if (params.lastLoginFilter === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      conditions.push(gte(schema.users.lastLoginAt, thirtyDaysAgo));
    } else if (params.lastLoginFilter === 'never') {
      conditions.push(sql`${schema.users.lastLoginAt} IS NULL`);
    }
  }

  const queryConditions = conditions.length > 0 ? and(...conditions) : undefined;

  const resultUsers = await db
    .select()
    .from(schema.users)
    .where(queryConditions)
    .orderBy(desc(schema.users.createdAt))
    .limit(pageSize)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.users)
    .where(queryConditions);

  const totalCount = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / pageSize);

  const departments = await db.select().from(schema.departments);

  return {
    users: resultUsers,
    totalCount,
    totalPages,
    departments,
    actor
  };
}

export async function createUserAction(data: {
  name: string;
  email: string;
  phone?: string;
  departmentId: string;
  role: string;
  title?: string;
  status: string;
  dataScope?: string;
  twoFactorEnabled?: boolean;
}) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;
  const finalDataScope = data.dataScope || (data.role === 'ADMIN' ? 'SYSTEM' : data.role === 'BGH' || data.role === 'CHAIRMAN' ? 'SCHOOL' : 'OWN');

  // Validate permission
  if (!canAssignRole(actor, data.role)) {
    return { success: false, error: "Bạn không có quyền gán vai trò này." };
  }
  if (!canAssignDataScope(actor, finalDataScope)) {
    return { success: false, error: "Bạn không có quyền gán phạm vi dữ liệu này." };
  }

  // Check email uniqueness
  const existingEmail = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, data.email))
    .limit(1);

  if (existingEmail.length > 0) {
    return { success: false, error: "Email này đã tồn tại trong hệ thống." };
  }

  const userId = `user_${Math.random().toString(36).substring(2, 9)}`;

  const newUser = {
    id: userId,
    clerkUserId: null,
    name: data.name,
    role: data.role,
    roleName: data.role, // Simple name sync
    title: data.title || "",
    email: data.email,
    workspaceId: data.departmentId,
    phone: data.phone || null,
    avatarUrl: null,
    departmentId: data.departmentId,
    status: data.status,
    dataScope: finalDataScope,
    twoFactorEnabled: !!data.twoFactorEnabled,
    mustChangePassword: false,
    createdBy: actor.id,
    updatedBy: actor.id,
    payload: {},
  };

  try {
    await db.insert(schema.users).values(newUser);

    // Auto-join chat channels
    await db.insert(schema.chatMembers).values({
      id: `member_school_${userId}`,
      conversationId: 'conv_school_ann',
      userId: userId,
      role: data.role === 'ADMIN' ? 'OWNER' : 'MEMBER',
      joinedAt: new Date(),
    });

    const [deptChannel] = await db
      .select()
      .from(schema.chatConversations)
      .where(and(
        eq(schema.chatConversations.type, 'DEPARTMENT_CHANNEL'),
        eq(schema.chatConversations.departmentId, data.departmentId)
      ))
      .limit(1);

    if (deptChannel) {
      await db.insert(schema.chatMembers).values({
        id: `member_dept_${userId}`,
        conversationId: deptChannel.id,
        userId: userId,
        role: data.role === 'MANAGER' ? 'OWNER' : 'MEMBER',
        joinedAt: new Date(),
      });
    }

    await writeAuditLog(actor.id, "CREATE_USER", "users", userId, { after: newUser });
    revalidatePath("/[locale]/users", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserAction(
  userId: string,
  data: {
    name: string;
    phone?: string;
    departmentId?: string;
    role?: string;
    title?: string;
    status: string;
    dataScope?: string;
    twoFactorEnabled?: boolean;
  }
) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  const [targetUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!targetUser) {
    return { success: false, error: "Không tìm thấy người dùng." };
  }

  // Hierarchy validation
  if (!canManageUser(actor, targetUser) && actor.id !== userId) {
    return { success: false, error: "Bạn không có quyền quản lý thành viên này." };
  }

  const updateData: any = {
    name: data.name,
    phone: data.phone || null,
    title: data.title || "",
    status: data.status,
    twoFactorEnabled: !!data.twoFactorEnabled,
    updatedBy: actor.id,
    updatedAt: new Date(),
  };

  if (data.role) {
    if (!canAssignRole(actor, data.role)) {
      return { success: false, error: "Bạn không có quyền gán vai trò này." };
    }
    updateData.role = data.role;
    updateData.roleName = data.role;
  }

  if (data.departmentId) {
    updateData.departmentId = data.departmentId;
    updateData.workspaceId = data.departmentId;
  }

  if (data.dataScope) {
    if (!canAssignDataScope(actor, data.dataScope)) {
      return { success: false, error: "Bạn không có quyền gán phạm vi dữ liệu này." };
    }
    updateData.dataScope = data.dataScope;
  }

  // Prevent self locking
  if (actor.id === userId && (data.status === 'SUSPENDED' || data.status === 'LOCKED')) {
    return { success: false, error: "Bạn không thể tự khóa tài khoản của chính mình." };
  }

  try {
    await db.update(schema.users).set(updateData).where(eq(schema.users.id, userId));
    await writeAuditLog(actor.id, "UPDATE_USER", "users", userId, {
      before: targetUser,
      after: { ...targetUser, ...updateData },
    });

    revalidatePath("/[locale]/users", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function softDeleteUserAction(userId: string) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  const [targetUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!targetUser) {
    return { success: false, error: "Không tìm thấy người dùng." };
  }

  if (!canManageUser(actor, targetUser)) {
    return { success: false, error: "Bạn không có quyền xóa người dùng này." };
  }

  // Prevent deleting the last Admin
  if (targetUser.role === 'ADMIN') {
    const adminCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(and(eq(schema.users.role, 'ADMIN'), ne(schema.users.status, 'DELETED')));

    if (Number(adminCount[0]?.count || 0) <= 1) {
      return { success: false, error: "Không thể xóa tài khoản Admin hệ thống cuối cùng." };
    }
  }

  try {
    await db
      .update(schema.users)
      .set({
        status: 'DELETED',
        deletedAt: new Date(),
        updatedBy: actor.id,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    await writeAuditLog(actor.id, "DELETE_USER_SOFT", "users", userId, { before: targetUser });
    revalidatePath("/[locale]/users", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function restoreUserAction(userId: string) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  const [targetUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!targetUser) {
    return { success: false, error: "Không tìm thấy người dùng." };
  }

  try {
    await db
      .update(schema.users)
      .set({
        status: 'ACTIVE',
        deletedAt: null,
        updatedBy: actor.id,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    await writeAuditLog(actor.id, "RESTORE_USER", "users", userId, { before: targetUser });
    revalidatePath("/[locale]/users", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function permanentDeleteUserAction(userId: string) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  if (actor.role !== 'ADMIN') {
    return { success: false, error: "Chỉ Admin hệ thống mới có quyền xóa vĩnh viễn tài khoản." };
  }

  const [targetUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!targetUser) {
    return { success: false, error: "Không tìm thấy người dùng." };
  }

  try {
    await db.delete(schema.users).where(eq(schema.users.id, userId));
    await writeAuditLog(actor.id, "PERMANENT_DELETE_USER", "users", userId, { before: targetUser });
    revalidatePath("/[locale]/users", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────
// Security Account Actions
// ─────────────────────────────────────────────────────────
export async function resetUserPasswordAction(userId: string) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  const [targetUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!targetUser) return { success: false, error: "Không tìm thấy người dùng." };

  try {
    await db
      .update(schema.users)
      .set({
        passwordChangedAt: new Date(),
        updatedBy: actor.id,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    await writeAuditLog(actor.id, "RESET_PASSWORD", "users", userId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function forcePasswordChangeAction(userId: string, mustChange: boolean) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  try {
    await db
      .update(schema.users)
      .set({
        mustChangePassword: mustChange,
        updatedBy: actor.id,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    await writeAuditLog(actor.id, "FORCE_PASSWORD_CHANGE", "users", userId, { mustChange });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function logoutAllDevicesAction(userId: string) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  try {
    // Write Login Failure/Disconnect audit log
    await writeAuditLog(actor.id, "LOGOUT_ALL_DEVICES", "users", userId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function lockUserAction(userId: string) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  const [targetUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!targetUser) return { success: false, error: "Không tìm thấy người dùng." };

  if (targetUser.role === 'ADMIN') {
    const adminCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(and(eq(schema.users.role, 'ADMIN'), ne(schema.users.status, 'LOCKED'), ne(schema.users.status, 'DELETED')));

    if (Number(adminCount[0]?.count || 0) <= 1) {
      return { success: false, error: "Không thể khóa tài khoản Admin hệ thống cuối cùng." };
    }
  }

  try {
    await db
      .update(schema.users)
      .set({
        status: 'LOCKED',
        updatedBy: actor.id,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    await writeAuditLog(actor.id, "LOCK_USER", "users", userId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function unlockUserAction(userId: string) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  try {
    await db
      .update(schema.users)
      .set({
        status: 'ACTIVE',
        updatedBy: actor.id,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    await writeAuditLog(actor.id, "UNLOCK_USER", "users", userId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────
// Invitations Management
// ─────────────────────────────────────────────────────────
export async function getUserInvitationsList() {
  const check = await checkAccess();
  if (!check.authorized) throw new Error("Unauthorized");

  return await db
    .select()
    .from(schema.userInvitations)
    .orderBy(desc(schema.userInvitations.createdAt));
}

export async function createUserInvitationAction(data: {
  email: string;
  role: string;
  departmentId: string;
  dataScope: string;
}) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  const inviteId = `invite_${Math.random().toString(36).substring(2, 9)}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiration

  const newInvite = {
    id: inviteId,
    email: data.email,
    role: data.role,
    departmentId: data.departmentId,
    dataScope: data.dataScope,
    invitedById: actor.id,
    invitedByName: actor.name,
    status: 'PENDING' as const,
    tokenHash: `token_${Math.random().toString(36).substring(2, 12)}`,
    expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await db.insert(schema.userInvitations).values(newInvite);
    await writeAuditLog(actor.id, "SEND_INVITATION", "user_invitations", inviteId, { after: newInvite });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function resendUserInvitationAction(inviteId: string) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db
      .update(schema.userInvitations)
      .set({
        expiresAt,
        status: 'PENDING',
        updatedAt: new Date(),
      })
      .where(eq(schema.userInvitations.id, inviteId));

    await writeAuditLog(actor.id, "RESEND_INVITATION", "user_invitations", inviteId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function cancelUserInvitationAction(inviteId: string) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  try {
    await db
      .update(schema.userInvitations)
      .set({
        status: 'CANCELED',
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.userInvitations.id, inviteId));

    await writeAuditLog(actor.id, "CANCEL_INVITATION", "user_invitations", inviteId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────
// Bulk Actions
// ─────────────────────────────────────────────────────────
export async function bulkUpdateUsersAction(
  userIds: string[],
  actionType: "assign_department" | "assign_role" | "assign_data_scope" | "lock" | "unlock" | "soft_delete",
  payload?: string
) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  if (!userIds || userIds.length === 0) return { success: false, error: "Danh sách trống." };

  try {
    const updateFields: any = {
      updatedBy: actor.id,
      updatedAt: new Date(),
    };

    if (actionType === "assign_department" && payload) {
      updateFields.departmentId = payload;
      updateFields.workspaceId = payload;
    } else if (actionType === "assign_role" && payload) {
      if (!canAssignRole(actor, payload)) {
        return { success: false, error: "Bạn không có quyền cấp vai trò này." };
      }
      updateFields.role = payload;
      updateFields.roleName = payload;
    } else if (actionType === "assign_data_scope" && payload) {
      if (!canAssignDataScope(actor, payload)) {
        return { success: false, error: "Bạn không có quyền cấp phạm vi này." };
      }
      updateFields.dataScope = payload;
    } else if (actionType === "lock") {
      updateFields.status = "LOCKED";
    } else if (actionType === "unlock") {
      updateFields.status = "ACTIVE";
    } else if (actionType === "soft_delete") {
      updateFields.status = "DELETED";
      updateFields.deletedAt = new Date();
    }

    await db
      .update(schema.users)
      .set(updateFields)
      .where(inArray(schema.users.id, userIds));

    await writeAuditLog(actor.id, `BULK_${actionType.toUpperCase()}`, "users", "multiple", {
      affectedIds: userIds,
      payload,
    });

    revalidatePath("/[locale]/users", "page");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────
// Role Permissions Matrix Actions
// ─────────────────────────────────────────────────────────
export async function getRolePermissionsMatrix() {
  const check = await checkAccess();
  if (!check.authorized) throw new Error("Unauthorized");

  const [row] = await db
    .select()
    .from(schema.rbacConfig)
    .where(eq(schema.rbacConfig.id, "system_matrix"))
    .limit(1);

  if (row) return row.config as any;

  // Prepopulate standard fallback mapping structure
  return {};
}

export async function saveRolePermissionsMatrix(configJson: any) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  if (actor.role !== "ADMIN") {
    return { success: false, error: "Chỉ Admin hệ thống mới có quyền lưu cấu hình ma trận phân quyền." };
  }

  try {
    const existing = await db
      .select()
      .from(schema.rbacConfig)
      .where(eq(schema.rbacConfig.id, "system_matrix"))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(schema.rbacConfig)
        .set({ config: configJson, updatedAt: new Date() })
        .where(eq(schema.rbacConfig.id, "system_matrix"));
    } else {
      await db.insert(schema.rbacConfig).values({
        id: "system_matrix",
        config: configJson,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await writeAuditLog(actor.id, "UPDATE_PERMISSIONS_MATRIX", "rbacConfig", "system_matrix");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────
// Export Users action (returns rows directly)
// ─────────────────────────────────────────────────────────
export async function exportUsersAction(filters: {
  search?: string;
  roleFilter?: string;
  deptFilter?: string;
  statusFilter?: string;
  dataScopeFilter?: string;
}) {
  const check = await checkAccess();
  if (!check.authorized) throw new Error("Unauthorized");

  let conditions: any[] = [];
  conditions.push(ne(schema.users.status, 'DELETED'));

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(
        like(schema.users.name, pattern),
        like(schema.users.email, pattern),
        like(schema.users.phone, pattern)
      )
    );
  }

  if (filters.roleFilter) conditions.push(eq(schema.users.role, filters.roleFilter));
  if (filters.deptFilter) conditions.push(eq(schema.users.departmentId, filters.deptFilter));
  if (filters.statusFilter) conditions.push(eq(schema.users.status, filters.statusFilter));
  if (filters.dataScopeFilter) conditions.push(eq(schema.users.dataScope, filters.dataScopeFilter));

  const queryConditions = conditions.length > 0 ? and(...conditions) : undefined;

  return await db.select().from(schema.users).where(queryConditions).orderBy(desc(schema.users.createdAt));
}

// ─────────────────────────────────────────────────────────
// Fetch Audit Logs and Login History
// ─────────────────────────────────────────────────────────
export async function getAuditLogsForUser(userId: string) {
  const check = await checkAccess();
  if (!check.authorized) return [];

  return await db
    .select()
    .from(schema.auditLogs)
    .where(eq(schema.auditLogs.entityId, userId))
    .orderBy(desc(schema.auditLogs.createdAt))
    .limit(15);
}

export async function getUserLoginHistory(userId: string) {
  const check = await checkAccess();
  if (!check.authorized) return [];

  return await db
    .select()
    .from(schema.userLoginHistory)
    .where(eq(schema.userLoginHistory.userId, userId))
    .orderBy(desc(schema.userLoginHistory.loginAt))
    .limit(15);
}

export async function getUserStatsAction() {
  const check = await checkAccess();
  if (!check.authorized) throw new Error("Unauthorized");
  const actor = check.actor!;

  let conditions: any[] = [];
  if (actor.role === 'MANAGER' && actor.departmentId) {
    conditions.push(eq(schema.users.departmentId, actor.departmentId));
    conditions.push(ne(schema.users.status, 'DELETED'));
  }

  const queryConditions = conditions.length > 0 ? and(...conditions) : undefined;
  
  const allUsers = await db
    .select({
      id: schema.users.id,
      role: schema.users.role,
      title: schema.users.title,
      status: schema.users.status,
    })
    .from(schema.users)
    .where(queryConditions);

  const stats = {
    total: allUsers.length,
    active: allUsers.filter(u => u.status === 'ACTIVE').length,
    pendingInvite: allUsers.filter(u => u.status === 'PENDING_INVITE' || u.status === 'INVITED').length,
    pendingActivation: allUsers.filter(u => u.status === 'PENDING_ACTIVATION').length,
    locked: allUsers.filter(u => u.status === 'LOCKED' || u.status === 'SUSPENDED').length,
    admins: allUsers.filter(u => ['ADMIN', 'CHAIRMAN', 'BGH', 'MANAGER'].includes(u.role)).length,
    teachers: allUsers.filter(u => u.role === 'TEACHER' || /giáo viên|gv/i.test(String((u as any).title || ''))).length,
    staff: allUsers.filter(u => u.role === 'STAFF' || /nhân viên|cán bộ|chuyên viên/i.test(String((u as any).title || ''))).length,
    deleted: allUsers.filter(u => u.status === 'DELETED').length,
  };

  return stats;
}

export async function importUsersAction(usersList: Array<{
  name: string;
  email: string;
  phone?: string;
  role: string;
  departmentId: string;
  title?: string;
  dataScope?: string;
}>) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  const results: { success: boolean; email: string; error?: string }[] = [];
  
  for (const item of usersList) {
    if (!item.name || !item.email || !item.role || !item.departmentId) {
      results.push({ success: false, email: item.email || "", error: "Thiếu trường thông tin bắt buộc (họ tên, email, vai trò, phòng ban)" });
      continue;
    }
    
    // Check permission for role and scope
    const finalScope = item.dataScope || "OWN";
    if (!canAssignRole(actor, item.role) || !canAssignDataScope(actor, finalScope)) {
      results.push({ success: false, email: item.email, error: "Không có quyền gán vai trò hoặc phạm vi dữ liệu" });
      continue;
    }

    // Check unique email
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, item.email))
      .limit(1);

    if (existing.length > 0) {
      results.push({ success: false, email: item.email, error: "Email đã tồn tại" });
      continue;
    }

    const userId = `user_${Math.random().toString(36).substring(2, 9)}`;
    const newUser = {
      id: userId,
      clerkUserId: null,
      name: item.name,
      role: item.role,
      roleName: item.role,
      title: item.title || "",
      email: item.email,
      workspaceId: item.departmentId,
      phone: item.phone || null,
      avatarUrl: null,
      departmentId: item.departmentId,
      status: "ACTIVE",
      dataScope: finalScope,
      twoFactorEnabled: false,
      mustChangePassword: false,
      createdBy: actor.id,
      updatedBy: actor.id,
      payload: {},
    };

    try {
      await db.insert(schema.users).values(newUser);
      await writeAuditLog(actor.id, "IMPORT_USER", "users", userId, { after: newUser });
      results.push({ success: true, email: item.email });
    } catch (err: any) {
      results.push({ success: false, email: item.email, error: err.message });
    }
  }

  revalidatePath("/[locale]/users", "page");
  return { success: true, results };
}

export async function getDepartmentsForSelect() {
  const check = await checkAccess();
  if (!check.authorized) return [];
  return await db.select().from(schema.departments).orderBy(schema.departments.name);
}

export async function getUsersForSelect() {
  const check = await checkAccess();
  if (!check.authorized) return [];
  return await db
    .select({ id: schema.users.id, name: schema.users.name, role: schema.users.role })
    .from(schema.users)
    .where(ne(schema.users.status, 'DELETED'))
    .orderBy(schema.users.name);
}

export async function getUserById(userId: string) {
  const check = await checkAccess();
  if (!check.authorized) return { error: check.reason || 'UNAUTHORIZED' };
  const actor = check.actor!;

  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (!user) return { error: 'NOT_FOUND' };
  if (actor.role === 'MANAGER' && actor.departmentId !== user.departmentId && actor.id !== user.id) {
    return { error: 'FORBIDDEN' };
  }

  const departments = await db.select().from(schema.departments).orderBy(schema.departments.name);
  const [manager] = user.managerId
    ? await db.select({ id: schema.users.id, name: schema.users.name }).from(schema.users).where(eq(schema.users.id, user.managerId)).limit(1)
    : [null as any];

  return { user, departments, manager, actor };
}

export async function checkEmployeeCode(employeeCode: string, excludeUserId?: string) {
  const check = await checkAccess();
  if (!check.authorized) return { available: false };
  if (!employeeCode) return { available: true };
  const rows = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.employeeCode, employeeCode)).limit(2);
  return { available: rows.every((row) => row.id === excludeUserId) };
}

export async function updateUserWorkInfo(userId: string, data: {
  staffType?: string;
  joinedAt?: string | null;
  managerId?: string | null;
  teachingLevel?: string | null;
  subject?: string | null;
  homeroomClassId?: string | null;
  internalNote?: string | null;
}) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;
  const [targetUser] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (!targetUser) return { success: false, error: "Không tìm thấy người dùng." };
  if (!canManageUser(actor, targetUser) && actor.id !== userId) return { success: false, error: "Bạn không có quyền cập nhật hồ sơ này." };

  const updateData = {
    staffType: data.staffType || null,
    joinedAt: data.joinedAt ? new Date(data.joinedAt) : null,
    managerId: data.managerId || null,
    teachingLevel: data.teachingLevel || null,
    subject: data.subject || null,
    homeroomClassId: data.homeroomClassId || null,
    internalNote: data.internalNote || null,
    updatedBy: actor.id,
    updatedAt: new Date(),
  };
  await db.update(schema.users).set(updateData).where(eq(schema.users.id, userId));
  await writeAuditLog(actor.id, "UPDATE_USER_WORK_INFO", "users", userId, { before: targetUser, after: updateData });
  revalidatePath("/[locale]/users", "page");
  return { success: true };
}

export async function changeUserRole(userId: string, role: string) {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (!user) return { success: false, error: "Không tìm thấy người dùng." };
  return updateUserAction(userId, { name: user.name, phone: user.phone || undefined, role, title: user.title || undefined, status: user.status, dataScope: user.dataScope });
}

export async function changeUserDepartment(userId: string, departmentId: string) {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (!user) return { success: false, error: "Không tìm thấy người dùng." };
  return updateUserAction(userId, { name: user.name, phone: user.phone || undefined, departmentId, role: user.role, title: user.title || undefined, status: user.status, dataScope: user.dataScope });
}

export async function updateUserSecurityStatus(userId: string, action: "SUSPEND" | "ACTIVATE" | "REQUIRE_PASSWORD_CHANGE") {
  if (action === "SUSPEND") return lockUserAction(userId);
  if (action === "ACTIVATE") return unlockUserAction(userId);
  return forcePasswordChangeAction(userId, true);
}

export async function getUserActivityLog(userId: string, page = 1, pageSize = 50) {
  const check = await checkAccess();
  if (!check.authorized) return { error: "Unauthorized", logs: [] };
  const logs = await db
    .select()
    .from(schema.auditLogs)
    .where(eq(schema.auditLogs.entityId, userId))
    .orderBy(desc(schema.auditLogs.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  return { logs };
}

export async function updateMyProfile(data: { phone?: string | null }) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };
  await db.update(schema.users).set({ phone: data.phone || null, updatedBy: actor.id, updatedAt: new Date() }).where(eq(schema.users.id, actor.id));
  await writeAuditLog(actor.id, "UPDATE_MY_PROFILE", "users", actor.id, { after: { phone: data.phone || null } });
  return { success: true };
}
