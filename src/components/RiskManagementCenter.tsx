import React, { useMemo } from 'react';
import { ShieldAlert, AlertTriangle, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface RiskItem {
  id: string;
  category: 'ADMISSION' | 'PROJECT' | 'HR' | 'OPERATIONAL';
  title: string;
  description: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  department: string;
}

export default function RiskManagementCenter() {
  const risks: RiskItem[] = [
    {
      id: 'risk_1',
      category: 'ADMISSION',
      title: 'Tuyển sinh chuyên Anh khối 10 đạt dưới chỉ tiêu dự phòng',
      description: 'Hiện tại mới tuyển được 120 học sinh so với chỉ tiêu tối thiểu 150 học sinh.',
      level: 'HIGH',
      department: 'Phòng Tuyển sinh & PR'
    },
    {
      id: 'risk_2',
      category: 'PROJECT',
      title: 'Dự án số hóa nâng cấp School OS trễ hạn bàn giao giai đoạn 1',
      description: 'Chậm trễ 8 ngày so với cột mốc milestone ngày 02/06 do vướng cơ chế đồng bộ cơ sở dữ liệu.',
      level: 'CRITICAL',
      department: 'Khối Hành chính & CNTT'
    },
    {
      id: 'risk_3',
      category: 'HR',
      title: 'Thiếu hụt cục bộ giáo viên Tin học chất lượng cao',
      description: 'Một giáo viên chuyên đề nộp đơn xin nghỉ đột xuất, chưa tìm được nhân sự thay thế thỏa đáng.',
      level: 'MEDIUM',
      department: 'Tổ Toán - Tin học'
    },
    {
      id: 'risk_4',
      category: 'OPERATIONAL',
      title: 'Tồn đọng hồ sơ nghiệm thu giáo án của Tổ Ngữ Văn',
      description: 'Hơn 15 giáo án chuyên đề chưa được duyệt báo cáo minh chứng trên hệ thống quá 7 ngày.',
      level: 'HIGH',
      department: 'Tổ Ngữ Văn'
    }
  ];

  const trendData = [
    { name: 'Tuần 1', 'Mức rủi ro': 35 },
    { name: 'Tuần 2', 'Mức rủi ro': 45 },
    { name: 'Tuần 3', 'Mức rủi ro': 60 },
    { name: 'Tuần 4', 'Mức rủi ro': 55 },
    { name: 'Tuần 5', 'Mức rủi ro': 68 }
  ];

  const getLevelBadge = (level: RiskItem['level']) => {
    switch (level) {
      case 'LOW':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350 border border-slate-200/50';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/40';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border border-orange-200/40';
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450 border border-rose-250/40 animate-pulse';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getCategoryLabel = (cat: RiskItem['category']) => {
    switch (cat) {
      case 'ADMISSION': return 'Rủi ro Tuyển sinh (Admissions)';
      case 'PROJECT': return 'Rủi ro Dự án (Project delay)';
      case 'HR': return 'Rủi ro Nhân sự (HR shortage)';
      case 'OPERATIONAL': return 'Rủi ro Vận hành (Operational)';
      default: return 'Khác';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2.5">
          <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border border-indigo-500/20 flex items-center gap-1 w-fit">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            Risk &amp; Auditing
          </span>
          <h2 className="text-xl md:text-2xl font-display font-black leading-tight">Trung Tâm Quản Trị Rủi Ro Học Đường</h2>
          <p className="text-xs text-slate-350 max-w-3xl font-light leading-relaxed">
            Giám sát rủi ro đa chiều: trễ hạn dự án, tuyển sinh dưới chỉ tiêu, quá tải nhân sự và ùn ứ công việc để kịp thời can thiệp điều hành.
          </p>
        </div>
      </div>

      {/* Overview and charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left column: Risks listing cards */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">
            Danh sách Sự vụ &amp; Điểm nghẽn rủi ro hiện tại
          </h3>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {risks.map(risk => (
              <div
                key={risk.id}
                className="p-4 bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-3xs flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 dark:text-slate-400 rounded-md font-mono">
                        {getCategoryLabel(risk.category)}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-[9px] font-bold text-indigo-700 dark:text-indigo-400 rounded-md">
                        {risk.department}
                      </span>
                    </div>
                    <h4 className="text-[12.5px] font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                      {risk.title}
                    </h4>
                    <p className="text-[11px] text-slate-450 mt-1">
                      {risk.description}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase font-mono tracking-wider shrink-0 ${getLevelBadge(risk.level)}`}>
                    {risk.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Risk Trend Line Chart */}
        <div className="lg:col-span-5 bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Biểu đồ xu hướng rủi ro học vụ (Risk Trend Chart)
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Đo lường chỉ số rủi ro tích lũy toàn trường qua các tuần học bồi dưỡng.
            </p>
          </div>

          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip />
                <Line type="monotone" dataKey="Mức rủi ro" stroke="#f43f5e" strokeWidth={2.5} dot={true} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-r from-rose-50/75 via-white to-rose-50/20 border border-rose-150 p-4 rounded-xl text-[10.5px] text-rose-950 leading-relaxed font-sans mt-4">
            <div className="flex items-start gap-2">
              <span className="text-rose-650 font-bold shrink-0">📌 Note:</span>
              <span>Chỉ số rủi ro tăng nhẹ 13% do vướng dự án nâng cấp chuyển đổi số phần mềm School OS chậm tiến độ giai đoạn 1. Đề nghị BGH đôn đốc ban CNTT.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
