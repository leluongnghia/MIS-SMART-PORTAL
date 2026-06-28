import { db, schema } from './db';
import { eq, and, inArray } from 'drizzle-orm';
import { getCurrentActor, Actor } from './auth-helper';

export type DataScopeType = 'OWN' | 'DEPARTMENT' | 'SCHOOL' | 'ALL';

/**
 * Single Source of Truth cho phân quyền:
 * Trả về danh sách slug các module hợp lệ của user:
 * Thuật toán: UNION(Department Modules) + Allow Overrides - Deny Overrides
 */
export async function getUserModules(userId: string): Promise<string[]> {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (!user || user.status !== 'ACTIVE') return [];

  // SUPER_ADMIN, ADMIN, và BGH (Ban Giám hiệu) có toàn bộ module đang active
  if (user.userType === 'SUPER_ADMIN' || user.role === 'ADMIN' || (user.role === 'MANAGER' && user.workspaceId === 'BGH')) {
    const allModules = await db.select().from(schema.modules).where(eq(schema.modules.status, true));
    return allModules.map(m => m.slug);
  }

  // 1. Lấy danh sách departmentId mà user tham gia trong userDepartments
  const userDepts = await db.select().from(schema.userDepartments)
    .where(eq(schema.userDepartments.userId, userId));
  const deptIds = userDepts.map(d => d.departmentId);
  
  // Fallback tương thích ngược nếu user có departmentId ở bảng users mà chưa có trong userDepartments
  if (user.departmentId && !deptIds.includes(user.departmentId)) {
    deptIds.push(user.departmentId);
  }

  // 2. Lấy các module từ các phòng ban đó
  let deptModuleSlugs: string[] = [];
  if (deptIds.length > 0) {
    const deptMods = await db.select({
      slug: schema.modules.slug
    })
    .from(schema.departmentModules)
    .innerJoin(schema.modules, eq(schema.departmentModules.moduleId, schema.modules.id))
    .where(and(
      inArray(schema.departmentModules.departmentId, deptIds),
      eq(schema.modules.status, true)
    ));
    deptModuleSlugs = deptMods.map(dm => dm.slug);
  }

  // 3. Lấy ngoại lệ override (ALLOW / DENY)
  const overrides = await db.select({
    slug: schema.modules.slug,
    effect: schema.userModuleOverrides.effect
  })
  .from(schema.userModuleOverrides)
  .innerJoin(schema.modules, eq(schema.userModuleOverrides.moduleId, schema.modules.id))
  .where(eq(schema.userModuleOverrides.userId, userId));

  const allowSlugs = overrides.filter(o => o.effect === 'ALLOW').map(o => o.slug);
  const denySlugs = new Set(overrides.filter(o => o.effect === 'DENY').map(o => o.slug));

  // 4. Thuật toán: UNION + ALLOW - DENY
  const combined = new Set([...deptModuleSlugs, ...allowSlugs]);
  denySlugs.forEach(slug => combined.delete(slug));

  return Array.from(combined);
}

/**
 * Kiểm tra xem user hiện tại có quyền truy cập module hay không.
 */
export async function hasModule(userId: string, moduleSlug: string): Promise<boolean> {
  const allowed = await getUserModules(userId);
  return allowed.includes(moduleSlug);
}

/**
 * Yêu cầu quyền truy cập module. Ném lỗi Error (403) nếu không có quyền.
 */
export async function requireModule(moduleSlug: string): Promise<Actor> {
  const actor = await getCurrentActor();
  if (!actor) {
    throw new Error('Unauthorized: Chưa đăng nhập');
  }
  const allowed = await getUserModules(actor.id);
  if (!allowed.includes(moduleSlug)) {
    throw new Error(`Forbidden: Bạn không có quyền truy cập module [${moduleSlug}]`);
  }
  return actor;
}

/**
 * Lấy phạm vi dữ liệu (Data Scope) của user đối với module (OWN | DEPARTMENT | SCHOOL | ALL)
 */
export async function getModuleDataScope(userId: string, moduleSlug: string): Promise<DataScopeType> {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (!user) return 'OWN';
  if (user.userType === 'SUPER_ADMIN' || user.role === 'ADMIN') return 'ALL';

  const [moduleRow] = await db.select().from(schema.modules).where(eq(schema.modules.slug, moduleSlug)).limit(1);
  if (!moduleRow) return 'OWN';

  const [scopeRow] = await db.select().from(schema.dataScopes)
    .where(and(
      eq(schema.dataScopes.userId, userId),
      eq(schema.dataScopes.moduleId, moduleRow.id)
    ))
    .limit(1);

  if (scopeRow && scopeRow.scope) {
    return scopeRow.scope as DataScopeType;
  }

  // Fallback mặc định
  if (user.role === 'MANAGER') return 'DEPARTMENT';
  return 'OWN';
}
