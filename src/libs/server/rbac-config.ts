/**
 * RBAC Configuration — MIS Smart Portal
 * Maps workspaceId + role → primaryRole → capabilities
 * Used by: AppSidebar (menu filter) + dashboard redirect + data-service (row scope)
 */

export type PrimaryRole =
  | 'council'        // Hội đồng trường / Ban điều hành
  | 'principal'      // Hiệu trưởng / BGH
  | 'academic_office'// Phòng chuyên môn / Khảo thí ĐBCL
  | 'homeroom_gvcn'  // Giáo viên chủ nhiệm
  | 'supervisor_quannhiem' // Quản nhiệm
  | 'operations'     // Vận hành dịch vụ (Bếp, Xe, Y tế, CSVC)
  | 'admissions'     // Tuyển sinh & PR
  | 'media_cskh'     // Truyền thông & CSKH
  | 'hr_admin'       // Hành chính - Nhân sự
  | 'finance'        // Kế toán - Tài chính
  | 'super_admin';   // Quản trị hệ thống

/** Maps system role/workspaceId to primaryRole */
export function inferPrimaryRole(user: {
  id?: string;
  role?: string | null;
  workspaceId?: string | null;
  homeroomClassId?: string | null;
  title?: string | null;
}): PrimaryRole {
  const ws = user.workspaceId?.toUpperCase() ?? '';
  const role = user.role?.toUpperCase() ?? '';

  // Super admin
  if (role === 'ADMIN') {
    if (user.id === 'user_chutich' || (user.title && user.title.toLowerCase().includes('chủ tịch'))) {
      return 'super_admin';
    }
    return 'principal';
  }

  // Workspace-based mapping
  const wsMap: Record<string, PrimaryRole> = {
    'BGH': 'principal',
    'TUYEN_SINH_PR': 'admissions',
    'QUOC_TE': 'academic_office',
    'KHAO_THI': 'academic_office',
    'CTHS_TAM_LY': 'supervisor_quannhiem',
    'DICH_VU_HOC_DUONG': 'operations',
    'HANH_CHINH': 'hr_admin',
    'TOAN_TIN': 'academic_office',
    'VAN': 'academic_office',
    'NGOAI_NGU': 'academic_office',
    'KHTN': 'academic_office',
    'LS_DL': 'academic_office',
    'GDCD_KTPL': 'academic_office',
    'NT_TC_QPAN': 'academic_office',
    'CN_TRAI_NGHIEM': 'academic_office',
  };

  if (ws && wsMap[ws]) return wsMap[ws];

  if (role === 'MANAGER') {
    return 'principal'; // Managers default to principal dashboard
  }

  // If user has homeroom class → GVCN
  if (user.homeroomClassId) return 'homeroom_gvcn';

  // Default for STAFF without clear workspace
  return 'homeroom_gvcn';
}

/** Dashboard redirect map per role */
export const ROLE_DASHBOARD: Record<PrimaryRole, string> = {
  council:               '/dashboard/council',
  principal:             '/dashboard/academic',
  academic_office:       '/lesson-plans',
  homeroom_gvcn:         '/students',
  supervisor_quannhiem:  '/conduct',
  operations:            '/facilities',
  admissions:            '/admissions',
  media_cskh:            '/tickets',
  hr_admin:              '/hrm',
  finance:               '/payments',
  super_admin:           '/dashboard/council',
};

/** Capabilities per role — used to show/hide menu items */
export const ROLE_CAPABILITIES: Record<PrimaryRole, string[]> = {
  super_admin: ['*'],

  council: [
    'dashboard.council.view',
    'report.executive.view',
    'approval.council',
    'risk.view',
    'admission.view',
    'finance.view',
    'ticket.view',
    'transport.view',
    'meal.view',
    'health.view',
    'facility.view',
    'hr.view',
    'timetable.view',
    'exam.view',
    'student.view',
    'announcement.view',
    'document.view',
  ],

  principal: [
    'dashboard.academic.view',
    'approval.academic',
    'event.view',
    'curriculum.view', 'curriculum.edit',
    'timetable.view', 'timetable.edit',
    'lessonplan.view', 'lessonplan.edit', 'lessonplan.approve',
    'exam.view', 'exam.edit',
    'student.view', 'student.edit',
    'conduct.view', 'conduct.edit',
    'commbook.view', 'commbook.edit',
    'studentlog.view',
    'announcement.view',
    'document.view',
  ],

  academic_office: [
    'curriculum.view', 'curriculum.edit', 'curriculum.admin',
    'timetable.view', 'timetable.edit', 'timetable.admin',
    'lessonplan.view', 'lessonplan.edit', 'lessonplan.approve',
    'exam.view', 'exam.edit', 'exam.admin',
    'student.view',
    'announcement.view',
    'document.view',
  ],

  homeroom_gvcn: [
    'student.view',
    'student.edit:own_class',
    'conduct.view:own_class',
    'conduct.edit:own_class',
    'commbook.view:own_class',
    'commbook.edit:own_class',
    'studentlog.view:own_class',
    'exam.view',
    'timetable.view',
    'announcement.view',
  ],

  supervisor_quannhiem: [
    'student.view:own_class',
    'conduct.view:own_class',
    'conduct.edit:own_class',
    'studentlog.view:own_class',
    'transport.view',
    'meal.view',
    'announcement.view',
  ],

  operations: [
    'facility.view', 'facility.edit', 'facility.admin',
    'transport.view', 'transport.edit', 'transport.admin',
    'meal.view', 'meal.edit', 'meal.admin',
    'health.view', 'health.edit', 'health.admin',
    'announcement.view',
    'document.view',
  ],

  admissions: [
    'admission.view', 'admission.edit', 'admission.admin',
    'lead.view', 'lead.edit', 'lead.admin',
    'media.view',
    'finance.view',
    'announcement.view',
    'document.view',
  ],

  media_cskh: [
    'media.view', 'media.edit', 'media.admin',
    'ticket.view', 'ticket.edit', 'ticket.admin',
    'survey.view', 'survey.edit', 'survey.admin',
    'event.view', 'event.edit',
    'announcement.view',
    'document.view',
  ],

  hr_admin: [
    'hr.view', 'hr.edit', 'hr.admin',
    'hr.contract.view', 'hr.contract.edit',
    'hr.attendance.view', 'hr.attendance.edit',
    'letter.view', 'letter.edit', 'letter.admin',
    'meeting.view', 'meeting.edit',
    'document.view', 'document.edit',
    'announcement.view',
  ],

  finance: [
    'finance.view', 'finance.edit', 'finance.admin',
    'finance.debt.view', 'finance.debt.edit',
    'admission.view',
    'announcement.view',
    'document.view',
  ],
};

/** Check if a user has a given capability */
export function hasCapability(primaryRole: PrimaryRole, capability: string): boolean {
  const caps = ROLE_CAPABILITIES[primaryRole] ?? [];
  if (caps.includes('*')) return true;

  // Strip row-level suffix for base check
  const base = capability.replace(/:.*$/, '');

  return caps.some(c => {
    // Wildcard: e.g. "facility.*" matches "facility.view"
    if (c.endsWith('.*')) {
      const prefix = c.slice(0, -2);
      return base.startsWith(prefix);
    }
    return c === capability || c === base;
  });
}
