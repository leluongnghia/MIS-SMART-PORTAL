'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/components/ui/Toast';
import { OPERATION_TASKS, STATUS_COLORS, TASK_TYPE_COLORS, PRIORITY_COLORS, TASK_TYPE_DOT } from '@/src/mockData/schedule';
import { AlertTriangle, Clock, Zap, RotateCcw, User, MapPin } from 'lucide-react';

export default function OverdueTab() {
  const { toast } = useToast();

  const overdueTasks = OPERATION_TASKS.filter(t => t.status === 'Quá hạn');
  const urgentUnassigned = OPERATION_TASKS.filter(t => t.priority === 'Khẩn cấp' && t.status === 'Chưa nhận');
  const reworkTasks = OPERATION_TASKS.filter(t => t.status === 'Cần làm lại');

  // Conflict detection: same person, same date, overlapping time
  const conflicts: { task1: string; task2: string; person: string; date: string }[] = [];
  const todayTasks = OPERATION_TASKS.filter(t => t.startDate === '2026-07-03' && t.startTime);
  for (let i = 0; i < todayTasks.length; i++) {
    for (let j = i + 1; j < todayTasks.length; j++) {
      const a = todayTasks[i];
      const b = todayTasks[j];
      if (a.assignedTo === b.assignedTo && a.startTime && b.startTime) {
        const aStart = a.startTime;
        const aEnd = a.endTime ?? '23:59';
        const bStart = b.startTime;
        const bEnd = b.endTime ?? '23:59';
        if (aStart < bEnd && aEnd > bStart) {
          conflicts.push({ task1: a.title, task2: b.title, person: a.assignedTo, date: a.startDate });
        }
      }
    }
  }

  // Recurring missed
  const missedRecurring = OPERATION_TASKS.filter(t =>
    t.isRecurring && (t.status === 'Chưa nhận' || t.status === 'Quá hạn') && t.dueDate < '2026-07-03'
  );

  function handleEscalate(title: string) {
    toast({ title: '🚨 Đã gửi cảnh báo leo thang', description: title, variant: 'destructive' });
  }

  return (
    <div className="space-y-5 mt-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50 dark:bg-red-950/20 text-center">
          <div className="text-3xl font-bold text-red-600">{overdueTasks.length}</div>
          <div className="text-xs text-red-600 mt-1">Công việc quá hạn</div>
        </div>
        <div className="p-4 rounded-xl border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20 text-center">
          <div className="text-3xl font-bold text-orange-600">{urgentUnassigned.length}</div>
          <div className="text-xs text-orange-600 mt-1">Khẩn cấp chưa giao</div>
        </div>
        <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20 text-center">
          <div className="text-3xl font-bold text-amber-600">{conflicts.length}</div>
          <div className="text-xs text-amber-600 mt-1">Xung đột lịch</div>
        </div>
        <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 dark:bg-slate-800/50 text-center">
          <div className="text-3xl font-bold text-slate-600">{reworkTasks.length}</div>
          <div className="text-xs text-slate-600 mt-1">Cần làm lại</div>
        </div>
      </div>

      {/* Overdue */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            Công việc quá hạn ({overdueTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overdueTasks.length === 0 ? (
            <div className="text-center py-6 text-slate-400">Không có công việc quá hạn 🎉</div>
          ) : (
            <div className="space-y-3">
              {overdueTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200">
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 ${TASK_TYPE_DOT[task.type]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-red-800 dark:text-red-300">{task.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-red-600 flex-wrap">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{task.assignedTo}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{task.area}</span>
                      <span>Hạn: {task.dueDate}</span>
                      <span>Tiến độ: {task.progress}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge className={`text-xs ${TASK_TYPE_COLORS[task.type]}`}>{task.type}</Badge>
                    <Button size="sm" onClick={() => handleEscalate(task.title)} className="text-xs h-6 bg-red-600 hover:bg-red-700">
                      Leo thang
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Urgent unassigned */}
      {urgentUnassigned.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-orange-600">
              <Zap className="h-4 w-4" />
              Khẩn cấp chưa có người nhận ({urgentUnassigned.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentUnassigned.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 animate-pulse">
                  <Zap className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-orange-800 dark:text-orange-300">{task.title}</div>
                    <div className="text-xs text-orange-600 mt-0.5">{task.area} · {task.dueDate}</div>
                  </div>
                  <Button size="sm" onClick={() => handleEscalate(task.title)} className="text-xs h-6 bg-orange-600 hover:bg-orange-700 shrink-0">
                    Phân công ngay
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-600">
              <Clock className="h-4 w-4" />
              Xung đột lịch ({conflicts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conflicts.map((c, i) => (
                <div key={i} className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-sm">
                  <div className="font-medium text-amber-800 dark:text-amber-300">
                    ⚠️ {c.person} được giao 2 việc trùng thời gian
                  </div>
                  <div className="text-amber-600 mt-1">
                    • {c.task1}<br />
                    • {c.task2}
                  </div>
                  <div className="text-xs text-amber-500 mt-1">Ngày {c.date}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rework tasks */}
      {reworkTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-slate-600">
              <RotateCcw className="h-4 w-4" />
              Cần làm lại ({reworkTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reworkTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 text-sm">
                  <RotateCcw className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span className="flex-1 font-medium">{task.title}</span>
                  <Badge className={`text-xs ${TASK_TYPE_COLORS[task.type]}`}>{task.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missed recurring */}
      {missedRecurring.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-slate-600">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Công việc định kỳ bị bỏ sót ({missedRecurring.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {missedRecurring.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-sm">
                  <RotateCcw className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-amber-600">Hạn {task.dueDate} · {task.assignedTo}</div>
                  </div>
                  <Badge className={`text-xs ${STATUS_COLORS[task.status]}`}>{task.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
