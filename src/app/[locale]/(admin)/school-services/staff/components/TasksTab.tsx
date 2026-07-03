'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import {
  STAFF_TASKS, type StaffTask, type Department,
  DEPARTMENT_COLORS, ALL_DEPARTMENTS, STAFF_PROFILES,
} from '@/src/mockData/staff';
import { Search, Plus, X, Zap, CheckCircle2, RotateCcw, Clock } from 'lucide-react';

const PRIORITY_COLORS: Record<string, string> = {
  'Thấp': 'bg-slate-100 text-slate-600',
  'Trung bình': 'bg-blue-100 text-blue-700',
  'Cao': 'bg-amber-100 text-amber-700',
  'Khẩn cấp': 'bg-red-100 text-red-700',
};

const TASK_STATUS_COLORS: Record<string, string> = {
  'Chưa nhận': 'bg-slate-100 text-slate-600',
  'Đang làm': 'bg-amber-100 text-amber-700',
  'Hoàn thành': 'bg-emerald-100 text-emerald-700',
  'Quá hạn': 'bg-red-100 text-red-700',
};

export default function TasksTab() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<StaffTask[]>(STAFF_TASKS);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    staffId: '',
    department: 'Bảo vệ' as Department,
    area: '',
    dueDate: '',
    priority: 'Trung bình' as StaffTask['priority'],
    module: '',
  });

  const filtered = tasks.filter(t => {
    const ms = t.title.toLowerCase().includes(search.toLowerCase()) ||
               t.assignedTo.toLowerCase().includes(search.toLowerCase());
    return ms &&
      (filterDept === 'all' || t.department === filterDept) &&
      (filterStatus === 'all' || t.status === filterStatus);
  });

  function handleStatusChange(id: string, status: StaffTask['status']) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    toast({ title: 'Cập nhật nhiệm vụ', description: `→ ${status}` });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const profile = STAFF_PROFILES.find(p => p.id === form.staffId);
    if (!profile || !form.title.trim()) {
      toast({ title: 'Thiếu thông tin', variant: 'destructive' });
      return;
    }
    const newTask: StaffTask = {
      id: `st${Date.now()}`,
      title: form.title,
      description: form.description,
      assignedTo: profile.name,
      staffId: form.staffId,
      department: form.department,
      area: form.area,
      dueDate: form.dueDate,
      priority: form.priority,
      status: 'Chưa nhận',
      module: form.module || undefined,
    };
    setTasks(prev => [newTask, ...prev]);
    setShowForm(false);
    setForm({ title: '', description: '', staffId: '', department: 'Bảo vệ', area: '', dueDate: '', priority: 'Trung bình', module: '' });
    toast({ title: '✅ Giao nhiệm vụ thành công', description: `${profile.name} ← ${form.title}` });
  }

  return (
    <div className="space-y-4 mt-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm nhiệm vụ..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="all">Tất cả bộ phận</option>
          {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          {['Chưa nhận', 'Đang làm', 'Hoàn thành', 'Quá hạn'].map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Button onClick={() => setShowForm(v => !v)} className="shrink-0">
          <Plus className="h-4 w-4 mr-1" />Giao nhiệm vụ
        </Button>
      </div>

      <div className="text-xs text-slate-500">{filtered.length} nhiệm vụ · {filtered.filter(t => t.status === 'Quá hạn').length} quá hạn</div>

      {/* Form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
          <CardContent className="pt-4">
            <div className="flex justify-between mb-3">
              <h4 className="font-medium text-sm">Giao nhiệm vụ mới</h4>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <Label>Tên nhiệm vụ *</Label>
                <Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="VD: Vệ sinh hành lang tầng 2..." />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label>Mô tả</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Chi tiết thực hiện..." />
              </div>
              <div className="space-y-1">
                <Label>Nhân sự phụ trách *</Label>
                <Select required value={form.staffId} onChange={e => {
                  const p = STAFF_PROFILES.find(p => p.id === e.target.value);
                  setForm(f => ({ ...f, staffId: e.target.value, department: p?.department ?? f.department }));
                }}>
                  <option value="">Chọn nhân sự...</option>
                  {STAFF_PROFILES.filter(p => p.status === 'Đang làm').map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.department}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Khu vực</Label>
                <Input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="Khu A, Hành lang..." />
              </div>
              <div className="space-y-1">
                <Label>Hạn hoàn thành</Label>
                <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Mức độ ưu tiên</Label>
                <Select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as StaffTask['priority'] }))}>
                  {['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'].map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Liên kết module</Label>
                <Select value={form.module} onChange={e => setForm(f => ({ ...f, module: e.target.value }))}>
                  <option value="">Không liên kết</option>
                  {['Vệ sinh', 'An ninh', 'Lịch vận hành', 'Cơ sở vật chất', 'Nhà ăn', 'Xe đưa đón'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                <Button type="submit">Giao nhiệm vụ</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-14 text-slate-400">Không tìm thấy nhiệm vụ nào</div>
        )}
        {filtered.map(task => (
          <Card key={task.id} className={`${task.status === 'Quá hạn' ? 'border-red-300 dark:border-red-800' : task.priority === 'Khẩn cấp' ? 'border-orange-300 dark:border-orange-800' : ''}`}>
            <CardContent className="py-3 px-4">
              <div className="flex items-start gap-3">
                {task.priority === 'Khẩn cấp' && <Zap className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{task.title}</span>
                    <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</Badge>
                    <Badge className={`text-xs ${TASK_STATUS_COLORS[task.status]}`}>{task.status}</Badge>
                    {task.module && <Badge className="text-xs bg-indigo-100 text-indigo-700">{task.module}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                    <span>👤 {task.assignedTo}</span>
                    <span><Badge className={`text-xs ${DEPARTMENT_COLORS[task.department]}`}>{task.department}</Badge></span>
                    <span>📍 {task.area}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Hạn: {task.dueDate}</span>
                  </div>
                  {task.description && <p className="text-xs text-slate-400 mt-1 truncate">{task.description}</p>}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {task.status === 'Chưa nhận' && (
                    <Button size="sm" onClick={() => handleStatusChange(task.id, 'Đang làm')} className="text-xs h-7">Bắt đầu</Button>
                  )}
                  {task.status === 'Đang làm' && (
                    <Button size="sm" onClick={() => handleStatusChange(task.id, 'Hoàn thành')} className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />Xong
                    </Button>
                  )}
                  {task.status === 'Quá hạn' && (
                    <Button size="sm" onClick={() => handleStatusChange(task.id, 'Đang làm')} className="text-xs h-7 bg-orange-600 hover:bg-orange-700">
                      <RotateCcw className="h-3 w-3 mr-1" />Xử lý
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
