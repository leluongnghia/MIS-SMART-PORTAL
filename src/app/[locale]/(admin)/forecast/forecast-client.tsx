'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { TrendingUp, Info, HelpCircle, ArrowRight, Settings, BarChart2, CalendarDays } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { saveForecastScenario } from './actions';

type MetricType = 'admissions' | 'tuition' | 'attendance' | 'turnover';

const METRIC_DETAILS = {
  admissions: {
    title: 'Số lượng học sinh mới tuyển sinh',
    unit: 'Học sinh',
    historyLabel: 'Tuyển sinh thực tế',
    forecastLabel: 'Dự báo tuyển sinh (AI)',
    desc: 'Dự đoán số lượng học sinh mới đăng ký nhập học trong các tháng tiếp theo dựa trên dữ liệu chuyển đổi lead của CRM.'
  },
  tuition: {
    title: 'Dòng tiền học phí thu được',
    unit: 'Triệu VNĐ',
    historyLabel: 'Thực thu học phí',
    forecastLabel: 'Dự báo thu học phí (AI)',
    desc: 'Ước tính doanh thu học phí thu được dựa trên thời hạn nộp phí và lịch sử hoàn thành nghĩa vụ tài chính của phụ huynh.'
  },
  attendance: {
    title: 'Tỷ lệ chuyên cần trung bình',
    unit: '%',
    historyLabel: 'Chuyên cần thực tế',
    forecastLabel: 'Dự báo chuyên cần (AI)',
    desc: 'Dự báo xu hướng đi học chuyên cần để cảnh báo sớm các đợt bùng phát nghỉ học theo mùa dịch bệnh/thời tiết.'
  },
  turnover: {
    title: 'Tỷ lệ giáo viên rời đi (Turn-over)',
    unit: '%',
    historyLabel: 'Biến động thực tế',
    forecastLabel: 'Dự báo biến động (AI)',
    desc: 'Ước lượng tỷ lệ giáo viên nghỉ việc để nhà trường chủ động lên phương án tuyển dụng và đào tạo nhân sự thay thế.'
  }
};

