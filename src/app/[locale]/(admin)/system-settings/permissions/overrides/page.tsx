"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Users2, Search, Filter, ShieldAlert, XCircle, CheckCircle2, UserCog, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { getUserOverridesList, saveUserOverride } from './actions';
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from '../../../users/users.constants';

export default function UserOverridesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [matrix, setMatrix] = useState<any>({});

  const loadData = () => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const data = await getUserOverridesList(search);
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const togglePermission = (moduleKey: string, actionKey: string) => {
    setMatrix((prev: any) => {
      const newMat = { ...prev };
      if (!newMat[moduleKey]) newMat[moduleKey] = {};
      newMat[moduleKey][actionKey] = !newMat[moduleKey][actionKey];
      return newMat;
    });
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      await saveUserOverride(selectedUser.id, matrix);
      alert("Đã lưu ngoại lệ thành công!");
      setSelectedUser(null);
      loadData();
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ghi đè phân quyền cá nhân</h2>
          <p className="text-sm text-slate-500">Cấp thêm quyền riêng biệt hoặc chặn quyền của một cá nhân cụ thể.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm người dùng..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Button variant="outline" className="gap-2" onClick={() => loadData()}>
          <Filter className="w-4 h-4" />
          Tải lại
        </Button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-800 dark:text-amber-300">Lưu ý khi cấu hình ghi đè</h4>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
            Quyền cấp ở mức cá nhân có độ ưu tiên cao nhất. (TODO: Cần backend checkAccess() ưu tiên quyền ngoại lệ).
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300">Người dùng</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300">Vai trò / Phòng ban chính</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300 text-center">Số ngoại lệ</th>
              <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-300 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? <tr><td colSpan={4} className="p-4 text-center">Đang tải...</td></tr> : users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/25 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 flex items-center justify-center shrink-0">
                      <Users2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {user.name}
                        {user.hasDeny && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 px-1.5 py-0.5 rounded uppercase">
                            <XCircle className="w-3 h-3" /> Bị chặn quyền
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.role}</td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                    {user.overrides}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-500/30 dark:hover:bg-indigo-500/10"
                      onClick={() => {
                        setSelectedUser(user);
                        setMatrix(user.rawOverrides || {});
                      }}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sửa ngoại lệ
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && users.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center">Không tìm thấy dữ liệu.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Ngoại lệ: {selectedUser.name}</h2>
              <button onClick={() => setSelectedUser(null)} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[78vh] overflow-y-auto p-5 space-y-4">
              <div className="flex gap-2 justify-end mb-4">
                <button onClick={() => setMatrix({})} className="rounded-xl border px-3 py-2 text-sm font-bold">Xóa toàn bộ</button>
                <button onClick={handleSave} className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-black text-white">Lưu cấu hình</button>
              </div>
              <div className="max-h-[65vh] overflow-auto rounded-2xl border">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950">
                    <tr>
                      <th className="p-3 text-left">Module</th>
                      {PERMISSION_ACTIONS.map((a) => <th key={a.key} className="p-3 text-center">{a.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSION_MODULES.map((m) => (
                      <tr key={m.key} className="border-t dark:border-slate-800">
                        <td className="p-3 font-bold">{m.label}</td>
                        {PERMISSION_ACTIONS.map((a) => (
                          <td key={a.key} className="p-3 text-center">
                            <input type="checkbox" checked={!!matrix?.[m.key]?.[a.key]} onChange={() => togglePermission(m.key, a.key)} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
