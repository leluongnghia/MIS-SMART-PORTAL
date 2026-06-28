"use client";

import React, { useState, useEffect } from 'react';
import { getEffectivePermissionPreviewAdmin } from '@/src/libs/server/actions/module-permission-actions';
import { 
  Building2, Layers, ShieldCheck, ShieldAlert, CheckCircle2, 
  XCircle, Database, UserCheck, ArrowRight, Loader2, Sparkles 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface UserRow {
  id: string;
  name: string;
  email: string | null;
  role: string;
  userType: string;
}

export default function CheckClient({ users }: { users: UserRow[] }) {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedUserId) return;
    setLoading(true);
    getEffectivePermissionPreviewAdmin(selectedUserId)
      .then(res => setPreviewData(res))
      .catch(() => alert('Lỗi tải dữ liệu kiểm tra quyền'))
      .finally(() => setLoading(false));
  }, [selectedUserId]);

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            Trình giả lập & Kiểm tra quyền thực tế (Effective Permission Preview)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Xem chính xác các Module và Phạm vi dữ liệu (Data Scope) mà người dùng nhận được sau khi tổng hợp từ Phòng ban và Ngoại lệ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Chọn thành viên:</label>
          <select
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          Đang tính toán ma trận quyền...
        </div>
      ) : previewData ? (
        <div className="space-y-8">
          {/* Banner thông tin cá nhân */}
          <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 font-bold text-xl backdrop-blur">
                {previewData.user.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black">{previewData.user.name}</h3>
                  <span className="rounded-full bg-indigo-500/30 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-indigo-200 border border-indigo-400/30">
                    {previewData.user.userType}
                  </span>
                </div>
                <p className="text-sm text-indigo-200 mt-1">
                  Vai trò hệ thống: <b className="text-white">{previewData.user.role}</b> • Email: {previewData.user.email || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur border border-white/10">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <div>
                <div className="text-xs text-indigo-200">Tổng Module truy cập</div>
                <div className="text-lg font-black text-white">{previewData.effectiveModules.length} Phân hệ</div>
              </div>
            </div>
          </div>

          {/* Sơ đồ luồng tính toán quyền (3 Bước) */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Bước 1: Phòng ban trực thuộc */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white border-b pb-3 dark:border-slate-800">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>1. Phòng ban tham gia ({previewData.departments.length})</span>
              </div>
              <div className="mt-3 space-y-2">
                {previewData.departments.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-2">Không thuộc phòng ban nào.</div>
                ) : (
                  previewData.departments.map((d: any) => (
                    <div key={d.deptId} className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-slate-200/60 shadow-sm dark:border-slate-800 dark:bg-slate-800">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{d.deptName}</span>
                      <span className="font-mono text-xs text-slate-400">{d.deptCode}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bước 2: Module kế thừa từ Phòng ban */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white border-b pb-3 dark:border-slate-800">
                <Layers className="h-5 w-5 text-indigo-600" />
                <span>2. Module kế thừa ({previewData.departmentModules.length})</span>
              </div>
              <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {previewData.departmentModules.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-2">Không có module kế thừa.</div>
                ) : (
                  previewData.departmentModules.map((dm: any, i: number) => (
                    <div key={`${dm.slug}_${i}`} className="flex items-center justify-between rounded bg-white px-3 py-1.5 border border-slate-200/60 text-xs dark:border-slate-800 dark:bg-slate-800">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{dm.name}</span>
                      <span className="text-slate-400 italic">từ {dm.fromDept}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bước 3: Ngoại lệ (ALLOW / DENY) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white border-b pb-3 dark:border-slate-800">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                <span>3. Ngoại lệ ({previewData.allowOverrides.length + previewData.denyOverrides.length})</span>
              </div>
              <div className="mt-3 space-y-2">
                {previewData.allowOverrides.map((o: any) => (
                  <div key={`allow_${o.slug}`} className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 border border-emerald-200 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-300">
                    <span className="font-bold">+ {o.name}</span>
                    <span className="font-black uppercase">ALLOW</span>
                  </div>
                ))}
                {previewData.denyOverrides.map((o: any) => (
                  <div key={`deny_${o.slug}`} className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2 border border-rose-200 text-xs text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/40 dark:text-rose-300">
                    <span className="font-bold">- {o.name}</span>
                    <span className="font-black uppercase">DENY</span>
                  </div>
                ))}
                {previewData.allowOverrides.length === 0 && previewData.denyOverrides.length === 0 && (
                  <div className="text-xs text-slate-400 italic py-2">Không có ngoại lệ cá nhân.</div>
                )}
              </div>
            </div>
          </div>

          {/* Bảng Kết quả cuối cùng: Effective Modules & Data Scopes */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  Danh sách Module Hợp lệ & Phạm vi Dữ liệu thực tế
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Đây là danh sách chính thức được sử dụng để hiển thị thanh điều hướng (Menu) và bảo vệ các API Routes của hệ thống.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {previewData.effectiveModules.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-hover hover:border-indigo-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 font-bold">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</div>
                      <div className="font-mono text-xs text-slate-400">{m.slug}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Data Scope</span>
                    <span className={cn(
                      "rounded px-2 py-0.5 text-xs font-black",
                      m.scope === 'ALL' ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" :
                      m.scope === 'SCHOOL' ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" :
                      m.scope === 'DEPARTMENT' ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                      "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    )}>
                      {m.scope}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
