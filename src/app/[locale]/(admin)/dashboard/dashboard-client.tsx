'use client';
import { serverStorage } from '../../../../libs/client/server-storage';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from "@/src/lib/utils";
import { MOCK_USERS } from '@/src/mockData';
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  LineChart,
  ShieldAlert,
  Target,
  Users,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  ComposedChart
} from 'recharts';

// Data mock for chart
const performanceData = [
  { month: '12/2024', total: 40, admission: 30, attendance: 60 },
  { month: '01/2025', total: 55, admission: 45, attendance: 68 },
  { month: '02/2025', total: 60, admission: 43, attendance: 65 },
  { month: '03/2025', total: 65, admission: 58, attendance: 75 },
  { month: '04/2025', total: 72, admission: 63, attendance: 80 },
  { month: '05/2025', total: 83.4, admission: 71.8, attendance: 94.2 },
];

export default function DashboardClient({ tab, initialData }: { tab?: string, initialData?: any }) {
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [isReady, setIsReady] = React.useState(false);
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const params = useParams();
  const locale = (params?.locale as string) || 'vi';
  const router = useRouter();

  React.useEffect(() => {
    const loggedIn = serverStorage.getItem("mis_edutask_logged_in") === "true";
    const savedUserId = serverStorage.getItem("mis_edutask_logged_in_user_id");
    if (loggedIn && savedUserId) {
      import("@/src/mockData").then(({ MOCK_USERS }) => {
        const matched = MOCK_USERS.find(u => u.id === savedUserId);
        if (matched) setCurrentUser(matched);
      });
    }
    setIsReady(true);
  }, []);

  // Use real data from DB, fall back to empty arrays
  const recentActivities: any[] = initialData?.recentActivities || [];
  const risks: any[] = initialData?.risks || [];
  const priorityTasks: any[] = initialData?.actionCenter?.priorityTasks || [];

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bảng điều khiển điều hành
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tổng quan tức thời về hoạt động và hiệu quả của nhà trường
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select className="block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
              <option>Thứ Sáu, 16/05/2025</option>
            </select>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setShowSettingsModal(true)}>
            <SettingsIcon className="h-4 w-4" />
            Tùy chỉnh
          </Button>
        </div>
      </div>

      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-[450px] shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Tùy chỉnh Dashboard</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowSettingsModal(false)}><span className="text-slate-400">✕</span></Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Bật/tắt các widget hiển thị trên bảng điều khiển của bạn.</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50">
                    <span className="text-sm font-medium">Top Alerts (Cảnh báo)</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50">
                    <span className="text-sm font-medium">OKRs & KPI</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50">
                    <span className="text-sm font-medium">Action Center</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSettingsModal(false)}>Hủy</Button>
                  <Button onClick={() => setShowSettingsModal(false)} className="bg-blue-600">Lưu thay đổi</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-red-500 p-3 text-white">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Công việc quá hạn</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-red-700 dark:text-red-300">{initialData?.alerts?.overdueTasksCount || 0}</h3>
                  <span className="text-xs font-medium text-red-500">↑ 8 so với tuần trước</span>
                </div>
              </div>
            </div>
            <Link href={`/${locale}/tasks`}><Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 hover:text-red-700">Xem chi tiết</Button></Link>
          </CardContent>
        </Card>

        <Card className="border-orange-100 bg-orange-50/50 dark:border-orange-900/30 dark:bg-orange-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-orange-500 p-3 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Phê duyệt tồn &gt; 7 ngày</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-orange-700 dark:text-orange-300">{initialData?.alerts?.pendingApprovalsCount || 0}</h3>
                  <span className="text-xs font-medium text-orange-500">↑ 5 so với tuần trước</span>
                </div>
              </div>
            </div>
            <Link href={`/${locale}/approvals`}><Button variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-100 hover:text-orange-700">Xem chi tiết</Button></Link>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-rose-600 p-3 text-white">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Rủi ro nghiêm trọng</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-rose-700 dark:text-rose-300">{initialData?.alerts?.severeRisksCount || 0}</h3>
                  <span className="text-xs font-medium text-rose-500">↑ 2 so với tuần trước</span>
                </div>
              </div>
            </div>
            <Link href={`/${locale}/risk`}><Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-100 hover:text-rose-700">Xem chi tiết</Button></Link>
          </CardContent>
        </Card>
      </div>

      {/* OKRs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Tuyển sinh', val: 72, target: '1.200 HS', actual: '864 HS', color: 'text-blue-600', status: 'Đang tốt', statusColor: 'text-emerald-500', href: 'leads' },
          { title: 'Đào tạo', val: 68, target: '95%', actual: '64.6%', color: 'text-blue-500', status: 'Đang tốt', statusColor: 'text-emerald-500', href: 'reports' },
          { title: 'Nhân sự', val: 85, target: '100%', actual: '85%', color: 'text-blue-600', status: 'Đang tốt', statusColor: 'text-emerald-500', href: 'hrm' },
          { title: 'Vận hành', val: 61, target: '100%', actual: '61%', color: 'text-blue-500', status: 'Cần cải thiện', statusColor: 'text-orange-500', href: 'tasks' },
        ].map((okr, i) => (
          <Link key={i} href={`/${locale}/${okr.href}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{okr.title}</h4>
                  <p className="text-xs text-slate-500">OKR Q2/2025</p>
                </div>
                <ChevronRight className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex items-center gap-4">
                {/* SVG Radial Progress */}
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={okr.color}
                      strokeDasharray={`${okr.val}, 100`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {okr.val}%
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  <div className="text-slate-500">Tiến độ</div>
                  <div className="font-bold text-base">{okr.val}%</div>
                  <div className="text-slate-500">Mục tiêu: {okr.target}</div>
                  <div className="text-slate-500">Thực tế: {okr.actual}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
                <div className={cn("h-2 w-2 rounded-full", okr.status === 'Đang tốt' ? 'bg-emerald-500' : 'bg-orange-500')} />
                <span className={okr.statusColor}>{okr.status}</span>
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>

      {/* KPI mini stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'KPI toàn trường', val: '83.4', up: '6.2', icon: LineChart, color: 'bg-blue-600' },
          { title: 'Tuyển sinh', val: '71.8', up: '5.1', icon: Users, color: 'bg-indigo-500' },
          { title: 'Giáo viên', val: '88.6', up: '7.3', icon: Target, color: 'bg-blue-500' },
          { title: 'Học sinh', val: '82.1', up: '4.8', icon: GraduationCap, color: 'bg-slate-700' },
        ].map((kpi, i) => (
          <Link key={i} href={`/${locale}/kpi`} className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn("h-10 w-10 shrink-0 rounded-lg flex items-center justify-center text-white", kpi.color)}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 truncate">{kpi.title}</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{kpi.val}</h4>
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">↑ {kpi.up} điểm so với tháng trước</p>
                </div>
                <ChevronRight className="h-4 w-4 text-blue-400 dark:text-blue-500" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Action Center */}
        <Card className="xl:col-span-1">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Action Center <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">8</span></CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 flex justify-between">
              <span>Phê duyệt khẩn cấp</span>
                <Link href={`/${locale}/approvals`} className="text-blue-600 font-medium">Xem tất cả</Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { task: 'Đề xuất mua sắm thiết bị phòng Tin học', dept: 'Phòng CNTT', tag: 'Quá hạn 2 ngày', href: `/${locale}/approvals` },
                { task: 'Kế hoạch ngoại khóa Khối 11', dept: 'Đoàn trường', tag: 'Quá hạn 1 ngày', href: `/${locale}/approvals` },
                { task: 'Điều chỉnh phân công giảng dạy HKII', dept: 'Phòng Đào tạo', tag: 'Hôm nay', tagColor: 'bg-orange-100 text-orange-600', href: `/${locale}/approvals` }
              ].map((act, i) => (
                <Link key={i} href={act.href} className="p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors block">
                  <div className="mt-0.5"><CheckSquare className="h-4 w-4 text-slate-400" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight mb-1">{act.task}</p>
                    <p className="text-xs text-slate-500">{act.dept}</p>
                  </div>
                  <Badge  className={cn("shrink-0 text-[10px] font-medium border-0", act.tagColor || "bg-red-100 text-red-600")}>
                    {act.tag}
                  </Badge>
                </Link>
              ))}
            </div>

            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 flex justify-between border-t border-slate-100 dark:border-slate-800">
              <span>Công việc ưu tiên</span>
                <Link href={`/${locale}/tasks`} className="text-blue-600 font-medium">Xem tất cả</Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {priorityTasks.length > 0 ? priorityTasks.map((act: any, i: number) => (
                <Link key={i} href={`/${locale}/tasks`} className="p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors block">
                  <div className="mt-0.5"><CheckSquare className="h-4 w-4 text-slate-400" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight mb-1">{act.task}</p>
                    <p className="text-xs text-slate-500">{act.dept}</p>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{act.date}</span>
                </Link>
              )) : [
                { task: 'Báo cáo tài chính Quý II/2025', dept: 'Phòng Tài chính', date: '20/05/2025' },
                { task: 'Rà soát hồ sơ học sinh lớp 10', dept: 'Phòng Tuyển sinh', date: '19/05/2025' },
              ].map((act, i) => (
                <Link key={i} href={`/${locale}/tasks`} className="p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors block">
                  <div className="mt-0.5"><CheckSquare className="h-4 w-4 text-slate-400" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight mb-1">{act.task}</p>
                    <p className="text-xs text-slate-500">{act.dept}</p>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{act.date}</span>
                </Link>
              ))}
            </div>
            <div className="p-3 text-center border-t border-slate-100 dark:border-slate-800">
              <Link href={`/${locale}/tasks`} className="block w-full"><Button variant="ghost" className="w-full text-sm text-blue-600">Xem tất cả công việc <ChevronRight className="h-4 w-4 ml-1" /></Button></Link>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  Xu hướng hiệu quả <AlertCircle className="h-4 w-4 text-slate-400" />
                </CardTitle>
                <select className="text-xs border-slate-200 rounded-md bg-transparent">
                  <option>6 tháng qua</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[250px] min-h-[250px] w-full min-w-0">
                <ResponsiveContainer width="100%" height={250} debounce={150}>
                  <ComposedChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} name="Hiệu quả toàn trường" />
                    <Line type="monotone" dataKey="admission" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Tuyển sinh" />
                    <Line type="monotone" dataKey="attendance" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="3 3" name="Tỷ lệ chuyên cần" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Hiệu quả TB 6 tháng</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">78.6%</span>
                    <span className="text-xs text-emerald-500 font-medium">↑ 5.4%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tuyển sinh TB 6 tháng</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-500">64.2%</span>
                    <span className="text-xs text-emerald-500 font-medium">↑ 6.7%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tỷ lệ chuyên cần TB 6 tháng</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-sky-500">92.1%</span>
                    <span className="text-xs text-emerald-500 font-medium">↑ 2.9%</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Link href={`/${locale}/reports`}><Button variant="ghost" className="text-sm text-blue-600 h-auto p-0">Xem phân tích chi tiết <ChevronRight className="h-4 w-4 ml-1" /></Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card className="xl:col-span-1">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Hoạt động gần đây</CardTitle>
                <Link href={`/${locale}/events`} className="text-xs font-medium text-blue-600">Xem tất cả</Link>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              {(recentActivities.length > 0 ? recentActivities : [
                { time: '16/05/2025 09:24', text: 'Nguyễn Văn Nam đã phê duyệt Kế hoạch dạy học HKII', dept: 'Phòng Đào tạo' },
                { time: '16/05/2025 08:15', text: 'Phê duyệt đề xuất mua sắm 30 bộ máy tính', dept: 'Phòng Tài chính' },
                { time: '15/05/2025 17:30', text: 'Cập nhật điểm danh học sinh 11A1', dept: 'GVCN - Trần Thị Mai' },
                { time: '15/05/2025 16:45', text: 'Đăng thông báo: Lịch thi thử THPTQG đợt 2', dept: 'Phòng Đào tạo' },
                { time: '15/05/2025 14:12', text: 'Hệ thống tự động sao lưu dữ liệu thành công', dept: 'Hệ thống' },
              ]).map((act: any, i: number) => (
                <div key={i} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full bg-blue-600 border-[2px] border-white dark:border-slate-950 z-10" />
                  {/* Timeline line */}
                  {i !== 4 && <div className="absolute left-1 top-3 h-full w-[1px] bg-slate-200 dark:bg-slate-800" />}
                  
                  <div className="text-xs text-slate-400 mb-1">{act.time}</div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight mb-1">{act.text}</div>
                  <div className="text-xs text-slate-500">{act.dept}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
      
      {/* Risk and Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mock Risk Heatmap */}
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              Risk Heatmap <AlertCircle className="h-4 w-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col md:flex-row gap-6">
            
  <div className="flex-1 w-full h-full flex gap-2">
    <div className="flex flex-col justify-around text-[10px] text-slate-500 font-medium text-right pr-2">
      <span>Tài chính</span>
      <span>Hoạt động</span>
      <span>Nhân sự</span>
      <span>Tuân thủ</span>
      <span>Danh tiếng</span>
    </div>
    <div className="flex-1 flex flex-col">
      <div className="flex-1 grid grid-rows-5 grid-cols-5 gap-1 mb-2">
        {(initialData?.heatmapData || Array(5).fill(Array(5).fill(0))).map((row, rIdx) => 
          row.map((val, cIdx) => {
            let bgClass = "bg-emerald-100";
            if (cIdx === 0) bgClass = "bg-emerald-200 dark:bg-emerald-900";
            if (cIdx === 1) bgClass = "bg-emerald-300 dark:bg-emerald-800";
            if (cIdx === 2) bgClass = "bg-yellow-300 dark:bg-yellow-800";
            if (cIdx === 3) bgClass = "bg-orange-400 dark:bg-orange-800";
            if (cIdx === 4) bgClass = "bg-red-500 dark:bg-red-800";
            
            // Override matrix logic for bottom left vs top right
            const score = rIdx + cIdx;
            if (score <= 2) bgClass = "bg-emerald-200 dark:bg-emerald-900";
            else if (score <= 4) bgClass = "bg-yellow-300 dark:bg-yellow-800";
            else if (score <= 6) bgClass = "bg-orange-400 dark:bg-orange-800";
            else bgClass = "bg-red-500 dark:bg-red-800";

            return (
              <div key={rIdx+"-"+cIdx} className={`rounded flex items-center justify-center text-[10px] font-bold text-slate-800 dark:text-slate-100 ${bgClass}`}>
                {val > 0 ? val : ""}
              </div>
            );
          })
        )}
      </div>
      <div className="grid grid-cols-5 gap-1 text-[10px] text-center text-slate-500 font-medium">
        <span>Rất thấp</span>
        <span>Thấp</span>
        <span>TB</span>
        <span>Cao</span>
        <span>Rất cao</span>
      </div>
    </div>
  </div>

            <div className="flex-1 space-y-4">
               <div className="flex justify-between items-end mb-2">
                 <h4 className="text-sm font-bold">Rủi ro nổi bật</h4>
                  <Link href={`/${locale}/risk`} className="text-xs text-blue-600 font-medium">Xem tất cả</Link>
               </div>
               <div className="space-y-3">
                 {(risks.length > 0 ? risks : [
                   { id: '3', text: 'Rủi ro về thiếu GV bộ môn Toán', tag: 'Cao' },
                   { id: '2', text: 'Tiến độ tuyển sinh thấp hơn kế hoạch', tag: 'Cao' },
                   { id: '1', text: 'Chậm phê duyệt thanh toán', tag: 'Trung bình', tagColor: 'bg-orange-100 text-orange-600' },
                 ]).map((r: any, i: number) => (
                   <div key={i} className="flex items-center justify-between gap-3">
                     <div className="flex items-center gap-2 min-w-0">
                       <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0", r.tag === 'Cao' ? 'bg-orange-500' : 'bg-yellow-500')}>
                         {r.id}
                       </div>
                       <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{r.text}</span>
                     </div>
                     <Badge  className={cn("border-0 shrink-0", r.tagColor || "bg-red-100 text-red-600")}>
                       {r.tag}
                     </Badge>
                   </div>
                 ))}
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Funnel */}
        <Card>
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Phễu tuyển sinh nhanh</CardTitle>
            <select className="text-xs border-slate-200 rounded-md bg-transparent">
              <option>Năm học 2025 - 2026</option>
            </select>
          </CardHeader>
          <CardContent className="p-4">
            
  <div className="flex w-full h-[220px] mb-4 gap-6">
    {/* Visual Funnel */}
    <div className="flex-1 flex flex-col justify-center gap-1">
      {(initialData?.funnel || []).map((stage, i) => {
        const widths = ["100%", "85%", "70%", "55%", "40%"];
        const opacities = ["opacity-100", "opacity-80", "opacity-60", "opacity-40", "opacity-30"];
        return (
          <div key={i} className="flex justify-center w-full">
            <div 
              className={`bg-blue-600 ${opacities[i]} flex items-center justify-center text-white text-xs font-bold transition-all`} 
              style={{ width: widths[i], height: "30px", clipPath: "polygon(5% 0, 95% 0, 100% 100%, 0% 100%)" }}
            />
          </div>
        );
      })}
    </div>
    
    {/* Data Table */}
    <div className="flex-1 flex flex-col justify-center divide-y divide-slate-100 dark:divide-slate-800">
      {(initialData?.funnel || []).map((stage, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-blue-600`} />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{stage.label}</span>
          </div>
          <div className="flex gap-4 text-xs font-bold">
            <span className="text-slate-900 dark:text-slate-100 w-8 text-right">{stage.value}</span>
            <span className="text-slate-500 w-10 text-right">{stage.pct}</span>
          </div>
        </div>
      ))}
    </div>
  </div>

            <div className="text-center">
              <Link href={`/${locale}/admissions`}><Button variant="ghost" className="text-sm text-blue-600">Xem chi tiết phễu tuyển sinh <ChevronRight className="h-4 w-4 ml-1" /></Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CheckSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

