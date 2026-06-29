'use client';

import React from 'react';
import { usePermission } from '../../hooks/usePermission';

interface PermissionGateProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission, isLoading } = usePermission();

  if (isLoading) {
    // Return null or a skeleton while checking
    return null; 
  }

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
