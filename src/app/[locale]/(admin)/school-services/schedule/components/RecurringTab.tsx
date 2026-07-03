'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import {
  RECURRING_TASKS, type RecurringTask, type TaskType, type Priority,
  type RecurringFrequency, TASK_TYPE_COLORS, PRIORITY_COLORS,
  ALL_TASK_TYPES, ALL_PRIORITIES, FREQUENCY_LABELS, DAY_NAMES,
} from '@/src/mockData/schedule';
import { RotateCcw, Plus, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';

const FREQUENCIES: RecurringFrequency[] = ['Hằng ngày', 'Hằng tuần', 'Hằng tháng', 'Theo thứ', 'Theo khoảng'];

const emptyRecurring: Omit<RecurringTask, 'id' | 'completedCount' | 'missedCount'> = {
  title: '',
  type: 'Vệ sinh',
  description: '',
  area: '',
  assignedTo: '',
  priority: 'Trung bình',
  frequency: 'Hằng ngày',
  startTime: '',
  endTime: '',
  activeFrom: '2026-07-03',
  activeTo: '',
  isActive: true,
};

export default function RecurringTab() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<RecurringTask[]>(RECURRING_TASKS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<RecurringTask, 'id' | 'completedCount' | 'missedCount'>>({ ...emptyRecurring });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  function toggleDay(d: number) {
    setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.assignedTo.trim()) {
      toast({ title: 'Thiếu thông tin', description: 'Vui lòng nhập tên và người phụ trách', variant: 'destructive' });
      return;
    }
    const newTask: RecurringTask = {
      ...form,
      id: `rt${Date.now()}`,
      daysOfWeek: ['Hằng tuần', 'Theo thứ'].includes(form.frequency) ? selectedDays : undefined,
      completedCount: 0,
      missedCount: 0,
      nextDue: form.activeFrom,
    };
    setTasks(prev => [newTask, ...prev]);
    setForm({ ...emptyRecurring });
    setSelectedDays([]);
    setShowForm(false);
    toast({ title: '✅ Tạo công việc định kỳ', description: `${newTask.title} — ${FREQUENCY_LABELS[newTask.frequency]}` });
  }

  function toggleActive(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
  }

  const completionRate = (t: RecurringTask) => {
    const total = t.completedCount + t.missedCount;
    return total === 0 ? 100 : Math.round((t.completedCount / total) * 100);
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Công việc định kỳ</h3>
          <p className="text-sm text-slate-500">{tasks.filter(t => t.isActive).length} đang hoạt động · {tasks.filter(t => !t.isActive).length} tạm dừng</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)}>
          <Plus className="h-4 w-4 mr-1" />Tạo định kỳ
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-blue-600" />
                Tạo công việc định kỳ mới
              </CardTitle>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <Label>Tên công việc *</Label>
                <Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="VD: Kiểm tra nhà vệ sinh..." />
              </div>

              <div className="space-y-1">
                <Label>Loại</Label>
                <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as TaskType }))}>
                  {ALL_TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Ưu tiên</Label>
                <Select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                  {ALL_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Tần suất *</Label>
                <Select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value as RecurringFrequency }))}>
                  {FREQUENCIES.map(f => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
                </Select>
              </div>

              {/* Conditional fields */}
              {['Hằng tuần', 'Theo thứ'].includes(form.frequency) && (
                <div className="space-y-1">
                  <Label>Thứ trong tuần</Label>
                  <div className="flex gap-1 flex-wrap">
                    {DAY_NAMES.map((d, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDay(i)}
                        className={`h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                          selectedDays.includes(i)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {form.frequency === 'Hằng tháng' && (
                <div className="space-y-1">
                  <Label>Ngày trong tháng</Label>
                  <Input type="number" min="1" max="31"
                    value={form.dayOfMonth ?? ''}
                    onChange={e => setForm(f => ({ ...f, dayOfMonth: Number(e.target.value) }))}
                    placeholder="1-31"
                  />
                </div>
              )}

              {form.frequency === 'Theo khoảng' && (
                <div className="space-y-1">
                  <Label>Cách mỗi N ngày</Label>
                  <Input type="number" min="1"
                    value={form.intervalDays ?? ''}
                    onChange={e => setForm(f => ({ ...f, intervalDays: Number(e.target.value) }))}
                    placeholder="VD: 30 (mỗi 30 ngày)"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label>Khu vực</Label>
                <Input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="Nhà vệ sinh, Kho vật tư..." />
              </div>

              <div className="space-y-1">
                <Label>Người phụ trách *</Label>
                <Input required value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} placeholder="Tổ vệ sinh A..." />
              </div>

              <div className="space-y-1">
                <Label>Giờ bắt đầu</Label>
                <Input type="time" value={form.startTime ?? ''} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
              </div>

              <div className="space-y-1">
                <Label>Ngày bắt đầu</Label>
                <Input type="date" value={form.activeFrom} onChange={e => setForm(f => ({ ...f, activeFrom: e.target.value }))} />
              </div>

              <div className="space-y-1">
                <Label>Ngày kết thúc (tuỳ chọn)</Label>
                <Input type="date" value={form.activeTo ?? ''} onChange={e => setForm(f => ({ ...f, activeTo: e.target.value }))} />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <Label>Mô tả</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Mô tả công việc..." />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                <Button type="submit">Tạo định kỳ</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Recurring task list */}
      <div className="space-y-3">
        {tasks.map(task => {
          const rate = completionRate(task);
          return (
            <Card key={task.id} className={!task.isActive ? 'opacity-60' : ''}>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(expanded === task.id ? null : task.id)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <RotateCcw className={`h-3.5 w-3.5 shrink-0 ${task.isActive ? 'text-blue-500' : 'text-slate-400'}`} />
                      <span className="font-semibold text-sm">{task.title}</span>
                      <Badge className={`text-xs ${TASK_TYPE_COLORS[task.type]}`}>{task.type}</Badge>
                      <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</Badge>
                      <Badge className={`text-xs ${task.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {task.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      <span className="font-medium text-blue-600">{FREQUENCY_LABELS[task.frequency]}</span>
                      {task.daysOfWeek && task.daysOfWeek.length > 0 && (
                        <span>({task.daysOfWeek.map(d => DAY_NAMES[d]).join(', ')})</span>
                      )}
                      {task.dayOfMonth && <span>(ngày {task.dayOfMonth} hàng tháng)</span>}
                      {task.intervalDays && <span>(cách {task.intervalDays} ngày)</span>}
                      <span>· {task.assignedTo}</span>
                      {task.startTime && <span>· {task.startTime}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>Hạn tiếp: <strong className="text-slate-700 dark:text-slate-300">{task.nextDue}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right text-xs">
                      <div className={`font-bold ${rate >= 90 ? 'text-emerald-600' : rate >= 70 ? 'text-amber-600' : 'text-red-600'}`}>{rate}%</div>
                      <div className="text-slate-400">{task.completedCount} hoàn thành</div>
                    </div>
                    {expanded === task.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${rate >= 90 ? 'bg-emerald-500' : rate >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </CardHeader>

              {expanded === task.id && (
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {task.description && (
                      <div className="text-slate-600 dark:text-slate-400">{task.description}</div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 text-center">
                        <div className="text-2xl font-bold text-emerald-600">{task.completedCount}</div>
                        <div className="text-slate-500 mt-0.5">Đã hoàn thành</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 text-center">
                        <div className="text-2xl font-bold text-red-600">{task.missedCount}</div>
                        <div className="text-slate-500 mt-0.5">Bỏ sót</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 text-center">
                        <div className="text-2xl font-bold text-blue-600">{rate}%</div>
                        <div className="text-slate-500 mt-0.5">Tỷ lệ hoàn thành</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 text-center">
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{task.nextDue}</div>
                        <div className="text-slate-500 mt-0.5">Lần tiếp theo</div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline" onClick={() => toggleActive(task.id)} className="text-xs h-7">
                        {task.isActive ? 'Tạm dừng' : 'Kích hoạt lại'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
