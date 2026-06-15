'use client';

import {
  LineChart as LineChartIcon,
  Users,
  CalendarCheck,
  Star,
  UserCheck,
  Filter,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const trendData = [
  { month: '01/2025', total: 65, admission: 55, attendance: 70, teacher: 80 },
  { month: '02/2025', total: 65, admission: 54, attendance: 72, teacher: 78 },
  { month: '03/2025', total: 60, admission: 68, attendance: 68, teacher: 82 },
  { month: '04/2025', total: 65, admission: 75, attendance: 75, teacher: 85 },
  { month: '05/2025', total: 78.6, admission: 80, attendance: 92.1, teacher: 88.6 },
];

const facilityData = [
  { name: 'Cơ sở 1 - Minh Khai', value: 78.6, fill: '#2563eb' },
  { name: 'Cơ sở 2 - Lê Lợi', value: 74.2, fill: '#93c5fd' },
  { name: 'Cơ sở 3 - Trần Hưng Đạo', value: 71.8, fill: '#93c5fd' },
  { name: 'Cơ sở 4 - Nguyễn Du', value: 68.9, fill: '#93c5fd' },
  { name: 'Cơ sở 5 - Phan Đình Phùng', value: 66.5, fill: '#93c5fd' },
];

const completionData = [
  { name: 'Hoàn thành (≥100%)', value: 24, color: '#10b981' },
  { name: 'Đạt (80% - <100%)', value: 32, color: '#3b82f6' },
  { name: 'Cần cải thiện (50% - <80%)', value: 14, color: '#f59e0b' },
  { name: 'Chưa đạt (<50%)', value: 5, color: '#ef4444' },
];

export default function KpiDashboard() {
  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Báo cáo & Phân tích KPI
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Theo dõi hiệu suất và phân tích KPI toàn trường
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select className="block w-56 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
            <option>01/01/2025 - 16/05/2025</option>
          </select>
          <select className="hidden sm:block w-36 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
            <option>Tất cả cơ sở</option>
          </select>
          <select className="hidden md:block w-44 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
            <option>Tất cả phòng/ban</option>
          </select>
          <Button variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:hover:bg-blue-900/50 gap-2">
            <Filter className="h-4 w-4" /> Bộ lọc nâng cao
          </Button>
          <Button variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800 gap-2">
            <Download className="h-4 w-4" /> Xuất Excel
          </Button>
          <Button variant="outline" className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:border-red-800 gap-2">
            <FileText className="h-4 w-4" /> Xuất PDF
          </Button>
        </div>
      </div>

      {/* Top Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { title: 'Hiệu quả toàn trường', val: '78.6%', up: '5.4%', icon: LineChartIcon, color: 'text-blue-600', bg: 'bg-blue-600', spark: '#2563eb' },
          { title: 'Tuyển sinh', val: '642', up: '6.2%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-600', spark: '#9333ea' },
          { title: 'Chuyên cần', val: '92.1%', up: '2.9%', icon: CalendarCheck, color: 'text-sky-500', bg: 'bg-sky-500', spark: '#0ea5e9' },
          { title: 'Mức độ hài lòng', val: '4.35/5', up: '0.18', icon: Star, color: 'text-orange-500', bg: 'bg-orange-500', spark: '#f97316' },
          { title: 'Hiệu suất giáo viên', val: '88.6%', up: '7.3%', icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500', spark: '#10b981' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-start gap-3 mb-4">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0", stat.bg)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1">{stat.title}</p>
                  <h3 className={cn("text-xl font-bold", stat.color)}>{stat.val}</h3>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">↑ {stat.up} so với cùng kỳ</p>
                </div>
              </div>
              <div className="h-8 w-full mt-auto">
                {/* Mock Sparkline */}
                <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,15 Q10,10 20,12 T40,8 T60,14 T80,5 T100,2" fill="none" stroke={stat.spark} strokeWidth="2" strokeLinecap="round" />
                  {/* Dots */}
                  <circle cx="0" cy="15" r="2" fill={stat.spark} />
                  <circle cx="20" cy="12" r="2" fill={stat.spark} />
                  <circle cx="40" cy="8" r="2" fill={stat.spark} />
                  <circle cx="60" cy="14" r="2" fill={stat.spark} />
                  <circle cx="80" cy="5" r="2" fill={stat.spark} />
                  <circle cx="100" cy="2" r="2" fill={stat.spark} />
                </svg>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Line Chart */}
        <Card>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              Xu hướng hiệu suất theo thời gian <Info className="h-4 w-4 text-slate-400" />
            </CardTitle>
            <select className="text-xs border-slate-200 rounded-md bg-transparent">
              <option>Theo tháng</option>
            </select>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-600 mb-4 px-4">
              <span className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-blue-600" /> Hiệu quả toàn trường</span>
              <span className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-purple-600" /> Tuyển sinh</span>
              <span className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-sky-500" /> Chuyên cần</span>
              <span className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-emerald-500" /> Hiệu suất giáo viên</span>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: '#2563eb' }} />
                  <Line type="monotone" dataKey="admission" stroke="#9333ea" strokeWidth={2} dot={{ r: 3, fill: '#9333ea' }} />
                  <Line type="monotone" dataKey="attendance" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3, fill: '#0ea5e9' }} />
                  <Line type="monotone" dataKey="teacher" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Facility Comparison Bar Chart */}
        <Card>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">So sánh hiệu suất theo cơ sở</CardTitle>
            <select className="text-xs border-slate-200 rounded-md bg-transparent">
              <option>Theo hiệu quả toàn trường</option>
            </select>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[280px] w-full flex flex-col justify-center">
              {facilityData.map((item, index) => (
                <div key={index} className="flex items-center mb-4 last:mb-0">
                  <div className="w-36 shrink-0 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {item.name}
                  </div>
                  <div className="flex-1 flex items-center">
                    <div className="h-6 bg-blue-600 rounded-r-sm" style={{ width: `${item.value}%`, backgroundColor: item.fill }} />
                    <span className="ml-2 text-xs font-bold w-10">{item.value}%</span>
                    {index === 0 && <Badge variant="outline" className="ml-2 text-[10px] text-blue-600 border-blue-200 bg-blue-50 px-1.5 py-0">Bạn</Badge>}
                  </div>
                </div>
              ))}
              <div className="flex items-center mt-2 pl-36 border-t border-slate-200 pt-2 text-[10px] text-slate-400">
                <span className="flex-1 text-left">0%</span>
                <span className="flex-1 text-center">20%</span>
                <span className="flex-1 text-center">40%</span>
                <span className="flex-1 text-center">60%</span>
                <span className="flex-1 text-center">80%</span>
                <span className="flex-1 text-right">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* KPI Completion Pie */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-base font-bold">Tỷ lệ hoàn thành mục tiêu KPI</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="h-[180px] w-full relative mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-blue-600">78.6%</span>
                <span className="text-[10px] font-bold text-blue-800">Hoàn thành</span>
              </div>
            </div>
            
            <div className="space-y-2 mt-auto">
              {completionData.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white w-5 inline-block text-right">{item.value}</span>
                    <span className="text-slate-400 w-10 inline-block text-right">({((item.value / 75) * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center font-bold text-sm border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
              Tổng số KPI: 75
            </div>
          </CardContent>
        </Card>

        {/* Detailed KPI Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-bold">Bảng KPI chi tiết</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-900/50 uppercase border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-bold">KPI</th>
                    <th className="px-4 py-3 font-bold">Nhóm KPI</th>
                    <th className="px-4 py-3 font-bold text-center">Kỳ này</th>
                    <th className="px-4 py-3 font-bold text-center">Kỳ trước</th>
                    <th className="px-4 py-3 font-bold text-center">Xu hướng</th>
                    <th className="px-4 py-3 font-bold text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { name: 'Tỷ lệ tuyển sinh đạt chỉ tiêu', group: 'Tuyển sinh', cur: '107.0%', prev: '100.8%', trend: '6.2%', up: true, status: 'Hoàn thành', statCol: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
                    { name: 'Tỷ lệ chuyên cần', group: 'Học sinh', cur: '92.1%', prev: '89.2%', trend: '2.9%', up: true, status: 'Hoàn thành', statCol: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
                    { name: 'Tỷ lệ học sinh khá giỏi', group: 'Học tập', cur: '68.4%', prev: '64.1%', trend: '4.3%', up: true, status: 'Cần cải thiện', statCol: 'text-orange-600 border-orange-200 bg-orange-50' },
                    { name: 'Điểm TB môn Toán (Khối 12)', group: 'Học tập', cur: '7.65', prev: '7.32', trend: '0.33', up: true, status: 'Hoàn thành', statCol: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
                    { name: 'Mức độ hài lòng của PHHS', group: 'Hài lòng', cur: '4.35/5', prev: '4.17/5', trend: '0.18', up: true, status: 'Hoàn thành', statCol: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
                    { name: 'Hiệu suất giáo viên', group: 'Nhân sự', cur: '88.6%', prev: '81.3%', trend: '7.3%', up: true, status: 'Hoàn thành', statCol: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
                    { name: 'Tỷ lệ tiết dạy đúng kế hoạch', group: 'Giảng dạy', cur: '95.2%', prev: '93.0%', trend: '2.2%', up: true, status: 'Hoàn thành', statCol: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
                    { name: 'Tỷ lệ thu học phí đúng hạn', group: 'Tài chính', cur: '96.8%', prev: '94.1%', trend: '2.7%', up: true, status: 'Hoàn thành', statCol: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 text-[13px] text-slate-900 dark:text-slate-100 font-medium">{row.name}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-500">{row.group}</td>
                      <td className="px-4 py-3 text-center text-[13px] font-medium">{row.cur}</td>
                      <td className="px-4 py-3 text-center text-[13px] text-slate-500">{row.prev}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("text-[11px] font-bold flex items-center justify-center gap-0.5", row.up ? "text-emerald-600" : "text-red-500")}>
                          {row.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {row.trend}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className={cn("text-[10px] py-0", row.statCol)}>{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 text-right border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
              <span className="text-[11px] text-slate-500 pl-2">Hiển thị 1 - 8 / 75 KPI</span>
              <Button variant="link" className="text-sm font-bold text-blue-600 p-0 h-auto">
                Xem tất cả KPI <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Highlights */}
        <Card className="lg:col-span-1">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-bold">Nhận định nổi bật</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="p-4">
                <div className="flex gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">1. Tuyển sinh vượt chỉ tiêu 7.0%</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Số lượng học sinh tuyển mới đạt 642, vượt chỉ tiêu so với kế hoạch (600).
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Button variant="outline" size="sm" className="h-6 text-[10px] text-blue-600 border-blue-200">Hành động <ChevronRight className="h-3 w-3 ml-1" /></Button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">2. Chuyên cần cải thiện tích cực</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Tỷ lệ chuyên cần tăng 2.9% so với cùng kỳ. Duy trì tốt nề nếp học sinh.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Button variant="outline" size="sm" className="h-6 text-[10px] text-emerald-600 border-emerald-200">Hành động <ChevronRight className="h-3 w-3 ml-1" /></Button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">3. Tỷ lệ HS khá giỏi còn thấp</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Chỉ đạt 68.4%, thấp hơn mục tiêu 75%. Cần tăng cường phụ đạo và bồi dưỡng.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Button variant="outline" size="sm" className="h-6 text-[10px] text-orange-600 border-orange-200">Hành động <ChevronRight className="h-3 w-3 ml-1" /></Button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">4. Hiệu suất giáo viên tăng mạnh</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Tăng 7.3% nhờ cải thiện kế hoạch giảng dạy và đánh giá định kỳ.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Button variant="outline" size="sm" className="h-6 text-[10px] text-purple-600 border-purple-200">Hành động <ChevronRight className="h-3 w-3 ml-1" /></Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
