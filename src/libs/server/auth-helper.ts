import { db, schema } from './db';
import { eq } from 'drizzle-orm';

export interface Actor {
  id: string;
  name: string;
  role: string; // 'ADMIN', 'MANAGER', 'STAFF'
  roleName: string | null;
  title: string | null;
  email: string | null;
  workspaceId: string | null;
  departmentId: string | null;
  status: string;
}

export async function getCurrentActor(): Promise<Actor | null> {
  // 1. Try Clerk
  if (process.env.CLERK_SECRET_KEY) {
    try {
      const { auth } = require('@clerk/nextjs/server');
      const authObj = await auth();
      if (authObj?.userId) {
        const [user] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, authObj.userId))
          .limit(1);
        if (user) return user as Actor;
      }
    } catch (e) {
      console.error('Clerk actor retrieval failed:', e);
    }
  }

  // 2. Try simulated auth via systemSettings client key
  const [setting] = await db
    .select()
    .from(schema.systemSettings)
    .where(eq(schema.systemSettings.key, 'client:mis_edutask_logged_in_user_id'))
    .limit(1);

  const userId = setting?.value;
  if (userId) {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (user) return user as Actor;
  }

  // 3. Fallback for demo/local auth: use an active admin, then any active user.
  // This keeps server components aligned with the client-only demo shell after deploys.
  const [adminUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.role, 'ADMIN'))
    .limit(1);

  if (adminUser) return adminUser as Actor;

  const [firstUser] = await db
    .select()
    .from(schema.users)
    .limit(1);

  return (firstUser as Actor) || null;
}

const SECRET_KEY_PATTERN = /(password|secret|token|api[_-]?key|smtp_password|credential)/i;

function sanitizeAuditValue(value: any): any {
  if (Array.isArray(value)) return value.map(sanitizeAuditValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [
      key,
      SECRET_KEY_PATTERN.test(key) ? '••••••••' : sanitizeAuditValue(val),
    ]));
  }
  return value;
}

