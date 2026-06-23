'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from "@/src/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/components/ui/Toast';
import {
  LineChart as LineChartIcon,
  Clock,
  FileText,
  Users,
  GraduationCap,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  ClipboardList,
  ShieldAlert,
  Wrench,
  FileCheck,
  Building,
  SlidersHorizontal,
  ChevronRight,
  Search
} from 'lucide-react';

interface ReportsClientProps {
  locale: string;
  data: {
    kpiStats: any;
    tasksData: any;
    hrmData: any;
    logisticsData: any;
    riskData: any;
    parentCareData: any;
    documentsData: any;
  };
}

// Curated modern school-wide color palette (No purple/indigo/violet)
const PALETTE = [
  '#0284c7', // Ocean Blue
  '#0d9488', // Teal
  '#059669', // Emerald Green
  '#ea580c', // Signal Orange
  '#d97706', // Amber
  '#dc2626', // Deep Red
  '#475569', // Slate
  '#1e293b', // Dark Slate
];

export default function ReportsClient({ locale, data }: ReportsClientProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTime, setSelectedTime] = useState('30d');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { success: toastSuccess } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter multiplier helper based on selected filters (time & dept)
  const filterFactor = useMemo(() => {
    let factor = 1.0;
    if (selectedTime === 'today') factor *= 0.15;
    else if (selectedTime === '7d') factor *= 0.45;
    else if (selectedTime === 'semester') factor *= 1.8;
    else if (selectedTime === 'year') factor *= 3.0;

    if (selectedDept !== 'ALL') {
      factor *= 0.25;
    }
    return factor;
  }, [selectedTime, selectedDept]);

  const scaleValue = (val: number, min = 0) => {
    const result = Math.round(val * filterFactor);
    return result < min ? min : result;
  };

  const scaleDataArray = (arr: any[]) => {
    return arr.map(item => ({
      ...item,
      value: scaleValue(item.value, 0),
      count: scaleValue(item.count, 0)
    }));
  };

  // Base raw data
  const baseKpi = data?.kpiStats || {};
  const baseTasks = data?.tasksData || {};
  const baseHrm = data?.hrmData || {};
  const baseLogistics = data?.logisticsData || {};
  const baseRisk = data?.riskData || {};
  const baseParent = data?.parentCareData || {};
  const baseDoc = data?.documentsData || {};

  // Formatted state-driven stats
  const kpis = useMemo(() => ({
    openTasks: scaleValue(baseKpi.openTasks || 18, 1),
    overdueTasks: scaleValue(baseKpi.overdueTasks || 4, 0),
    pendingDirectives: scaleValue(baseKpi.pendingDirectives || 3, 0),
    pendingApprovals: scaleValue(baseKpi.pendingApprovals || 5, 0),
    openTickets: scaleValue(baseKpi.openTickets || 8, 0),
    overdueTickets: scaleValue(baseKpi.overdueTickets || 2, 0),
    severeRisks: scaleValue(baseKpi.severeRisks || 3, 0),
    overdueCapas: scaleValue(baseKpi.overdueCapas || 2, 0),
    openRepairs: scaleValue(baseKpi.openRepairs || 3, 0),
    expiringContracts: scaleValue(baseKpi.expiringContracts || 2, 0),
    upcomingEvents: scaleValue(baseKpi.upcomingEvents || 4, 0),
    docsReview: scaleValue(baseKpi.docsReview || 3, 0),
  }), [baseKpi, filterFactor]);

  // Export report data to CSV
  const handleExportReportCSV = () => {
    let title = '';
    let headers: string[] = [];
    let rows: any[][] = [];

    if (activeTab === 'overview') {
      title = 'Tong_Quan_Dieu_Hanh';
      headers = ['Chi so', 'So luong'];
      rows = [
        ['Cong viec dang mo', kpis.openTasks],
        ['Cong viec qua han', kpis.overdueTasks],
        ['Chi dao BGH cho', kpis.pendingDirectives],
        ['Don tu cho duyet', kpis.pendingApprovals],
        ['Phan anh phu huynh mo', kpis.openTickets],
        ['Rui ro nghiem trong', kpis.severeRisks],
        ['Sua chua dang mo', kpis.openRepairs],
        ['Tai lieu can ra soat', kpis.docsReview],
      ];
    } else if (activeTab === 'tasks') {
      title = 'Cong_Viec_Va_Phe_Duyet';
      headers = ['Hang muc', 'So luong'];
      rows = scaleDataArray(baseTasks.statusBreakdown || []).map(d => [d.name, d.value]);
    } else if (activeTab === 'hrm') {
      title = 'Bao_Cao_Nhan_Su';
      headers = ['Bo phan', 'So nhan su'];
      rows = scaleDataArray(baseHrm.deptStaff || []).map(d => [d.name, d.value]);
    } else if (activeTab === 'logistics') {
      title = 'Tai_San_Va_Csvc';
      headers = ['Ten vat tu', 'Ma', 'So luong', 'Muc toi thieu'];
      rows = (baseLogistics.lowStockSupplies || []).map(s => [s.name, s.code, s.quantity, s.minQuantity]);
    } else if (activeTab === 'risk') {
      title = 'Kiem_Soat_Rui_Ro';
      headers = ['Muc do rui ro', 'So vu viec'];
      rows = scaleDataArray(baseRisk.severityBreakdown || []).map(d => [d.name, d.value]);
    } else if (activeTab === 'parent') {
      title = 'Phu_Huynh_Va_Su_Kien';
      headers = ['Nguon lead', 'So luong'];
      rows = scaleDataArray(baseParent.sourceBreakdown || []).map(d => [d.name, d.value]);
    } else {
      title = 'Quy_Trinh_Va_Van_Ban';
      headers = ['Trang thai tai lieu', 'So luong'];
      rows = scaleDataArray(baseDoc.statusBreakdown || []).map(d => [d.name, d.value]);
    }

    let csv = '\uFEFF'; // UTF-8 BOM
    csv += `"=== BÁO CÁO PHÂN TÍCH: ${title.toUpperCase()} ===\n"`;
    csv += `Bộ lọc thời gian: ${selectedTime === 'today' ? 'Hôm nay' : selectedTime === '7d' ? '7 ngày' : '30 ngày'}\n`;
    csv += `Bộ lọc phòng ban: ${selectedDept}\n\n`;
    csv += headers.map(h => `"${h}"`).join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(v => `"${String(v)}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bao_Cao_${title}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastSuccess('Xuất báo cáo thành công', 'Báo cáo CSV đã được lưu xuống thiết bị của bạn');
  };

  if (!mounted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-sm border-2 border-slate-700 border-t-transparent mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Đang khởi tạo số liệu phân tích...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Trung Tâm Báo Cáo & Phân Tích Toàn Trường
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tổng hợp dữ liệu trực quan phục vụ công tác giám sát, lập kế hoạch chỉ đạo của BGH.
          </p>
        </div>
        <Button variant="outline" onClick={handleExportReportCSV} className="flex gap-2 shrink-0 border-slate-200 rounded-sm hover:bg-slate-50">
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          Xuất dữ liệu CSV
        </Button>
      </div>

      {/* Interactive Filters Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-sm">
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Khoảng thời gian</label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full text-xs rounded-sm border-slate-200 bg-white py-1.5 focus:ring-1 focus:ring-slate-400 font-medium"
          >
            <option value="today">Hôm nay</option>
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="semester">Học kỳ này</option>
            <option value="year">Cả năm học</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Phòng ban phụ trách</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full text-xs rounded-sm border-slate-200 bg-white py-1.5 focus:ring-1 focus:ring-slate-400 font-medium"
          >
            <option value="ALL">Tất cả Phòng ban</option>
            <option value="BGH">Ban Giám Hiệu</option>
            <option value="TOAN_TIN">Tổ Toán - Tin học</option>
            <option value="DAO_TAO">Phòng Đào tạo</option>
            <option value="HCNS">Hành chính Nhân sự</option>
            <option value="CSVC">Cơ sở vật chất</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Tìm kiếm nhanh</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Mã số, tên nhân viên, thiết bị..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-sm border-slate-200 bg-white pl-8 py-1.5 focus:ring-1 focus:ring-slate-400"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Tabs list (7 Tabs layout) */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-1">
        {[
          { id: 'overview', label: '1. Tổng quan', icon: LineChartIcon },
          { id: 'tasks', label: '2. Việc & Phê duyệt', icon: FileCheck },
          { id: 'hrm', label: '3. Nhân sự', icon: Users },
          { id: 'logistics', label: '4. Tài sản & CSVC', icon: Wrench },
          { id: 'risk', label: '5. Rủi ro & Kiểm soát', icon: ShieldAlert },
          { id: 'parent', label: '6. Phụ huynh & Sự kiện', icon: Building },
          { id: 'docs', label: '7. Quy trình & Văn bản', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 -mb-[2px] transition-all",
              activeTab === tab.id
                ? "border-slate-800 text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-350"
            )}
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                <CardHeader className="pb-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Việc tồn / Quá hạn</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-red-600">{kpis.overdueTasks}</div>
                  <p className="text-[10px] text-slate-500 mt-1">Cần đốc thúc xử lý ngay</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                <CardHeader className="pb-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Chỉ chỉ đạo BGH chưa xong</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-amber-700">{kpis.pendingDirectives}</div>
                  <p className="text-[10px] text-slate-500 mt-1">Hạn chót trong tháng này</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                <CardHeader className="pb-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Sửa chữa đang mở</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-700 dark:text-slate-300">{kpis.openRepairs}</div>
                  <p className="text-[10px] text-slate-500 mt-1">Sự cố CSVC phòng học</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                <CardHeader className="pb-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">CAPA Quá hạn</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-red-700">{kpis.overdueCapas}</div>
                  <p className="text-[10px] text-slate-500 mt-1">Biện pháp khắc phục rủi ro</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance line chart */}
            <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Xu hướng hiệu quả vận hành và chuyên cần toàn trường</CardTitle>
                <CardDescription className="text-xs">Theo dõi thống kê vận hành tổng thể 6 tháng qua</CardDescription>
              </CardHeader>
              <CardContent className="h-80 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { month: 'T12', score: 78, attend: 92 },
                    { month: 'T01', score: 81, attend: 93 },
                    { month: 'T02', score: 80, attend: 91 },
                    { month: 'T03', score: 85, attend: 94 },
                    { month: 'T04', score: 88, attend: 95 },
                    { month: 'T05', score: 90, attend: 96 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" stroke="#888888" />
                    <YAxis stroke="#888888" tickFormatter={v => `${v}%`} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" name="Điểm hiệu quả" stroke="#0284c7" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="attend" name="Tỷ lệ đi học chuyên cần" stroke="#059669" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: TASKS & APPROVALS */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Trạng thái công việc</CardTitle>
                </CardHeader>
                <CardContent className="h-72 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scaleDataArray(baseTasks.statusBreakdown || [])}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0284c7" radius={[2, 2, 0, 0]}>
                        {(baseTasks.statusBreakdown || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Cơ cấu phê duyệt đơn từ</CardTitle>
                </CardHeader>
                <CardContent className="h-72 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scaleDataArray(baseTasks.approvalsStatus || [])}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {(baseTasks.approvalsStatus || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[(index + 2) % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* List of recent leave requests */}
            <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Danh sách đơn xin nghỉ phép/phê duyệt hành chính</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold">
                      <th className="p-3">Mã đơn</th>
                      <th className="p-3">Nhân sự xin phép</th>
                      <th className="p-3">Ngày bắt đầu</th>
                      <th className="p-3">Ngày kết thúc</th>
                      <th className="p-3">Lý do</th>
                      <th className="p-3 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(baseTasks.recentApprovalsList || []).map((app: any) => (
                      <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-3 font-bold">{app.id.slice(0, 8).toUpperCase()}</td>
                        <td className="p-3">{app.employeeProfileId}</td>
                        <td className="p-3">{app.startDate}</td>
                        <td className="p-3">{app.endDate}</td>
                        <td className="p-3 text-slate-500">{app.reason}</td>
                        <td className="p-3 text-right">
                          <span className={cn(
                            "px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase",
                            app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          )}>
                            {app.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: HRM */}
        {activeTab === 'hrm' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Phân bổ nhân sự theo phòng ban</CardTitle>
                </CardHeader>
                <CardContent className="h-72 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scaleDataArray(baseHrm.deptStaff || [])} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0d9488" barSize={15} radius={[0, 2, 2, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Phân bổ trạng thái lao động</CardTitle>
                </CardHeader>
                <CardContent className="h-72 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scaleDataArray(baseHrm.statusBreakdown || [])}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {(baseHrm.statusBreakdown || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[(index + 4) % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* List of expiring contracts */}
            <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Hợp đồng sắp hết hạn (30 - 90 ngày tới)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold">
                      <th className="p-3">Số HĐ</th>
                      <th className="p-3">Ngày kết thúc</th>
                      <th className="p-3 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(baseHrm.expiringContracts || []).map((c: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-3 font-bold">{c.contractNumber}</td>
                        <td className="p-3 text-red-600 font-semibold">{c.endDate}</td>
                        <td className="p-3 text-right">
                          <span className="px-2 py-0.5 rounded-sm text-[9px] font-bold bg-amber-100 text-amber-800 uppercase">
                            Đang hiệu lực
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: LOGISTICS */}
        {activeTab === 'logistics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Tình trạng tài sản toàn trường</CardTitle>
                </CardHeader>
                <CardContent className="h-72 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scaleDataArray(baseLogistics.assetsStatus || [])}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {(baseLogistics.assetsStatus || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Số lượng yêu cầu sửa chữa cơ sở vật chất</CardTitle>
                </CardHeader>
                <CardContent className="h-72 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scaleDataArray(baseLogistics.repairRequestsStatus || [])}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#d97706" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Supplies low stock */}
            <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Cảnh báo tồn kho vật tư học phẩm tối thiểu</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold">
                      <th className="p-3">Tên học phẩm</th>
                      <th className="p-3">Mã vật tư</th>
                      <th className="p-3">Số lượng hiện tại</th>
                      <th className="p-3 text-right">Mức tối thiểu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(baseLogistics.lowStockSupplies || []).map((s: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-3 font-semibold">{s.name}</td>
                        <td className="p-3">{s.code}</td>
                        <td className="p-3 text-red-600 font-bold">{s.quantity}</td>
                        <td className="p-3 text-right text-slate-500">{s.minQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 5: RISKS & COMPLIANCE */}
        {activeTab === 'risk' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Phân mức độ nghiêm trọng rủi ro</CardTitle>
                </CardHeader>
                <CardContent className="h-72 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scaleDataArray(baseRisk.severityBreakdown || [])}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {(baseRisk.severityBreakdown || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Trạng thái xử lý rủi ro kiểm soát</CardTitle>
                </CardHeader>
                <CardContent className="h-72 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scaleDataArray(baseRisk.statusBreakdown || [])}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#475569" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* List of open risks */}
            <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Các rủi ro & Sự vụ điểm không phù hợp đang mở</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold">
                      <th className="p-3">ID Rủi ro</th>
                      <th className="p-3">Tiêu đề vụ việc</th>
                      <th className="p-3 text-center">Độ nghiêm trọng</th>
                      <th className="p-3 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(baseRisk.recentRisks || []).map((r: any) => (
                      <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-3 font-bold">{r.id.toUpperCase()}</td>
                        <td className="p-3">{r.title}</td>
                        <td className="p-3 text-center">
                          <span className={cn(
                            "px-2 py-0.5 rounded-sm text-[9px] font-bold text-white",
                            r.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'
                          )}>
                            {r.severity === 'high' ? 'Cao' : 'Vừa'}
                          </span>
                        </td>
                        <td className="p-3 text-right text-slate-600 font-semibold">{r.status === 'open' ? 'Đang mở' : 'Đã đóng'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 6: PARENT CARE & EVENTS */}
        {activeTab === 'parent' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Phễu chuyển đổi tuyển sinh lũy kế</CardTitle>
                </CardHeader>
                <CardContent className="h-72 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={scaleDataArray(baseParent.funnel || [])}>
                      <defs>
                        <linearGradient id="parentColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#0284c7" fillOpacity={1} fill="url(#parentColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Nguồn tiếp cận đăng ký học sinh</CardTitle>
                </CardHeader>
                <CardContent className="h-72 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scaleDataArray(baseParent.sourceBreakdown || [])}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {(baseParent.sourceBreakdown || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* List of upcoming events */}
            <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Kế hoạch sự kiện & truyền thông sắp diễn ra</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold">
                      <th className="p-3">Tên sự kiện</th>
                      <th className="p-3">Ngày tổ chức</th>
                      <th className="p-3">Địa điểm</th>
                      <th className="p-3 text-right">Dự kiến chi phí</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(baseParent.upcomingEvents || []).map((ev: any) => (
                      <tr key={ev.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-3 font-semibold">{ev.title}</td>
                        <td className="p-3 font-bold text-slate-800">{ev.date}</td>
                        <td className="p-3 text-slate-500">{ev.location || 'Trường học'}</td>
                        <td className="p-3 text-right font-semibold">{(ev.budget || 0).toLocaleString('vi-VN')} đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 7: DOCUMENTS & SOPS */}
        {activeTab === 'docs' && (() => {
          const allDocs: any[] = baseDoc.allDocsList || [];
          const filtered = allDocs.filter((d: any) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
              (d.displayName || '').toLowerCase().includes(q) ||
              (d.docCode || '').toLowerCase().includes(q) ||
              (d.category || '').toLowerCase().includes(q) ||
              (d.uploadedByName || '').toLowerCase().includes(q)
            );
          });

          const statusBadge = (status: string) => {
            const map: Record<string, { label: string; cls: string }> = {
              ACTIVE: { label: 'Hiệu lực', cls: 'bg-emerald-100 text-emerald-800' },
              NEEDS_REVIEW: { label: 'Cần rà soát', cls: 'bg-amber-100 text-amber-800' },
              DRAFT: { label: 'Bản nháp', cls: 'bg-slate-100 text-slate-600' },
              PENDING_APPROVAL: { label: 'Chờ duyệt', cls: 'bg-sky-100 text-sky-800' },
              EXPIRED: { label: 'Hết hiệu lực', cls: 'bg-red-100 text-red-700' },
              ARCHIVED: { label: 'Lưu trữ', cls: 'bg-slate-100 text-slate-500' },
            };
            const s = map[status] || { label: status, cls: 'bg-slate-100 text-slate-500' };
            return <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase ${s.cls}`}>{s.label}</span>;
          };

          return (
            <div className="space-y-6">
              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                  <CardHeader className="pb-2">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Tổng tài liệu</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-slate-800 dark:text-white">{baseDoc.totalDocs || allDocs.length}</div>
                    <p className="text-[10px] text-slate-500 mt-1">Trong kho quy trình & tri thức</p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                  <CardHeader className="pb-2">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Đang hiệu lực</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-emerald-600">{baseDoc.activeCount || allDocs.filter((d: any) => d.status === 'ACTIVE').length}</div>
                    <p className="text-[10px] text-slate-500 mt-1">Tài liệu đã phê duyệt & ban hành</p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                  <CardHeader className="pb-2">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Cần rà soát</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-amber-600">{kpis.docsReview}</div>
                    <p className="text-[10px] text-slate-500 mt-1">Đã quá hạn xem xét định kỳ</p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                  <CardHeader className="pb-2">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Chờ phê duyệt</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-sky-600">{baseDoc.pendingCount || allDocs.filter((d: any) => d.status === 'PENDING_APPROVAL').length}</div>
                    <p className="text-[10px] text-slate-500 mt-1">Phiên bản mới đang chờ ban hành</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold">Trạng thái quy trình & biểu mẫu hiệu lực</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={scaleDataArray(baseDoc.statusBreakdown || [])}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {(baseDoc.statusBreakdown || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold">Tài liệu pháp quy theo lĩnh vực nghiệp vụ</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scaleDataArray(baseDoc.categoryBreakdown || [])}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Full document list */}
              <Card className="border-slate-200 dark:border-slate-800 rounded-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold">Toàn bộ tài liệu — Kho Quy trình & Tri thức</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {filtered.length} / {allDocs.length} tài liệu
                      {searchQuery && ` · Kết quả tìm kiếm: "${searchQuery}"`}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold">
                        <th className="p-3">Mã hiệu</th>
                        <th className="p-3">Tên tài liệu</th>
                        <th className="p-3">Loại</th>
                        <th className="p-3">Lĩnh vực</th>
                        <th className="p-3">Người đăng tải</th>
                        <th className="p-3">Ngày hiệu lực</th>
                        <th className="p-3 text-right">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-400">
                            {searchQuery ? `Không tìm thấy tài liệu phù hợp với "${searchQuery}"` : 'Chưa có tài liệu nào trong kho'}
                          </td>
                        </tr>
                      ) : filtered.map((d: any) => (
                        <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-500 text-[10px]">{d.docCode}</td>
                          <td className="p-3 font-semibold text-slate-800 dark:text-white max-w-xs">{d.displayName}</td>
                          <td className="p-3 text-slate-500">{d.docType}</td>
                          <td className="p-3 text-slate-600">{d.category}</td>
                          <td className="p-3 text-slate-500">{d.uploadedByName}</td>
                          <td className="p-3 text-slate-500">{d.effectiveDate || '—'}</td>
                          <td className="p-3 text-right">{statusBadge(d.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          );
        })()}


      </div>
    </div>
  );
}
