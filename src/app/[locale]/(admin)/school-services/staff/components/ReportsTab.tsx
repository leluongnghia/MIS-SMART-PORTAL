'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import {
  STAFF_PROFILES, ATTENDANCE_RECORDS, STAFF_TASKS, SHIFT_ASSIGNMENTS,
  TRAINING_RECORDS, DISCIPLINARY_RECORDS, MANDATORY_TRAININGS,
  DEPARTMENT_DOT, ALL_DEPARTMENTS, PERFORMANCE_COLORS,
} from '@/src/mockData/staff';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

// ─── KPIs ─────────────────────────────────────────────────────
const totalStaff = STAFF_PROFILES.length;
const activeStaff = STAFF_PROFILES.filter(p => p.status === 'Đang làm').length;
const todayAttendance = ATTENDANCE_RECORDS.filter(r => r.date === '2026-07-03');
const onTime = todayAttendance.filter(r => r.type === 'Bình thường' || r.type === 'Tăng ca').length;
const onTimeRate = Math.round((onTime / Math.max(todayAttendance.length, 1)) * 100);

const totalTasks = STAFF_TASKS.length;
const doneTasks = STAFF_TASKS.filter(t => t.status === 'Hoàn thành').length;
const taskRate = Math.round((doneTasks / Math.max(totalTasks, 1)) * 100);

const trainedAll = STAFF_PROFILES.filter(p =>
  MANDATORY_TRAININGS.every(tid => p.trainingCompleted.includes(tid))
).length;
const trainingRate = Math.round((trainedAll / Math.max(totalStaff, 1)) * 100);

const shiftsWithSub = SHIFT_ASSIGNMENTS.filter(s => s.status === 'Vắng mặt' && s.substitute).length;
const totalAbsent = SHIFT_ASSIGNMENTS.filter(s => s.status === 'Vắng mặt').length;
const subRate = totalAbsent === 0 ? 100 : Math.round((shiftsWithSub / totalAbsent) * 100);

const complaints = DISCIPLINARY_RECORDS.filter(r => r.type === 'Vi phạm' && r.content.toLowerCase().includes('thái độ')).length;

const goodOrAbove = STAFF_PROFILES.filter(p =>
  p.performanceRating === 'Xuất sắc' || p.performanceRating === 'Tốt'
).length;
const goodRate = Math.round((goodOrAbove / Math.max(STAFF_PROFILES.filter(p => p.performanceRating).length, 1)) * 100);

// By dept
const byDept = ALL_DEPARTMENTS.map(dept => {
  const list = STAFF_PROFILES.filter(p => p.department === dept);
  const active = list.filter(p => p.status === 'Đang làm').length;
  const avgScore = list.reduce((s, p) => s + (p.performanceScore ?? 0), 0) / Math.max(list.length, 1);
  const trained = list.filter(p => MANDATORY_TRAININGS.every(tid => p.trainingCompleted.includes(tid))).length;
  return { dept, total: list.length, active, avgScore: Math.round(avgScore), trained };
}).filter(d => d.total > 0);

