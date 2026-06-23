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
  UserCheck,
  Target,
  LineChart,
  Activity,
  HeartHandshake
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/components/ui/Toast';

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
  const router = useRouter();

  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const { success: toastSuccess } = useToast();

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

  useEffect(() => {
    const handleSopDismissed = () => {
      const dismissedStr = serverStorage.getItem('mis_dismissed_alerts') || '[]';
      let dismissed: string[] = [];
      try {
        dismissed = JSON.parse(dismissedStr);
      } catch (e) {}
      
      if (initialData?.actionCenter?.priorityAlerts) {
        const filtered = initialData.actionCenter.priorityAlerts.filter(
          (a: any) => !dismissed.includes(a.id)
        );
        setActiveAlerts(filtered);
      }
    };

    window.addEventListener('sop-dismissed', handleSopDismissed);
    handleSopDismissed(); // Run initially

    return () => {
      window.removeEventListener('sop-dismissed', handleSopDismissed);
    };
  }, [initialData]);

  // Priority warning center list filtering
  const filteredAlerts = useMemo(() => {
    const alerts = activeAlerts || [];
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
  }, [activeAlerts, selectedDept, locale]);

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
              Bảng Điều Hành Chỉ Đạo
            </h1>
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
          { label: 'Việc đang mở', count: kpiStats.openTasks, color: 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/50 text-slate-800 hover:shadow-slate-100', icon: Clock, iconColor: 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400', path: '/tasks' },
          { label: 'Việc quá hạn', count: kpiStats.overdueTasks, color: 'bg-red-50/40 border-red-200/80 hover:bg-red-100/35 text-red-650 hover:shadow-red-50', icon: AlertCircle, iconColor: 'text-red-550 bg-red-100/60 dark:bg-red-950/40 dark:text-red-400', path: '/tasks' },
          { label: 'Chỉ đạo chưa xong', count: kpiStats.pendingDirectives, color: 'bg-amber-50/40 border-amber-200 hover:bg-amber-100/35 text-amber-800 hover:shadow-amber-50', icon: Target, iconColor: 'text-amber-600 bg-amber-100/60 dark:bg-amber-950/40 dark:text-amber-400', path: '/directives' },
          { label: 'Đơn chờ duyệt', count: kpiStats.pendingApprovals, color: 'bg-cyan-50/40 border-cyan-200 hover:bg-cyan-100/35 text-cyan-800 hover:shadow-cyan-50', icon: FileCheck, iconColor: 'text-cyan-600 bg-cyan-100/60 dark:bg-cyan-950/40 dark:text-cyan-400', path: '/approvals' },
          { label: 'Ticket phụ huynh mở', count: kpiStats.openTickets, color: 'bg-sky-50/40 border-sky-200 hover:bg-sky-100/35 text-sky-850 hover:shadow-sky-50', icon: Users, iconColor: 'text-sky-650 bg-sky-100/60 dark:bg-sky-950/40 dark:text-sky-400', path: '/events' },
          { label: 'Ticket quá hạn SLA', count: kpiStats.overdueTickets, color: 'bg-red-50/40 border-red-200/80 hover:bg-red-100/35 text-red-650 hover:shadow-red-50', icon: ShieldAlert, iconColor: 'text-red-550 bg-red-100/60 dark:bg-red-950/40 dark:text-red-400', path: '/events' },
          { label: 'Rủi ro nghiêm trọng', count: kpiStats.severeRisks, color: 'bg-rose-50/60 border-rose-200 hover:bg-rose-100/50 text-rose-800 hover:shadow-rose-50', icon: AlertTriangle, iconColor: 'text-rose-600 bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400', path: '/risk' },
          { label: 'CAPA quá hạn', count: kpiStats.overdueCapas, color: 'bg-red-50/40 border-red-200/80 hover:bg-red-100/35 text-red-650 hover:shadow-red-50', icon: Activity, iconColor: 'text-red-550 bg-red-100/60 dark:bg-red-950/40 dark:text-red-400', path: '/risk' },
          { label: 'Sửa chữa đang mở', count: kpiStats.openRepairs, color: 'bg-amber-50/40 border-amber-200 hover:bg-amber-100/35 text-amber-800 hover:shadow-amber-50', icon: Wrench, iconColor: 'text-amber-600 bg-amber-100/60 dark:bg-amber-950/40 dark:text-amber-400', path: '/facilities' },
          { label: 'Hợp đồng sắp hết hạn', count: kpiStats.expiringContracts, color: 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/50 text-slate-800 hover:shadow-slate-100', icon: UserCheck, iconColor: 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400', path: '/hrm' },
          { label: 'Sự kiện sắp tới', count: kpiStats.upcomingEvents, color: 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-100/35 text-emerald-800 hover:shadow-emerald-50', icon: Calendar, iconColor: 'text-emerald-600 bg-emerald-100/60 dark:bg-emerald-950/40 dark:text-emerald-400', path: '/events' },
          { label: 'Tài liệu cần rà soát', count: kpiStats.docsReview, color: 'bg-amber-50/40 border-amber-200 hover:bg-amber-100/35 text-amber-800 hover:shadow-amber-50', icon: FileSpreadsheet, iconColor: 'text-amber-600 bg-amber-100/60 dark:bg-amber-950/40 dark:text-amber-400', path: '/knowledge' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <Link key={i} href={`/${locale}${item.path}`} className="block">
              <div className={cn(
                "p-4 border rounded-2xl transition-all duration-305 hover:-translate-y-1 hover:shadow-md cursor-pointer bg-white dark:bg-slate-950 flex justify-between items-start h-26",
                item.color
              )}>
                <div className="flex flex-col justify-between h-full min-w-0 pr-2">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight truncate">{item.label}</span>
                  <span className="text-2xl font-black mt-2 tracking-tight">{item.count}</span>
                </div>
                <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm", item.iconColor)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2. Cảnh báo ưu tiên (Cần xử lý ngay) */}
      <Card className="border-red-200 bg-red-50/5 dark:border-red-950/20 dark:bg-red-950/5 rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-100 dark:border-red-950/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 bg-red-600 text-white rounded-lg flex items-center justify-center shadow-sm">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-red-800 dark:text-red-300">Cần Xử Lý Ngay (Warning Center)</CardTitle>
              <CardDescription className="text-xs text-red-700/70 dark:text-red-400/60 mt-0.5">
                Các sự vụ nghiêm trọng, chỉ số quá hạn cần chỉ đạo giải quyết khẩn cấp.
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-red-100 text-red-800 border-0 font-bold rounded-full px-2.5 py-0.5 text-[10px]">
            {filteredAlerts.length} cảnh báo
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-red-100/30 dark:bg-red-950/20 text-[10px] uppercase font-bold text-red-800/80 dark:text-red-400 border-b border-red-100 dark:border-red-950/20">
                  <th className="py-3 px-5">Tiêu đề cảnh báo</th>
                  <th className="py-3 px-5 w-28">Nguồn</th>
                  <th className="py-3 px-5 w-28 text-center">Độ nghiêm trọng</th>
                  <th className="py-3 px-5 w-40">Phụ trách</th>
                  <th className="py-3 px-5 w-28">Hạn xử lý</th>
                  <th className="py-3 px-5 w-24 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100/20 dark:divide-red-950/20">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert: any) => (
                    <tr key={alert.id} className="hover:bg-red-100/10 dark:hover:bg-red-950/10 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-800 dark:text-slate-200">
                        {alert.title}
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge className="border-red-200 text-red-700 bg-red-100/10 text-[9px] rounded-full uppercase tracking-wide">
                          {alert.module}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide",
                          alert.severity === 'Nghiêm trọng' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                        )}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-650 dark:text-slate-400 font-semibold">
                        {alert.owner}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-red-600 dark:text-red-400">
                        {alert.deadline}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button 
                          onClick={() => {
                            const target = alert.targetUrl || `/${locale}/dashboard`;
                            const url = `${target}${target.includes('?') ? '&' : '?'}sopAlertId=${alert.id}&sopTitle=${encodeURIComponent(alert.title)}&sopModule=${encodeURIComponent(alert.module)}&sopSeverity=${encodeURIComponent(alert.severity)}&sopOwner=${encodeURIComponent(alert.owner)}&sopDeadline=${encodeURIComponent(alert.deadline)}`;
                            router.push(url);
                          }}
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] text-red-750 hover:text-white hover:bg-red-650 px-2.5 rounded-full border border-red-200/80 transition-all duration-200"
                        >
                          Xử lý
                        </Button>
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
        <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
              <div>
                <CardTitle className="text-sm font-bold">Chỉ Đạo Ban Giám Hiệu (Directives)</CardTitle>
                <CardDescription className="text-xs">Theo dõi tiến trình triển khai chỉ thị và nghị quyết BGH</CardDescription>
              </div>
            </div>
            <Link href={`/${locale}/directives`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-800 rounded-full">
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
        <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
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
                <Button variant="outline" size="sm" className="h-7 text-xs rounded-full">
                  Tasks
                </Button>
              </Link>
              <Link href={`/${locale}/approvals`}>
                <Button variant="outline" size="sm" className="h-7 text-xs rounded-full">
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
                    <span className="font-bold text-cyan-650">{kpiStats.pendingApprovals}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Cần bổ sung hồ sơ</span>
                    <span className="font-bold text-amber-650">1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action checklist */}
            <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 p-3 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Đơn nghỉ phép/cấp phát đang chờ duyệt khẩn:</span>
              <div className="space-y-2 divide-y divide-slate-200/50 dark:divide-slate-850">
                <div className="pt-2 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200">Cô Nguyễn Thị Mai - Nghỉ phép năm học</div>
                    <div className="text-[10px] text-slate-500">Phòng Đào tạo • Đăng ký từ 25/06/2026</div>
                  </div>
                  <Link href={`/${locale}/approvals`}>
                    <Button size="sm" className="h-6 text-[10px] bg-slate-900 text-white rounded-full hover:bg-slate-800 px-3">Duyệt nhanh</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION C: NHÂN SỰ (HRM) */}
        <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
              <div>
                <CardTitle className="text-sm font-bold">Giám Sát Nhân Sự & Hợp Đồng (HRM)</CardTitle>
                <CardDescription className="text-xs">Theo dõi biến động nhân sự, hợp đồng và kế hoạch đào tạo chuyên môn</CardDescription>
              </div>
            </div>
            <Link href={`/${locale}/hrm`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-800 rounded-full">
                Mở rộng <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-2xl font-black text-slate-800 dark:text-slate-205">{baseHrm.total || 52}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Tổng nhân sự</p>
              </div>
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-2xl font-black text-amber-600">{baseHrm.probation || 3}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Đang thử việc</p>
              </div>
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-2xl font-black text-red-650">{kpiStats.expiringContracts}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">HĐ sắp hết hạn</p>
              </div>
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-2xl font-black text-slate-700 dark:text-slate-300">{baseHrm.leaveToday || 1}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Nghỉ phép hôm nay</p>
              </div>
            </div>

            <div className="text-xs space-y-1.5">
              <div className="flex justify-between items-center text-slate-650 dark:text-slate-400">
                <span>Hồ sơ nhân sự thiếu giấy tờ pháp lý:</span>
                <Badge className="border-amber-200 text-amber-705 bg-amber-50/10 text-[10px] rounded-full font-bold px-2 py-0.5">
                  {baseHrm.missingDocs || 4} hồ sơ
                </Badge>
              </div>
              <div className="flex justify-between items-center text-slate-650 dark:text-slate-400">
                <span>Chương trình đào tạo chuyên môn đang chạy:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">2 khóa hoạt động</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION D: TÀI SẢN & DỊCH VỤ (LOGISTICS) */}
        <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
              <div>
                <CardTitle className="text-sm font-bold">Quản Lý Cơ Sở Vật Chất & Vật Tư (Logistics)</CardTitle>
                <CardDescription className="text-xs">Theo dõi bảo trì tài sản, thiết bị và hàng tồn kho vật tư dạy học</CardDescription>
              </div>
            </div>
            <Link href={`/${locale}/facilities`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-800 rounded-full">
                Mở rộng <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{baseLogistics.totalAssets || 120}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Tổng tài sản</p>
              </div>
              <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-xl font-bold text-red-650">{baseLogistics.brokenAssets || 3}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Hỏng/Mất</p>
              </div>
              <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-xl font-bold text-amber-600">{kpiStats.openRepairs}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Yêu cầu sửa chữa</p>
              </div>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-650 dark:text-slate-400">
                <span>Vật tư tồn kho dưới định mức tối thiểu:</span>
                <Badge className="bg-red-100 text-red-800 font-bold text-[10px] border-0 rounded-full px-2.5 py-0.5">
                  {baseLogistics.lowStockSupplies || 1} danh mục cần nhập
                </Badge>
              </div>
              <div className="flex justify-between items-center text-slate-650 dark:text-slate-400">
                <span>Kiểm kê tài sản định kỳ học kỳ:</span>
                <span className="text-slate-500 font-medium italic">Đang diễn ra (Dự kiến hoàn thành 30/06)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION E: RỦI RO & KIỂM SOÁT NỘI BỘ (RISK) */}
        <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
              <div>
                <CardTitle className="text-sm font-bold">Rủi Ro & Kiểm Soát Nội Bộ</CardTitle>
                <CardDescription className="text-xs">Ma trận điểm không phù hợp và tiến độ hành động khắc phục CAPA</CardDescription>
              </div>
            </div>
            <Link href={`/${locale}/risk`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-800 rounded-full">
                Mở rộng <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Giám sát CAPA</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black text-red-650">{kpiStats.overdueCapas}</span>
                  <span className="text-xs font-bold text-slate-500">CAPA quá hạn</span>
                </div>
                <p className="text-[10px] text-slate-500">2 CAPA đang chờ thẩm định hiệu lực.</p>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Rủi ro phát hiện</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-200">{baseRisk.totalRisks || 8}</span>
                  <span className="text-xs font-bold text-red-650">{kpiStats.severeRisks} mức cao</span>
                </div>
                <p className="text-[10px] text-slate-500">Khảo sát rủi ro học đường tự động.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION F: CSKH PHỤ HUYNH, TRUYỀN THÔNG & SỰ KIỆN */}
        <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
              <div>
                <CardTitle className="text-sm font-bold">Chăm Sóc Phụ Huynh, Truyền Thông & Sự Kiện</CardTitle>
                <CardDescription className="text-xs">Theo dõi phản ánh (tickets), đo lường truyền thông tuyển sinh và khảo sát</CardDescription>
              </div>
            </div>
            <Link href={`/${locale}/events`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-800 rounded-full">
                Mở rộng <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{kpiStats.openTickets}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Tickets mở</p>
              </div>
              <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-xl font-bold text-red-650">{kpiStats.overdueTickets}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Quá hạn SLA</p>
              </div>
              <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-xl font-bold text-slate-700 dark:text-slate-300">{kpiStats.upcomingEvents}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Sự kiện tới</p>
              </div>
              <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-xl font-bold text-slate-850 dark:text-slate-205">{baseParent.crisisCount || 0}</span>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Khủng hoảng</p>
              </div>
            </div>

            <div className="text-xs space-y-1.5">
              <div className="flex justify-between items-center text-slate-650 dark:text-slate-400">
                <span>Khảo sát hài lòng phụ huynh Q2:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Đạt 84% phản hồi tốt</span>
              </div>
              <div className="flex justify-between items-center text-slate-650 dark:text-slate-400">
                <span>Nội dung truyền thông tuyển sinh tuần tới:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">1 bài viết đang chờ BGH duyệt</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION G: QUY TRÌNH & VĂN BẢN (DOCUMENT) */}
        <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 xl:col-span-2">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
              <div>
                <CardTitle className="text-sm font-bold">Quản Trị Quy Trình & Tài Liệu Pháp Quy (SOPs)</CardTitle>
                <CardDescription className="text-xs">Theo dõi hiệu lực quy chế, biểu mẫu kiểm định chất lượng đào tạo</CardDescription>
              </div>
            </div>
            <Link href={`/${locale}/knowledge`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-800 rounded-full">
                Mở rộng <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-xl text-center">
                <span className="text-2xl font-black text-slate-800 dark:text-slate-200">{baseDoc.total || 24}</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Tổng tài liệu</p>
              </div>
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-xl text-center">
                <span className="text-2xl font-black text-emerald-600">{baseDoc.active || 18}</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Đang hiệu lực</p>
              </div>
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-xl text-center">
                <span className="text-2xl font-black text-amber-600">{kpiStats.docsReview}</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Cần rà soát</p>
              </div>
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-xl text-center">
                <span className="text-2xl font-black text-red-650">{baseDoc.expired || 1}</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Hết hiệu lực</p>
              </div>
            </div>

            <div className="bg-slate-50/40 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-650 dark:text-slate-350 block mb-2">Quy định/Biểu mẫu học hiệu hết hạn hoặc cần kiểm tra định kỳ:</span>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">1. HD-02-BGH: Hướng dẫn quản lý tài sản lớp học</span>
                  <Badge className="border-amber-250 text-amber-700 bg-amber-50/10 text-[9px] rounded-full px-2 py-0.5">Cần rà soát tháng này</Badge>
                </div>
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">2. BM-05-DT: Biểu mẫu thẩm định giáo án giảng dạy</span>
                  <Badge className="border-red-250 text-red-700 bg-red-50/10 text-[9px] rounded-full px-2 py-0.5">Đã hết hiệu lực ngày 15/06</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION H: TIẾN ĐỘ TUYỂN SINH & CRM */}
        <Card className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 xl:col-span-2">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle className="text-sm font-bold">Phễu Chuyển Đổi Tuyển Sinh & CRM</CardTitle>
                <CardDescription className="text-xs">Theo dõi tiến trình lead tuyển sinh qua phễu lọc 5 giai đoạn liên thông</CardDescription>
              </div>
            </div>
            <Link href={`/${locale}/admissions`}>
              <Button variant="outline" size="sm" className="h-7 text-xs text-blue-600 hover:bg-blue-50/50 border-blue-200 hover:border-blue-300 rounded-full px-4.5 font-bold transition-all">
                Đến Quản trị Tuyển sinh <ChevronRight className="h-3.5 w-3.5 ml-0.5 inline-block" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-5 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative">
              {(() => {
                const baseFunnel = initialData?.funnel || [
                  { label: 'Tiếp cận', value: 0, pct: '0%' },
                  { label: 'Quan tâm', value: 0, pct: '0%' },
                  { label: 'Tư vấn', value: 0, pct: '0%' },
                  { label: 'Đăng ký', value: 0, pct: '0%' },
                  { label: 'Nhập học', value: 0, pct: '0%' },
                ];
                
                const steps = [
                  { label: 'Tiếp cận', value: baseFunnel[0]?.value || 0, pct: baseFunnel[0]?.pct || '100%', color: 'border-sky-200 text-sky-700 bg-sky-50/20 hover:bg-sky-50/40 dark:bg-sky-950/10 dark:border-sky-900/30', icon: Users, iconColor: 'text-sky-500 bg-sky-100/60 dark:bg-sky-900/40' },
                  { label: 'Quan tâm', value: baseFunnel[1]?.value || 0, pct: baseFunnel[1]?.pct || '0%', color: 'border-blue-200 text-blue-700 bg-blue-50/20 hover:bg-blue-50/40 dark:bg-blue-950/10 dark:border-blue-900/30', icon: Target, iconColor: 'text-blue-500 bg-blue-100/60 dark:bg-blue-900/40' },
                  { label: 'Tư vấn', value: baseFunnel[2]?.value || 0, pct: baseFunnel[2]?.pct || '0%', color: 'border-cyan-200 text-cyan-705 bg-cyan-50/20 hover:bg-cyan-50/40 dark:bg-cyan-950/10 dark:border-cyan-900/30', icon: LineChart, iconColor: 'text-cyan-600 bg-cyan-100/60 dark:bg-cyan-900/40' },
                  { label: 'Đăng ký', value: baseFunnel[3]?.value || 0, pct: baseFunnel[3]?.pct || '0%', color: 'border-emerald-200 text-emerald-705 bg-emerald-50/20 hover:bg-emerald-50/40 dark:bg-emerald-950/10 dark:border-emerald-900/30', icon: CheckCircle, iconColor: 'text-emerald-500 bg-emerald-100/60 dark:bg-emerald-900/40' },
                  { label: 'Nhập học', value: baseFunnel[4]?.value || 0, pct: baseFunnel[4]?.pct || '0%', color: 'border-green-200 text-green-700 bg-green-50/20 hover:bg-green-50/40 dark:bg-green-950/10 dark:border-green-900/30', icon: GraduationCap, iconColor: 'text-green-600 bg-green-100/60 dark:bg-green-900/40' },
                ];

                return steps.map((step, idx) => {
                  const Icon = step.icon;
                  // Calculate local transition rate from previous step
                  let stepRate = '';
                  if (idx > 0) {
                    const prevVal = steps[idx-1].value;
                    const rateVal = prevVal > 0 ? Math.round((step.value / prevVal) * 100) : 0;
                    stepRate = `${rateVal}%`;
                  }

                  return (
                    <div key={idx} className="relative flex flex-col justify-between">
                      {/* Step Card */}
                      <div className={cn(
                        "p-4 border rounded-2xl flex flex-col justify-between h-28 shadow-3xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xs",
                        step.color
                      )}>
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{step.label}</span>
                          <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm", step.iconColor)}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{step.value}</span>
                          <span className="text-[10px] text-slate-400 block mt-1">Tỷ lệ phễu: <strong className="font-extrabold text-slate-650 dark:text-slate-350">{step.pct}</strong></span>
                        </div>
                      </div>

                      {/* Transition rate connector between columns */}
                      {idx < 4 && (
                        <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full h-6 w-11 shadow-sm text-[9px] font-black text-slate-500">
                          {(() => {
                            const nextVal = steps[idx+1].value;
                            const rateVal = step.value > 0 ? Math.round((nextVal / step.value) * 100) : 0;
                            return `→ ${rateVal}%`;
                          })()}
                        </div>
                      )}

                      {/* Mobile version rate connector */}
                      {idx < 4 && (
                        <div className="flex lg:hidden items-center justify-center py-1.5 text-[10px] font-bold text-slate-400">
                          {(() => {
                            const nextVal = steps[idx+1].value;
                            const rateVal = step.value > 0 ? Math.round((nextVal / step.value) * 100) : 0;
                            return `↓ Chuyển đổi ${rateVal}% sang bước tiếp theo`;
                          })()}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
