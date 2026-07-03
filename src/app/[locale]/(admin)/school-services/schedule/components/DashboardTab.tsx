'use client';

import React from 'react';
import { SparklineCard } from '@/src/components/ui/SparklineCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import {
  SCHEDULE_KPI, OPERATION_TASKS, OPERATION_EVENTS,
  TASK_TYPE_COLORS, TASK_TYPE_DOT, STATUS_COLORS, PRIORITY_COLORS,
} from '@/src/mockData/schedule';
import {
  CheckCircle2, Clock, AlertTriangle, Zap, CalendarDays,
  Users, ListTodo, TrendingUp, ArrowRight,
} from 'lucide-react';

export default function DashboardTab() {
  const today = '2026-07-03';
  const todayTasks = OPERATION_TASKS.filter(t => t.startDate === today || t.dueDate === today);
  const urgentTasks = OPERATION_TASKS.filter(t => t.priority === 'Khẩn cấp' && t.status !== 'Hoàn thành' && t.status !== 'Đã hủy');
  const overdueTasks = OPERATION_TASKS.filter(t => t.status === 'Quá hạn');
  const unassignedUrgent = urgentTasks.filter(t => t.status === 'Chưa nhận');
  const upcomingEvents = OPERATION_EVENTS.filter(e => e.status !== 'Hoàn thành');

  // Group by type for mini chart
  const byType = OPERATION_TASKS.reduce<Record<string, number>>((acc, t) => {
    acc[t.type] = (acc[t.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 mt-6">
      {/* Urgent banner */}
      {unassignedUrgent.length > 0 && (
        <div className="rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3 animate-pulse">
          <Zap className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-red-700 dark:text-red-400">
              🚨 {unassignedUrgent.length} công việc khẩn cấp chưa có người nhận!
            </div>
            {unassignedUrgent.map(t => (
              <div key={t.id} className="text-sm text-red-600 mt-1">{t.title} — {t.area}</div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SparklineCard
          title="Công việc hôm nay"
          value={SCHEDULE_KPI.totalToday.toString()}
          icon={<ListTodo className="h-4 w-4 text-blue-500" />}
          trend="up" trendValue="+3 so hôm qua"
          data={[{value:18},{value:20},{value:22},{value:21},{value:23},{value:24},{value:24}]}
          subtitle="Tổng công việc"
          color="blue"
        />
        <SparklineCard
          title="Hoàn thành"
          value={SCHEDULE_KPI.completed.toString()}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          trend="up" trendValue={`${Math.round((SCHEDULE_KPI.completed/SCHEDULE_KPI.totalToday)*100)}%`}
          data={[{value:5},{value:6},{value:7},{value:8},{value:9},{value:9},{value:9}]}
          subtitle={`${Math.round((SCHEDULE_KPI.completed/SCHEDULE_KPI.totalToday)*100)}% tỷ lệ hoàn thành`}
          color="emerald"
        />
        <SparklineCard
          title="Đang làm"
          value={SCHEDULE_KPI.inProgress.toString()}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          trend="up" trendValue="đang xử lý"
          data={[{value:2},{value:3},{value:4},{value:5},{value:5},{value:5},{value:5}]}
          subtitle="Đang thực hiện"
          color="amber"
        />
        <SparklineCard
          title="Quá hạn"
          value={SCHEDULE_KPI.overdue.toString()}
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          trend="up" trendValue="cần xử lý ngay"
          data={[{value:0},{value:1},{value:1},{value:2},{value:2},{value:2},{value:2}]}
          subtitle="Cần xử lý ngay"
          color="red"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SparklineCard
          title="Chưa nhận"
          value={SCHEDULE_KPI.pending.toString()}
          icon={<Clock className="h-4 w-4 text-slate-500" />}
          trend="down" trendValue="cần phân công"
          data={[{value:10},{value:9},{value:8},{value:8},{value:8},{value:8},{value:8}]}
          subtitle="Chờ nhận việc"
          color="slate"
        />
        <SparklineCard
          title="Khẩn cấp"
          value={SCHEDULE_KPI.urgent.toString()}
          icon={<Zap className="h-4 w-4 text-red-500" />}
          trend="up" trendValue="ưu tiên cao nhất"
          data={[{value:1},{value:1},{value:2},{value:3},{value:3},{value:3},{value:3}]}
          subtitle="Ưu tiên tối cao"
          color="red"
        />
        <SparklineCard
          title="Sự kiện sắp tới"
          value={SCHEDULE_KPI.upcomingEvents.toString()}
          icon={<CalendarDays className="h-4 w-4 text-indigo-500" />}
          trend="up" trendValue="7 ngày tới"
          data={[{value:0},{value:0},{value:1},{value:1},{value:2},{value:2},{value:2}]}
          subtitle="Cần chuẩn bị"
          color="indigo"
        />
        <SparklineCard
          title="Nhân sự trực"
          value={SCHEDULE_KPI.onDutyStaff.toString()}
          icon={<Users className="h-4 w-4 text-blue-500" />}
          trend="up" trendValue="hôm nay"
          data={[{value:4},{value:5},{value:6},{value:6},{value:6},{value:6},{value:6}]}
          subtitle="Đang có lịch trực"
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today task list */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-blue-500" />
              Công việc hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {todayTasks.slice(0, 8).map(task => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    task.status === 'Quá hạn'
                      ? 'bg-red-50 border-red-200 dark:bg-red-950/20'
                      : task.priority === 'Khẩn cấp'
                      ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20'
                      : 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700'
                  }`}
                >
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${TASK_TYPE_DOT[task.type]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{task.title}</span>
                      {task.priority === 'Khẩn cấp' && (
                        <Zap className="h-3 w-3 text-red-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{task.assignedTo}</span>
                      {task.startTime && <span>· {task.startTime}{task.endTime ? `–${task.endTime}` : ''}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-xs text-slate-500 hidden sm:block">{task.progress}%</div>
                    <Badge className={`text-xs ${STATUS_COLORS[task.status]}`}>{task.status}</Badge>
                  </div>
                </div>
              ))}
              {todayTasks.length > 8 && (
                <div className="text-center text-sm text-blue-600 py-1">
                  + {todayTasks.length - 8} công việc khác
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming events */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-indigo-500" />
                Sự kiện sắp tới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map(ev => (
                  <div key={ev.id} className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100">
                    <div className="font-medium text-sm text-indigo-900 dark:text-indigo-300 leading-tight">{ev.title}</div>
                    <div className="text-xs text-indigo-600 mt-0.5">{ev.startDatetime} · {ev.location}</div>
                    <Badge className="text-xs mt-1.5 bg-indigo-100 text-indigo-700">{ev.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By type breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Phân loại công việc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(byType).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${TASK_TYPE_DOT[type as keyof typeof TASK_TYPE_DOT]}`} />
                    <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">{type}</span>
                    <span className="text-xs font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