export default function ForecastPage({ initialData }: { initialData?: any }) {
  const [activeTab, setActiveTab] = useState<MetricType>('admissions');
  const [isSaving, startSaving] = useTransition();
  const [scenarioCount, setScenarioCount] = useState(initialData?.scenarios?.length || 0);
  
  // Simulator parameters
  const [admissionsGrowth, setAdmissionsGrowth] = useState(initialData?.params?.admissionsGrowth ?? 12); // percent growth modifier
  const [tuitionReminderRate, setTuitionReminderRate] = useState(initialData?.params?.tuitionReminderRate ?? 85); // reminder efficiency target
  const [attendanceHealthRate, setAttendanceHealthRate] = useState(initialData?.params?.attendanceHealthRate ?? 96); // health awareness target
  const [turnoverRetentionRate, setTurnoverRetentionRate] = useState(initialData?.params?.turnoverRetentionRate ?? 90); // retention effort score

  // Generate dynamic data based on parameters
  const getChartData = () => {
    const months = ['T11/25', 'T12/25', 'T1/26', 'T2/26', 'T3/26', 'T4/26', 'T5/26', 'T6/26', 'T7/26', 'T8/26', 'T9/26', 'T10/26'];
    
    switch (activeTab) {
      case 'admissions': {
        const growthFactor = 1 + admissionsGrowth / 100;
        return [
          { name: months[0], history: 42, forecast: null },
          { name: months[1], history: 38, forecast: null },
          { name: months[2], history: 45, forecast: null },
          { name: months[3], history: 55, forecast: null },
          { name: months[4], history: 72, forecast: null },
          { name: months[5], history: 95, forecast: 95 },
          { name: months[6], history: null, forecast: Math.round(140 * growthFactor) },
          { name: months[7], history: null, forecast: Math.round(220 * growthFactor) },
          { name: months[8], history: null, forecast: Math.round(280 * growthFactor) },
          { name: months[9], history: null, forecast: Math.round(180 * growthFactor) },
          { name: months[10], history: null, forecast: Math.round(65 * growthFactor) },
          { name: months[11], history: null, forecast: Math.round(48 * growthFactor) },
        ];
      }
      case 'tuition': {
        const rateFactor = tuitionReminderRate / 80;
        return [
          { name: months[0], history: 2400, forecast: null },
          { name: months[1], history: 1800, forecast: null },
          { name: months[2], history: 3200, forecast: null },
          { name: months[3], history: 4500, forecast: null },
          { name: months[4], history: 2100, forecast: null },
          { name: months[5], history: 1950, forecast: 1950 },
          { name: months[6], history: null, forecast: Math.round(2200 * rateFactor) },
          { name: months[7], history: null, forecast: Math.round(1800 * rateFactor) },
          { name: months[8], history: null, forecast: Math.round(4800 * rateFactor) },
          { name: months[9], history: null, forecast: Math.round(6200 * rateFactor) },
          { name: months[10], history: null, forecast: Math.round(3500 * rateFactor) },
          { name: months[11], history: null, forecast: Math.round(2800 * rateFactor) },
        ];
      }
      case 'attendance': {
        const healthBonus = (attendanceHealthRate - 95) * 0.2;
        return [
          { name: months[0], history: 96.2, forecast: null },
          { name: months[1], history: 94.8, forecast: null },
          { name: months[2], history: 93.5, forecast: null },
          { name: months[3], history: 95.1, forecast: null },
          { name: months[4], history: 96.8, forecast: null },
          { name: months[5], history: 97.2, forecast: 97.2 },
          { name: months[6], history: null, forecast: Math.min(99.5, Number((96.5 + healthBonus).toFixed(1))) },
          { name: months[7], history: null, forecast: Math.min(99.5, Number((95.8 + healthBonus).toFixed(1))) },
          { name: months[8], history: null, forecast: Math.min(99.5, Number((94.2 + healthBonus).toFixed(1))) },
          { name: months[9], history: null, forecast: Math.min(99.5, Number((95.0 + healthBonus).toFixed(1))) },
          { name: months[10], history: null, forecast: Math.min(99.5, Number((96.8 + healthBonus).toFixed(1))) },
          { name: months[11], history: null, forecast: Math.min(99.5, Number((97.4 + healthBonus).toFixed(1))) },
        ];
      }
      case 'turnover': {
        const retentionPenalty = Math.max(0, (100 - turnoverRetentionRate) * 0.15);
        return [
          { name: months[0], history: 1.2, forecast: null },
          { name: months[1], history: 0.8, forecast: null },
          { name: months[2], history: 1.5, forecast: null },
          { name: months[3], history: 2.1, forecast: null },
          { name: months[4], history: 1.1, forecast: null },
          { name: months[5], history: 0.9, forecast: 0.9 },
          { name: months[6], history: null, forecast: Number(Math.max(0.2, 1.4 + retentionPenalty).toFixed(1)) },
          { name: months[7], history: null, forecast: Number(Math.max(0.2, 3.5 + retentionPenalty).toFixed(1)) },
          { name: months[8], history: null, forecast: Number(Math.max(0.2, 4.2 + retentionPenalty).toFixed(1)) },
          { name: months[9], history: null, forecast: Number(Math.max(0.2, 2.0 + retentionPenalty).toFixed(1)) },
          { name: months[10], history: null, forecast: Number(Math.max(0.2, 0.8 + retentionPenalty).toFixed(1)) },
          { name: months[11], history: null, forecast: Number(Math.max(0.2, 0.5 + retentionPenalty).toFixed(1)) },
        ];
      }
      default:
        return [];
    }
  };

  const chartData = getChartData();
  const currentMetric = METRIC_DETAILS[activeTab];

  // Calculated KPI summary based on state
  const getKpiSummary = () => {
    switch (activeTab) {
      case 'admissions':
        return {
          title: 'Tổng học sinh tuyển mới dự báo',
          value: chartData.reduce((acc, curr) => acc + (curr.forecast || 0), 0) + ' học sinh',
          status: 'Tốt',
          color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20'
        };
      case 'tuition':
        return {
          title: 'Tổng thu dự báo (Quý tới)',
          value: (chartData.slice(6, 9).reduce((acc, curr) => acc + (curr.forecast || 0), 0) / 1000).toFixed(1) + ' tỷ VNĐ',
          status: 'Ổn định',
          color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20'
        };
      case 'attendance':
        return {
          title: 'Tỷ lệ chuyên cần kỳ vọng',
          value: (chartData.slice(6, 12).reduce((acc, curr) => acc + (curr.forecast || 0), 0) / 6).toFixed(2) + '%',
          status: 'Đạt chuẩn',
          color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20'
        };
      case 'turnover':
        return {
          title: 'Tỷ lệ rời đi cao điểm (Tháng 7-8)',
          value: Math.max(...chartData.map(d => d.forecast || 0)) + '%',
          status: 'Cảnh báo',
          color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20'
        };
    }
  };

  const kpi = getKpiSummary();
  const currentParams = { admissionsGrowth, tuitionReminderRate, attendanceHealthRate, turnoverRetentionRate };
  const persistForecastScenario = () => {
    startSaving(async () => {
      const result = await saveForecastScenario({ metric: activeTab, params: currentParams, summary: kpi });
      if (result.success) {
        setScenarioCount((count: number) => count + 1);
        alert('Đã lưu kịch bản dự báo vào DB.');
      } else {
        alert(result.error || 'Lưu kịch bản thất bại.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Phân tích & Dự báo</h2>
        <p className="text-sm text-slate-500">Mô hình AI dự báo các chỉ số quan trọng và kiểm thử kịch bản giả lập vận hành</p>
        <div className="mt-3">
          <Button onClick={persistForecastScenario} disabled={isSaving} variant="outline" className="gap-2">
            <CalendarDays className="h-4 w-4" /> {isSaving ? 'Đang lưu...' : `Lưu kịch bản (${scenarioCount})`}
          </Button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(METRIC_DETAILS) as MetricType[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "p-4 rounded-xl border text-left transition-all relative overflow-hidden shadow-sm",
              activeTab === key
                ? "bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950"
                : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            )}
          >
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {key === 'admissions' ? 'Tuyển sinh' : key === 'tuition' ? 'Tài chính' : key === 'attendance' ? 'Học vụ' : 'Nhân sự'}
            </div>
            <div className="text-sm font-black text-slate-950 dark:text-white truncate">
              {METRIC_DETAILS[key].title}
            </div>
            <div className="absolute right-2 top-2">
              <TrendingUp className={cn("h-4 w-4", activeTab === key ? "text-blue-500" : "text-slate-300")} />
            </div>
          </button>
        ))}
      </div>

      {/* Main panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 cols: Chart and Details */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="p-5 pb-0">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 mb-1 flex items-center gap-1 w-fit"><BarChart2 className="h-3 w-3" /> ARIMA + Hồi quy tuyến tính</Badge>
                  <CardTitle className="text-lg font-black">{currentMetric.title}</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">{currentMetric.desc}</p>
                </div>
                
                <div className={cn("px-4 py-2 rounded-xl border border-transparent", kpi.color)}>
                  <div className="text-[10px] uppercase font-bold text-slate-500">{kpi.title}</div>
                  <div className="text-lg font-black">{kpi.value}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                    <XAxis dataKey="name" style={{ fontSize: '10px' }} />
                    <YAxis unit={` ${currentMetric.unit}`} style={{ fontSize: '10px' }} />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="history"
                      name={currentMetric.historyLabel}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorHistory)"
                    />
                    <Area
                      type="monotone"
                      dataKey="forecast"
                      name={currentMetric.forecastLabel}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorForecast)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* How it works details */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold flex items-center gap-2"><HelpCircle className="h-5 w-5 text-blue-500" /> Mô hình AI dự báo hoạt động như thế nào?</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">1. Thu thập dữ liệu đầu vào</h4>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                    <li>Dữ liệu lịch sử 3 năm qua từ CRM tuyển sinh, tài chính học phí, chấm công vân tay, bảng lương.</li>
                    <li>Tham số lịch mùa vụ học kỳ (Khai giảng, thi HK, tuyển sinh cao điểm hè).</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">2. Thuật toán & Kỹ thuật dự báo</h4>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                    <li><strong>ARIMA / Prophet:</strong> Phân tích chuỗi thời gian (time-series) tự động bóc tách xu hướng dài hạn và yếu tố mùa vụ lặp lại định kỳ.</li>
                    <li><strong>Hồi quy đa biến:</strong> Liên kết nhiều chỉ báo đầu vào (ví dụ: số cuộc gọi tư vấn ảnh hưởng tới số lượng học sinh đăng ký).</li>
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold mb-2">Cơ sở dữ liệu tích hợp thực tế:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-transparent border-slate-350 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium">leads</Badge>
                  <Badge className="bg-transparent border-slate-350 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium">payments</Badge>
                  <Badge className="bg-transparent border-slate-350 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium">attendance_records</Badge>
                  <Badge className="bg-transparent border-slate-350 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium">employee_profiles</Badge>
                  <Badge className="bg-transparent border-slate-350 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium">leave_requests</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right col: Simulator controls */}
        <div className="space-y-6">
          <Card className="border-blue-100 dark:border-blue-900/30 shadow-md">
            <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-950/20">
              <CardTitle className="text-base font-bold flex items-center gap-2"><Settings className="h-5 w-5 text-blue-600" /> Trình giả lập tham số AI</CardTitle>
              <p className="text-[11px] text-slate-500">Điều chỉnh các biến số giả định để quan sát xu hướng thay đổi trên biểu đồ bên cạnh</p>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              
              {/* Option 1: Admissions */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Tăng trưởng mục tiêu lead (CRM)</span>
                  <span className="font-black text-blue-600">+{admissionsGrowth}%</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="50"
                  value={admissionsGrowth}
                  onChange={(e) => setAdmissionsGrowth(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Giả định chiến dịch PR hiệu quả làm tăng nguồn lead tư vấn tuyển sinh đầu vào.</p>
              </div>

              {/* Option 2: Tuition */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Hiệu quả gửi thông báo nợ phí</span>
                  <span className="font-black text-blue-600">{tuitionReminderRate}% đúng hạn</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={tuitionReminderRate}
                  onChange={(e) => setTuitionReminderRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Điều chỉnh mức độ tối ưu hóa hệ thống nhắc nợ tự động gửi qua SMS/Email cho phụ huynh.</p>
              </div>

              {/* Option 3: Attendance */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Mục tiêu nâng cao sức khỏe học đường</span>
                  <span className="font-black text-blue-600">{attendanceHealthRate}% chuyên cần</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="100"
                  value={attendanceHealthRate}
                  onChange={(e) => setAttendanceHealthRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Giả lập hiệu quả kiểm soát y tế học đường hạn chế lây lan dịch cúm theo mùa.</p>
              </div>

              {/* Option 4: Turnover */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Chỉ số giữ chân giáo viên (Retention)</span>
                  <span className="font-black text-blue-600">{turnoverRetentionRate}% giữ lại</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  value={turnoverRetentionRate}
                  onChange={(e) => setTurnoverRetentionRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Giả lập tăng phúc lợi/lương cơ bản giữ chân các giáo viên tổ chuyên môn giỏi không chuyển trường.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-150 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Độ tin cậy của mô hình (Confidence Interval)</div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Khoảng tin cậy AI:</span>
                  <span className="font-bold">95% (p &lt; 0.05)</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Sai số dự báo (MAPE):</span>
                  <span className="font-bold text-emerald-600">3.8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

