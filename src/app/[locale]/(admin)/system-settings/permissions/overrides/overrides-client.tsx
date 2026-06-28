"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { 
  getUserPermissionDetailsAdmin, 
  saveUserModuleOverrideAdmin, 
  removeUserModuleOverrideAdmin, 
  saveUserDataScopeAdmin 
} from '@/src/libs/server/actions/module-permission-actions';
import { DataScopeType } from '@/src/libs/server/module-auth-service';
import { User, ShieldAlert, ShieldCheck, Trash2, Plus, Loader2, Database, Search } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

interface UserRow {
  id: string;
  name: string;
  email: string | null;
  role: string;
  userType: string;
  departmentId: string | null;
}

interface ModRow {
  id: string;
  name: string;
  slug: string;
  status: boolean;
}

export default function OverridesClient({
  users,
  modules,
}: {
  users: UserRow[];
  modules: ModRow[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [details, setDetails] = useState<{ overrides: any[]; scopes: any[] }>({ overrides: [], scopes: [] });
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form thêm override
  const [selectedModId, setSelectedModId] = useState<string>(modules[0]?.id || '');
  const [overrideEffect, setOverrideEffect] = useState<'ALLOW' | 'DENY'>('ALLOW');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedUser = users.find(u => u.id === selectedUserId);

  useEffect(() => {
    if (!selectedUserId) return;
    setLoadingDetails(true);
    getUserPermissionDetailsAdmin(selectedUserId)
      .then(res => setDetails(res))
      .catch(() => alert('Lỗi tải chi tiết quyền'))
      .finally(() => setLoadingDetails(false));
  }, [selectedUserId]);

  const handleAddOverride = () => {
    if (!selectedUserId || !selectedModId) return;
    startTransition(async () => {
      try {
        await saveUserModuleOverrideAdmin(selectedUserId, selectedModId, overrideEffect);
        const updated = await getUserPermissionDetailsAdmin(selectedUserId);
        setDetails(updated);
      } catch (err) {
        alert('Lỗi thêm ngoại lệ');
      }
    });
  };

  const handleRemoveOverride = (overrideId: string) => {
    startTransition(async () => {
      try {
        await removeUserModuleOverrideAdmin(overrideId);
        const updated = await getUserPermissionDetailsAdmin(selectedUserId);
        setDetails(updated);
      } catch (err) {
        alert('Lỗi xoá ngoại lệ');
      }
    });
  };

  const handleScopeChange = (modId: string, newScope: DataScopeType) => {
    if (!selectedUserId) return;
    // Optimistic update
    setDetails(prev => {
      const exist = prev.scopes.find(s => s.moduleId === modId);
      const nextScopes = exist 
        ? prev.scopes.map(s => s.moduleId === modId ? { ...s, scope: newScope } : s)
        : [...prev.scopes, { moduleId: modId, scope: newScope }];
      return { ...prev, scopes: nextScopes };
    });

    startTransition(async () => {
      try {
        await saveUserDataScopeAdmin(selectedUserId, modId, newScope);
      } catch (err) {
        alert('Lỗi lưu phạm vi dữ liệu');
        const reverted = await getUserPermissionDetailsAdmin(selectedUserId);
        setDetails(reverted);
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Cột trái: Danh sách User */}
      <div className="space-y-3 lg:col-span-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm người dùng..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>

        <div className="max-h-[600px] space-y-1.5 overflow-y-auto pr-1">
          {filteredUsers.map(u => {
            const isSelected = u.id === selectedUserId;
            return (
              <button
                key={u.id}
                onClick={() => setSelectedUserId(u.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all",
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full font-bold text-xs",
                    isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  )}>
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className={cn("font-bold text-sm", isSelected ? "text-indigo-950 dark:text-indigo-200" : "text-slate-900 dark:text-white")}>
                      {u.name}
                    </div>
                    <div className="text-xs text-slate-500">{u.role} {u.departmentId ? `• ${u.departmentId}` : ''}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cột phải: Overrides & Data Scopes */}
      <div className="space-y-6 lg:col-span-8">
        {selectedUser ? (
          loadingDetails ? (
            <div className="flex h-64 items-center justify-center gap-2 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              Đang tải chi tiết quyền...
            </div>
          ) : (
            <>
              {/* Box 1: Ngoại lệ người dùng (Overrides) */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b pb-4 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-500" />
                    Ngoại lệ truy cập Module (User Override)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Cấp đặc quyền (ALLOW) cho người dùng truy cập module ngoài phòng ban, hoặc phủ quyết (DENY) cấm truy cập module dù phòng ban có quyền.
                  </p>
                </div>

                {/* Form thêm override */}
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                  <select
                    value={selectedModId}
                    onChange={e => setSelectedModId(e.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    {modules.filter(m => m.status).map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.slug})</option>
                    ))}
                  </select>

                  <select
                    value={overrideEffect}
                    onChange={e => setOverrideEffect(e.target.value as any)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="ALLOW" className="text-emerald-600 font-bold">ALLOW (Cấp đặc quyền)</option>
                    <option value="DENY" className="text-rose-600 font-bold">DENY (Cấm truy cập)</option>
                  </select>

                  <Button onClick={handleAddOverride} disabled={isPending} size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 gap-1.5">
                    <Plus className="h-4 w-4" /> Thêm ngoại lệ
                  </Button>
                </div>

                {/* Danh sách override hiện tại */}
                <div className="mt-4 space-y-2">
                  {details.overrides.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">Chưa có ngoại lệ nào được cấu hình cho người dùng này.</div>
                  ) : (
                    details.overrides.map(ovr => (
                      <div key={ovr.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2.5 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "rounded px-2 py-0.5 text-xs font-black uppercase",
                            ovr.effect === 'ALLOW' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          )}>
                            {ovr.effect}
                          </span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{ovr.moduleName}</span>
                          <span className="font-mono text-xs text-slate-500">({ovr.moduleSlug})</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveOverride(ovr.id)}
                          disabled={isPending}
                          className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Box 2: Phạm vi dữ liệu (Data Scope) */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b pb-4 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-indigo-600" />
                    Phạm vi dữ liệu (Data Scope)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Quyết định lượng dữ liệu người dùng nhìn thấy trong mỗi module: Cá nhân (OWN) • Phòng ban (DEPARTMENT) • Cơ sở (SCHOOL) • Toàn trường (ALL).
                  </p>
                </div>

                <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {modules.filter(m => m.status).map(mod => {
                    const currentScopeObj = details.scopes.find(s => s.moduleId === mod.id);
                    const currentScope = currentScopeObj ? currentScopeObj.scope : (selectedUser?.role === 'MANAGER' ? 'DEPARTMENT' : 'OWN');

                    return (
                      <div key={mod.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-2">
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">{mod.name}</div>
                          <div className="font-mono text-xs text-slate-500">{mod.slug}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {(['OWN', 'DEPARTMENT', 'SCHOOL', 'ALL'] as DataScopeType[]).map(scope => {
                            const isSelected = currentScope === scope;
                            return (
                              <button
                                key={scope}
                                type="button"
                                disabled={isPending}
                                onClick={() => handleScopeChange(mod.id, scope)}
                                className={cn(
                                  "rounded-md px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                                  isSelected
                                    ? "bg-indigo-600 text-white shadow"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                )}
                              >
                                {scope}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-500">Vui lòng chọn người dùng bên trái</div>
        )}
      </div>
    </div>
  );
}
