import React, { useState, useMemo } from 'react';
import { Target, Sparkles, Plus, Award, ChevronRight, BarChart3, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface Objective {
  id: string;
  title: string;
  department: string;
  year: string;
  progress: number;
  keyResults: KeyResult[];
}

interface KeyResult {
  id: string;
  title: string;
  target: string;
  current: string;
  progress: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND';
}

export default function StrategyOkrHub() {
  const [objectives, setObjectives] = useState<Objective[]>([
    {
      id: 'obj_1',
      title: 'Trở thành trường tư thục hàng đầu khu vực về giáo dục phát triển Đa Trí Tuệ',
      department: 'Ban Giám hiệu',
      year: '2025-2026',
      progress: 78,
      keyResults: [
        { id: 'kr_1_1', title: 'Tuyển sinh đạt chỉ tiêu học sinh mới', target: '1500 học sinh', current: '1380 học sinh', progress: 92, status: 'ON_TRACK' },
        { id: 'kr_1_2', title: 'Tỷ lệ phụ huynh hài lòng qua khảo sát định kỳ', target: '90% phụ huynh', current: '88% phụ huynh', progress: 97, status: 'ON_TRACK' },
        { id: 'kr_1_3', title: 'Học sinh đạt chuẩn đầu ra ngoại ngữ Cambridge', target: '95% học sinh', current: '78% học sinh', progress: 82, status: 'AT_RISK' }
      ]
    },
    {
      id: 'obj_2',
      title: 'Đẩy mạnh chuyển đổi số toàn diện hoạt động dạy, học và điều hành quản trị',
      department: 'Phòng Hành chính & CNTT',
      year: '2025-2026',
      progress: 65,
      keyResults: [
        { id: 'kr_2_1', title: 'Số hóa 100% học liệu giáo án điện tử tổ chuyên môn', target: '100%', current: '80%', progress: 80, status: 'ON_TRACK' },
        { id: 'kr_2_2', title: 'Triển khai vận hành trơn tru School OS điều hành công việc', target: 'Hoàn thành 100%', current: 'Đang chạy thử nghiệm', progress: 50, status: 'AT_RISK' }
      ]
    },
    {
      id: 'obj_3',
      title: 'Xây dựng môi trường học đường hạnh phúc, tư vấn tham vấn tâm lý học sinh tích cực',
      department: 'Tổ Công tác Học sinh',
      year: '2025-2026',
      progress: 85,
      keyResults: [
        { id: 'kr_3_1', title: 'Tổ chức chuyên đề tư vấn tâm lý học đường cho các khối', target: '12 chuyên đề', current: '11 chuyên đề', progress: 91, status: 'ON_TRACK' },
        { id: 'kr_3_2', title: 'Giảm thiểu tỷ lệ sự vụ vi phạm nề nếp kỷ luật học sinh', target: 'Giảm 30%', current: 'Giảm 25%', progress: 83, status: 'ON_TRACK' }
      ]
    }
  ]);

  // Form states
  const [showAddObjective, setShowAddObjective] = useState(false);
  const [newObjTitle, setNewObjTitle] = useState('');
  const [newObjDept, setNewObjDept] = useState('Ban Giám hiệu');
  const [newObjYear, setNewObjYear] = useState('2025-2026');

  const [selectedObjIdForKr, setSelectedObjIdForKr] = useState<string | null>(null);
  const [newKrTitle, setNewKrTitle] = useState('');
  const [newKrTarget, setNewKrTarget] = useState('');
  const [newKrCurrent, setNewKrCurrent] = useState('');
  const [newKrProgress, setNewKrProgress] = useState(0);
  const [newKrStatus, setNewKrStatus] = useState<'ON_TRACK' | 'AT_RISK' | 'BEHIND'>('ON_TRACK');

  // Chart data
  const chartData = useMemo(() => {
    let onTrack = 0;
    let atRisk = 0;
    let behind = 0;

    objectives.forEach(obj => {
      obj.keyResults.forEach(kr => {
        if (kr.status === 'ON_TRACK') onTrack++;
        else if (kr.status === 'AT_RISK') atRisk++;
        else behind++;
      });
    });

    return [
      { name: 'Đúng tiến độ (On track)', value: onTrack, color: '#10B981' },
      { name: 'Có nguy cơ trễ (At risk)', value: atRisk, color: '#F59E0B' },
      { name: 'Trễ hạn nghiêm trọng', value: behind, color: '#EF4444' }
    ];
  }, [objectives]);

  const handleAddObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjTitle.trim()) return;

    const newObj: Objective = {
      id: `obj_${Date.now()}`,
      title: newObjTitle.trim(),
      department: newObjDept,
      year: newObjYear,
      progress: 0,
      keyResults: []
    };

    setObjectives([...objectives, newObj]);
    setNewObjTitle('');
    setShowAddObjective(false);
  };

  const handleAddKeyResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObjIdForKr || !newKrTitle.trim() || !newKrTarget.trim()) return;

    const newKr: KeyResult = {
      id: `kr_${Date.now()}`,
      title: newKrTitle.trim(),
      target: newKrTarget.trim(),
      current: newKrCurrent.trim() || '0%',
      progress: Number(newKrProgress) || 0,
      status: newKrStatus
    };

    setObjectives(prev => prev.map(obj => {
      if (obj.id === selectedObjIdForKr) {
        const updatedKrs = [...obj.keyResults, newKr];
        const avgProgress = Math.round(updatedKrs.reduce((sum, kr) => sum + kr.progress, 0) / updatedKrs.length);
        return {
          ...obj,
          keyResults: updatedKrs,
          progress: avgProgress
        };
      }
      return obj;
    }));

    setNewKrTitle('');
    setNewKrTarget('');
    setNewKrCurrent('');
    setNewKrProgress(0);
    setNewKrStatus('ON_TRACK');
    setSelectedObjIdForKr(null);
  };

  return (
    <div className="space-y-6">
      {/* Strategic Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2.5">
          <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border border-indigo-500/20 flex items-center gap-1 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Strategic Management
          </span>
          <h2 className="text-xl md:text-2xl font-display font-black leading-tight">Định Hướng Chiến Lược & Quản Trị OKRs</h2>
          <p className="text-xs text-slate-350 max-w-3xl font-light leading-relaxed">
            Liên kết trực tiếp mục tiêu phát triển dài hạn của Hội đồng trường với kế hoạch năm học và công việc hàng ngày của từng bộ phận chức năng.
          </p>
        </div>
      </div>

      {/* Strategic Cascade: Vision to Task */}
      <section className="bg-white dark:bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm mb-4">Cấu Trúc Hoạt Động (Strategic Cascade Flow)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-center text-xs font-bold text-slate-700 dark:text-slate-200">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block mb-1">Cấp 1</span>
            <span className="block text-slate-900 dark:text-white font-extrabold">Vision (Tầm nhìn)</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block mb-1">Cấp 2</span>
            <span className="block text-slate-900 dark:text-white font-extrabold">Strategy (Chiến lược)</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block mb-1">Cấp 3</span>
            <span className="block text-slate-900 dark:text-white font-extrabold">Objective (Mục tiêu)</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block mb-1">Cấp 4</span>
            <span className="block text-slate-900 dark:text-white font-extrabold">Key Result (Kết quả)</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block mb-1">Cấp 5</span>
            <span className="block text-slate-900 dark:text-white font-extrabold">Project (Dự án)</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block mb-1">Cấp 6</span>
            <span className="block text-slate-900 dark:text-white font-extrabold">Task (Công việc)</span>
          </div>
        </div>
      </section>

      {/* Main Grid: OKRs Tracker + Target breakdown charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: OKR list and tracking cards */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">Danh Sách Mục Tiêu Chiến Lược (Objectives)</h3>
            <button
              onClick={() => setShowAddObjective(!showAddObjective)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Mục Tiêu mới</span>
            </button>
          </div>

          {showAddObjective && (
            <form onSubmit={handleAddObjective} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono">Khởi tạo Objective mới</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Tiêu đề Mục tiêu</label>
                  <input
                    type="text"
                    required
                    value={newObjTitle}
                    onChange={(e) => setNewObjTitle(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Ví dụ: Nâng cao năng lực chuyên môn tiếng Anh toàn trường..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Bộ phận phụ trách</label>
                  <select
                    value={newObjDept}
                    onChange={(e) => setNewObjDept(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="Ban Giám hiệu">Ban Giám hiệu</option>
                    <option value="Tổ Toán - Tin">Tổ Toán - Tin</option>
                    <option value="Tổ Ngữ Văn">Tổ Ngữ Văn</option>
                    <option value="Phòng Tuyển sinh">Phòng Tuyển sinh</option>
                    <option value="Phòng Hành chính">Phòng Hành chính</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddObjective(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-650"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                >
                  Lưu Mục Tiêu
                </button>
              </div>
            </form>
          )}

          {selectedObjIdForKr && (
            <form onSubmit={handleAddKeyResult} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                Thêm Kết quả Then chốt (Key Result)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Tiêu đề Key Result</label>
                  <input
                    type="text"
                    required
                    value={newKrTitle}
                    onChange={(e) => setNewKrTitle(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                    placeholder="Ví dụ: Đạt 100% giáo viên có chứng chỉ giảng dạy quốc tế..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Mục tiêu hướng tới (Target Value)</label>
                  <input
                    type="text"
                    required
                    value={newKrTarget}
                    onChange={(e) => setNewKrTarget(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                    placeholder="Ví dụ: 100% hoặc 1500 học sinh"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Hiện trạng thực tế (Current Value)</label>
                  <input
                    type="text"
                    value={newKrCurrent}
                    onChange={(e) => setNewKrCurrent(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                    placeholder="Ví dụ: 80% hoặc 1380 học sinh"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Tiến độ phần trăm (0 - 100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newKrProgress}
                    onChange={(e) => setNewKrProgress(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Trạng thái rủi ro</label>
                  <select
                    value={newKrStatus}
                    onChange={(e) => setNewKrStatus(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value="ON_TRACK">Đúng tiến độ (On track)</option>
                    <option value="AT_RISK">Có nguy cơ chậm (At risk)</option>
                    <option value="BEHIND">Trễ tiến độ (Behind)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedObjIdForKr(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-650"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                >
                  Lưu Kết Quả
                </button>
              </div>
            </form>
          )}

          {/* Vision Statement */}
          <div className="p-5 border border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900/40 shadow-xs">
            <span className="text-[10px] font-black font-mono uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
              Tầm nhìn trường học (Vision Statement)
            </span>
            <blockquote className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100 border-l-4 border-l-indigo-600 pl-4 italic leading-relaxed">
              "Xây dựng Trường phổ thông liên cấp chất lượng cao MIS trở thành thương hiệu giáo dục đa trí tuệ hàng đầu khu vực, giúp mỗi cá nhân học sinh khai phóng tối đa tài năng thiên bẩm và tự tin hội nhập toàn cầu."
            </blockquote>
          </div>

          {/* Objective Cards */}
          <div className="space-y-4">
            {objectives.map(obj => (
              <div
                key={obj.id}
                className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs transition-all hover:shadow-sm"
              >
                {/* Objective details */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 rounded-md font-mono">
                        {obj.year}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 rounded-md">
                        {obj.department}
                      </span>
                    </div>
                    <h4 className="text-[13.5px] font-black text-slate-900 dark:text-white leading-snug">
                      {obj.title}
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 block">{obj.progress}%</span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Tiến độ chung</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${obj.progress}%` }}></div>
                </div>

                {/* Key Results */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    <span>Kết quả then chốt (Key Results)</span>
                    <button
                      onClick={() => setSelectedObjIdForKr(obj.id)}
                      className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-0.5 text-[10px]"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm KR</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {obj.keyResults.map(kr => {
                      let statusBadge = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450';
                      if (kr.status === 'AT_RISK') {
                        statusBadge = 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450';
                      } else if (kr.status === 'BEHIND') {
                        statusBadge = 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450';
                      }

                      return (
                        <div key={kr.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/35 border border-slate-100 dark:border-slate-800/40 rounded-xl text-xs space-y-2 hover:border-slate-200 dark:hover:border-slate-700">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 flex-1">
                              {kr.title}
                            </p>
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase font-mono tracking-wider shrink-0 ${statusBadge}`}>
                              {kr.status === 'ON_TRACK' ? 'On Track' : kr.status === 'AT_RISK' ? 'At Risk' : 'Behind'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10.5px]">
                            <span className="text-slate-450">
                              Mục tiêu: <strong className="text-slate-700 dark:text-slate-300 font-bold">{kr.target}</strong> (Hiện đạt: {kr.current})
                            </span>
                            <span className="font-mono font-bold text-slate-750 dark:text-slate-350">{kr.progress}%</span>
                          </div>

                          {/* Mini Progress */}
                          <div className="w-full bg-slate-150 dark:bg-slate-850 h-1 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${kr.status === 'ON_TRACK' ? 'bg-emerald-500' : kr.status === 'AT_RISK' ? 'bg-amber-500' : 'bg-rose-500'}`} 
                              style={{ width: `${kr.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Right Side: OKRs & Goals metrics breakdown pie chart */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
            <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono mb-4 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              Tình trạng Key Results
            </h4>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} chỉ tiêu`, 'Số lượng']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="mt-4 space-y-2 text-[11px] font-bold">
              {chartData.map(entry => (
                <div key={entry.name} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: entry.color }} />
                    <span>{entry.name}</span>
                  </div>
                  <span className="font-mono text-slate-900 dark:text-white">{entry.value} KRs</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Projects Reference */}
          <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-4">
            <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500" />
              Dự án chiến lược liên kết
            </h4>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-xl flex items-center justify-between text-xs hover:border-slate-200 dark:hover:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Tuyển sinh</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-bold block mt-0.5">Chiến dịch School Tour 2026</strong>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-xl flex items-center justify-between text-xs hover:border-slate-200 dark:hover:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Chuyển đổi số</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-bold block mt-0.5">Xây dựng cổng dữ liệu School OS</strong>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
