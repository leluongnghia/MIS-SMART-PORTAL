"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Building, Layers, Search, Shield, UserCog, Clock, UserPlus } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { serverStorage } from '@/src/libs/client/server-storage';
import { MOCK_USERS } from '@/src/mockData';
import { decryptData } from '@/src/utils/security';

export default function PermissionsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'vi';

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const savedUserId = serverStorage.getItem('mis_edutask_logged_in_user_id');
    if (!savedUserId) {
      setIsAuthorized(false);
      return;
    }
    
    const localUsersStr = serverStorage.getItem('school_task_manager_users_profiles');
    let users = MOCK_USERS;
    if (localUsersStr) {
      try {
        const decrypted = decryptData(localUsersStr);
        users = (decrypted !== null ? decrypted : JSON.parse(localUsersStr)) as any;
      } catch (e) {}
    }
    const currentUser = users.find((u: any) => u.id === savedUserId);
    
    if (currentUser?.role === 'ADMIN' || currentUser?.workspaceId === 'BGH') {
      setIsAuthorized(true);
    } else {
      fetch(`/api/auth/permissions?userId=${currentUser?.id}&departmentId=${currentUser?.workspaceId}`)
        .then(res => res.json())
        .then(data => {
          if (data.permissions?.includes('SYSTEM.VIEW')) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        })
        .catch(() => setIsAuthorized(false));
    }
  }, []);

  if (isAuthorized === false) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-900">
        <Shield className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">403 - KHÔNG CÓ QUYỀN TRUY CẬP</h1>
        <p className="text-slate-600 dark:text-slate-400">Tài khoản của bạn không được phép cấu hình Ma trận phân quyền.</p>
        <button onClick={() => router.push(`/${locale}`)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Quay lại trang chủ</button>
      </div>
    );
  }

  if (isAuthorized === null) {
    return <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-slate-500">Đang kiểm tra quyền truy cập...</div>;
  }

  const tabs = [
    { name: 'Danh sách Module', href: '', icon: Layers, active: pathname.endsWith('/permissions') },
    { name: 'Phân quyền Phòng ban', href: 'departments', icon: Building, active: pathname.endsWith('/permissions/departments') },
    { name: 'Ma trận quyền (Matrix)', href: 'departments-matrix', icon: Shield, active: pathname.includes('/permissions/departments-matrix') },
    { name: 'Quyền Cá nhân', href: 'user-permissions', icon: UserPlus, active: pathname.includes('/permissions/user-permissions') },
    { name: 'Ngoại lệ & Data Scope', href: 'overrides', icon: UserCog, active: pathname.includes('/permissions/overrides') },
    { name: 'Kiểm tra quyền thực tế', href: 'check', icon: Search, active: pathname.includes('/permissions/check') },
    { name: 'Lịch sử (Audit)', href: 'audit-logs', icon: Clock, active: pathname.includes('/permissions/audit-logs') },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Shield className="h-6 w-6 text-indigo-600" />
          Quản trị phân quyền (Mô hình Phòng ban → Module)
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Hệ thống phân quyền trung tâm Single Source of Truth: Quản lý module theo phòng ban, ngoại lệ cá nhân (Override) và phạm vi dữ liệu (Data Scope).
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
