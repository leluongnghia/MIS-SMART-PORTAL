"use client";

import React, { ReactNode } from 'react';
import { usePermissions } from '@/src/hooks/usePermissions';

interface CanProps {
  permission?: string;
  module?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const Can = ({ permission, module, children, fallback = null }: CanProps) => {
  const { hasPermission, canAccessModule, isLoading } = usePermissions();

  if (isLoading) {
    // Optionally return a skeleton or just return fallback during load to prevent flash
    return <>{fallback}</>;
  }

  let isAllowed = true;

  if (module) {
    isAllowed = isAllowed && canAccessModule(module);
  }

  if (permission) {
    isAllowed = isAllowed && hasPermission(permission);
  }

  return isAllowed ? <>{children}</> : <>{fallback}</>;
};