// Write Audit Log helper
export async function writeAuditLog(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string,
  metadata: {
    before?: any;
    after?: any;
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
    errorMessage?: string;
    module?: string;
    [key: string]: any;
  } = {}
) {
  try {
    const id = `audit_${Math.random().toString(36).substring(2, 9)}`;
    let actorSnapshot: any = null;
    if (actorId) {
      const [actor] = await db.select().from(schema.users).where(eq(schema.users.id, actorId)).limit(1);
      if (actor) {
        actorSnapshot = {
          id: actor.id,
          name: actor.name,
          role: actor.role,
          roleName: actor.roleName,
          title: actor.title,
        };
      }
    }

    await db.insert(schema.auditLogs).values({
      id,
      entityType,
      entityId,
      action,
      actorId,
      metadata: sanitizeAuditValue({
        success: metadata.success ?? true,
        module: metadata.module || entityType,
        actor: actorSnapshot,
        ...metadata,
      }) || {},
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

// User authorization helpers
export function isAdminTruong(actor: Actor) {
  return actor.role === 'ADMIN';
}

export function isTruongPhong(actor: Actor) {
  return actor.role === 'MANAGER';
}

export function canViewUser(actor: Actor, targetUser: any) {
  if (isAdminTruong(actor)) return true;
  if (isTruongPhong(actor)) {
    return actor.departmentId === targetUser.departmentId;
  }
  // STAFF can view their own profile
  return actor.id === targetUser.id;
}

export function canViewUserProfile(actor: Actor, targetUser: any) {
  return canViewUser(actor, targetUser);
}

export function canUpdateWorkInfo(actor: Actor, targetUser: any) {
  if (isAdminTruong(actor)) return true;
  if (isTruongPhong(actor)) {
    return actor.departmentId === targetUser.departmentId;
  }
  return false;
}

export function canUpdateSecurityStatus(actor: Actor, targetUser: any) {
  // Only admin can change security status
  if (!isAdminTruong(actor)) return false;
  // Cannot lock yourself if you're the only admin
  return true;
}

export function canChangeUserRole(actor: Actor, _targetUser: any, _nextRole: string) {
  return isAdminTruong(actor);
}

export function canChangeUserDepartment(actor: Actor, _targetUser: any) {
  return isAdminTruong(actor);
}

export function canViewUserActivityLog(actor: Actor, targetUser: any) {
  if (isAdminTruong(actor)) return true;
  if (isTruongPhong(actor)) {
    return actor.departmentId === targetUser.departmentId;
  }
  // STAFF can see basic log of themselves
  return actor.id === targetUser.id;
}

export function canUpdateMyProfile(actor: Actor, fields: string[]) {
  // Fields any user can update on their own profile
  const allowedFields = ['phone', 'avatarUrl'];
  // STAFF can only update allowed fields
  if (actor.role === 'STAFF') {
    return fields.every(f => allowedFields.includes(f));
  }
  // MANAGER can update allowed fields + title
  if (isTruongPhong(actor)) {
    return fields.every(f => [...allowedFields, 'title'].includes(f));
  }
  return true;
}

export function canCreateUser(actor: Actor, roleToAssign: string, departmentId: string) {
  if (isAdminTruong(actor)) return true;
  if (isTruongPhong(actor)) {
    // Trưởng phòng chỉ được tạo STAFF và chỉ thuộc phòng của mình
    return roleToAssign === 'STAFF' && actor.departmentId === departmentId;
  }
  return false;
}

export function canUpdateUser(actor: Actor, targetUser: any) {
  if (isAdminTruong(actor)) return true;
  if (isTruongPhong(actor)) {
    // Trưởng phòng chỉ được sửa user cùng phòng và không được tự nâng role của target, hay đổi department
    return actor.departmentId === targetUser.departmentId && targetUser.role === 'STAFF';
  }
  return false;
}

export function canDeleteUser(actor: Actor, targetUser: any) {
  if (isAdminTruong(actor)) {
    // Không thể xóa chính mình
    if (actor.id === targetUser.id) return false;
    return true;
  }
  if (isTruongPhong(actor)) {
    // Trưởng phòng chỉ được xóa STAFF trong phòng của mình
    return actor.departmentId === targetUser.departmentId && targetUser.role === 'STAFF';
  }
  return false;
}

// Chat authorization helpers
export function canViewConversation(actor: Actor, conversation: any, memberUserIds: string[]) {
  if (conversation.type === 'SCHOOL_ANNOUNCEMENT') return true;
  if (conversation.type === 'DEPARTMENT_CHANNEL') {
    // Admin có quyền xem, hoặc thành viên cùng phòng ban
    return isAdminTruong(actor) || actor.departmentId === conversation.departmentId;
  }
  // Cho DIRECT_MESSAGE và GROUP_CHAT, actor phải là thành viên
  return memberUserIds.includes(actor.id);
}

export function canSendMessage(actor: Actor, conversation: any, memberUserIds: string[]) {
  if (conversation.type === 'SCHOOL_ANNOUNCEMENT') {
    return isAdminTruong(actor);
  }
  if (conversation.type === 'DEPARTMENT_CHANNEL') {
    // Admin có quyền nhắn, hoặc thành viên cùng phòng ban
    return isAdminTruong(actor) || actor.departmentId === conversation.departmentId;
  }
  return memberUserIds.includes(actor.id);
}

export function canPinMessage(actor: Actor, conversation: any) {
  if (isAdminTruong(actor)) return true;
  if (isTruongPhong(actor) && conversation.type === 'DEPARTMENT_CHANNEL' && actor.departmentId === conversation.departmentId) {
    return true;
  }
  return false;
}

export function canDeleteMessage(actor: Actor, message: any, conversation: any) {
  if (isAdminTruong(actor)) return true;
  if (message.senderId === actor.id) return true;
  if (isTruongPhong(actor) && conversation.type === 'DEPARTMENT_CHANNEL' && actor.departmentId === conversation.departmentId) {
    return true; // Trưởng phòng được xóa tin nhắn trong kênh phòng của mình
  }
  return false;
}

// Mentions guards
export function canMentionUser(actor: Actor, targetUser: any, conversationMembers: string[]) {
  return conversationMembers.includes(targetUser.id);
}

export function canMentionDepartment(actor: Actor, departmentId: string) {
  if (isAdminTruong(actor)) return true;
  if (isTruongPhong(actor)) {
    return actor.departmentId === departmentId;
  }
  return false;
}

export function canMentionAll(actor: Actor) {
  return isAdminTruong(actor);
}

// System Data - Categories permission check
export function canManageCategories(actor: Actor) {
  return isAdminTruong(actor);
}

// System Data - Reports permission check
export function canManageReports(actor: Actor) {
  return isAdminTruong(actor);
}

export function canViewReport(actor: Actor, reportType: string, scopeDeptId?: string | null) {
  if (isAdminTruong(actor)) return true;
  if (isTruongPhong(actor)) {
    // Trưởng phòng chỉ được xem báo cáo thuộc phòng ban mình
    if (!scopeDeptId) return false;
    return actor.departmentId === scopeDeptId;
  }
  // Nhân viên chỉ xem cá nhân/giới hạn
  return false;
}

// System Data - Storage permission check
export function canViewFile(actor: Actor, file: { visibility: string; departmentId?: string | null; uploadedBy: string }) {
  if (isAdminTruong(actor)) return true;
  if (file.visibility === 'SCHOOL' || file.visibility === 'SCHOOL_WIDE') return true;
  if (file.visibility === 'DEPARTMENT' && file.departmentId) {
    return actor.departmentId === file.departmentId;
  }
  // Private
  return actor.id === file.uploadedBy;
}

export function canUploadFile(actor: Actor, visibility: string, departmentId?: string | null) {
  if (isAdminTruong(actor)) return true;
  if (visibility === 'SCHOOL' || visibility === 'SCHOOL_WIDE' || visibility === 'ADMIN_ONLY') return false; // Chỉ admin được upload file school-wide hoặc admin-only
  if (visibility === 'DEPARTMENT') {
    return actor.departmentId === departmentId;
  }
  // Private upload
  return true;
}

export function canEditFile(actor: Actor, file: { uploadedBy: string; departmentId?: string | null; visibility: string }) {
  if (isAdminTruong(actor)) return true;
  if (isTruongPhong(actor) && file.visibility === 'DEPARTMENT' && file.departmentId === actor.departmentId) return true;
  return actor.id === file.uploadedBy;
}

export function canArchiveFile(actor: Actor, file: { uploadedBy: string; departmentId?: string | null; visibility: string }) {
  return canEditFile(actor, file);
}

export function canDeleteFile(actor: Actor, file: { uploadedBy: string }) {
  if (isAdminTruong(actor)) return true;
  return actor.id === file.uploadedBy;
}

export function canRestoreFile(actor: Actor, file: { uploadedBy: string }) {
  if (isAdminTruong(actor)) return true;
  return actor.id === file.uploadedBy;
}

export function canPermanentlyDeleteFile(actor: Actor) {
  return isAdminTruong(actor);
}

// System Data - Settings permission check
export function canViewSystemSettings(actor: Actor) {
  return isAdminTruong(actor) || isTruongPhong(actor);
}

export function canUpdateSystemSettings(actor: Actor) {
  return isAdminTruong(actor);
}

export function canViewSecretSetting(actor: Actor) {
  return isAdminTruong(actor);
}

// Integration Settings (SMTP, QR payment) — chỉ Admin hệ thống
export function canManageIntegrationSettings(actor: Actor) {
  return isAdminTruong(actor);
}

export function canManageSystemSettings(actor: Actor) {
  return canUpdateSystemSettings(actor);
}

export function canManageSecuritySettings(actor: Actor) {
  return isAdminTruong(actor);
}

export function canViewAuditLogs(actor: Actor) {
  return isAdminTruong(actor) || isTruongPhong(actor);
}

export function canUseUserSwitcher(actor: Actor) {
  return isAdminTruong(actor);
}

export function getRoleRank(role: string) {
  const ranks: Record<string, number> = { STAFF: 1, MANAGER: 2, ADMIN: 3 };
  return ranks[role] || 0;
}

export function canSwitchToUser(actor: Actor, targetUser: { role: string }) {
  if (isAdminTruong(actor)) return true;
  return getRoleRank(actor.role) >= getRoleRank(targetUser.role);
}

// ==========================================
// MODULE CSVC & THIẾT BỊ (FACILITIES) PERMISSIONS
// ==========================================

export function canManageFacilities(actor: Actor) {
  return isAdminTruong(actor) || isTruongPhong(actor); // Giả định Trưởng phòng CSVC hoặc BGH có quyền. Trong thực tế có thể check departmentId === 'CSVC'
}

export function canCreatePurchaseRequest(actor: Actor) {
  // Ai cũng có thể tạo đề xuất mua sắm cho phòng ban của mình
  return true;
}

export function canApprovePurchaseRequest(actor: Actor) {
  // Chỉ BGH/Admin được duyệt
  return isAdminTruong(actor);
}

export function canReceivePurchasedItems(actor: Actor) {
  // Người quản lý CSVC nhận hàng
  return canManageFacilities(actor);
}

export function canCreateAssetFromPurchase(actor: Actor) {
  return canManageFacilities(actor);
}

export function canManageInventoryCheck(actor: Actor) {
  return canManageFacilities(actor);
}

export function canViewFacilityReports(actor: Actor) {
  return isAdminTruong(actor) || isTruongPhong(actor);
}

// New Extensions
export function canManageSupplies(actor: Actor) {
  return canManageFacilities(actor);
}

export function canManageSuppliers(actor: Actor) {
  return canManageFacilities(actor);
}

export function canManageWarranties(actor: Actor) {
  return canManageFacilities(actor);
}

export function canManageSafetyChecks(actor: Actor) {
  return canManageFacilities(actor);
}

export function canCreateBooking(actor: Actor) {
  return true; // Any user can create a booking
}

export function canApproveBooking(actor: Actor) {
  return canManageFacilities(actor);
}

export function canManageRenovationProjects(actor: Actor) {
  return canManageFacilities(actor);
}

export function canGenerateAssetQr(actor: Actor) {
  return canManageFacilities(actor);
}

export function canViewFacilityAlerts(actor: Actor) {
  return isAdminTruong(actor) || isTruongPhong(actor);
}

export function canManageFacilitySla(actor: Actor) {
  return isAdminTruong(actor);
}
