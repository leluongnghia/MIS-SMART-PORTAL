'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import {
  type OperationTask, type TaskType, type Priority, type TaskStatus,
  ALL_TASK_TYPES, ALL_PRIORITIES,
} from '@/src/mockData/schedule';
import { X, AlertTriangle } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSave: (task: OperationTask) => void;
  initialTask?: Partial<OperationTask>;
}

const emptyForm = {
  title: '',
  type: 'Vệ sinh' as TaskType,
  description: '',
  area: '',
  assignedTo: '',
  coordinator: '',
  assignedBy: '',
  startDate: '2026-07-03',
  dueDate: '2026-07-03',
  startTime: '',
  endTime: '',
  priority: 'Trung bình' as Priority,
  status: 'Chưa nhận' as TaskStatus,
  notes: '',
};

export default function TaskFormModal({ onClose, onSave, initialTask }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState({ ...emptyForm, ...initialTask });
  const [saving, setSaving] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.assignedTo.trim() || !form.area.trim()) {
      toast({ title: 'Thiếu thông tin', description: 'Vui lòng điền Tên, Khu vực và Người phụ trách', variant: 'destructive' });
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const task: OperationTask = {
        ...form,
        id: `ot${Date.now()}`,
        progress: 0,
        isRecurring: false,
        updates: [],
      };
      onSave(task);
      setSaving(false);
      if (form.priority === 'Khẩn cấp') {
        toast({
          title: '🚨 Công việc khẩn cấp đã tạo!',
          description: 'Đã gửi thông báo cho người phụ trách.',
          variant: 'destructive',
        });
      }
    }, 300);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sticky top-0 bg-white dark:bg-slate-950 z-10 border-b">
          <CardTitle className="text-base">
            {initialTask ? 'Chỉnh sửa công việc' : 'Tạo công việc mới'}
          </CardTitle>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Urgent warning */}
            {form.priority === 'Khẩn cấp' && (
              <div className="sm:col-span-2 flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Công việc khẩn cấp sẽ được gửi thông báo ngay cho người phụ trách!
              </div>
            )}

            <div className="sm:col-span-2 space-y-1">
              <Label>Tên công việc *</Label>
              <Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="VD: Bảo trì máy lạnh phòng 201..." />
            </div>

            <div className="space-y-1">
              <Label>Loại công việc</Label>
              <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as TaskType }))}>
                {ALL_TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Mức độ ưu tiên</Label>
              <Select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                {ALL_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label>Mô tả</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Mô tả chi tiết công việc..." />
            </div>

            <div className="space-y-1">
              <Label>Khu vực *</Label>
              <Input required value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="Tầng 2 khu B, Sân trường..." />
            </div>

            <div className="space-y-1">
              <Label>Người phụ trách *</Label>
              <Input required value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} placeholder="Tên nhân sự..." />
            </div>

            <div className="space-y-1">
              <Label>Người phối hợp</Label>
              <Input value={form.coordinator ?? ''} onChange={e => setForm(f => ({ ...f, coordinator: e.target.value }))} placeholder="Tên nhân sự khác..." />
            </div>

            <div className="space-y-1">
              <Label>Người giao việc</Label>
              <Input value={form.assignedBy} onChange={e => setForm(f => ({ ...f, assignedBy: e.target.value }))} placeholder="Trưởng phòng vận hành..." />
            </div>

            <div className="space-y-1">
              <Label>Ngày bắt đầu</Label>
              <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <Label>Hạn hoàn thành</Label>
              <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <Label>Giờ bắt đầu</Label>
              <Input type="time" value={form.startTime ?? ''} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <Label>Giờ kết thúc</Label>
              <Input type="time" value={form.endTime ?? ''} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <Label>Trạng thái</Label>
              <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}>
                <option value="Chưa nhận">Chưa nhận</option>
                <option value="Đã nhận">Đã nhận</option>
                <option value="Đang làm">Đang làm</option>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Ghi chú</Label>
              <Input value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Thêm ghi chú..." />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t">
              <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
              <Button
                type="submit"
                disabled={saving}
                className={form.priority === 'Khẩn cấp' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {saving ? 'Đang lưu...' : 'Tạo công việc'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
