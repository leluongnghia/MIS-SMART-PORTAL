import React from 'react';
import { getAllUsersForPermAdmin, getAllModulesAdmin } from '@/src/libs/server/actions/module-permission-actions';
import OverridesClient from './overrides-client';

export default async function OverridesPage() {
  const users = await getAllUsersForPermAdmin();
  const modules = await getAllModulesAdmin();

  return <OverridesClient users={users} modules={modules} />;
}
