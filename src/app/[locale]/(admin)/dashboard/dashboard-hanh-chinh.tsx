'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  FileCheck, 
  Users, 
  UserCheck, 
  Calendar, 
  Wrench, 
  AlertTriangle,
  ClipboardList, 
  ArrowRight, 
  Plus, 
  Clock, 
  AlertCircle,
  Building,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { Badge } from '@/src/components/ui/badge';

export default function DashboardHanhChinh({ data, user }: { data: any; user: any }) {
  const params = useParams();
  const locale = (params?.locale as string) || 'vi';

  const pendingApprovals = data?.alerts?.pendingApprovalsCount || 0;
  const probation = data?.hrmStats?.probation || 0;
  const expiringContracts = data?.alerts?.expiringContractsCount || 0;
  const leaveToday = data?.hrmStats?.leaveToday || 0;
  const totalEmployees = data?.hrmStats?.total || 0;
  const missingDocs = data?.hrmStats?.missingDocs || 0;

  // Logistics / Asset stats
  const totalAssets = data?.logisticsStats?.totalAssets || 0;
  const brokenAssets = data?.logisticsStats?.brokenAssets || 0;
  const repairRequests = data?.logisticsStats?.repairRequests || 0;
  const lowStockSupplies = data?.logisticsStats?.lowStockSupplies || 0;

  const kpis = [
    { 
      label: 'Đơn chờ duyệt', 
      value: pendingApprovals, 
      icon: FileCheck, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50 dark:bg-rose-950/40', 
      href: `/${locale}/approvals` 
    },
    { 
      label: 'Đang thử việc', 
      value: probation, 
      icon: Users, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50 dark:bg-amber-950/40', 
      href: `/${locale}/hrm` 
    },
    { 
      label: 'HĐ sắp hết hạn', 
      value: expiringContracts, 
      icon: UserCheck, 
      color: 'text-red-600', 
      bg: 'bg-red-50 dark:bg-red-950/40', 
      href: `/${locale}/hrm` 
    },
    { 
      label: 'Nghỉ phép hôm nay', 
      value: leaveToday, 
      icon: Calendar, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50 dark:bg-blue-950/40', 
      href: `/${locale}/hrm` 
    },
    { 
      label: 'Tổng nhân sự', 
      value: totalEmployees, 
      icon: ShieldCheck, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 dark:bg-emerald-950/40', 
      href: `/${locale}/hrm` 
    },
    { 
      label: 'Yêu cầu sửa chữa', 
      value: repairRequests, 
      icon: Wrench, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50 dark:bg-purple-950/40', 
      href: `/${locale}/facilities` 
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Hành chính - Nhân sự & Kế toán</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Chào, <strong>{user?.name}</strong> · {user?.title || 'Trưởng phòng Hành chính'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/approvals`}>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white gap-2 h-9">
              <FileCheck className="h-4 w-4" /> Phê duyệt đơn từ
            </Button>
          </Link>
          <Link href={`/${locale}/hrm`}>
            <Button variant="outline" className="gap-2 h-9">
              <Users className="h-4 w-4" /> Quản lý Nhân sự
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Link key={i} href={kpi.href} className="block group">
              <div className={cn(
                "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              )}>
                <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center mb-3", kpi.bg)}>
                  <Icon className={cn("h-4.5 w-4.5", kpi.color)} />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5 leading-tight">{kpi.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2 columns: Nhân sự chi tiết + Quản lý Cơ sở vật chất */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Nhân sự chi tiết */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3 border-b dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-rose-600" />
                Giám sát Nhân sự & Đơn từ
              </CardTitle>
              <Link href={`/${locale}/hrm`}>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 gap-1">
                  Đến HRM <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Hồ sơ nhân sự thiếu tài liệu pháp lý:</span>
                <Badge className="bg-amber-100 text-amber-800 font-bold border-0">
                  {missingDocs} hồ sơ cần bổ sung
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Hợp đồng thử việc đang chạy:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{probation} nhân viên</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Nhân sự nghỉ phép hôm nay:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{leaveToday} người</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-rose-500" /> Đơn xin nghỉ phép cần duyệt gấp:
              </span>
              <div className="text-xs flex justify-between items-center bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Cô Nguyễn Thị Mai</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Phòng Đào tạo • Nghỉ phép năm học</div>
                </div>
                <Link href={`/${locale}/approvals`}>
                  <Button size="sm" className="h-7 text-[11px] bg-rose-600 hover:bg-rose-700 text-white rounded-lg">
                    Duyệt ngay
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quản lý Cơ sở vật chất */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3 border-b dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-600" />
                Cơ sở vật chất & Vật tư (Logistics)
              </CardTitle>
              <Link href={`/${locale}/facilities`}>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 gap-1">
                  Đến CSVC <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5">
                <div className="text-xl font-black text-slate-900 dark:text-white">{totalAssets}</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Tổng tài sản</div>
              </div>
              <div className="rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 p-2.5">
                <div className="text-xl font-black text-red-650 dark:text-red-450">{brokenAssets}</div>
                <div className="text-[9px] font-bold text-red-500 uppercase mt-0.5">Hỏng/Mất</div>
              </div>
              <div className="rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 p-2.5">
                <div className="text-xl font-black text-amber-600 dark:text-amber-450">{lowStockSupplies}</div>
                <div className="text-[9px] font-bold text-amber-500 uppercase mt-0.5">Dưới định mức</div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/10 p-3.5">
              <div className="flex gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300">Nhắc nhở Vận hành thiết bị</h4>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
                    Có <strong>{repairRequests}</strong> yêu cầu sửa chữa đang ở trạng thái mở. Vui lòng rà soát tiến độ xử lý và phê chuẩn mua sắm vật tư thay thế nếu cần.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
