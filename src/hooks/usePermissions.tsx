"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchMyPermissions } from '@/src/libs/server/actions/permission-actions';

interface PermissionsContextState {
  permissions: Record<string, any>; // Map is sent as Object from Server Action
  allowedModules: string[];
  isLoading: boolean;
  hasPermission: (code: string) => boolean;
  canAccessModule: (code: string) => boolean;
  getScope: (code: string) => string;
}

const PermissionsContext = createContext<PermissionsContextState>({
  permissions: {},
  allowedModules: [],
  isLoading: true,
  hasPermission: () => false,
  canAccessModule: () => false,
  getScope: () => 'none',
});

export const PermissionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [permissions, setPermissions] = useState<Record<string, any>>({});
  const [allowedModules, setAllowedModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // You can trigger this re-fetch on auth state changes
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const data = await fetchMyPermissions();
        if (data) {
          setPermissions(data.permissions);
          setAllowedModules(data.allowedModules);
        }
      } catch (err) {
        console.error("Failed to load permissions", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPermissions();
  }, []);

  const hasPermission = (code: string) => {
    const perm = permissions[code];
    return perm?.effect === 'ALLOW';
  };

  const canAccessModule = (code: string) => {
    // ADMIN skip check is handled in server, so if it's ADMIN, allowedModules contains all modules
    return allowedModules.includes(code);
  };

  const getScope = (code: string) => {
    const perm = permissions[code];
    return perm?.effect === 'ALLOW' ? perm.dataScope : 'none';
  };

  return (
    <PermissionsContext.Provider value={{ permissions, allowedModules, isLoading, hasPermission, canAccessModule, getScope }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  return useContext(PermissionsContext);
};
