'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { SparklineCard } from '@/src/components/ui/SparklineCard';
import { CLEANING_KPI } from '@/src/mockData/cleaning';
import { CheckCircle2, AlertTriangle, Clock, Target } from 'lucide-react';

export default function DashboardTab() {
  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SparklineCard
          title="Khu vực đạt chuẩn"
          value={`${CLEANING_KPI.areasPassed}/${CLEANING_KPI.areasChecked}`}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          trend="up"
          trendValue="2.5%"
          data={[{ value: 10 }, { value: 20 }, { value: 25 }, { value: 30 }, { value: 32 }, { value: 35 }, { value: 35 }]}
          subtitle="Khu vực đã kiểm tra"
          color="emerald"
        />
        <SparklineCard
          title="Hoàn thành lịch"
          value={`${CLEANING_KPI.completionRate}%`}
          icon={<Target className="h-4 w-4 text-blue-500" />}
          trend="up"
          trendValue="5.1%"
          data={[{ value: 50 }, { value: 60 }, { value: 65 }, { value: 68 }, { value: 70 }, { value: 71 }, { value: 70.8 }]}
          subtitle={`${CLEANING_KPI.schedulesCompleted}/${CLEANING_KPI.schedulesToday} ca`}
          color="blue"
        />
        <SparklineCard
          title="Sự cố đang xử lý"
          value={CLEANING_KPI.pendingIncidents.toString()}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          trend="down"
          trendValue="12%"
          data={[{ value: 5 }, { value: 8 }, { value: 12 }, { value: 10 }, { value: 15 }, { value: 11 }, { value: 12 }]}
          subtitle="Sự cố chưa hoàn thành"
          color="amber"
        />
        <SparklineCard
          title="Sự cố khẩn cấp"
          value={CLEANING_KPI.criticalIncidents.toString()}
          icon={<AlertTriangle className="h-4 w-4 text-rose-500" />}
          trend="down"
          trendValue="50%"
          data={[{ value: 0 }, { value: 1 }, { value: 0 }, { value: 0 }, { value: 1 }, { value: 2 }, { value: 2 }]}
          subtitle="Cần xử lý ngay"
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Khu vực cần lưu ý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-rose-50 dark:bg-rose-900/10 rounded-lg">
                <div>
                  <div className="font-medium text-rose-700 dark:text-rose-400">Nhà vệ sinh nữ tầng 2</div>
                  <div className="text-sm text-rose-600/80">Có mùi khai nồng nặc (Khẩn cấp)</div>
                </div>
                <div className="text-sm font-medium text-rose-700">Đang xử lý</div>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                <div>
                  <div className="font-medium text-amber-700 dark:text-amber-400">Phòng Lab Hóa</div>
                  <div className="text-sm text-amber-600/80">Không đạt chuẩn vệ sinh hôm nay</div>
                </div>
                <div className="text-sm font-medium text-amber-700">Cần làm lại</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiến độ ca trực hiện tại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Ca Sáng (06:00 - 11:30)</span>
                  <span className="text-slate-500">85%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Ca Chiều (13:00 - 17:30)</span>
                  <span className="text-slate-500">10%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
