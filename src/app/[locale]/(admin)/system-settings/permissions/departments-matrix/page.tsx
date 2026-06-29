import React from 'react';
import { getAllDepartmentsAdmin } from '@/src/libs/server/actions/module-permission-actions';
import { db, schema } from '@/src/libs/server/db';
import DepartmentMatrixClient from './matrix-client';
import { getCurrentActor } from '@/src/libs/server/auth-helper';

export default async function DepartmentMatrixPage() {
  const actor = await getCurrentActor();
  console.log('ACTOR IN PAGE:', actor?.id, actor?.role);
  const isAdmin = actor?.role?.toUpperCase() === 'ADMIN' || actor?.id === 'user_chutich' || actor?.id === 'user_ceo';

  const departments = await getAllDepartmentsAdmin();
  const allDeptPerms = await db.select().from(schema.departmentPermissions);
  
  const deptPermsCountMap: Record<string, number> = {};
  for (const dp of allDeptPerms) {
    deptPermsCountMap[dp.departmentId] = (deptPermsCountMap[dp.departmentId] || 0) + 1;
  }

  return <DepartmentMatrixClient departments={departments} initialCounts={deptPermsCountMap} isAdmin={isAdmin} />;
}
