import { db, schema } from './db';
import { eq, isNotNull, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * Script migration: Cập nhật Role cho user từ text sang hệ thống Role mới.
 */
export async function migrateUserRoles() {
  console.log('--- Bắt đầu Migration Roles ---');

  // Lấy danh sách users có role
  const allUsers = await db.select({
    id: schema.users.id,
    roleText: schema.users.role,
    deptId: schema.users.departmentId,
  }).from(schema.users).where(isNotNull(schema.users.role));

  const roleTextSet = new Set(allUsers.map(u => u.roleText));
  
  // Tạo roles nếu chưa có
  for (const roleText of roleTextSet) {
    if (!roleText) continue;
    const roleCode = roleText.toUpperCase().replace(/\s+/g, '_');
    
    // Thử insert role, nếu trùng code thì bỏ qua
    await db.insert(schema.roles).values({
      id: randomUUID(),
      code: roleCode,
      name: roleText,
      description: `Migrated from text role: ${roleText}`,
      level: 0,
      isSystemRole: false
    }).onConflictDoNothing({ target: schema.roles.code });
  }

  // Lấy map roles hiện tại
  const currentRoles = await db.select().from(schema.roles);
  const roleCodeMap = new Map(currentRoles.map(r => [r.code, r.id]));

  // Mapping vào userDepartments (vì schema mới khuyến khích dùng userDepartments để map Role & Dept)
  let count = 0;
  for (const u of allUsers) {
    if (!u.roleText) continue;
    const roleCode = u.roleText.toUpperCase().replace(/\s+/g, '_');
    const roleId = roleCodeMap.get(roleCode);

    if (roleId && u.deptId) {
      // Check if already exists
      const existing = await db.select().from(schema.userDepartments)
        .where(eq(schema.userDepartments.userId, u.id));
      
      const hasMapping = existing.some(e => e.departmentId === u.deptId && e.roleId === roleId);

      if (!hasMapping) {
        await db.insert(schema.userDepartments).values({
          id: randomUUID(),
          userId: u.id,
          departmentId: u.deptId,
          roleId: roleId,
          isPrimary: true,
        });
        count++;
      }
    }
  }

  console.log(`--- Migration hoàn tất. Đã map ${count} records vào userDepartments ---`);
}