const KPI_BARS = [
  { label: 'Đi làm đúng giờ', value: onTimeRate, color: onTimeRate >= 90 ? 'bg-emerald-500' : onTimeRate >= 75 ? 'bg-amber-500' : 'bg-red-500' },
  { label: 'Hoàn thành nhiệm vụ đúng hạn', value: taskRate, color: taskRate >= 85 ? 'bg-emerald-500' : taskRate >= 70 ? 'bg-amber-500' : 'bg-red-500' },
  { label: 'Hoàn tất đào tạo bắt buộc', value: trainingRate, color: trainingRate >= 90 ? 'bg-emerald-500' : trainingRate >= 70 ? 'bg-amber-500' : 'bg-red-500' },
  { label: 'Ca vắng có người thay thế', value: subRate, color: subRate === 100 ? 'bg-emerald-500' : 'bg-amber-500' },
  { label: 'Đánh giá Tốt trở lên', value: goodRate, color: goodRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500' },
];

export default function ReportsTab() {
  return (
    <div className="space-y-6 mt-6">
      {/* KPI bars */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">KPI Nhân sự dịch vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {KPI_BARS.map(kpi => (
              <div key={kpi.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">{kpi.label}</span>
                  <span className={`font-bold ${kpi.value >= 85 ? 'text-emerald-600' : kpi.value >= 70 ? 'text-amber-600' : 'text-red-600'}`}>{kpi.value}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${kpi.color}`} style={{ width: `${kpi.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By department */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Nhân sự theo bộ phận</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-slate-500">
                    <th className="pb-2 text-left font-medium">Bộ phận</th>
                    <th className="pb-2 text-center font-medium">Tổng</th>
                    <th className="pb-2 text-center font-medium">Đang làm</th>
                    <th className="pb-2 text-center font-medium">Đào tạo ✓</th>
                    <th className="pb-2 text-left font-medium">HiS TB</th>
                  </tr>
                </thead>
                <tbody>
                  {byDept.map(d => (
                    <tr key={d.dept} className="border-b last:border-0">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${DEPARTMENT_DOT[d.dept as keyof typeof DEPARTMENT_DOT]}`} />
                          <span className="font-medium">{d.dept}</span>
                        </div>
                      </td>
                      <td className="py-2 text-center font-semibold">{d.total}</td>
                      <td className="py-2 text-center text-emerald-600 font-semibold">{d.active}</td>
                      <td className="py-2 text-center">
                        <span className={`text-xs font-semibold ${d.trained === d.total ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {d.trained}/{d.total}
                        </span>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded overflow-hidden">
                            <div className={`h-full ${d.avgScore >= 85 ? 'bg-emerald-500' : d.avgScore >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${d.avgScore}%` }} />
                          </div>
                          <span className="text-xs text-slate-600">{d.avgScore}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Attendance summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Chấm công hôm nay (03/07/2026)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {[
                { label: 'Đúng giờ', count: todayAttendance.filter(r => r.type === 'Bình thường').length, color: 'bg-emerald-500' },
                { label: 'Tăng ca', count: todayAttendance.filter(r => r.type === 'Tăng ca').length, color: 'bg-purple-500' },
                { label: 'Đi muộn', count: todayAttendance.filter(r => r.type === 'Đi muộn').length, color: 'bg-amber-500' },
                { label: 'Vắng có phép', count: todayAttendance.filter(r => r.type === 'Vắng có phép').length, color: 'bg-blue-500' },
                { label: 'Vắng không phép', count: todayAttendance.filter(r => r.type === 'Vắng không phép').length, color: 'bg-red-500' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 dark:text-slate-400 w-28 shrink-0">{s.label}</span>
                  <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                    <div
                      className={`h-full ${s.color} flex items-center justify-end pr-2 rounded`}
                      style={{ width: `${(s.count / Math.max(todayAttendance.length, 1)) * 100}%`, minWidth: s.count > 0 ? '24px' : '0' }}
                    >
                      {s.count > 0 && <span className="text-xs text-white font-bold">{s.count}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 w-4 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Nhân sự nổi bật</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {STAFF_PROFILES
                .filter(p => p.performanceScore)
                .sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0))
                .slice(0, 5)
                .map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.department}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-bold ${(p.performanceScore ?? 0) >= 90 ? 'text-emerald-600' : 'text-blue-600'}`}>{p.performanceScore}%</div>
                      {p.performanceRating && (
                        <div className={`text-xs ${PERFORMANCE_COLORS[p.performanceRating]} rounded px-1`}>{p.performanceRating}</div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Need improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Cần chú ý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {STAFF_PROFILES
                .filter(p => (p.performanceRating === 'Cần cải thiện' || p.performanceRating === 'Không đạt') ||
                  MANDATORY_TRAININGS.some(tid => !p.trainingCompleted.includes(tid)))
                .slice(0, 5)
                .map(p => (
                  <div key={p.id} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-amber-600">
                        {p.performanceRating === 'Cần cải thiện' || p.performanceRating === 'Không đạt'
                          ? `Hiệu suất: ${p.performanceRating}`
                          : `Chưa hoàn tất ${MANDATORY_TRAININGS.filter(tid => !p.trainingCompleted.includes(tid)).length} đào tạo bắt buộc`
                        }
                      </div>
                    </div>
                  </div>
                ))}
              {STAFF_PROFILES.filter(p =>
                p.performanceRating === 'Cần cải thiện' ||
                MANDATORY_TRAININGS.some(tid => !p.trainingCompleted.includes(tid))
              ).length === 0 && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Tất cả nhân sự đang đạt yêu cầu!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
