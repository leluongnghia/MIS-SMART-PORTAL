import React from 'react';
import { getPermissionUsers } from '../actions';
import UserPermissionsClient from './user-permissions-client';

export default async function UserPermissionsPage() {
  const users = await getPermissionUsers();
  
  return <UserPermissionsClient users={users} />;
}
