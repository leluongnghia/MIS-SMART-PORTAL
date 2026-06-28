import React from 'react';
import { getAllModulesAdmin } from '@/src/libs/server/actions/module-permission-actions';
import ModulesClient from './modules-client';

export default async function PermissionsPage() {
  const modules = await getAllModulesAdmin();

  return <ModulesClient initialModules={modules} />;
}
