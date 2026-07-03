'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import {
  OPERATION_TASKS, type OperationTask, type TaskStatus,
  TASK_TYPE_COLORS, TASK_TYPE_DOT, STATUS_COLORS, PRIORITY_COLORS,
  ALL_TASK_TYPES, ALL_STATUSES, ALL_PRIORITIES,
} from '@/src/mockData/schedule';
import {
  Search, ChevronDown, ChevronUp, Zap, Clock, User, MapPin,
  RotateCcw, CheckCircle2, AlertTriangle, Plus,
} from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';
import TaskFormModal from './TaskFormModal';

const DAY_NAMES_VN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Calendar view: 7 days from today
function get7Days(): string[] {
  const days: string[] = [];
  const base = new Date('2026-07-03');
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export default function CalendarTab() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<OperationTask[]>(OPERATION_TASKS);
  const [view, setView] = useState<'week' | 'list'>('week');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const days7 = get7Days();

  const filtered = tasks.filter(t => {
    const ms = t.title.toLowerCase().includes(search.toLowerCase()) ||
               t.area.toLowerCase().includes(search.toLowerCase()) ||
               t.assignedTo.toLowerCase().includes(search.toLowerCase());
    const mt = filterType === 'all' || t.type === filterType;
    const ms2 = filterStatus === 'all' || t.status === filterStatus;
    const mp = filterPriority === 'all' || t.priority === filterPriority;
    return ms && mt && ms2 && mp;
  });

  function handleStatusUpdate(id: string, status: TaskStatus) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status, progress: status === 'Hoàn thành' ? 100 : t.progress } : t));
    toast({ title: 'Cập nhật trạng thái', description: `→ ${status}` });
  }

  function handleProgressUpdate(id: string, progress: number) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, progress } : t));
  }

  function handleAddTask(task: OperationTask) {
    setTasks(prev => [task, ...prev]);
    setShowForm(false);
    toast({ title: '✅ Tạo công việc thành công', description: task.title });
  }

  return (
    <div className="space-y-4 mt-6">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm công việc, khu vực, người phụ trách..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
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
        <div className="flex gap-2">
          <Button variant={view === 'week' ? 'default' : 'outline'} onClick={() => setView('week')} className="shrink-0 px-3">Tuần</Button>
          <Button variant={view === 'list' ? 'default' : 'outline'} onClick={() => setView('list')} className="shrink-0 px-3">Danh sách</Button>
        </div>
        <Button onClick={() => setShowForm(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-1" />Tạo công việc
        </Button>
      </div>

      {/* Week view */}
      {view === 'week' && (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <div className="grid grid-cols-8 min-w-[700px]">
              {/* Header */}
              <div className="p-3 border-b border-r text-xs font-medium text-slate-500 bg-slate-50 dark:bg-slate-800">Loại</div>
              {days7.map(d => {
                const dt = new Date(d);
                const isToday = d === '2026-07-03';
                return (
                  <div key={d} className={`p-3 border-b border-r text-center text-xs font-medium bg-slate-50 dark:bg-slate-800 ${isToday ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700' : 'text-slate-500'}`}>
                    <div>{DAY_NAMES_VN[dt.getDay()]}</div>
                    <div className={`text-base font-bold mt-0.5 ${isToday ? 'text-blue-600' : 'text-slate-800 dark:text-slate-200'}`}>{dt.getDate()}</div>
                  </div>
                );
              })}

              {/* Task rows by type */}
              {ALL_TASK_TYPES.map(type => {
                const typeTasks = filtered.filter(t => t.type === type);
                if (typeTasks.length === 0) return null;
                return (
                  <React.Fragment key={type}>
                    <div className="p-2 border-b border-r flex items-center">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${TASK_TYPE_DOT[type]}`} />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{type}</span>
                      </div>
                    </div>
                    {days7.map(d => {
                      const dayTasks = typeTasks.filter(t => t.startDate === d || t.dueDate === d);
                      return (
                        <div key={d} className="p-1 border-b border-r min-h-[60px] space-y-1">
                          {dayTasks.map(t => (
                            <div
                              key={t.id}
                              className={`text-xs px-1.5 py-1 rounded cursor-pointer leading-tight ${
                                t.status === 'Quá hạn' ? 'bg-red-100 text-red-700 dark:bg-red-950/30' :
                                t.priority === 'Khẩn cấp' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/30' :
                                t.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30' :
                                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                              }`}
                              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                              title={t.title}
                            >
                              <div className="font-medium truncate">{t.title}</div>
                              {t.startTime && <div className="opacity-70">{t.startTime}</div>}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">Không có công việc nào</div>
          )}
          {filtered.map(task => (
            <Card
              key={task.id}
              className={
                task.status === 'Quá hạn' ? 'border-red-300 dark:border-red-700' :
                task.priority === 'Khẩn cấp' && task.status !== 'Hoàn thành' ? 'border-orange-300 dark:border-orange-700' : ''
              }
            >
              <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(expanded === task.id ? null : task.id)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {task.priority === 'Khẩn cấp' && <Zap className="h-4 w-4 text-red-500 shrink-0" />}
                      <span className="font-semibold text-sm">{task.title}</span>
                      <Badge className={`text-xs ${TASK_TYPE_COLORS[task.type]}`}>{task.type}</Badge>
                      <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</Badge>
                      {task.isRecurring && <RotateCcw className="h-3 w-3 text-slate-400" title="Định kỳ" />}
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
                <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
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
                  <div className="space-y-3 text-sm">
                    <div className="text-slate-600 dark:text-slate-400">{task.description}</div>
                    {task.coordinator && (
                      <div><span className="font-medium">Phối hợp: </span>{task.coordinator}</div>
                    )}
                    {task.notes && (
                      <div className="italic text-slate-500">{task.notes}</div>
                    )}

                    {/* Updates history */}
                    {task.updates.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="text-xs font-medium text-slate-500 uppercase">Lịch sử cập nhật</div>
                        {task.updates.map((u, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                            <div>
                              <span className="text-slate-500">{u.at} · {u.by}: </span>
                              <span className="text-slate-700 dark:text-slate-300">{u.note}</span>
                              {u.progress !== undefined && <span className="text-blue-600 ml-1">({u.progress}%)</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    {task.status !== 'Hoàn thành' && task.status !== 'Đã hủy' && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {task.status === 'Chưa nhận' && (
                          <Button size="sm" onClick={() => handleStatusUpdate(task.id, 'Đã nhận')} className="text-xs h-7">Nhận việc</Button>
                        )}
                        {task.status === 'Đã nhận' && (
                          <Button size="sm" onClick={() => handleStatusUpdate(task.id, 'Đang làm')} className="text-xs h-7 bg-amber-600 hover:bg-amber-700">Bắt đầu làm</Button>
                        )}
                        {task.status === 'Đang làm' && (
                          <>
                            <Button size="sm" onClick={() => handleStatusUpdate(task.id, 'Hoàn thành')} className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />Hoàn thành
                            </Button>
                            <div className="flex items-center gap-2">
                              <input
                                type="range" min="0" max="100" value={task.progress}
                                onChange={e => handleProgressUpdate(task.id, Number(e.target.value))}
                                className="w-24 h-1.5 accent-blue-500"
                              />
                              <span className="text-xs text-slate-500">{task.progress}%</span>
                            </div>
                          </>
                        )}
                        {task.status === 'Quá hạn' && (
                          <Button size="sm" onClick={() => handleStatusUpdate(task.id, 'Đang làm')} className="text-xs h-7 bg-orange-600 hover:bg-orange-700">
                            <AlertTriangle className="h-3 w-3 mr-1" />Xử lý ngay
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
      )}

      {/* Form modal */}
      {showForm && (
        <TaskFormModal onClose={() => setShowForm(false)} onSave={handleAddTask} />
      )}
    </div>
  );
}
