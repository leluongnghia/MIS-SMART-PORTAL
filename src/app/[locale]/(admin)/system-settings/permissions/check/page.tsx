import React from 'react';
import { getAllUsersForPermAdmin } from '@/src/libs/server/actions/module-permission-actions';
import CheckClient from './check-client';

export default async function PermissionCheckPage() {
  const users = await getAllUsersForPermAdmin();

  return <CheckClient users={users} />;
}
