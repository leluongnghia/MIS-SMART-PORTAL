'use client';

import React from 'react';
import { SparklineCard } from '@/src/components/ui/SparklineCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import {
  STAFF_KPI, STAFF_PROFILES, SHIFT_ASSIGNMENTS, STAFF_TASKS, DISCIPLINARY_RECORDS,
  DEPARTMENT_DOT, DEPARTMENT_COLORS, STATUS_COLORS, SHIFT_STATUS_COLORS, PERFORMANCE_COLORS,
  MANDATORY_TRAININGS,
} from '@/src/mockData/staff';
import {
  Users, UserCheck, CalendarClock, Briefcase, AlertTriangle,
  GraduationCap, Star, Clock,
} from 'lucide-react';

// Stats by dept
const byDept = STAFF_PROFILES.reduce<Record<string, number>>((acc, s) => {
  acc[s.department] = (acc[s.department] ?? 0) + 1;
  return acc;
}, {});

// Missing mandatory training
const incompleteTraining = STAFF_PROFILES.filter(
  s => MANDATORY_TRAININGS.some(tid => !s.trainingCompleted.includes(tid))
);

// Overdue tasks
const overdueTasks = STAFF_TASKS.filter(t => t.status === 'Quá hạn');

export default function DashboardTab() {
  const onDutyShifts = SHIFT_ASSIGNMENTS.filter(s => s.status === 'Đang trực');
  const absentShifts = SHIFT_ASSIGNMENTS.filter(s => s.status === 'Vắng mặt');
  const recentRecords = DISCIPLINARY_RECORDS.slice(0, 4);

  return (
    <div className="space-y-6 mt-6">
      {/* Warnings */}
      {(incompleteTraining.length > 0 || overdueTasks.length > 0 || absentShifts.length > 0) && (
        <div className="space-y-2">
          {absentShifts.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-xl border-2 border-red-300 bg-red-50 dark:bg-red-950/20">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-700 text-sm">⚠️ {absentShifts.length} ca vắng mặt hôm nay</div>
                {absentShifts.map(s => (
                  <div key={s.id} className="text-xs text-red-600 mt-0.5">
                    {s.staffName} — {s.shiftName} {s.substitute ? `(Thay: ${s.substitute})` : '(Chưa có người thay!)'}
                  </div>
                ))}
              </div>
            </div>
          )}
          {incompleteTraining.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20">
              <GraduationCap className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <span className="font-semibold">{incompleteTraining.length} nhân sự</span> chưa hoàn tất đào tạo bắt buộc: {incompleteTraining.map(s => s.name).join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI sparklines */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SparklineCard
          title="Tổng nhân sự"
          value={STAFF_KPI.total.toString()}
          icon={<Users className="h-4 w-4 text-blue-500" />}
          trend="up" trendValue="+2 tháng này"
          data={[{value:28},{value:29},{value:30},{value:30},{value:31},{value:32},{value:32}]}
          subtitle="Tất cả bộ phận"
          color="blue"
        />
        <SparklineCard
          title="Đang làm hôm nay"
          value={STAFF_KPI.onDutyToday.toString()}
          icon={<UserCheck className="h-4 w-4 text-emerald-500" />}
          trend="up" trendValue={`${Math.round((STAFF_KPI.onDutyToday/STAFF_KPI.total)*100)}%`}
          data={[{value:24},{value:25},{value:25},{value:26},{value:26},{value:26},{value:26}]}
          subtitle="Có mặt tại trường"
          color="emerald"
        />
        <SparklineCard
          title="Ca trực hôm nay"
          value={STAFF_KPI.shiftsToday.toString()}
          icon={<CalendarClock className="h-4 w-4 text-amber-500" />}
          trend="up" trendValue="theo lịch"
          data={[{value:10},{value:11},{value:11},{value:12},{value:12},{value:12},{value:12}]}
          subtitle="Lịch phân ca"
          color="amber"
        />
        <SparklineCard
          title="Vị trí thiếu"
          value={STAFF_KPI.vacantPositions.toString()}
          icon={<Briefcase className="h-4 w-4 text-red-500" />}
          trend="down" trendValue="cần tuyển dụng"
          data={[{value:1},{value:1},{value:2},{value:2},{value:2},{value:2},{value:2}]}
          subtitle="Cần bổ sung"
          color="red"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SparklineCard
          title="Nghỉ phép"
          value={STAFF_KPI.onLeave.toString()}
          icon={<Clock className="h-4 w-4 text-slate-500" />}
          trend="up" trendValue="hôm nay"
          data={[{value:1},{value:2},{value:2},{value:3},{value:3},{value:3},{value:3}]}
          subtitle="Vắng mặt"
          color="slate"
        />
        <SparklineCard
          title="Nhiệm vụ tồn"
          value={STAFF_KPI.pendingTasks.toString()}
          icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
          trend="down" trendValue="chưa hoàn thành"
          data={[{value:10},{value:9},{value:9},{value:8},{value:8},{value:8},{value:8}]}
          subtitle="Cần xử lý"
          color="orange"
        />
        <SparklineCard
          title="Chưa đào tạo"
          value={STAFF_KPI.incompleteTraining.toString()}
          icon={<GraduationCap className="h-4 w-4 text-indigo-500" />}
          trend="down" trendValue="bắt buộc"
          data={[{value:8},{value:7},{value:6},{value:6},{value:5},{value:5},{value:5}]}
          subtitle="Đào tạo bắt buộc"
          color="indigo"
        />
        <SparklineCard
          title="Hiệu suất TB"
          value={`${STAFF_KPI.avgPerformance}%`}
          icon={<Star className="h-4 w-4 text-amber-500" />}
          trend="up" trendValue="+3% tháng này"
          data={[{value:76},{value:78},{value:79},{value:80},{value:81},{value:82},{value:82}]}
          subtitle="Toàn bộ phận"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* On-duty list */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-500" />
              Ca trực hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {SHIFT_ASSIGNMENTS.map(shift => (
                <div key={shift.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                  shift.status === 'Vắng mặt' ? 'bg-red-50 border-red-200 dark:bg-red-950/20' :
                  shift.status === 'Đang trực' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20' :
                  'bg-slate-50 border-slate-100 dark:bg-slate-800/30 dark:border-slate-700'
                }`}>
                  <div className={`h-2 w-2 rounded-full shrink-0 ${DEPARTMENT_DOT[shift.department]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{shift.staffName}</div>
                    <div className="text-xs text-slate-500">{shift.shiftName} · {shift.startTime}–{shift.endTime}</div>
                  </div>
                  <Badge className={`text-xs ${SHIFT_STATUS_COLORS[shift.status]}`}>{shift.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Side column */}
        <div className="space-y-4">
          {/* By dept */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Nhân sự theo bộ phận</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(byDept).map(([dept, count]) => (
                  <div key={dept} className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${DEPARTMENT_DOT[dept as keyof typeof DEPARTMENT_DOT]}`} />
                    <span className="text-xs flex-1 text-slate-600 dark:text-slate-400">{dept}</span>
                    <span className="text-xs font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent records */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Khen thưởng / Vi phạm gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentRecords.map(r => (
                  <div key={r.id} className="text-xs">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] ${r.type === 'Khen thưởng' ? 'bg-emerald-100 text-emerald-700' : r.type === 'Vi phạm' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {r.type}
                      </Badge>
                      <span className="font-medium truncate">{r.staffName}</span>
                    </div>
                    <div className="text-slate-400 mt-0.5 truncate">{r.content.slice(0, 60)}...</div>
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
