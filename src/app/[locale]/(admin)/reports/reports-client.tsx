'use client';

import { useState, useEffect } from 'react';
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
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/components/ui/Toast';
import { BarChart3, PieChartIcon, TrendingUp, DollarSign, GraduationCap, FileSpreadsheet } from 'lucide-react';

interface ChartItem {
  name: string;
  value: number;
}

interface FunnelItem {
  name: string;
  count: number;
}

interface ReportsClientProps {
  locale: string;
  data: {
    leadsBySource: ChartItem[];
    leadsByStatus: ChartItem[];
    conversionFunnel: FunnelItem[];
    revenueByPaymentType: ChartItem[];
    enrollmentByGrade: ChartItem[];
  };
}

// Curated modern color palette
const COLORS = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#14b8a6', // Teal
];

export default function ReportsClient({ locale, data }: ReportsClientProps) {
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch with Recharts dynamic sizing
  useEffect(() => {
    setMounted(true);
  }, []);

  const { success: toastSuccess } = useToast();

  if (!mounted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Đang tải biểu đồ phân tích...</p>
        </div>
      </div>
    );
  }

  // Format currency helper
  const formatCurrency = (val: number) => {
    return `${val.toLocaleString('vi-VN')} đ`;
  };

  const handleExportReportCSV = () => {
    const sections = [
      { title: 'Phễu Chuyển Đổi', headers: ['Giai Đoạn', 'Số Lượng'], rows: data.conversionFunnel.map(d => [d.name, d.count]) },
      { title: 'Nguồn Lead', headers: ['Nguồn', 'Số Lượng'], rows: data.leadsBySource.map(d => [d.name, d.value]) },
      { title: 'Trạng Thái Lead', headers: ['Trạng Thái', 'Số Lượng'], rows: data.leadsByStatus.map(d => [d.name, d.value]) },
      { title: 'Doanh Thu', headers: ['Loại Phí', 'Số Tiền (VND)'], rows: data.revenueByPaymentType.map(d => [d.name, d.value]) },
      { title: 'Nhập Học Theo Khối', headers: ['Khối Lớp', 'Số Học Sinh'], rows: data.enrollmentByGrade.map(d => [d.name, d.value]) },
    ];
    let csv = '\uFEFF';
    sections.forEach(section => {
      csv += `"=== ${section.title} ===\n"`;
      csv += section.headers.map(h => `"${h}"`).join(',') + '\n';
      section.rows.forEach((row: any[]) => {
        csv += row.map(v => `"${String(v)}"`).join(',') + '\n';
      });
      csv += '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MIS_Reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastSuccess('Xuất báo cáo thành công', 'Báo cáo CSV đã được tải xuống');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            Báo Cáo & Phân Tích Tuyển Sinh
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Phân tích chuyên sâu nguồn học sinh, hiệu quả chuyển đổi phễu tuyển sinh và doanh thu nhập học.
          </p>
        </div>
        <Button variant="outline" onClick={handleExportReportCSV} className="hidden sm:flex gap-2 shrink-0">
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          Xuất báo cáo CSV
        </Button>
      </div>

      {/* Grid containing reports */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Funnel: Conversion Funnel */}
        <Card className="md:col-span-2 border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                Phễu chuyển đổi tuyển sinh (Conversion Funnel)
              </CardTitle>
              <CardDescription className="text-xs">
                Số lượng ứng viên lũy kế qua từng chặng trong phễu tuyển sinh.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.conversionFunnel}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-slate-800/50" />
                  <XAxis dataKey="name" stroke="#888888" className="font-semibold" />
                  <YAxis stroke="#888888" className="font-semibold" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      color: '#0f172a',
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Số ứng viên"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorFunnel)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 1. Leads by Status */}
        <Card className="border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500">
              <PieChartIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                Tỷ lệ trạng thái hồ sơ
              </CardTitle>
              <CardDescription className="text-xs">
                Cơ cấu trạng thái của toàn bộ hồ sơ đăng ký.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full text-xs">
              {data.leadsByStatus.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  Không có dữ liệu
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.leadsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.leadsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. Revenue by Payment Type */}
        <Card className="border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                Doanh thu theo loại quỹ thu
              </CardTitle>
              <CardDescription className="text-xs">
                Tổng doanh thu thực tế đã thu (VND) theo từng danh mục.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.revenueByPaymentType}
                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-slate-800/50" />
                  <XAxis dataKey="name" stroke="#888888" className="font-semibold" />
                  <YAxis
                    stroke="#888888"
                    tickFormatter={v => `${(v / 1000000).toFixed(0)}M`}
                    className="font-semibold"
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]}>
                    {data.revenueByPaymentType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. Leads by Source */}
        <Card className="border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-500">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                Nguồn học sinh đăng ký
              </CardTitle>
              <CardDescription className="text-xs">
                Số lượng ứng viên thu thập được chia theo nguồn kênh tuyển sinh.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full text-xs">
              {data.leadsBySource.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  Không có dữ liệu
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.leadsBySource}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-slate-100 dark:stroke-slate-800/50" />
                    <XAxis type="number" stroke="#888888" className="font-semibold" />
                    <YAxis dataKey="name" type="category" stroke="#888888" width={80} className="font-semibold" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" name="Ứng viên" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
                      {data.leadsBySource.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 4. Enrollment by Grade */}
        <Card className="border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-500">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                Học sinh nhập học theo khối lớp
              </CardTitle>
              <CardDescription className="text-xs">
                Số lượng ứng viên chính thức nhập học thành công (Enrolled) theo các khối.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full text-xs">
              {data.enrollmentByGrade.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  Chưa có học sinh nhập học chính thức
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.enrollmentByGrade}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-slate-800/50" />
                    <XAxis dataKey="name" stroke="#888888" className="font-semibold" />
                    <YAxis stroke="#888888" className="font-semibold" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" name="Nhập học chính thức" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                      {data.enrollmentByGrade.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
