'use client';

import { useState, useEffect } from 'react';

export interface Permission {
  code: string;
  action: string;
  dataScope: string;
  effect: 'ALLOW' | 'DENY';
}

let cachedPermissions: Permission[] | null = null;
let isSuperAdminCached = false;
let fetchPromise: Promise<any> | null = null;

export function usePermission() {
  const [permissions, setPermissions] = useState<Permission[]>(cachedPermissions || []);
  const [isSuperAdmin, setIsSuperAdmin] = useState(isSuperAdminCached);
  const [isLoading, setIsLoading] = useState(!cachedPermissions && !isSuperAdminCached);

  useEffect(() => {
    if (cachedPermissions || isSuperAdminCached) {
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetch('/api/rbac/my-permissions')
        .then(res => res.json())
        .then(data => {
          if (data.isSuperAdmin) {
            isSuperAdminCached = true;
            setIsSuperAdmin(true);
          } else {
            cachedPermissions = data.permissions || [];
            setPermissions(cachedPermissions as Permission[]);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch permissions:', err);
          setIsLoading(false);
        });
    } else {
      fetchPromise.then(() => {
        setIsSuperAdmin(isSuperAdminCached);
        if (cachedPermissions) setPermissions(cachedPermissions);
        setIsLoading(false);
      });
    }
  }, []);

  const hasPermission = (code: string) => {
    if (isSuperAdmin) return true;
    const perm = permissions.find(p => p.code === code);
    return perm !== undefined && perm.effect === 'ALLOW';
  };

  const getScope = (code: string) => {
    if (isSuperAdmin) return 'all';
    const perm = permissions.find(p => p.code === code);
    if (perm && perm.effect === 'ALLOW') return perm.dataScope;
    return 'none';
  };

  return { hasPermission, getScope, isLoading, isSuperAdmin, permissions };
}
