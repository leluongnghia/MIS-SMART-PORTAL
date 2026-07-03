'use client';

import React from 'react';
import { SparklineCard } from '@/src/components/ui/SparklineCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { SECURITY_KPI, SECURITY_INCIDENTS, CAMERAS } from '@/src/mockData/security';
import {
  Users, UserCheck, Clock, ShieldAlert, Video, VideoOff, Flame,
  TrendingUp, AlertTriangle, CheckCircle2, Shield,
} from 'lucide-react';

const severityColor: Record<string, string> = {
  'Khẩn cấp': 'bg-red-100 text-red-700 border-red-200',
  'Cao': 'bg-orange-100 text-orange-700 border-orange-200',
  'Trung bình': 'bg-amber-100 text-amber-700 border-amber-200',
  'Thấp': 'bg-slate-100 text-slate-700 border-slate-200',
};

const statusColor: Record<string, string> = {
  'Mới ghi nhận': 'bg-red-100 text-red-700',
  'Đang xử lý': 'bg-amber-100 text-amber-700',
  'Chờ xác minh': 'bg-blue-100 text-blue-700',
  'Đã xử lý': 'bg-emerald-100 text-emerald-700',
  'Đóng sự cố': 'bg-slate-100 text-slate-600',
};

export default function DashboardTab() {
  const openIncidents = SECURITY_INCIDENTS.filter(
    (i) => i.status !== 'Đã xử lý' && i.status !== 'Đóng sự cố'
  );
  const urgentIncidents = SECURITY_INCIDENTS.filter(
    (i) => (i.severity === 'Khẩn cấp' || i.severity === 'Cao') && i.status !== 'Đã xử lý' && i.status !== 'Đóng sự cố'
  );
  const errorCameras = CAMERAS.filter((c) => c.status !== 'Hoạt động');

  return (
    <div className="space-y-6 mt-6">
      {/* Urgent Alert Banner */}
      {urgentIncidents.length > 0 && (
        <div className="rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3 animate-pulse">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-red-700 dark:text-red-400">
              🚨 Cảnh báo khẩn cấp — {urgentIncidents.length} sự cố cần xử lý ngay
            </div>
            <div className="mt-1 space-y-1">
              {urgentIncidents.map((inc) => (
                <div key={inc.id} className="text-sm text-red-600 dark:text-red-300">
                  [{inc.severity}] {inc.type} — {inc.location} ({inc.occurredAt})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SparklineCard
          title="Khách trong trường"
          value={SECURITY_KPI.guestsInside.toString()}
          icon={<Users className="h-4 w-4 text-blue-500" />}
          trend="up"
          trendValue="8 hôm nay"
          data={[{ value: 3 }, { value: 5 }, { value: 7 }, { value: 6 }, { value: 8 }, { value: 9 }, { value: 8 }]}
          subtitle={`${SECURITY_KPI.guestsTodayIn} vào / ${SECURITY_KPI.guestsTodayOut} ra`}
          color="blue"
        />
        <SparklineCard
          title="Đón muộn hôm nay"
          value={SECURITY_KPI.latePickups.toString()}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          trend="up"
          trendValue="2 bất thường"
          data={[{ value: 1 }, { value: 2 }, { value: 1 }, { value: 3 }, { value: 2 }, { value: 4 }, { value: 4 }]}
          subtitle="Học sinh chưa về"
          color="amber"
        />
        <SparklineCard
          title="Sự cố chưa xử lý"
          value={openIncidents.length.toString()}
          icon={<ShieldAlert className="h-4 w-4 text-rose-500" />}
          trend="up"
          trendValue="1 khẩn cấp"
          data={[{ value: 1 }, { value: 2 }, { value: 1 }, { value: 3 }, { value: 4 }, { value: 3 }, { value: 3 }]}
          subtitle="Cần xử lý ngay"
          color="rose"
        />
        <SparklineCard
          title="Camera lỗi"
          value={errorCameras.length.toString()}
          icon={<VideoOff className="h-4 w-4 text-orange-500" />}
          trend="down"
          trendValue={`${CAMERAS.length - errorCameras.length}/${CAMERAS.length} OK`}
          data={[{ value: 1 }, { value: 1 }, { value: 2 }, { value: 2 }, { value: 3 }, { value: 2 }, { value: 2 }]}
          subtitle="Mất kết nối/Lỗi"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SparklineCard
          title="Ca trực đang hoạt động"
          value={SECURITY_KPI.activeShifts.toString()}
          icon={<Shield className="h-4 w-4 text-indigo-500" />}
          trend="up"
          trendValue="4 nhân sự"
          data={[{ value: 2 }, { value: 2 }, { value: 2 }, { value: 2 }, { value: 2 }, { value: 2 }, { value: 2 }]}
          subtitle="Ca sáng & chiều"
          color="indigo"
        />
        <SparklineCard
          title="PCCC cần kiểm tra"
          value={SECURITY_KPI.fireSafetyOverdue.toString()}
          icon={<Flame className="h-4 w-4 text-red-500" />}
          trend="up"
          trendValue="Quá hạn"
          data={[{ value: 0 }, { value: 0 }, { value: 0 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }]}
          subtitle="Thiết bị quá hạn KT"
          color="red"
        />
        <SparklineCard
          title="Khách ra/vào hôm nay"
          value={SECURITY_KPI.guestsTodayIn.toString()}
          icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
          trend="up"
          trendValue="+15%"
          data={[{ value: 10 }, { value: 12 }, { value: 15 }, { value: 18 }, { value: 20 }, { value: 21 }, { value: 23 }]}
          subtitle="Lượt vào hôm nay"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              Sự cố gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SECURITY_INCIDENTS.slice(0, 4).map((inc) => (
                <div
                  key={inc.id}
                  className={`p-3 rounded-lg border ${
                    inc.severity === 'Khẩn cấp'
                      ? 'bg-red-50 border-red-200 dark:bg-red-950/20'
                      : inc.severity === 'Cao'
                      ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20'
                      : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">{inc.type}</span>
                        <Badge className={`text-xs shrink-0 ${severityColor[inc.severity]}`}>
                          {inc.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">{inc.location} — {inc.occurredAt}</div>
                    </div>
                    <Badge className={`text-xs shrink-0 ${statusColor[inc.status]}`}>
                      {inc.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Camera Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-500" />
              Trạng thái Camera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {CAMERAS.slice(0, 6).map((cam) => (
                <div key={cam.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        cam.status === 'Hoạt động' ? 'bg-emerald-500' :
                        cam.status === 'Lỗi' ? 'bg-red-500' :
                        cam.status === 'Mất kết nối' ? 'bg-orange-500' :
                        'bg-slate-400'
                      }`}
                    />
                    <span className="text-sm truncate">{cam.name}</span>
                  </div>
                  <Badge
                    className={`text-xs shrink-0 ${
                      cam.status === 'Hoạt động' ? 'bg-emerald-100 text-emerald-700' :
                      cam.status === 'Lỗi' ? 'bg-red-100 text-red-700' :
                      cam.status === 'Mất kết nối' ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cam.status}
                  </Badge>
                </div>
              ))}
              <div className="pt-2 border-t text-xs text-slate-500 flex justify-between">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {CAMERAS.filter(c => c.status === 'Hoạt động').length} hoạt động</span>
                <span className="flex items-center gap-1"><VideoOff className="h-3 w-3 text-red-500" /> {errorCameras.length} có vấn đề</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
