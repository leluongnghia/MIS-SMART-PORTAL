import { db, pool, schema } from '../src/libs/server/db';
import { MOCK_USERS } from '../src/mockData';

const now = new Date();

async function seedModulesOnly() {
  console.log("Seeding modules, departmentModules, and userDepartments (Safe New Engine)...");
  const seedModules = [
    { id: 'mod_dashboard', name: 'Dashboard Tổng quan', slug: 'dashboard', icon: 'LayoutDashboard', sort: 1, status: true },
    { id: 'mod_crm', name: 'CRM Khách hàng', slug: 'crm', icon: 'Users', sort: 2, status: true },
    { id: 'mod_admissions', name: 'Tuyển sinh CRM', slug: 'admissions', icon: 'Workflow', sort: 3, status: true },
    { id: 'mod_website', name: 'Quản lý Website', slug: 'website', icon: 'Globe', sort: 4, status: true },
    { id: 'mod_landing', name: 'Landing Page', slug: 'landing', icon: 'Layout', sort: 5, status: true },
    { id: 'mod_marketing', name: 'Marketing & Chiến dịch', slug: 'marketing', icon: 'Target', sort: 6, status: true },
    { id: 'mod_finance', name: 'Kế toán & Học phí', slug: 'finance', icon: 'CreditCard', sort: 7, status: true },
    { id: 'mod_hrm', name: 'Nhân sự & Lương', slug: 'hrm', icon: 'UserCheck', sort: 8, status: true },
    { id: 'mod_academic', name: 'Hồ sơ Học sinh & Học vụ', slug: 'academic', icon: 'GraduationCap', sort: 9, status: true },
    { id: 'mod_classes', name: 'Quản lý Lớp học', slug: 'classes', icon: 'Users', sort: 10, status: true },
    { id: 'mod_schedule', name: 'Thời khóa biểu', slug: 'schedule', icon: 'CalendarDays', sort: 11, status: true },
    { id: 'mod_exams', name: 'Khảo thí & Đánh giá', slug: 'exams', icon: 'FileText', sort: 12, status: true },
    { id: 'mod_reports', name: 'Báo cáo & Thống kê', slug: 'reports', icon: 'FileBarChart', sort: 13, status: true },
    { id: 'mod_services', name: 'Dịch vụ học đường', slug: 'services', icon: 'Bus', sort: 14, status: true },
    { id: 'mod_operations', name: 'Vận hành & Tài sản', slug: 'operations', icon: 'Building', sort: 15, status: true },
    { id: 'mod_settings', name: 'Cấu hình hệ thống', slug: 'settings', icon: 'Settings', sort: 16, status: true },
  ];
  await db.insert(schema.modules).values(seedModules.map(m => ({ ...m, createdAt: now, updatedAt: now }))).onConflictDoNothing();

  const userDeptsToInsert = MOCK_USERS.filter((u: any) => u.workspaceId && u.workspaceId !== 'ALL').map((u: any) => ({
    id: `ud_${u.id}_${u.workspaceId}`,
    userId: u.id,
    departmentId: u.workspaceId,
    isPrimary: true,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  }));
  await db.insert(schema.userDepartments).values(userDeptsToInsert).onConflictDoNothing();

  const deptModMappings: { deptId: string; modSlugs: string[] }[] = [
    { deptId: 'BGH', modSlugs: seedModules.map(m => m.slug) },
    { deptId: 'TUYEN_SINH_PR', modSlugs: ['dashboard', 'crm', 'admissions', 'website', 'landing', 'marketing', 'reports'] },
    { deptId: 'QUOC_TE', modSlugs: ['dashboard', 'academic', 'classes', 'schedule', 'exams', 'reports'] },
    { deptId: 'CTHS_TAM_LY', modSlugs: ['dashboard', 'academic', 'classes', 'services', 'reports'] },
    { deptId: 'DICH_VU_HOC_DUONG', modSlugs: ['dashboard', 'services', 'operations', 'reports'] },
    { deptId: 'TOAN_TIN', modSlugs: ['dashboard', 'academic', 'classes', 'schedule', 'exams'] },
    { deptId: 'VAN', modSlugs: ['dashboard', 'academic', 'classes', 'schedule', 'exams'] },
    { deptId: 'NGOAI_NGU', modSlugs: ['dashboard', 'academic', 'classes', 'schedule', 'exams'] },
    { deptId: 'KHTN', modSlugs: ['dashboard', 'academic', 'classes', 'schedule', 'exams'] },
    { deptId: 'HANH_CHINH', modSlugs: ['dashboard', 'hrm', 'operations', 'services', 'reports', 'settings'] },
  ];

  const deptModsToInsert: any[] = [];
  for (const mapping of deptModMappings) {
    for (const slug of mapping.modSlugs) {
      const mod = seedModules.find(m => m.slug === slug);
      if (mod) {
        deptModsToInsert.push({
          id: `dm_${mapping.deptId}_${mod.id}`,
          departmentId: mapping.deptId,
          moduleId: mod.id,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }
  await db.insert(schema.departmentModules).values(deptModsToInsert).onConflictDoNothing();
  console.log("Modules seed completed successfully without modifying student tables.");
}

seedModulesOnly().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await pool.end();
});
