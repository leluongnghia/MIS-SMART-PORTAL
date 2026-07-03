'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/Toast';
import {
  OPERATION_TASKS, type OperationTask, type TaskStatus,
  TASK_TYPE_COLORS, STATUS_COLORS, PRIORITY_COLORS, TASK_TYPE_DOT,
  ALL_TASK_TYPES, ALL_STATUSES, ALL_PRIORITIES,
} from '@/src/mockData/schedule';
import {
  Search, User, MapPin, Clock, CheckCircle2, Zap, RotateCcw,
  AlertTriangle, ChevronDown, ChevronUp, Plus,
} from 'lucide-react';
import TaskFormModal from './TaskFormModal';

export default function TasksTab() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<OperationTask[]>(OPERATION_TASKS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [progressInput, setProgressInput] = useState<Record<string, number>>({});

  const filtered = tasks.filter(t => {
    const ms = t.title.toLowerCase().includes(search.toLowerCase()) ||
               t.area.toLowerCase().includes(search.toLowerCase()) ||
               t.assignedTo.toLowerCase().includes(search.toLowerCase());
    return ms &&
      (filterType === 'all' || t.type === filterType) &&
      (filterStatus === 'all' || t.status === filterStatus) &&
      (filterPriority === 'all' || t.priority === filterPriority);
  });

  function handleStatusUpdate(id: string, status: TaskStatus) {
    setTasks(prev => prev.map(t => t.id === id
      ? { ...t, status, progress: status === 'Hoàn thành' ? 100 : t.progress,
          updates: [...t.updates, { at: new Date().toLocaleTimeString('vi-VN'), by: 'Người dùng', note: `→ ${status}`, progress: status === 'Hoàn thành' ? 100 : t.progress }] }
      : t
    ));
    toast({ title: 'Cập nhật trạng thái', description: `→ ${status}` });
  }

  function handleSaveProgress(id: string) {
    const prog = progressInput[id];
    if (prog === undefined) return;
    setTasks(prev => prev.map(t => t.id === id
      ? { ...t, progress: prog,
          updates: [...t.updates, { at: new Date().toLocaleTimeString('vi-VN'), by: 'Người dùng', note: 'Cập nhật tiến độ', progress: prog }] }
      : t
    ));
    toast({ title: 'Đã lưu tiến độ', description: `${prog}%` });
  }

  function handleAddTask(task: OperationTask) {
    setTasks(prev => [task, ...prev]);
    setShowForm(false);
    toast({ title: '✅ Tạo công việc thành công', description: task.title });
  }

  return (
    <div className="space-y-4 mt-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm công việc..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Tất cả loại</option>
          {ALL_TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">Tất cả ưu tiên</option>
          {ALL_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </Select>
        <Button onClick={() => setShowForm(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-1" />Tạo công việc
        </Button>
      </div>

      {/* Count */}
      <div className="text-xs text-slate-500">{filtered.length} công việc</div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">Không tìm thấy công việc nào</div>
        )}
        {filtered.map(task => (
          <Card
            key={task.id}
            className={
              task.status === 'Quá hạn' ? 'border-red-300 dark:border-red-800' :
              (task.priority === 'Khẩn cấp' && task.status !== 'Hoàn thành') ? 'border-orange-300 dark:border-orange-800' : ''
            }
          >
            <CardHeader className="pb-1.5 cursor-pointer" onClick={() => setExpanded(expanded === task.id ? null : task.id)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${TASK_TYPE_DOT[task.type]}`} />
                    {task.priority === 'Khẩn cấp' && <Zap className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                    <span className="font-semibold text-sm">{task.title}</span>
                    <Badge className={`text-xs ${TASK_TYPE_COLORS[task.type]}`}>{task.type}</Badge>
                    <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</Badge>
                    {task.isRecurring && <RotateCcw className="h-3 w-3 text-slate-400 shrink-0" title="Định kỳ" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{task.assignedTo}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{task.area}</span>
                    {task.startTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{task.startTime}{task.endTime ? `–${task.endTime}` : ''}</span>}
                    <span>Hạn: {task.dueDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <Badge className={`text-xs ${STATUS_COLORS[task.status]}`}>{task.status}</Badge>
                    <div className="text-xs text-slate-400 mt-1">{task.progress}%</div>
                  </div>
                  {expanded === task.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    task.status === 'Hoàn thành' ? 'bg-emerald-500' :
                    task.status === 'Quá hạn' ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </CardHeader>

            {expanded === task.id && (
              <CardContent>
                <div className="space-y-4 text-sm">
                  {task.description && (
                    <p className="text-slate-600 dark:text-slate-400">{task.description}</p>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                      <div className="text-slate-400">Người giao</div>
                      <div className="font-medium mt-0.5">{task.assignedBy || '—'}</div>
                    </div>
                    {task.coordinator && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                        <div className="text-slate-400">Phối hợp</div>
                        <div className="font-medium mt-0.5">{task.coordinator}</div>
                      </div>
                    )}
                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                      <div className="text-slate-400">Khu vực</div>
                      <div className="font-medium mt-0.5">{task.area}</div>
                    </div>
                  </div>

                  {/* Progress update */}
                  {task.status === 'Đang làm' && (
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                      <span className="text-xs text-slate-500 shrink-0">Tiến độ:</span>
                      <input
                        type="range" min="0" max="100"
                        value={progressInput[task.id] ?? task.progress}
                        onChange={e => setProgressInput(prev => ({ ...prev, [task.id]: Number(e.target.value) }))}
                        className="flex-1 h-1.5 accent-blue-500"
                      />
                      <span className="text-xs font-semibold text-blue-600 w-8">{progressInput[task.id] ?? task.progress}%</span>
                      <Button size="sm" onClick={() => handleSaveProgress(task.id)} className="text-xs h-6 shrink-0">Lưu</Button>
                    </div>
                  )}

                  {/* Updates history */}
                  {task.updates.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Lịch sử cập nhật</div>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {[...task.updates].reverse().map((u, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                            <div>
                              <span className="text-slate-500">{u.at} · <span className="font-medium">{u.by}</span>: </span>
                              <span className="text-slate-700 dark:text-slate-300">{u.note}</span>
                              {u.progress !== undefined && <span className="text-blue-600 ml-1">({u.progress}%)</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status actions */}
                  {task.status !== 'Hoàn thành' && task.status !== 'Đã hủy' && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {task.status === 'Chưa nhận' && (
                        <Button size="sm" onClick={() => handleStatusUpdate(task.id, 'Đã nhận')} className="text-xs h-7">Nhận việc</Button>
                      )}
                      {task.status === 'Đã nhận' && (
                        <Button size="sm" onClick={() => handleStatusUpdate(task.id, 'Đang làm')} className="text-xs h-7 bg-amber-600 hover:bg-amber-700">Bắt đầu</Button>
                      )}
                      {(task.status === 'Đang làm' || task.status === 'Đã nhận') && (
                        <Button size="sm" onClick={() => handleStatusUpdate(task.id, 'Hoàn thành')} className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />Hoàn thành
                        </Button>
                      )}
                      {task.status === 'Quá hạn' && (
                        <Button size="sm" onClick={() => handleStatusUpdate(task.id, 'Đang làm')} className="text-xs h-7 bg-orange-600 hover:bg-orange-700">
                          <AlertTriangle className="h-3 w-3 mr-1" />Xử lý ngay
                        </Button>
                      )}
                      {task.status === 'Cần làm lại' && (
                        <Button size="sm" onClick={() => handleStatusUpdate(task.id, 'Đang làm')} className="text-xs h-7 bg-blue-600 hover:bg-blue-700">
                          <RotateCcw className="h-3 w-3 mr-1" />Làm lại
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(task.id, 'Đã hủy')} className="text-xs h-7 text-slate-500">Hủy</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {showForm && <TaskFormModal onClose={() => setShowForm(false)} onSave={handleAddTask} />}
    </div>
  );
}
