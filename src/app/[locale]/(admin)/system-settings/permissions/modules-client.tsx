"use client";

import React, { useState, useTransition } from 'react';
import { toggleModuleStatusAdmin } from '@/src/libs/server/actions/module-permission-actions';
import { 
  LayoutDashboard, Users, Workflow, Globe, Layout, Target, 
  CreditCard, UserCheck, GraduationCap, CalendarDays, FileText, 
  FileBarChart, Bus, Building, Settings, Layers, Box, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Users, Workflow, Globe, Layout, Target, 
  CreditCard, UserCheck, GraduationCap, CalendarDays, FileText, 
  FileBarChart, Bus, Building, Settings, Layers, Box
};

interface ModuleRow {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort: number;
  status: boolean;
}

export default function ModulesClient({ initialModules }: { initialModules: ModuleRow[] }) {
  const [modules, setModules] = useState<ModuleRow[]>(initialModules);
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    const nextStatus = !currentStatus;
    
    // Optimistic update
    setModules(prev => prev.map(m => m.id === id ? { ...m, status: nextStatus } : m));

    startTransition(async () => {
      try {
        await toggleModuleStatusAdmin(id, nextStatus);
      } catch (err) {
        alert('Lỗi khi cập nhật trạng thái module');
        // Revert
        setModules(prev => prev.map(m => m.id === id ? { ...m, status: currentStatus } : m));
      } finally {
        setLoadingId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Danh sách Module chuẩn (Đơn vị phân quyền tối cao)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Mỗi Module đại diện cho một phân hệ chức năng độc lập. Việc bật/tắt ở đây sẽ áp dụng trên toàn bộ trường học.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
          <Layers className="h-4 w-4" />
          Tổng số: {modules.length} module ({modules.filter(m => m.status).length} đang bật)
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modules.map((m) => {
          const IconComponent = ICON_MAP[m.icon || 'Box'] || Box;
          const isLoading = loadingId === m.id;

          return (
            <div 
              key={m.id} 
              className={cn(
                "relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-200",
                m.status 
                  ? "border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60" 
                  : "border-slate-200/60 bg-slate-50 opacity-60 dark:border-slate-800/60 dark:bg-slate-900/20"
              )}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                    m.status ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400" : "bg-slate-200 text-slate-500 dark:bg-slate-800"
                  )}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400">#{m.sort}</span>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">{m.name}</h3>
                  <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {m.slug}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {m.status ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-700 dark:text-emerald-400">Hoạt động</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-500">Đã vô hiệu hóa</span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleToggle(m.id, m.status)}
                  className={cn(
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:cursor-not-allowed",
                    m.status ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center",
                      m.status ? "translate-x-5" : "translate-x-0"
                    )}
                  >
                    {isLoading && <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
