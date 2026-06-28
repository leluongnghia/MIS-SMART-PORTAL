"use client";

import React, { useState, useTransition } from 'react';
import { saveDepartmentModulesAdmin } from '@/src/libs/server/actions/module-permission-actions';
import { Building2, Check, CheckSquare, Square, Save, Loader2, Layers } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

interface DeptRow {
  id: string;
  name: string;
  code: string;
  type: string;
}

interface ModRow {
  id: string;
  name: string;
  slug: string;
  status: boolean;
}

export default function DepartmentsClient({
  initialDepartments,
  modules,
  initialDeptModulesMap,
}: {
  initialDepartments: DeptRow[];
  modules: ModRow[];
  initialDeptModulesMap: Record<string, string[]>;
}) {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(initialDepartments[0]?.id || '');
  const [deptModulesMap, setDeptModulesMap] = useState<Record<string, string[]>>(initialDeptModulesMap);
  const [isPending, startTransition] = useTransition();

  const selectedDept = initialDepartments.find(d => d.id === selectedDeptId);
  const currentAssignedModIds = deptModulesMap[selectedDeptId] || [];

  const handleToggleModule = (modId: string) => {
    setDeptModulesMap(prev => {
      const current = prev[selectedDeptId] || [];
      const next = current.includes(modId) ? current.filter(id => id !== modId) : [...current, modId];
      return { ...prev, [selectedDeptId]: next };
    });
  };

  const handleSelectAll = () => {
    const activeModIds = modules.filter(m => m.status).map(m => m.id);
    setDeptModulesMap(prev => ({ ...prev, [selectedDeptId]: activeModIds }));
  };

  const handleDeselectAll = () => {
    setDeptModulesMap(prev => ({ ...prev, [selectedDeptId]: [] }));
  };

  const handleSave = () => {
    if (!selectedDeptId) return;
    startTransition(async () => {
      try {
        await saveDepartmentModulesAdmin(selectedDeptId, currentAssignedModIds);
        alert('Đã lưu phân quyền module cho phòng ban!');
      } catch (err) {
        alert('Lỗi khi lưu phân quyền');
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Cột trái: Danh sách phòng ban */}
      <div className="space-y-3 lg:col-span-4">
        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">Danh sách Phòng ban ({initialDepartments.length})</h3>
        </div>
        <div className="max-h-[600px] space-y-1.5 overflow-y-auto pr-1">
          {initialDepartments.map(dept => {
            const modCount = (deptModulesMap[dept.id] || []).length;
            const isSelected = dept.id === selectedDeptId;

            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDeptId(dept.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all",
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg font-bold",
                    isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  )}>
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className={cn("font-bold", isSelected ? "text-indigo-950 dark:text-indigo-200" : "text-slate-900 dark:text-white")}>
                      {dept.name}
                    </div>
                    <div className="font-mono text-xs text-slate-500">{dept.code}</div>
                  </div>
                </div>
                <span className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-bold",
                  modCount > 0 ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                )}>
                  {modCount} mod
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cột phải: Chọn Module cho phòng ban */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/40 lg:col-span-8">
        {selectedDept ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Cấu hình Module cho: <span className="text-indigo-600 dark:text-indigo-400">{selectedDept.name}</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Mọi thành viên thuộc phòng ban này sẽ tự động được cấp quyền truy cập vào các module được chọn bên dưới.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>Chọn tất cả</Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAll}>Bỏ chọn</Button>
                <Button onClick={handleSave} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Lưu thay đổi
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {modules.map(mod => {
                const isChecked = currentAssignedModIds.includes(mod.id);
                if (!mod.status) return null; // Không hiển thị module bị tắt toàn trường

                return (
                  <div
                    key={mod.id}
                    onClick={() => handleToggleModule(mod.id)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all select-none",
                      isChecked
                        ? "border-indigo-600 bg-white shadow-sm dark:border-indigo-500 dark:bg-slate-900"
                        : "border-slate-200 bg-white/60 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-6 w-6 items-center justify-center rounded transition-colors",
                        isChecked ? "bg-indigo-600 text-white" : "border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                      )}>
                        {isChecked && <Check className="h-4 w-4 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{mod.name}</div>
                        <div className="font-mono text-xs text-slate-500">{mod.slug}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-500">Vui lòng chọn phòng ban bên trái</div>
        )}
      </div>
    </div>
  );
}
