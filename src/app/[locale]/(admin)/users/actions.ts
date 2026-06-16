"use server";

import { db, schema } from "@/src/libs/server/db";
import { eq, and, or, like, desc, sql, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { 
  getCurrentActor, canCreateUser, canUpdateUser, canDeleteUser, canViewUser, 
  isAdminTruong, isTruongPhong, writeAuditLog,
  canViewUserProfile, canUpdateWorkInfo, canUpdateSecurityStatus,
  canChangeUserRole, canChangeUserDepartment, canViewUserActivityLog, canUpdateMyProfile
} from "@/src/libs/server/auth-helper";


export async function checkAccess() {
  const actor = await getCurrentActor();
  if (!actor) return { authorized: false, reason: "UNAUTHORIZED" };
  if (actor.role === 'STAFF') {
    return { authorized: false, reason: "FORBIDDEN" };
  }
  return { authorized: true, actor };
}

export async function getUsersList(params: {
  search?: string;
  roleFilter?: string;
  deptFilter?: string;
  statusFilter?: string;
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

  let conditions = [];

  // Enforce role-based constraints
  if (isTruongPhong(actor)) {
    // Trưởng phòng chỉ thấy thành viên cùng phòng ban mình
    if (actor.departmentId) {
      conditions.push(eq(schema.users.departmentId, actor.departmentId));
    } else {
      return { users: [], totalCount: 0, totalPages: 0, departments: [] };
    }
    // Trưởng phòng không xem được tab "Đã xóa"
    conditions.push(ne(schema.users.status, 'DELETED'));
  } else {
    // Admin xem hoặc Active hoặc Deleted
    if (params.showTrash) {
      conditions.push(eq(schema.users.status, 'DELETED'));
    } else {
      conditions.push(ne(schema.users.status, 'DELETED'));
    }
  }

  // Appending extra filters
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

  if (params.roleFilter) {
    conditions.push(eq(schema.users.role, params.roleFilter));
  }

  // Admin can filter department. Manager is restricted, so we only apply deptFilter if Admin
  if (isAdminTruong(actor) && params.deptFilter) {
    conditions.push(eq(schema.users.departmentId, params.deptFilter));
  }

  if (params.statusFilter && params.statusFilter !== 'DELETED') {
    conditions.push(eq(schema.users.status, params.statusFilter));
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

  // Fetch departments for filter option
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
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  title?: string;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
}) {
  const check = await checkAccess();
  if (!check.authorized) return { success: false, error: "Unauthorized" };
  const actor = check.actor!;

  // Validate creator permission
  if (!canCreateUser(actor, data.role, data.departmentId)) {
    return { success: false, error: "Bạn không có quyền tạo người dùng này." };
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
  const roleNameMap = {
    ADMIN: "Ban Giám hiệu",
    MANAGER: "Tổ trưởng Chuyên môn",
    STAFF: "Giáo viên / Nhân viên"
  };

  const newUser = {
    id: userId,
    clerkUserId: null,
    name: data.name,
    role: data.role,
    roleName: roleNameMap[data.role] || "Giáo viên / Nhân viên",
    title: data.title || "",
    email: data.email,
    workspaceId: data.departmentId,
    phone: data.phone || null,
    avatarUrl: null,
    departmentId: data.departmentId,
    status: data.status,
    createdBy: actor.id,
    updatedBy: actor.id,
    payload: {},
  };

  try {
    await db.insert(schema.users).values(newUser);

    // Auto-join to the global school channel
    await db.insert(schema.chatMembers).values({
      id: `member_school_${userId}`,
      conversationId: 'conv_school_ann',
      userId: userId,
      role: data.role === 'ADMIN' ? 'OWNER' : 'MEMBER',
      joinedAt: new Date(),
    });

    // Auto-join to department channel if departmentId matches
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
    role?: 'ADMIN' | 'MANAGER' | 'STAFF';
    title?: string;
    status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
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

  // Validate authorization
  if (!canUpdateUser(actor, targetUser)) {
    return { success: false, error: "Bạn không có quyền sửa thành viên này." };
  }

  // Strict check: Manager cannot change department or role
  const updateData: any = {
    name: data.name,
    phone: data.phone || null,
    title: data.title || "",
    status: data.status,
    updatedBy: actor.id,
    updatedAt: new Date(),
  };

  if (isAdminTruong(actor)) {
    if (data.role) {
      updateData.role = data.role;
      const roleNameMap = {
        ADMIN: "Ban Giám hiệu",
        MANAGER: "Tổ trưởng Chuyên môn",
        STAFF: "Giáo viên / Nhân viên"
      };
      updateData.roleName = roleNameMap[data.role] || "Giáo viên / Nhân viên";
    }
    if (data.departmentId) {
      updateData.departmentId = data.departmentId;
      updateData.workspaceId = data.departmentId;
    }
  }

  // Prevent self locking
  if (actor.id === userId && data.status === 'SUSPENDED') {
    return { success: false, error: "Bạn không thể tự khóa tài khoản của chính mình." };
  }

  try {
    await db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, userId));

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

  if (!canDeleteUser(actor, targetUser)) {
    return { success: false, error: "Bạn không có quyền xóa người dùng này." };
  }

  // Prevent deleting the last Admin
  if (targetUser.role === 'ADMIN') {
    const adminCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(and(
        eq(schema.users.role, 'ADMIN'),
        ne(schema.users.status, 'DELETED')
      ));

    if (Number(adminCountResult[0]?.count || 0) <= 1) {
      return { success: false, error: "Không thể xóa tài khoản Admin trường cuối cùng." };
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

  if (!isAdminTruong(actor)) {
    return { success: false, error: "Chỉ Admin trường mới có quyền khôi phục tài khoản." };
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

export async function getAuditLogsForUser(userId: string) {
  const check = await checkAccess();
  if (!check.authorized) return [];
  
  return await db
    .select()
    .from(schema.auditLogs)
    .where(eq(schema.auditLogs.entityId, userId))
    .orderBy(desc(schema.auditLogs.createdAt))
    .limit(10);
}

// ─────────────────────────────────────────────────────────
// NEW: getUserById — with role-based access control
// ─────────────────────────────────────────────────────────
export async function getUserById(userId: string) {
  const actor = await getCurrentActor();
  if (!actor) return { error: "UNAUTHORIZED", user: null, departments: [] };

  const [targetUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!targetUser) return { error: "NOT_FOUND", user: null, departments: [] };

  if (!canViewUserProfile(actor, targetUser)) {
    return { error: "FORBIDDEN", user: null, departments: [] };
  }

  const departments = await db.select().from(schema.departments);
  // Fetch manager name if exists
  let manager = null;
  if (targetUser.managerId) {
    const [m] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, targetUser.managerId))
      .limit(1);
    manager = m || null;
  }

  // Strip sensitive fields before returning
  const safeUser = {
    ...targetUser,
    payload: undefined,
  };

  return { error: null, user: safeUser, departments, manager, actor };
}

// ─────────────────────────────────────────────────────────
// NEW: updateUserWorkInfo
// ─────────────────────────────────────────────────────────
export async function updateUserWorkInfo(
  userId: string,
  data: {
    staffType?: string;
    joinedAt?: string | null;
    managerId?: string | null;
    teachingLevel?: string | null;
    subject?: string | null;
    homeroomClassId?: string | null;
    internalNote?: string | null;
  }
) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  const [targetUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!targetUser) return { success: false, error: "Không tìm thấy người dùng." };
  if (!canUpdateWorkInfo(actor, targetUser)) {
    return { success: false, error: "Bạn không có quyền sửa thông tin công việc này." };
  }

  const before = { ...targetUser };
  const updateData: any = {
    updatedBy: actor.id,
    updatedAt: new Date(),
  };

  if (data.staffType !== undefined) updateData.staffType = data.staffType;
  if (data.joinedAt !== undefined) updateData.joinedAt = data.joinedAt ? new Date(data.joinedAt) : null;
  if (data.managerId !== undefined) updateData.managerId = data.managerId;
  if (data.teachingLevel !== undefined) updateData.teachingLevel = data.teachingLevel;
  if (data.subject !== undefined) updateData.subject = data.subject;
  if (data.homeroomClassId !== undefined) updateData.homeroomClassId = data.homeroomClassId;
  // internalNote only visible to admin/manager
  if (data.internalNote !== undefined) {
    if (isAdminTruong(actor) || isTruongPhong(actor)) {
      updateData.internalNote = data.internalNote;
    }
  }

  try {
    await db.update(schema.users).set(updateData).where(eq(schema.users.id, userId));
    await writeAuditLog(actor.id, "UPDATE_USER_WORK_INFO", "users", userId, {
      before,
      after: { ...before, ...updateData },
    });
    revalidatePath(`/[locale]/users/${userId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────
// NEW: updateUserSecurityStatus — suspend/activate/mustChangePassword
// ─────────────────────────────────────────────────────────
export async function updateUserSecurityStatus(
  userId: string,
  action: "SUSPEND" | "ACTIVATE" | "REQUIRE_PASSWORD_CHANGE" | "CLEAR_PASSWORD_CHANGE"
) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  if (!isAdminTruong(actor)) {
    return { success: false, error: "Chỉ Admin trường mới có quyền thay đổi trạng thái bảo mật." };
  }

  const [targetUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!targetUser) return { success: false, error: "Không tìm thấy người dùng." };

  // Prevent self-lock
  if (action === "SUSPEND" && actor.id === userId) {
    return { success: false, error: "Bạn không thể tự khóa tài khoản của chính mình." };
  }

  // Prevent suspending the last admin
  if (action === "SUSPEND" && targetUser.role === "ADMIN") {
    const adminCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(and(eq(schema.users.role, "ADMIN"), ne(schema.users.status, "DELETED"), ne(schema.users.status, "SUSPENDED")));
    if (Number(adminCountResult[0]?.count || 0) <= 1) {
      return { success: false, error: "Không thể khóa tài khoản Admin trường cuối cùng đang hoạt động." };
    }
  }

  const updateData: any = { updatedBy: actor.id, updatedAt: new Date() };
  let auditAction = "";

  switch (action) {
    case "SUSPEND":
      updateData.status = "SUSPENDED";
      auditAction = "SUSPEND_USER";
      break;
    case "ACTIVATE":
      updateData.status = "ACTIVE";
      auditAction = "ACTIVATE_USER";
      break;
    case "REQUIRE_PASSWORD_CHANGE":
      updateData.mustChangePassword = true;
      auditAction = "REQUIRE_PASSWORD_CHANGE";
      break;
    case "CLEAR_PASSWORD_CHANGE":
      updateData.mustChangePassword = false;
      auditAction = "CLEAR_PASSWORD_CHANGE";
      break;
  }

  try {
    await db.update(schema.users).set(updateData).where(eq(schema.users.id, userId));
    await writeAuditLog(actor.id, auditAction, "users", userId, {
      before: { status: targetUser.status, mustChangePassword: targetUser.mustChangePassword },
      after: updateData,
    });
    revalidatePath(`/[locale]/users/${userId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────
// NEW: changeUserRole — Admin only
// ─────────────────────────────────────────────────────────
export async function changeUserRole(userId: string, newRole: "ADMIN" | "MANAGER" | "STAFF") {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  if (!isAdminTruong(actor)) {
    return { success: false, error: "Chỉ Admin trường mới có quyền đổi vai trò." };
  }

  const [targetUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!targetUser) return { success: false, error: "Không tìm thấy người dùng." };

  // Prevent removing the last admin
  if (targetUser.role === "ADMIN" && newRole !== "ADMIN") {
    const adminCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(and(eq(schema.users.role, "ADMIN"), ne(schema.users.status, "DELETED")));
    if (Number(adminCountResult[0]?.count || 0) <= 1) {
      return { success: false, error: "Không thể đổi vai trò Admin trường cuối cùng." };
    }
  }

  const roleNameMap: Record<string, string> = {
    ADMIN: "Ban Giám hiệu",
    MANAGER: "Tổ trưởng Chuyên môn",
    STAFF: "Giáo viên / Nhân viên",
  };

  try {
    await db
      .update(schema.users)
      .set({ role: newRole, roleName: roleNameMap[newRole], updatedBy: actor.id, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));
    await writeAuditLog(actor.id, "CHANGE_USER_ROLE", "users", userId, {
      before: { role: targetUser.role },
      after: { role: newRole },
    });
    revalidatePath(`/[locale]/users/${userId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────
// NEW: changeUserDepartment — Admin only
// ─────────────────────────────────────────────────────────
export async function changeUserDepartment(userId: string, newDepartmentId: string) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  if (!isAdminTruong(actor)) {
    return { success: false, error: "Chỉ Admin trường mới có quyền đổi phòng ban." };
  }

  const [targetUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!targetUser) return { success: false, error: "Không tìm thấy người dùng." };

  try {
    await db
      .update(schema.users)
      .set({ departmentId: newDepartmentId, workspaceId: newDepartmentId, updatedBy: actor.id, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));
    await writeAuditLog(actor.id, "CHANGE_USER_DEPARTMENT", "users", userId, {
      before: { departmentId: targetUser.departmentId },
      after: { departmentId: newDepartmentId },
    });
    revalidatePath(`/[locale]/users/${userId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────
// NEW: getUserActivityLog — paginated
// ─────────────────────────────────────────────────────────
export async function getUserActivityLog(userId: string, page = 1, pageSize = 20) {
  const actor = await getCurrentActor();
  if (!actor) return { logs: [], totalCount: 0, error: "UNAUTHORIZED" };

  const [targetUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!targetUser) return { logs: [], totalCount: 0, error: "NOT_FOUND" };

  // STAFF can only see their own log (limited)
  if (actor.role === "STAFF" && actor.id !== userId) {
    return { logs: [], totalCount: 0, error: "FORBIDDEN" };
  }

  if (actor.role === "MANAGER" && actor.departmentId !== targetUser.departmentId && actor.id !== userId) {
    return { logs: [], totalCount: 0, error: "FORBIDDEN" };
  }

  const offset = (page - 1) * pageSize;
  const logs = await db
    .select()
    .from(schema.auditLogs)
    .where(eq(schema.auditLogs.entityId, userId))
    .orderBy(desc(schema.auditLogs.createdAt))
    .limit(pageSize)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.auditLogs)
    .where(eq(schema.auditLogs.entityId, userId));

  const totalCount = Number(countResult[0]?.count || 0);
  return { logs, totalCount, error: null };
}

// ─────────────────────────────────────────────────────────
// NEW: updateMyProfile — user self-update
// ─────────────────────────────────────────────────────────
export async function updateMyProfile(data: {
  phone?: string | null;
  avatarUrl?: string | null;
  title?: string | null;
}) {
  const actor = await getCurrentActor();
  if (!actor) return { success: false, error: "Unauthorized" };

  const fields = Object.keys(data).filter(k => (data as any)[k] !== undefined);

  if (!canUpdateMyProfile(actor, fields)) {
    return { success: false, error: "Bạn không có quyền sửa các trường này." };
  }

  const updateData: any = { updatedBy: actor.id, updatedAt: new Date() };
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
  if (data.title !== undefined && (actor.role === "ADMIN" || actor.role === "MANAGER")) {
    updateData.title = data.title;
  }

  try {
    await db.update(schema.users).set(updateData).where(eq(schema.users.id, actor.id));
    await writeAuditLog(actor.id, "UPDATE_MY_PROFILE", "users", actor.id, {
      after: updateData,
    });
    revalidatePath(`/[locale]/profile`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────
// NEW: checkEmployeeCode uniqueness
// ─────────────────────────────────────────────────────────
export async function checkEmployeeCode(code: string, excludeUserId?: string) {
  const actor = await getCurrentActor();
  if (!actor) return { available: false };

  const conditions: any[] = [eq(schema.users.employeeCode, code)];
  if (excludeUserId) {
    conditions.push(ne(schema.users.id, excludeUserId));
  }

  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(and(...conditions))
    .limit(1);

  return { available: existing.length === 0 };
}

// ─────────────────────────────────────────────────────────
// NEW: getDepartmentsForSelect
// ─────────────────────────────────────────────────────────
export async function getDepartmentsForSelect() {
  return await db.select().from(schema.departments).orderBy(schema.departments.name);
}

// ─────────────────────────────────────────────────────────
// NEW: getUsersForSelect (for managerId dropdown)
// ─────────────────────────────────────────────────────────
export async function getUsersForSelect() {
  return await db
    .select({ id: schema.users.id, name: schema.users.name, role: schema.users.role })
    .from(schema.users)
    .where(ne(schema.users.status, "DELETED"))
    .orderBy(schema.users.name);
}
