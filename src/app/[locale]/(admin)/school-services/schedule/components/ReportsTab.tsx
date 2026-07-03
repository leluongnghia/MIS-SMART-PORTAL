'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { OPERATION_TASKS, RECURRING_TASKS, TASK_TYPE_DOT, ALL_TASK_TYPES } from '@/src/mockData/schedule';
import { TrendingUp, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

// Helpers
const tasks = OPERATION_TASKS;
const total = tasks.length;
const completed = tasks.filter(t => t.status === 'Hoàn thành').length;
const overdue = tasks.filter(t => t.status === 'Quá hạn').length;
const inProgress = tasks.filter(t => t.status === 'Đang làm').length;
const pending = tasks.filter(t => t.status === 'Chưa nhận').length;
const cancelled = tasks.filter(t => t.status === 'Đã hủy').length;
const rework = tasks.filter(t => t.status === 'Cần làm lại').length;
const onTimeRate = Math.round((completed / Math.max(total, 1)) * 100);
const recurringCompletion = Math.round(
  (RECURRING_TASKS.reduce((s, r) => s + r.completedCount, 0) /
    Math.max(RECURRING_TASKS.reduce((s, r) => s + r.completedCount + r.missedCount, 0), 1)) * 100
);

const byType = ALL_TASK_TYPES.map(type => ({
  type,
  count: tasks.filter(t => t.type === type).length,
  done: tasks.filter(t => t.type === type && t.status === 'Hoàn thành').length,
})).filter(x => x.count > 0);

const byPerson = Object.entries(
  tasks.reduce<Record<string, { total: number; done: number; overdue: number }>>((acc, t) => {
    if (!acc[t.assignedTo]) acc[t.assignedTo] = { total: 0, done: 0, overdue: 0 };
    acc[t.assignedTo].total++;
    if (t.status === 'Hoàn thành') acc[t.assignedTo].done++;
    if (t.status === 'Quá hạn') acc[t.assignedTo].overdue++;
    return acc;
  }, {})
).map(([name, s]) => ({ name, ...s })).sort((a, b) => b.total - a.total).slice(0, 6);

const STATUS_DATA = [
  { label: 'Hoàn thành', count: completed, color: 'bg-emerald-500' },
  { label: 'Đang làm', count: inProgress, color: 'bg-amber-500' },
  { label: 'Chưa nhận', count: pending, color: 'bg-slate-300' },
  { label: 'Quá hạn', count: overdue, color: 'bg-red-500' },
  { label: 'Cần làm lại', count: rework, color: 'bg-orange-500' },
  { label: 'Đã hủy', count: cancelled, color: 'bg-slate-200' },
];

export default function ReportsTab() {
  return (
    <div className="space-y-6 mt-6">
      {/* KPI summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Tỷ lệ hoàn thành đúng hạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${onTimeRate >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{onTimeRate}%</div>
            <div className="text-xs text-slate-500 mt-1">{completed}/{total} công việc</div>
            <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${onTimeRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${onTimeRate}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Công việc quá hạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdue}</div>
            <div className="text-xs text-slate-500 mt-1">{Math.round((overdue / Math.max(total, 1)) * 100)}% tổng công việc</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-blue-500" />
              Định kỳ hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${recurringCompletion >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{recurringCompletion}%</div>
            <div className="text-xs text-slate-500 mt-1">
              {RECURRING_TASKS.reduce((s, r) => s + r.completedCount, 0)} hoàn thành · {RECURRING_TASKS.reduce((s, r) => s + r.missedCount, 0)} bỏ sót
            </div>
            <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${recurringCompletion >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${recurringCompletion}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500">Tỷ lệ làm lại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{rework}</div>
            <div className="text-xs text-slate-500 mt-1">Công việc cần làm lại</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500">Phát sinh hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {tasks.filter(t => !t.isRecurring && t.startDate === '2026-07-03').length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Công việc không định kỳ</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500">Đang thực hiện</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{inProgress}</div>
            <div className="text-xs text-slate-500 mt-1">Công việc đang làm</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Phân bổ theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {STATUS_DATA.filter(s => s.count > 0).map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 dark:text-slate-400 w-24 shrink-0">{s.label}</span>
                  <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                    <div
                      className={`h-full ${s.color} rounded flex items-center justify-end pr-2 transition-all`}
                      style={{ width: `${(s.count / total) * 100}%` }}
                    >
                      {s.count >= 1 && <span className="text-xs text-white font-medium">{s.count}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right">{Math.round((s.count / total) * 100)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Công việc theo loại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {byType.map(t => (
                <div key={t.type} className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${TASK_TYPE_DOT[t.type]}`} />
                  <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">{t.type}</span>
                  <div className="w-24 h-5 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded"
                      style={{ width: `${(t.count / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-12 text-right">
                    {t.done}/{t.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By person */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Hiệu suất theo nhân sự</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-slate-500">
                    <th className="text-left pb-2 font-medium">Nhân sự</th>
                    <th className="text-center pb-2 font-medium">Tổng</th>
                    <th className="text-center pb-2 font-medium">Hoàn thành</th>
                    <th className="text-center pb-2 font-medium">Quá hạn</th>
                    <th className="text-left pb-2 font-medium">Tỷ lệ hoàn thành</th>
                  </tr>
                </thead>
                <tbody>
                  {byPerson.map(p => {
                    const rate = Math.round((p.done / Math.max(p.total, 1)) * 100);
                    return (
                      <tr key={p.name} className="border-b last:border-0">
                        <td className="py-2 font-medium text-slate-700 dark:text-slate-300">{p.name}</td>
                        <td className="py-2 text-center text-slate-600">{p.total}</td>
                        <td className="py-2 text-center text-emerald-600 font-semibold">{p.done}</td>
                        <td className="py-2 text-center text-red-600">{p.overdue}</td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
                              <div
                                className={`h-full rounded ${rate >= 80 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold ${rate >= 80 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
