import { db, schema } from './db';
import { randomUUID } from 'crypto';

/**
 * Script khởi tạo dữ liệu mẫu cho hệ thống phân quyền động
 */
export async function seedPermissions() {
  console.log('--- Bắt đầu seed permission ---');

  // 1. Khởi tạo Modules
  const modules = [
    { id: randomUUID(), code: 'DASHBOARD', name: 'Bộ máy điều hành', sortOrder: 1, isSystem: true },
    { id: randomUUID(), code: 'ACADEMIC', name: 'Học vụ & Nhân sự', sortOrder: 2, isSystem: false },
    { id: randomUUID(), code: 'OPERATIONS', name: 'Vận hành & Nguồn lực', sortOrder: 3, isSystem: false },
    { id: randomUUID(), code: 'SERVICES', name: 'Dịch vụ học đường', sortOrder: 4, isSystem: false },
    { id: randomUUID(), code: 'SYSTEM', name: 'Cài đặt hệ thống', sortOrder: 99, isSystem: true },
  ];

  for (const m of modules) {
    await db.insert(schema.sysModules).values(m).onConflictDoNothing({ target: schema.sysModules.code });
  }

  // Lấy lại ID thực tế sau khi seed
  const dbModules = await db.select().from(schema.sysModules);
  const modMap = new Map(dbModules.map(m => [m.code, m.id]));

  // 2. Khởi tạo Features (Danh mục con)
  const features = [
    { id: randomUUID(), moduleId: modMap.get('DASHBOARD')!, code: 'COUNCIL', name: 'Dashboard Hội đồng', sortOrder: 1 },
    { id: randomUUID(), moduleId: modMap.get('DASHBOARD')!, code: 'PRINCIPAL', name: 'Dashboard Hiệu trưởng', sortOrder: 2 },
    { id: randomUUID(), moduleId: modMap.get('ACADEMIC')!, code: 'STUDENTS', name: 'Hồ sơ học sinh', sortOrder: 1 },
    { id: randomUUID(), moduleId: modMap.get('ACADEMIC')!, code: 'LESSON_PLANS', name: 'Giáo án & Dự giờ', sortOrder: 2 },
    { id: randomUUID(), moduleId: modMap.get('SERVICES')!, code: 'SERVICE_TICKETS', name: 'Trung tâm Ticket', sortOrder: 1 },
    { id: randomUUID(), moduleId: modMap.get('SYSTEM')!, code: 'RBAC', name: 'Phân quyền', sortOrder: 1 },
  ];

  for (const f of features) {
    await db.insert(schema.sysFeatures).values(f).onConflictDoNothing({ target: schema.sysFeatures.code });
  }

  const dbFeatures = await db.select().from(schema.sysFeatures);
  const featMap = new Map(dbFeatures.map(f => [f.code, f.id]));

  // 3. Khởi tạo Permissions
  const permissions = [
    { id: randomUUID(), moduleId: modMap.get('DASHBOARD')!, featureId: featMap.get('COUNCIL'), code: 'dashboard.council.view', name: 'Xem Dashboard Hội đồng', action: 'view' },
    { id: randomUUID(), moduleId: modMap.get('DASHBOARD')!, featureId: featMap.get('PRINCIPAL'), code: 'dashboard.principal.view', name: 'Xem Dashboard Hiệu trưởng', action: 'view' },
    { id: randomUUID(), moduleId: modMap.get('ACADEMIC')!, featureId: featMap.get('LESSON_PLANS'), code: 'academic.lesson_plan.view', name: 'Xem giáo án', action: 'view' },
    { id: randomUUID(), moduleId: modMap.get('ACADEMIC')!, featureId: featMap.get('LESSON_PLANS'), code: 'academic.lesson_plan.approve', name: 'Duyệt giáo án', action: 'approve' },
    { id: randomUUID(), moduleId: modMap.get('SERVICES')!, featureId: featMap.get('SERVICE_TICKETS'), code: 'service.ticket.view', name: 'Xem Ticket Dịch vụ', action: 'view' },
    { id: randomUUID(), moduleId: modMap.get('SERVICES')!, featureId: featMap.get('SERVICE_TICKETS'), code: 'service.ticket.process', name: 'Xử lý Ticket', action: 'update' },
    { id: randomUUID(), moduleId: modMap.get('SYSTEM')!, featureId: featMap.get('RBAC'), code: 'system.rbac.manage', name: 'Quản trị phân quyền', action: 'manage', isSystem: true },
  ];

  for (const p of permissions) {
    await db.insert(schema.sysPermissions).values(p).onConflictDoNothing({ target: schema.sysPermissions.code });
  }

  // 4. Khởi tạo Roles chuẩn
  const roles = [
    { id: randomUUID(), code: 'ADMIN', name: 'Quản trị hệ thống', level: 100, isSystemRole: true },
    { id: randomUUID(), code: 'PRINCIPAL', name: 'Hiệu trưởng', level: 90, isSystemRole: false },
    { id: randomUUID(), code: 'ACADEMIC_HEAD', name: 'Trưởng phòng Học vụ', level: 80, isSystemRole: false },
    { id: randomUUID(), code: 'TEACHER', name: 'Giáo viên', level: 10, isSystemRole: false },
  ];

  for (const r of roles) {
    await db.insert(schema.roles).values(r).onConflictDoNothing({ target: schema.roles.code });
  }

  // 5. Khởi tạo Groups (Nhóm linh hoạt)
  const groups = [
    { id: randomUUID(), code: 'ADMISSIONS_CAMPAIGN_2026', name: 'Nhóm tuyển sinh cao điểm 2026', type: 'CAMPAIGN', isTemporary: true, description: 'Đội ngũ trực chiến chiến dịch tuyển sinh' },
    { id: randomUUID(), code: 'EVENT_OPENING_TEAM', name: 'Nhóm sự kiện khai giảng', type: 'EVENT', isTemporary: true, description: 'Ban tổ chức lễ khai giảng' },
    { id: randomUUID(), code: 'DIGITAL_TRANSFORMATION', name: 'Ban chuyển đổi số', type: 'TASK_FORCE', isTemporary: false, description: 'Chuyên trách chuyển đổi số toàn trường' },
  ];

  for (const g of groups) {
    await db.insert(schema.sysGroups).values(g).onConflictDoNothing({ target: schema.sysGroups.code });
  }

  console.log('--- Hoàn tất seed permission ---');
}
