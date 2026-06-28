"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchMyPermissions } from '@/src/libs/server/actions/permission-actions';

interface PermissionsContextState {
  permissions: Record<string, any>;
  allowedModules: string[];
  scopesMap: Record<string, string>;
  isLoading: boolean;
  hasPermission: (code: string) => boolean;
  canAccessModule: (slug: string) => boolean;
  getScope: (slugOrCode: string) => string;
}

const PermissionsContext = createContext<PermissionsContextState>({
  permissions: {},
  allowedModules: [],
  scopesMap: {},
  isLoading: true,
  hasPermission: () => false,
  canAccessModule: () => false,
  getScope: () => 'OWN',
});

export const PermissionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [allowedModules, setAllowedModules] = useState<string[]>([]);
  const [scopesMap, setScopesMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const data = await fetchMyPermissions();
        if (data) {
          setAllowedModules(data.allowedModules || []);
          setScopesMap(data.scopesMap || {});
        }
      } catch (err) {
        console.error("Failed to load permissions", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPermissions();
  }, []);

  const canAccessModule = (slug: string) => {
    return allowedModules.includes(slug);
  };

  const hasPermission = (code: string) => {
    // Tương thích ngược: crm.lead.view -> kiểm tra module 'crm' hoặc 'admissions'
    const prefix = code.split('.')[0];
    if (prefix === 'crm' || prefix === 'admissions') {
      return canAccessModule('crm') || canAccessModule('admissions');
    }
    return canAccessModule(prefix);
  };

  const getScope = (slugOrCode: string) => {
    const prefix = slugOrCode.split('.')[0];
    return scopesMap[prefix] || scopesMap[slugOrCode] || 'OWN';
  };

  return (
    <PermissionsContext.Provider value={{ permissions: {}, allowedModules, scopesMap, isLoading, hasPermission, canAccessModule, getScope }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  return useContext(PermissionsContext);
};
