"use client";

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { BarChart3, Building, Layers, Lock, Search, Shield, UserCog, Users } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function PermissionsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || 'vi';

  const tabs = [
    { name: 'Tong quan', href: '', icon: BarChart3, active: pathname.endsWith('/permissions') },
    { name: 'Nguoi dung', href: 'users', icon: UserCog, active: pathname.includes('/permissions/users') },
    { name: 'Vai tro', href: 'roles', icon: Shield, active: pathname.includes('/permissions/roles') },
    { name: 'Module', href: 'modules', icon: Layers, active: pathname.includes('/permissions/modules') },
    { name: 'Phong ban', href: 'departments', icon: Building, active: pathname.includes('/permissions/departments') },
    { name: 'Nhom', href: 'groups', icon: Users, active: pathname.includes('/permissions/groups') },
    { name: 'Ngoai le user', href: 'overrides', icon: Users, active: pathname.includes('/permissions/overrides') },
    { name: 'Kiem tra', href: 'check', icon: Search, active: pathname.includes('/permissions/check') },
    { name: 'Audit', href: 'audit', icon: Lock, active: pathname.includes('/permissions/audit') },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Shield className="h-6 w-6 text-indigo-600" />
          Quan tri phan quyen
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quy trinh don gian: module, role preset, phong ban/nhom, ngoai le user, kiem tra va audit.
        </p>
      </div>

      <div className="flex space-x-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        {tabs.map(tab => (
          <Link
            key={tab.name}
            href={tab.href ? `/${locale}/system-settings/permissions/${tab.href}` : `/${locale}/system-settings/permissions`}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab.active
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.name}
          </Link>
        ))}
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        {children}
      </div>
    </div>
  );
}
