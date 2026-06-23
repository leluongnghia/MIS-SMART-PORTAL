'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from "@/src/lib/utils";
import { serverStorage } from '../../../../libs/client/server-storage';
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  Users,
  GraduationCap,
  TrendingUp,
  Settings,
  Plus,
  Search,
  CheckCircle,
  HelpCircle,
  FileSpreadsheet,
  AlertCircle,
  ClipboardList,
  ShieldAlert,
  SlidersHorizontal,
  Wrench,
  FileCheck,
  Building,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';

interface DashboardClientProps {
  tab?: string;
  initialData?: any;
}

export default function DashboardClient({ tab, initialData }: DashboardClientProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [selectedTime, setSelectedTime] = useState('30d');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const params = useParams();
  const locale = (params?.locale as string) || 'vi';

  useEffect(() => {
    const loggedIn = serverStorage.getItem("mis_edutask_logged_in") === "true";
    const savedUserId = serverStorage.getItem("mis_edutask_logged_in_user_id");
    if (loggedIn && savedUserId) {
      import("@/src/mockData").then(({ MOCK_USERS }) => {
        const matched = MOCK_USERS.find(u => u.id === savedUserId);
        if (matched) {
          setCurrentUser(matched);
          // Auto-limit department for department heads (MANAGER)
          if (matched.role === 'MANAGER' && matched.workspaceId) {
            setSelectedDept(matched.workspaceId);
          }
        }
      });
    }
    setIsReady(true);
  }, []);

  // Filter multiplier helper based on selected filters (time & dept)
  const filterFactor = useMemo(() => {
    let factor = 1.0;
    if (selectedTime === 'today') factor *= 0.15;
    else if (selectedTime === '7d') factor *= 0.45;
    else if (selectedTime === 'semester') factor *= 1.8;
    else if (selectedTime === 'year') factor *= 3.0;

    if (selectedDept !== 'ALL') {
      factor *= 0.25; // Narrow department scope reduces overall counts
    }
    return factor;
  }, [selectedTime, selectedDept]);

  const scaleValue = (val: number, min = 0) => {
    const result = Math.round(val * filterFactor);
    return result < min ? min : result;
  };

  // Base raw stats
  const baseAlerts = initialData?.alerts || {};
  const baseHrm = initialData?.hrmStats || {};
  const baseLogistics = initialData?.logisticsStats || {};
  const baseRisk = initialData?.riskStats || {};
  const baseParent = initialData?.parentCareStats || {};
  const baseDoc = initialData?.documentStats || {};
  const baseDirectives = initialData?.directivesStats || { total: 0, inProgress: 0, completed: 0, pendingFeedback: 0, list: [] };

  // Calculate filtered counts for 12 KPIs
  const kpiStats = useMemo(() => {
    return {
      openTasks: scaleValue(baseAlerts.openTasksCount || 18, 1),
      overdueTasks: scaleValue(baseAlerts.overdueTasksCount || 4, 0),
      pendingDirectives: scaleValue(baseDirectives.pendingFeedback || 3, 0),
      pendingApprovals: scaleValue(baseAlerts.pendingApprovalsCount || 5, 0),
      openTickets: scaleValue(baseAlerts.openParentTicketsCount || 8, 0),
      overdueTickets: scaleValue(baseAlerts.overdueParentTicketsCount || 2, 0),
      severeRisks: scaleValue(baseAlerts.severeRisksCount || 3, 0),
      overdueCapas: scaleValue(baseAlerts.overdueCapasCount || 2, 0),
      openRepairs: scaleValue(baseAlerts.openRepairRequestsCount || 3, 0),
      expiringContracts: scaleValue(baseAlerts.expiringContractsCount || 2, 0),
      upcomingEvents: scaleValue(baseAlerts.upcomingEventsCount || 4, 0),
      docsReview: scaleValue(baseAlerts.documentsToReviewCount || 3, 0),
    };
  }, [baseAlerts, baseDirectives, filterFactor]);

  // Priority warning center list filtering
  const filteredAlerts = useMemo(() => {
    const alerts = initialData?.actionCenter?.priorityAlerts || [];
    return alerts
      .filter((a: any) => {
        if (selectedDept === 'ALL') return true;
        // Simple mapping from dept filter to alert module
        const moduleMap: Record<string, string[]> = {
          'BGH': ['Chỉ đạo', 'Phê duyệt'],
          'TOAN_TIN': ['Công việc', 'Văn bản'],
          'DAO_TAO': ['Công việc', 'Văn bản'],
          'HCNS': ['Nhân sự', 'Phê duyệt'],
          'CSVC': ['Tài sản'],
          'KHOA_HOC': ['Công việc'],
        };
        return moduleMap[selectedDept]?.includes(a.module) ?? true;
      })
      .map((a: any) => ({
        ...a,
        // Adapt target URLs based on selected locale
        targetUrl: a.targetUrl ? a.targetUrl.replace('/vi/', `/${locale}/`) : `/${locale}/dashboard`
      }));
  }, [initialData, selectedDept, locale]);

  if (!isReady) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-sm border-2 border-slate-700 border-t-transparent mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Đang khởi tạo hệ thống quản trị...</p>
        </div>
      </div>
    );
  }

  // Render personal workspace for STAFF (Giáo viên / Nhân viên)
  if (currentUser && currentUser.role === 'STAFF') {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-sm text-white flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Chào mừng quay lại, {currentUser.name}</h2>
            <p className="text-xs text-slate-400">Không gian làm việc cá nhân • Chức vụ: {currentUser.title || 'Giáo viên'}</p>
          </div>
          <Badge className="bg-slate-800 border-slate-700 text-slate-300">Giao diện Giáo viên / Nhân viên</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300">Nhiệm vụ cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">6</div>
              <p className="text-xs text-slate-500 mt-1">4 đang mở • 2 quá hạn</p>
              <div className="mt-4">
                <Link href={`/${locale}/tasks`}>
                  <Button variant="outline" size="sm" className="w-full text-xs rounded-sm">Xem danh sách</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300">Đơn từ của tôi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">2</div>
              <p className="text-xs text-slate-500 mt-1">1 đang chờ duyệt • 1 đã duyệt</p>
              <div className="mt-4">
                <Link href={`/${locale}/approvals`}>
                  <Button variant="outline" size="sm" className="w-full text-xs rounded-sm">Đăng ký nghỉ phép / Yêu cầu</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300">Tri thức & Tài liệu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">24</div>
              <p className="text-xs text-slate-500 mt-1">SOPs trường học đang hiệu lực</p>
              <div className="mt-4">
                <Link href={`/${locale}/knowledge`}>
                  <Button variant="outline" size="sm" className="w-full text-xs rounded-sm">Tra cứu quy trình</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-100 bg-amber-50/20 dark:border-amber-900/30 dark:bg-amber-950/10 rounded-sm p-5">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Thông tin giới hạn quyền truy cập</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                Bạn đang truy cập hệ thống với tư cách là Giáo viên/Nhân viên. Bảng điều khiển điều hành BGH và các báo cáo tổng hợp tài chính, nhân sự, kiểm soát nội bộ toàn trường chỉ mở cho Ban Giám Hiệu và các Trưởng bộ phận quản lý. Vui lòng liên hệ Quản trị viên nếu cần cấp thêm quyền.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Bảng Điều Hành Chỉ Đạo & Giám Sát BGH
            </h1>
            <Badge className="bg-slate-100 text-slate-800 border-0 rounded-sm font-bold text-[10px] uppercase tracking-wider">
              {currentUser?.role === 'ADMIN' ? 'BGH Executive' : `Trưởng phòng: ${currentUser?.workspaceId || ''}`}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Trung tâm kiểm soát vận hành, rủi ro, tài sản, nhân sự và chỉ đạo hành chính đa kênh MIS.
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 rounded-sm shadow-inner">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-bold px-2 border-r border-slate-200 dark:border-slate-800">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>LỌC:</span>
          </div>

          {/* Time Period Filter */}
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="text-xs border-0 py-1 pl-2 pr-8 bg-transparent text-slate-800 dark:text-slate-200 font-bold focus:ring-0 cursor-pointer"
          >
            <option value="today">Hôm nay</option>
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="semester">Học kỳ này</option>
            <option value="year">Cả năm học</option>
          </select>

          {/* Department Filter (Only enabled for ADMIN/BGH, manager locked to their own dept) */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            disabled={currentUser?.role !== 'ADMIN'}
            className={cn(
              "text-xs border-0 py-1 pl-2 pr-8 bg-transparent text-slate-800 dark:text-slate-200 font-bold focus:ring-0 cursor-pointer border-l border-slate-200 dark:border-slate-800",
              currentUser?.role !== 'ADMIN' && "opacity-60 cursor-not-allowed"
            )}
          >
            <option value="ALL">Tất cả Phòng ban</option>
            <option value="BGH">Ban Giám Hiệu</option>
            <option value="TOAN_TIN">Tổ Toán - Tin học</option>
            <option value="DAO_TAO">Phòng Đào tạo</option>
            <option value="HCNS">Hành chính Nhân sự</option>
            <option value="CSVC">Cơ sở vật chất</option>
            <option value="KHOA_HOC">Tổ Khoa học Tự nhiên</option>
          </select>
        </div>
      </div>

      {/* 1. Thanh KPI Toàn Trường (12 cards layout) */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {[
          { label: 'Việc đang mở', count: kpiStats.openTasks, color: 'border-slate-300 dark:border-slate-800 hover:border-slate-400 text-slate-700', path: '/tasks' },
          { label: 'Việc quá hạn', count: kpiStats.overdueTasks, color: 'border-red-200 bg-red-50/10 hover:border-red-300 text-red-600 dark:text-red-400', path: '/tasks' },
          { label: 'Chỉ đạo chưa xong', count: kpiStats.pendingDirectives, color: 'border-amber-200 bg-amber-50/10 hover:border-amber-300 text-amber-700 dark:text-amber-400', path: '/directives' },
          { label: 'Đơn chờ duyệt', count: kpiStats.pendingApprovals, color: 'border-cyan-200 bg-cyan-50/10 hover:border-cyan-300 text-cyan-700 dark:text-cyan-400', path: '/approvals' },
          { label: 'Ticket phụ huynh mở', count: kpiStats.openTickets, color: 'border-slate-300 hover:border-slate-400 text-slate-600', path: '/events' },
          { label: 'Ticket quá hạn SLA', count: kpiStats.overdueTickets, color: 'border-red-200 bg-red-50/10 hover:border-red-300 text-red-600 dark:text-red-400', path: '/events' },
          { label: 'Rủi ro nghiêm trọng', count: kpiStats.severeRisks, color: 'border-red-300 bg-red-50/20 hover:border-red-400 text-red-700 dark:text-red-400', path: '/risk' },
          { label: 'CAPA quá hạn', count: kpiStats.overdueCapas, color: 'border-red-200 bg-red-50/10 hover:border-red-300 text-red-600 dark:text-red-400', path: '/risk' },
          { label: 'Sửa chữa đang mở', count: kpiStats.openRepairs, color: 'border-amber-200 hover:border-amber-300 text-amber-600', path: '/facilities' },
          { label: 'Hợp đồng sắp hết hạn', count: kpiStats.expiringContracts, color: 'border-slate-300 hover:border-slate-400 text-slate-600', path: '/hrm' },
          { label: 'Sự kiện sắp tới', count: kpiStats.upcomingEvents, color: 'border-emerald-200 bg-emerald-50/10 hover:border-emerald-300 text-emerald-700 dark:text-emerald-400', path: '/events' },
          { label: 'Tài liệu cần rà soát', count: kpiStats.docsReview, color: 'border-amber-200 bg-amber-50/10 hover:border-amber-300 text-amber-700 dark:text-amber-400', path: '/knowledge' },
        ].map((item, i) => (
          <Link key={i} href={`/${locale}${item.path}`} className="block">
            <div className={cn(
              "p-3.5 border rounded-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer bg-white dark:bg-slate-950 flex flex-col justify-between h-24",
              item.color
            )}>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider leading-tight">{item.label}</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black">{item.count}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 2. Cảnh báo ưu tiên (Cần xử lý ngay) */}
      <Card className="border-red-200 bg-red-50/5 dark:border-red-950/20 dark:bg-red-950/5 rounded-sm">
        <CardHeader className="pb-3 border-b border-red-100 dark:border-red-950/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-red-600 text-white rounded-sm flex items-center justify-center">
              <AlertTriangle className="h-3 w-3" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-red-800 dark:text-red-300">Cần Xử Lý Ngay (Warning Center)</CardTitle>
              <CardDescription className="text-xs text-red-700/70 dark:text-red-400/60 mt-0.5">
                Các sự vụ nghiêm trọng, chỉ số quá hạn cần chỉ đạo giải quyết khẩn cấp.
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-red-100 text-red-800 border-0 font-bold rounded-sm text-[10px]">
            {filteredAlerts.length} cảnh báo
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-red-100/30 dark:bg-red-950/20 text-[10px] uppercase font-bold text-red-800/80 dark:text-red-400 border-b border-red-100 dark:border-red-950/20">
                  <th className="py-2.5 px-4">Tiêu đề cảnh báo</th>
                  <th className="py-2.5 px-4 w-28">Nguồn</th>
                  <th className="py-2.5 px-4 w-28 text-center">Độ nghiêm trọng</th>
                  <th className="py-2.5 px-4 w-40">Phụ trách</th>
                  <th className="py-2.5 px-4 w-28">Hạn xử lý</th>
                  <th className="py-2.5 px-4 w-24 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100/20 dark:divide-red-950/20">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert: any) => (
                    <tr key={alert.id} className="hover:bg-red-100/10 dark:hover:bg-red-950/10 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {alert.title}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="border-red-200 text-red-700 bg-red-100/10 text-[9px] rounded-sm uppercase tracking-wide">
                          {alert.module}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wide",
                          alert.severity === 'Nghiêm trọng' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                        )}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {alert.owner}
                      </td>
                      <td className="py-3 px-4 font-bold text-red-600 dark:text-red-400">
                        {alert.deadline}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={alert.targetUrl || '#'}>
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] text-red-700 hover:text-white hover:bg-red-600 px-2 rounded-sm border border-red-200">
                            Xử lý
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      Không có cảnh báo khẩn cấp nào thuộc phạm vi lựa chọn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 3. Detailed widgets layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* SECTION A: CHỈ ĐẠO BGH */}
        <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
              <div>
                <CardTitle className="text-sm font-bold">Chỉ Đạo Ban Giám Hiệu (Directives)</CardTitle>
                <CardDescription className="text-xs">Theo dõi tiến trình triển khai chỉ thị và nghị quyết BGH</CardDescription>
              </div>
            </div>
            <Link href={`/${locale}/directives`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-800">
                Mở rộng <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-sm">
                <div className="text-lg font-black text-slate-900 dark:text-white">{baseDirectives.total}</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">Tổng chỉ đạo</div>
              </div>
              <div className="p-2 bg-amber-50/30 border border-amber-100 rounded-sm">
                <div className="text-lg font-black text-amber-700">{baseDirectives.inProgress}</div>
                <div className="text-[9px] font-bold text-amber-600 uppercase">Đang làm</div>
              </div>
              <div className="p-2 bg-emerald-50/30 border border-emerald-100 rounded-sm">
                <div className="text-lg font-black text-emerald-700">{baseDirectives.completed}</div>
                <div className="text-[9px] font-bold text-emerald-600 uppercase">Đã xong</div>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-sm">
                <div className="text-lg font-black text-slate-700 dark:text-slate-300">{baseDirectives.pendingFeedback}</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">Chờ phản hồi</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400">Danh sách nhanh mới cập nhật:</h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {(baseDirectives.list || []).map((dir: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 pr-4 min-w-0">
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{dir.title}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>Phòng ban: {dir.dept}</span>
                        <span>•</span>
                        <span>Hạn: {dir.deadline}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-bold">{dir.progress}%</span>
                        <div className="w-16 bg-slate-100 h-1 rounded-full mt-0.5 overflow-hidden">
                          <div className="bg-slate-700 h-full" style={{ width: `${dir.progress}%` }} />
                        </div>
                      </div>
                      <Badge className={cn(
                        "rounded-sm text-[9px] font-bold border-0 uppercase",
                        dir.status === 'Đã hoàn thành' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      )}>
                        {dir.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION B: CÔNG VIỆC & PHÊ DUYỆT */}
        <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
              <div>
                <CardTitle className="text-sm font-bold">Nhiệm Vụ & Phê Duyệt Hành Chính</CardTitle>
                <CardDescription className="text-xs">Kiểm soát tiến độ công việc và duyệt đơn từ nghỉ phép, thiết bị</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/${locale}/tasks`}>
                <Button variant="outline" size="sm" className="h-7 text-xs rounded-sm">
                  Tasks
                </Button>
              </Link>
              <Link href={`/${locale}/approvals`}>
                <Button variant="outline" size="sm" className="h-7 text-xs rounded-sm">
                  Duyệt Đơn
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái công việc</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Đang mở</span>
                    <span className="font-bold">{kpiStats.openTasks}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-red-600">
                    <span>Quá hạn</span>
                    <span className="font-bold">{kpiStats.overdueTasks}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái phê duyệt</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Chờ duyệt</span>
                    <span className="font-bold text-cyan-600">{kpiStats.pendingApprovals}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Cần bổ sung hồ sơ</span>
                    <span className="font-bold text-amber-600">1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action checklist */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-sm space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Đơn nghỉ phép/cấp phát đang chờ duyệt khẩn:</span>
              <div className="space-y-2 divide-y divide-slate-200 dark:divide-slate-800">
                <div className="pt-2 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200">Cô Nguyễn Thị Mai - Nghỉ phép năm học</div>
                    <div className="text-[10px] text-slate-500">Phòng Đào tạo • Đăng ký từ 25/06/2026</div>
                  </div>
                  <Link href={`/${locale}/approvals`}>
                    <Button size="sm" className="h-6 text-[10px] bg-slate-900 text-white rounded-sm hover:bg-slate-800">Duyệt nhanh</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION C: NHÂN SỰ (HRM) */}
        <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
              <div>
                <CardTitle className="text-sm font-bold">Giám Sát Nhân Sự & Hợp Đồng (HRM)</CardTitle>
                <CardDescription className="text-xs">Theo dõi biến động nhân sự, hợp đồng và kế hoạch đào tạo chuyên môn</CardDescription>
              </div>
            </div>
            <Link href={`/${locale}/hrm`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-800">
                Mở rộng <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-sm">
                <span className="text-2xl font-black text-slate-850">{baseHrm.total || 52}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Tổng nhân sự</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-sm">
                <span className="text-2xl font-black text-amber-600">{baseHrm.probation || 3}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Đang thử việc</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-sm">
                <span className="text-2xl font-black text-red-600">{kpiStats.expiringContracts}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">HĐ sắp hết hạn</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-sm">
                <span className="text-2xl font-black text-slate-700">{baseHrm.leaveToday || 1}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Nghỉ phép hôm nay</p>
              </div>
            </div>

            <div className="text-xs space-y-1.5">
              <div className="flex justify-between items-center text-slate-650">
                <span>Hồ sơ nhân sự thiếu giấy tờ pháp lý:</span>
                <Badge className="border-amber-300 text-amber-700 bg-amber-50/10 text-[10px] rounded-sm font-bold">
                  {baseHrm.missingDocs || 4} hồ sơ
                </Badge>
              </div>
              <div className="flex justify-between items-center text-slate-650">
                <span>Chương trình đào tạo chuyên môn đang chạy:</span>
                <span className="font-bold text-slate-800">2 khóa hoạt động</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION D: TÀI SẢN & DỊCH VỤ (LOGISTICS) */}
        <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
              <div>
                <CardTitle className="text-sm font-bold">Quản Lý Cơ Sở Vật Chất & Vật Tư (Logistics)</CardTitle>
                <CardDescription className="text-xs">Theo dõi bảo trì tài sản, thiết bị và hàng tồn kho vật tư dạy học</CardDescription>
              </div>
            </div>
            <Link href={`/${locale}/facilities`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-800">
                Mở rộng <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-sm">
                <span className="text-xl font-bold text-slate-800">{baseLogistics.totalAssets || 120}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Tổng tài sản</p>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-sm">
                <span className="text-xl font-bold text-red-600">{baseLogistics.brokenAssets || 3}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Hỏng/Mất</p>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-sm">
                <span className="text-xl font-bold text-amber-600">{kpiStats.openRepairs}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Yêu cầu sửa chữa</p>
              </div>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-650">
                <span>Vật tư tồn kho dưới định mức tối thiểu:</span>
                <Badge className="bg-red-100 text-red-800 font-bold text-[10px] border-0 rounded-sm">
                  {baseLogistics.lowStockSupplies || 1} danh mục cần nhập
                </Badge>
              </div>
              <div className="flex justify-between items-center text-slate-650">
                <span>Kiểm kê tài sản định kỳ học kỳ:</span>
                <span className="text-slate-500 font-medium italic">Đang diễn ra (Dự kiến hoàn thành 30/06)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION E: RỦI RO & KIỂM SOÁT NỘI BỘ (RISK) */}
        <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
              <div>
                <CardTitle className="text-sm font-bold">Rủi Ro & Kiểm Soát Nội Bộ</CardTitle>
                <CardDescription className="text-xs">Ma trận điểm không phù hợp và tiến độ hành động khắc phục CAPA</CardDescription>
              </div>
            </div>
            <Link href={`/${locale}/risk`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-800">
                Mở rộng <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 p-3.5 rounded-sm space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Giám sát CAPA</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black text-red-600">{kpiStats.overdueCapas}</span>
                  <span className="text-xs font-bold text-slate-500">CAPA quá hạn</span>
                </div>
                <p className="text-[10px] text-slate-500">2 CAPA đang chờ thẩm định hiệu lực.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 p-3.5 rounded-sm space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Rủi ro phát hiện</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-200">{baseRisk.totalRisks || 8}</span>
                  <span className="text-xs font-bold text-red-600">{kpiStats.severeRisks} mức cao</span>
                </div>
                <p className="text-[10px] text-slate-500">Khảo sát rủi ro học đường tự động.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION F: CSKH PHỤ HUYNH, TRUYỀN THÔNG & SỰ KIỆN */}
        <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
              <div>
                <CardTitle className="text-sm font-bold">Chăm Sóc Phụ Huynh, Truyền Thông & Sự Kiện</CardTitle>
                <CardDescription className="text-xs">Theo dõi phản ánh (tickets), đo lường truyền thông tuyển sinh và khảo sát</CardDescription>
              </div>
            </div>
            <Link href={`/${locale}/events`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-800">
                Mở rộng <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-sm">
                <span className="text-xl font-bold text-slate-800">{kpiStats.openTickets}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Tickets mở</p>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-sm">
                <span className="text-xl font-bold text-red-600">{kpiStats.overdueTickets}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Quá hạn SLA</p>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-sm">
                <span className="text-xl font-bold text-slate-700">{kpiStats.upcomingEvents}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Sự kiện tới</p>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-sm">
                <span className="text-xl font-bold text-slate-800">{baseParent.crisisCount || 0}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Khủng hoảng</p>
              </div>
            </div>

            <div className="text-xs space-y-1.5">
              <div className="flex justify-between items-center text-slate-650">
                <span>Khảo sát hài lòng phụ huynh Q2:</span>
                <span className="font-bold text-emerald-600">Đạt 84% phản hồi tốt</span>
              </div>
              <div className="flex justify-between items-center text-slate-650">
                <span>Nội dung truyền thông tuyển sinh tuần tới:</span>
                <span className="text-amber-600 font-bold">1 bài viết đang chờ BGH duyệt</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION G: QUY TRÌNH & VĂN BẢN (DOCUMENT) */}
        <Card className="border-slate-200 dark:border-slate-800 rounded-sm xl:col-span-2">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
              <div>
                <CardTitle className="text-sm font-bold">Quản Trị Quy Trình & Tài Liệu Pháp Quy (SOPs)</CardTitle>
                <CardDescription className="text-xs">Theo dõi hiệu lực quy chế, biểu mẫu kiểm định chất lượng đào tạo</CardDescription>
              </div>
            </div>
            <Link href={`/${locale}/knowledge`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-800">
                Mở rộng <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-sm text-center">
                <span className="text-2xl font-black text-slate-800">{baseDoc.total || 24}</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Tổng tài liệu</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-sm text-center">
                <span className="text-2xl font-black text-emerald-600">{baseDoc.active || 18}</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Đang hiệu lực</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-sm text-center">
                <span className="text-2xl font-black text-amber-600">{kpiStats.docsReview}</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Cần rà soát</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-sm text-center">
                <span className="text-2xl font-black text-red-600">{baseDoc.expired || 1}</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Hết hiệu lực</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-sm border border-slate-200">
              <span className="text-xs font-bold text-slate-650 block mb-2">Quy định/Biểu mẫu học hiệu hết hạn hoặc cần kiểm tra định kỳ:</span>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">1. HD-02-BGH: Hướng dẫn quản lý tài sản lớp học</span>
                  <Badge className="border-amber-300 text-amber-700 bg-amber-50/10 text-[9px]">Cần rà soát tháng này</Badge>
                </div>
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">2. BM-05-DT: Biểu mẫu thẩm định giáo án giảng dạy</span>
                  <Badge className="border-red-300 text-red-700 bg-red-50/10 text-[9px]">Đã hết hiệu lực ngày 15/06</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
