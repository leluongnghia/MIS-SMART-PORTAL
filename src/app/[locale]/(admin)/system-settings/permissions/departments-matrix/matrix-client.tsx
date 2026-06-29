'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getDepartmentMatrix, saveDepartmentMatrix, createDepartmentAdmin } from '../actions';
import { Button } from '@/src/components/ui/button';
import { Building2, Save, Loader2, Shield, Plus, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

import { serverStorage } from '@/src/libs/client/server-storage';
import { MOCK_USERS } from '@/src/mockData';

export default function DepartmentMatrixClient({ departments, initialCounts = {}, isAdmin = false }: { departments: any[], initialCounts?: Record<string, number>, isAdmin?: boolean }) {
  const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || '');
  const [clientIsAdmin, setClientIsAdmin] = useState(isAdmin);
  const [matrix, setMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [grantedIds, setGrantedIds] = useState<Set<string>>(new Set());
  const [countsMap, setCountsMap] = useState<Record<string, number>>(initialCounts);
  
  const [depts, setDepts] = useState<any[]>(departments);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [isAdding, startAdding] = useTransition();

  useEffect(() => {
    const savedUserId = serverStorage.getItem('mis_edutask_logged_in_user_id');
    if (savedUserId) {
      const u = MOCK_USERS.find(u => u.id === savedUserId);
      if (u?.role === 'ADMIN' || savedUserId === 'user_chutich' || savedUserId === 'user_ceo') {
        setClientIsAdmin(true);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedDeptId) {
      setLoading(true);
      getDepartmentMatrix(selectedDeptId).then(data => {
        setMatrix(data);
        const ids = new Set<string>();
        data.forEach((mod: any) => {
          mod.features.forEach((feat: any) => {
            feat.permissions.forEach((p: any) => {
              if (p.granted) ids.add(p.id);
            });
          });
        });
        setGrantedIds(ids);
        setLoading(false);
      });
    }
  }, [selectedDeptId]);

  const togglePermission = (id: string) => {
    setGrantedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveDepartmentMatrix(selectedDeptId, Array.from(grantedIds), 'department');
        setCountsMap(prev => ({ ...prev, [selectedDeptId]: grantedIds.size }));
        alert('Đã lưu ma trận quyền thành công!');
      } catch (err) {
        alert('Lỗi lưu ma trận quyền.');
      }
    });
  };

  const handleSelectAll = () => {
    const ids = new Set<string>();
    matrix.forEach((mod: any) => {
      mod.features.forEach((feat: any) => {
        feat.permissions.forEach((p: any) => {
          ids.add(p.id);
        });
      });
    });
    setGrantedIds(ids);
  };

  const handleDeselectAll = () => {
    setGrantedIds(new Set());
  };

  const handleAddDept = () => {
    startAdding(async () => {
      try {
        const result = await createDepartmentAdmin({ name: newName, code: newCode, type: 'DEPARTMENT', description: '' });
        setDepts(prev => [...prev, { id: result.id, name: newName, code: newCode }]);
        setSelectedDeptId(result.id);
        setShowAddModal(false);
        setNewName(''); setNewCode('');
      } catch (err: any) {
        alert('Lỗi: ' + (err.message || 'Không thể tạo phòng ban'));
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Cột trái: Danh sách phòng ban */}
      <div className="space-y-3 lg:col-span-3 border-r pr-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Phòng ban ({depts.length})</h3>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs h-8">
            <Plus className="h-3.5 w-3.5" />
            Thêm mới
          </Button>
        </div>
        <div className="max-h-[680px] space-y-1.5 overflow-y-auto pr-1">
          {depts.map(dept => {
            const isSelected = selectedDeptId === dept.id;
            const permCount = isSelected ? grantedIds.size : (countsMap[dept.id] || 0);
            return (
              <div
                key={dept.id}
                onClick={() => setSelectedDeptId(dept.id)}
                className={cn(
                  "group flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  )}>
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className={cn("font-bold truncate text-sm", isSelected ? "text-indigo-900 dark:text-indigo-200" : "text-slate-900 dark:text-white")}>
                      {dept.name}
                    </div>
                    <div className="font-mono text-xs text-slate-400">{dept.code}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-bold",
                    permCount > 0 ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                  )}>
                    {permCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cột phải: Ma trận */}
      <div className="lg:col-span-9 space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Ma trận phân quyền chi tiết
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll} className="h-9">Tất cả</Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll} className="h-9">Bỏ chọn</Button>
            <Button onClick={handleSave} disabled={isPending || loading} className="bg-indigo-600 h-9">
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Lưu Matrix
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">Đang tải ma trận quyền...</div>
        ) : (
          <div className="space-y-6">
            {matrix.map(mod => (
              <div key={mod.id} className="border rounded-lg overflow-hidden">
                <div className="bg-slate-100 p-3 font-bold border-b flex justify-between">
                  <span>{mod.name}</span>
                </div>
                <div className="p-0">
                  <table className="w-full text-sm">
                    <tbody>
                      {mod.features.map((feat: any) => (
                        <tr key={feat.id} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="p-3 w-1/3 font-medium border-r">{feat.name}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-4">
                              {feat.permissions.map((p: any) => {
                                if (!clientIsAdmin && (p.code.includes('.UPDATE') || p.code.includes('.DELETE') || p.name === 'Sửa' || p.name === 'Xóa')) return null;
                                return (
                                  <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                    checked={grantedIds.has(p.id)}
                                    onChange={() => togglePermission(p.id)}
                                  />
                                  <span className={grantedIds.has(p.id) ? "font-semibold text-indigo-700" : "text-slate-600"}>
                                    {p.name}
                                  </span>
                                  </label>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Thêm Phòng ban mới</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Tên phòng ban <span className="text-red-500">*</span></label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="VD: Kế toán" className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Mã phòng ban <span className="text-red-500">*</span></label>
                <input type="text" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))} placeholder="VD: KE_TOAN" className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Hủy</Button>
              <Button onClick={handleAddDept} disabled={isAdding || !newName || !newCode} className="flex-1 bg-indigo-600 text-white">
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tạo'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
