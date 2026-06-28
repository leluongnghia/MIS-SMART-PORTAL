import React from 'react';
import { getAllDepartmentsAdmin, getAllModulesAdmin } from '@/src/libs/server/actions/module-permission-actions';
import { db, schema } from '@/src/libs/server/db';
import DepartmentsClient from './departments-client';

export default async function DepartmentsPage() {
  const departments = await getAllDepartmentsAdmin();
  const modules = await getAllModulesAdmin();
  const allDeptModules = await db.select().from(schema.departmentModules);
  
  const deptModulesMap: Record<string, string[]> = {};
  for (const dm of allDeptModules) {
    if (!deptModulesMap[dm.departmentId]) deptModulesMap[dm.departmentId] = [];
    deptModulesMap[dm.departmentId].push(dm.moduleId);
  }

  return <DepartmentsClient initialDepartments={departments} modules={modules} initialDeptModulesMap={deptModulesMap} />;
}
