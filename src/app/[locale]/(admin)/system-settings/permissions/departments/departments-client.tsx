"use client";

import React, { useState, useTransition, useMemo } from 'react';
import { saveDepartmentModulesAdmin, createDepartmentAdmin, deleteDepartmentAdmin } from '@/src/libs/server/actions/module-permission-actions';
import { Building2, Check, Save, Loader2, Plus, Trash2, X, ChevronRight, ChevronDown, Layers } from 'lucide-react';
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
  parentId?: string | null;
  sort: number;
}

interface ModuleTreeNode extends ModRow {
  children: ModuleTreeNode[];
}

function buildModuleTree(modules: ModRow[]): ModuleTreeNode[] {
  const parentModules = modules.filter(m => !m.parentId).sort((a, b) => a.sort - b.sort);
  return parentModules.map(parent => ({
    ...parent,
    children: modules
      .filter(m => m.parentId === parent.id)
      .sort((a, b) => a.sort - b.sort)
      .map(child => ({ ...child, children: [] })),
  }));
}

function ModuleTreeItem({
  node,
  assignedIds,
  onToggle,
  depth = 0,
}: {
  node: ModuleTreeNode;
  assignedIds: string[];
  onToggle: (id: string, isParent: boolean, childIds: string[]) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const childIds = node.children.map(c => c.id);
  const isParentChecked = assignedIds.includes(node.id);
  
  // Parent: checked = ít nhất 1 con được chọn hoặc bản thân được chọn
  const checkedChildCount = childIds.filter(id => assignedIds.includes(id)).length;
  const isIndeterminate = hasChildren && checkedChildCount > 0 && checkedChildCount < childIds.length;
  const isAllChildrenChecked = hasChildren && checkedChildCount === childIds.length;

  if (!node.status) return null;

  return (
    <div className={cn(depth > 0 && "ml-5 border-l border-slate-200 pl-3 dark:border-slate-700")}>
      {/* Module item */}
      <div
        className={cn(
          "group flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 transition-all select-none mb-1.5",
          (isParentChecked || isAllChildrenChecked)
            ? "border-indigo-500 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950/40"
            : isIndeterminate
            ? "border-indigo-300 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20"
            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60",
          depth > 0 && "py-2"
        )}
        onClick={() => onToggle(node.id, hasChildren, childIds)}
      >
        {/* Checkbox */}
        <div className={cn(
          "relative flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors",
          (isParentChecked || isAllChildrenChecked)
            ? "bg-indigo-600 text-white"
            : isIndeterminate
            ? "bg-indigo-200 dark:bg-indigo-800"
            : "border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
        )}>
          {(isParentChecked || isAllChildrenChecked) && <Check className="h-3.5 w-3.5 stroke-[3]" />}
          {isIndeterminate && <div className="h-2 w-2 rounded-sm bg-indigo-600 dark:bg-indigo-400" />}
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-semibold truncate leading-tight",
            depth === 0 ? "text-sm text-slate-900 dark:text-white" : "text-xs text-slate-700 dark:text-slate-300"
          )}>
            {node.name}
          </div>
          <div className="font-mono text-[10px] text-slate-400">{node.slug}</div>
        </div>

        {/* Expand/collapse nếu có con */}
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            {expanded
              ? <ChevronDown className="h-4 w-4" />
              : <ChevronRight className="h-4 w-4" />}
          </button>
        )}

        {/* Badge số con */}
        {hasChildren && (
          <span className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
            checkedChildCount > 0
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800"
          )}>
            {checkedChildCount}/{childIds.length}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="mb-2">
          {node.children.map(child => (
            <ModuleTreeItem
              key={child.id}
              node={child}
              assignedIds={assignedIds}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
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
  const [departments, setDepartments] = useState<DeptRow[]>(initialDepartments);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(initialDepartments[0]?.id || '');
  const [deptModulesMap, setDeptModulesMap] = useState<Record<string, string[]>>(initialDeptModulesMap);
  const [isPending, startTransition] = useTransition();

  // Modal thêm phòng ban
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState('DEPARTMENT');
  const [newDesc, setNewDesc] = useState('');
  const [isAdding, startAdding] = useTransition();

  const selectedDept = departments.find(d => d.id === selectedDeptId);
  const currentAssignedModIds = deptModulesMap[selectedDeptId] || [];

  // Build module tree
  const moduleTree = useMemo(() => buildModuleTree(modules), [modules]);

  const handleToggle = (modId: string, isParent: boolean, childIds: string[]) => {
    setDeptModulesMap(prev => {
      const current = new Set(prev[selectedDeptId] || []);

      if (isParent && childIds.length > 0) {
        // Nếu click vào parent: toggle tất cả children + chính nó
        const allChildrenSelected = childIds.every(id => current.has(id));
        if (allChildrenSelected) {
          // Bỏ tất cả children và parent
          childIds.forEach(id => current.delete(id));
          current.delete(modId);
        } else {
          // Chọn tất cả children và parent
          childIds.forEach(id => current.add(id));
          current.add(modId);
        }
      } else {
        // Toggle module đơn lẻ
        if (current.has(modId)) {
          current.delete(modId);
        } else {
          current.add(modId);
          // Nếu là child, tự động thêm parent
          const parent = modules.find(m => m.id === modules.find(mm => mm.id === modId)?.parentId);
          if (parent) current.add(parent.id);
        }
      }

      return { ...prev, [selectedDeptId]: Array.from(current) };
    });
  };

  const handleSelectAll = () => {
    const allActiveIds = modules.filter(m => m.status).map(m => m.id);
    setDeptModulesMap(prev => ({ ...prev, [selectedDeptId]: allActiveIds }));
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

  const handleAddDept = () => {
    if (!newName.trim() || !newCode.trim()) {
      alert('Vui lòng nhập đầy đủ Tên và Mã phòng ban.');
      return;
    }
    startAdding(async () => {
      try {
        const result = await createDepartmentAdmin({ name: newName, code: newCode, type: newType, description: newDesc });
        const newDept: DeptRow = { id: result.id, name: newName, code: newCode.toUpperCase(), type: newType };
        setDepartments(prev => [...prev, newDept]);
        setSelectedDeptId(result.id);
        setShowAddModal(false);
        setNewName(''); setNewCode(''); setNewType('DEPARTMENT'); setNewDesc('');
      } catch (err: any) {
        alert('Lỗi: ' + (err.message || 'Không thể tạo phòng ban'));
      }
    });
  };

  const selectedCount = currentAssignedModIds.length;
  const totalActive = modules.filter(m => m.status).length;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Cột trái: Danh sách phòng ban */}
      <div className="space-y-3 lg:col-span-4">
        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">Phòng ban ({departments.length})</h3>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm mới
          </Button>
        </div>
        <div className="max-h-[680px] space-y-1.5 overflow-y-auto pr-1">
          {departments.map(dept => {
            const modCount = (deptModulesMap[dept.id] || []).length;
            const isSelected = dept.id === selectedDeptId;
            return (
              <div
                key={dept.id}
                className={cn(
                  "group flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                )}
                onClick={() => setSelectedDeptId(dept.id)}
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
                    modCount > 0 ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                  )}>
                    {modCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cột phải: Module Tree */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40 lg:col-span-8">
        {selectedDept ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Module cho: <span className="text-indigo-600 dark:text-indigo-400">{selectedDept.name}</span>
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  Đã chọn <strong className="text-indigo-600">{selectedCount}</strong> / {totalActive} modules
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={handleSelectAll} className="text-xs h-8">Tất cả</Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAll} className="text-xs h-8">Bỏ chọn</Button>
                <Button onClick={handleSave} disabled={isPending} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 h-8 text-xs">
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Lưu
                </Button>
              </div>
            </div>

            {/* Module Tree */}
            <div className="max-h-[580px] overflow-y-auto pr-1 space-y-0.5">
              {moduleTree.map(node => (
                <ModuleTreeItem
                  key={node.id}
                  node={node}
                  assignedIds={currentAssignedModIds}
                  onToggle={handleToggle}
                  depth={0}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-500">Vui lòng chọn phòng ban bên trái</div>
        )}
      </div>

      {/* Modal Thêm phòng ban */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Thêm Phòng ban mới</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Tên phòng ban <span className="text-red-500">*</span></label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="VD: Phòng Kế toán & Tài chính" className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Mã phòng ban <span className="text-red-500">*</span> <span className="ml-1 font-normal text-slate-400">(chữ in hoa, không dấu)</span></label>
                <input type="text" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))} placeholder="VD: KE_TOAN" className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Loại phòng ban</label>
                <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                  <option value="DEPARTMENT">Phòng ban</option>
                  <option value="SUBJECT_GROUP">Tổ chuyên môn</option>
                  <option value="BOARD">Ban / Hội đồng</option>
                  <option value="SERVICE">Bộ phận dịch vụ</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Mô tả (tuỳ chọn)</label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} placeholder="Mô tả chức năng của phòng ban..." className="w-full resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Hủy</Button>
              <Button onClick={handleAddDept} disabled={isAdding || !newName.trim() || !newCode.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Tạo phòng ban
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
