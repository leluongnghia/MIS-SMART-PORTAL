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
import { BarChart3, PieChartIcon, TrendingUp, DollarSign, GraduationCap, FileSpreadsheet, Download, Eye } from 'lucide-react';

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

  const formatCurrency = (val: number) => {
    return `${val.toLocaleString('vi-VN')} đ`;
  };

  const { success: toastSuccess } = useToast();

  const escapeExcel = (value: unknown) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const buildReadableExcel = () => {
    const today = new Date().toLocaleDateString('vi-VN');
    const sections = [
      { title: 'Phễu Chuyển Đổi', headers: ['Giai đoạn', 'Số lượng', 'Ghi chú'], rows: data.conversionFunnel.map(d => [d.name, d.count, 'Theo thứ tự trong phễu tuyển sinh']) },
      { title: 'Nguồn Lead', headers: ['Nguồn', 'Số lượng', 'Tỷ trọng'], rows: data.leadsBySource.map(d => [d.name, d.value, `${Math.round((d.value / Math.max(1, data.leadsBySource.reduce((sum, item) => sum + item.value, 0))) * 100)}%`]) },
      { title: 'Trạng Thái Lead', headers: ['Trạng thái', 'Số lượng', 'Mục đích đọc'], rows: data.leadsByStatus.map(d => [d.name, d.value, 'Theo dõi tình trạng hồ sơ']) },
      { title: 'Doanh Thu', headers: ['Loại phí', 'Số tiền (VND)', 'Hiển thị'], rows: data.revenueByPaymentType.map(d => [d.name, d.value, formatCurrency(d.value)]) },
      { title: 'Nhập Học Theo Khối', headers: ['Khối lớp', 'Số học sinh', 'Nhóm báo cáo'], rows: data.enrollmentByGrade.map(d => [d.name, d.value, 'Học sinh đã nhập học']) },
    ];

    return `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  body { font-family: Arial, sans-serif; color: #0f172a; }
  .title { font-size: 22px; font-weight: 800; color: #1d4ed8; }
  .meta { color: #64748b; font-size: 12px; margin-bottom: 16px; }
  .section { margin-top: 22px; font-size: 16px; font-weight: 800; color: #065f46; }
  table { border-collapse: collapse; width: 100%; margin-top: 8px; }
  th { background: #1d4ed8; color: white; font-weight: 800; text-align: left; padding: 9px; border: 1px solid #93c5fd; }
  td { padding: 8px; border: 1px solid #dbeafe; }
  tr:nth-child(even) td { background: #f8fafc; }
  .number { text-align: right; font-weight: 700; color: #047857; }
</style></head><body>
  <div class="title">MIS SMART PORTAL - Báo cáo nhanh tuyển sinh</div>
  <div class="meta">Ngày xuất: ${today} • Định dạng tối ưu để mở bằng Excel</div>
  ${sections.map(section => `
    <div class="section">${escapeExcel(section.title)}</div>
    <table>
      <thead><tr>${section.headers.map(header => `<th>${escapeExcel(header)}</th>`).join('')}</tr></thead>
      <tbody>${section.rows.map(row => `<tr>${row.map((cell, index) => `<td class="${typeof cell === 'number' || index === 1 ? 'number' : ''}">${escapeExcel(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
  `).join('')}
</body></html>`;
  };

  const handleExportReportExcel = () => {
    const excelHtml = buildReadableExcel();
    const blob = new Blob(['\uFEFF', excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MIS_Bao_Cao_Nhanh_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toastSuccess('Xuất Excel thành công', 'File .xls đã có tiêu đề, bảng rõ ràng, màu header và số căn phải');
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
        <Button variant="outline" onClick={handleExportReportExcel} className="hidden sm:flex gap-2 shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          <FileSpreadsheet className="h-4 w-4" />
          Xuất Excel dễ đọc
        </Button>
      </div>

      <Card className="overflow-hidden border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 shadow-sm dark:border-emerald-950 dark:from-emerald-950/30 dark:via-slate-950 dark:to-blue-950/20">
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="p-5 sm:p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-black text-emerald-700 shadow-sm dark:border-emerald-900/60 dark:bg-slate-950/70 dark:text-emerald-300">
                <Download className="h-3.5 w-3.5" />
                Xuất Excel tối ưu
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-950 dark:text-white">File Excel rõ ràng, mở ra đọc ngay</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Báo cáo xuất ra dạng <b>.xls</b> có tiêu đề, ngày xuất, từng nhóm bảng riêng, header màu xanh, số liệu căn phải và dòng xen kẽ để dễ đọc/in ấn.
              </p>
              <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Không còn CSV rời rạc khó nhìn</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" />Mỗi phần báo cáo có bảng riêng</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" />Dễ copy, lọc, in hoặc gửi BGH</div>
              </div>
              <Button onClick={handleExportReportExcel} className="mt-5 gap-2 bg-emerald-600 hover:bg-emerald-700">
                <FileSpreadsheet className="h-4 w-4" />
                Tải file Excel mẫu
              </Button>
            </div>
            <div className="border-t border-emerald-100 bg-white/80 p-4 dark:border-emerald-950 dark:bg-slate-950/60 lg:border-l lg:border-t-0">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-slate-500"><Eye className="h-4 w-4" /> Ảnh ví dụ khi mở bằng Excel</div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">MIS_Bao_Cao_Nhanh.xls</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-3 py-2 dark:border-slate-800 dark:bg-slate-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-[10px] font-bold text-slate-500">Excel Preview</span>
                </div>
                <div className="p-3 text-[10px]">
                  <div className="mb-2 text-base font-black text-blue-700">MIS SMART PORTAL - Báo cáo nhanh tuyển sinh</div>
                  <div className="mb-3 text-slate-500">Ngày xuất: 16/06/2026 • Định dạng tối ưu để mở bằng Excel</div>
                  <div className="mb-1 font-black text-emerald-700">Phễu Chuyển Đổi</div>
                  <table className="w-full border-collapse overflow-hidden text-left">
                    <thead>
                      <tr className="bg-blue-700 text-white">
                        <th className="border border-blue-200 px-2 py-1.5">Giai đoạn</th>
                        <th className="border border-blue-200 px-2 py-1.5 text-right">Số lượng</th>
                        <th className="border border-blue-200 px-2 py-1.5">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.conversionFunnel.slice(0, 4).map((item, index) => (
                        <tr key={item.name} className={index % 2 ? 'bg-slate-50 dark:bg-slate-800/70' : ''}>
                          <td className="border border-blue-100 px-2 py-1.5">{item.name}</td>
                          <td className="border border-blue-100 px-2 py-1.5 text-right font-black text-emerald-700">{item.count}</td>
                          <td className="border border-blue-100 px-2 py-1.5 text-slate-500">Theo thứ tự trong phễu</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
