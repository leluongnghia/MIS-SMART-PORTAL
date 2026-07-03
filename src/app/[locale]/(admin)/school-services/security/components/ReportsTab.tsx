'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { SparklineCard } from '@/src/components/ui/SparklineCard';
import {
  GUESTS, SECURITY_INCIDENTS, CAMERAS, FIRE_SAFETY_ITEMS, PICKUP_RECORDS, GUARD_LOGS,
} from '@/src/mockData/security';
import {
  Users, ShieldAlert, Video, Flame, TrendingUp, Clock, CheckCircle2, AlertTriangle,
} from 'lucide-react';

// Aggregate stats
const guestsByDate = [
  { date: '27/06', count: 15 },
  { date: '28/06', count: 18 },
  { date: '29/06', count: 12 },
  { date: '30/06', count: 20 },
  { date: '01/07', count: 22 },
  { date: '02/07', count: 17 },
  { date: '03/07', count: 23 },
];

const incidentsByType = [
  { type: 'Người lạ', count: 2 },
  { type: 'Té ngã', count: 1 },
  { type: 'Học sinh ra khỏi khu vực', count: 1 },
  { type: 'Mất đồ', count: 1 },
  { type: 'Nguy cơ mất an toàn', count: 1 },
  { type: 'Sự cố khác', count: 0 },
];

const incidentsBySeverity = [
  { severity: 'Khẩn cấp', count: 1, color: 'text-red-600' },
  { severity: 'Cao', count: 2, color: 'text-orange-600' },
  { severity: 'Trung bình', count: 1, color: 'text-amber-600' },
  { severity: 'Thấp', count: 2, color: 'text-slate-600' },
];

export default function ReportsTab() {
  const totalGuests = GUESTS.length;
  const resolvedIncidents = SECURITY_INCIDENTS.filter(i => i.status === 'Đã xử lý' || i.status === 'Đóng sự cố').length;
  const resolutionRate = Math.round((resolvedIncidents / SECURITY_INCIDENTS.length) * 100);
  const activeCamera = CAMERAS.filter(c => c.status === 'Hoạt động').length;
  const cameraRate = Math.round((activeCamera / CAMERAS.length) * 100);
  const goodFireSafety = FIRE_SAFETY_ITEMS.filter(f => f.status === 'Tốt').length;
  const fireSafetyRate = Math.round((goodFireSafety / FIRE_SAFETY_ITEMS.length) * 100);
  const logsWithHandover = GUARD_LOGS.filter(l => l.handoverNotes.length > 0).length;
  const logRate = Math.round((logsWithHandover / GUARD_LOGS.length) * 100);
  const latePickups = PICKUP_RECORDS.filter(p => p.status === 'Đón muộn' || p.status === 'Đón thay' || p.status === 'Bất thường').length;

  return (
    <div className="space-y-6 mt-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-500" />
              Tỷ lệ camera hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${cameraRate >= 90 ? 'text-emerald-600' : cameraRate >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
              {cameraRate}%
            </div>
            <div className="text-xs text-slate-500 mt-1">{activeCamera}/{CAMERAS.length} camera</div>
            <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${cameraRate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${cameraRate}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              Tỷ lệ xử lý sự cố
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${resolutionRate >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {resolutionRate}%
            </div>
            <div className="text-xs text-slate-500 mt-1">{resolvedIncidents}/{SECURITY_INCIDENTS.length} đã xử lý</div>
            <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${resolutionRate}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              PCCC đạt chuẩn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${fireSafetyRate >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {fireSafetyRate}%
            </div>
            <div className="text-xs text-slate-500 mt-1">{goodFireSafety}/{FIRE_SAFETY_ITEMS.length} thiết bị tốt</div>
            <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${fireSafetyRate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${fireSafetyRate}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Nhật ký ca đầy đủ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{logRate}%</div>
            <div className="text-xs text-slate-500 mt-1">{logsWithHandover}/{GUARD_LOGS.length} ca có bàn giao</div>
            <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${logRate}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Đón muộn/bất thường
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{latePickups}</div>
            <div className="text-xs text-slate-500 mt-1">Trên tổng {PICKUP_RECORDS.length} học sinh</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Khách ghi nhận 100%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalGuests}</div>
            <div className="text-xs text-slate-500 mt-1">Lượt trong tuần</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Khách ra vào theo ngày */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Lượt khách ra vào 7 ngày qua</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {guestsByDate.map((d) => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-12 shrink-0">{d.date}</span>
                  <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${(d.count / 25) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">{d.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sự cố theo loại */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Sự cố theo loại (tháng này)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incidentsByType.filter(i => i.count > 0).map((item) => (
                <div key={item.type} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">{item.type}</span>
                  <div className="w-24 h-5 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded transition-all"
                      style={{ width: `${(item.count / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-6 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sự cố theo mức độ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Phân loại mức độ sự cố</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incidentsBySeverity.map((item) => (
                <div key={item.severity} className="flex items-center justify-between">
                  <span className={`font-medium text-sm ${item.color}`}>{item.severity}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {Array.from({ length: Math.max(item.count, 0) }).map((_, i) => (
                        <div key={i} className={`h-4 w-4 rounded ${
                          item.severity === 'Khẩn cấp' ? 'bg-red-500' :
                          item.severity === 'Cao' ? 'bg-orange-500' :
                          item.severity === 'Trung bình' ? 'bg-amber-500' :
                          'bg-slate-400'
                        }`} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tình trạng đón trả */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tình trạng đón trả hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(['Đã đón', 'Chưa đón', 'Đón muộn', 'Đón thay', 'Bất thường'] as const).map((status) => {
                const count = PICKUP_RECORDS.filter(p => p.status === status).length;
                const colors: Record<string, string> = {
                  'Đã đón': 'bg-emerald-500',
                  'Chưa đón': 'bg-slate-300',
                  'Đón muộn': 'bg-amber-500',
                  'Đón thay': 'bg-blue-500',
                  'Bất thường': 'bg-red-500',
                };
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 dark:text-slate-400 w-24 shrink-0">{status}</span>
                    <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                      <div
                        className={`h-full ${colors[status]} rounded transition-all`}
                        style={{ width: `${(count / PICKUP_RECORDS.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
