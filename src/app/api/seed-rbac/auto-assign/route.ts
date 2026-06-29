import { NextResponse } from 'next/server';
import { db, schema } from '@/src/libs/server/db';
import { eq } from 'drizzle-orm';
import { getAllDepartmentsAdmin } from '@/src/libs/server/actions/module-permission-actions';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const departments = await getAllDepartmentsAdmin();
    const modules = await db.select().from(schema.sysModules);
    
    const permissions = await db.select().from(schema.sysPermissions);
    
    // Xóa quyền cũ để seed lại
    await db.delete(schema.departmentPermissions);
    
    let inserted = 0;
    
    const assign = async (deptId: string, moduleCodes: string[]) => {
      for (const code of moduleCodes) {
        const mod = modules.find(m => m.code === code);
        if (!mod) continue;
        
        const actions = ['VIEW', 'CREATE', 'UPDATE', 'DELETE'];
        for (const action of actions) {
          const permCode = `${code}.MAIN.${action}`;
          const perm = permissions.find(p => p.code === permCode);
          if (perm) {
            await db.insert(schema.departmentPermissions).values({
              id: randomUUID(),
              departmentId: deptId,
              permissionId: perm.id,
              dataScope: 'department'
            });
            inserted++;
          }
        }
      }
    };

    for (const dept of departments) {
      const code = dept.code;
      console.log('DEPT CODE:', code);
      
      if (code === 'BGH') {
        // BGH có full quyền
        await assign(dept.id, modules.map(m => m.code));
      } else if (code === 'TUYEN_SINH_PR') {
        await assign(dept.id, ['CRM', 'ADMISSIONS', 'ADMISSIONS_LEADS', 'ADMISSIONS_PIPELINE', 'ADMISSIONS_CALENDAR', 'ADMISSIONS_FINANCE', 'ADMISSIONS_DOCS', 'ADMISSIONS_REPORT', 'MARKETING', 'WEBSITE', 'LANDING', 'DASHBOARD']);
      } else if (code === 'HANH_CHINH') {
        await assign(dept.id, ['HRM', 'HRM_STAFF', 'HRM_LEAVE', 'HRM_PAYROLL', 'OPERATIONS', 'OPERATIONS_ASSETS', 'OPERATIONS_MEETINGS', 'SERVICES_TICKETS', 'SERVICES_KNOWLEDGE', 'DASHBOARD']);
      } else if (code === 'DICH_VU_HOC_DUONG') {
        await assign(dept.id, ['SERVICES', 'SERVICES_TICKETS', 'SERVICES_EVENTS', 'OPERATIONS_TRANSPORT', 'OPERATIONS_MEALS', 'DASHBOARD']);
      } else if (code === 'KHAO_THI') {
        await assign(dept.id, ['ACADEMIC', 'EXAMS', 'ACADEMIC_GRADEBOOK', 'REPORTS', 'DASHBOARD']);
      } else if (code === 'QUOC_TE') {
        await assign(dept.id, ['ACADEMIC', 'CLASSES', 'CLASSES_LIST', 'CLASSES_HOMEROOM', 'SCHEDULE', 'EXAMS', 'ACADEMIC_STUDENTS', 'ACADEMIC_GRADEBOOK', 'DASHBOARD']);
      } else if (code === 'CTHS_TAM_LY') {
        await assign(dept.id, ['ACADEMIC', 'ACADEMIC_CONDUCT', 'ACADEMIC_STUDENTS', 'SERVICES_TICKETS', 'DASHBOARD']);
      } else if (['KHTN', 'LS_DL', 'NGOAI_NGU', 'VAN', 'TOAN_TIN', 'CN_TRAI_NGHIEM', 'GDCD_KTPL', 'NT_TC_QPAN'].includes(code)) {
        // Các tổ chuyên môn
        await assign(dept.id, ['ACADEMIC', 'CLASSES', 'CLASSES_LIST', 'CLASSES_HOMEROOM', 'SCHEDULE', 'EXAMS', 'ACADEMIC_STUDENTS', 'ACADEMIC_CONDUCT', 'ACADEMIC_GRADEBOOK', 'DASHBOARD']);
      }
    }

    const tsPerms = await db.select().from(schema.departmentPermissions).where(eq(schema.departmentPermissions.departmentId, 'TUYEN_SINH_PR'));
    return NextResponse.json({ message: 'Auto-assigned basic permissions', inserted, tsPermsCount: tsPerms.length, moduleCodes: modules.map(m => m.code) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
