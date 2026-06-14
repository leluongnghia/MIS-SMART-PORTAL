import React, { useState, useMemo } from 'react';
import { ShieldAlert, AlertTriangle, TrendingUp, Users, Settings, GraduationCap, Wrench, Plus, X, CheckCircle2, BookOpen, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface RiskItem {
  id: string;
  category: 'ADMISSION' | 'PROJECT' | 'HR' | 'OPERATIONAL';
  title: string;
  description: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  department: string;
  probability: 1 | 2 | 3 | 4 | 5; // 1=Hiếm, 5=Chắc chắn
  impact: 1 | 2 | 3 | 4 | 5;       // 1=Không đáng kể, 5=Thảm họa
  owner: string;
  status: 'OPEN' | 'MITIGATING' | 'CLOSED';
  sopRef: string;
}

interface SopStep {
  order: number;
  action: string;
  who: string;
  when: string;
}

interface SopEntry {
  id: string;
  title: string;
  category: RiskItem['category'];
  trigger: string;
  steps: SopStep[];
}

const PROB_LABELS = ['', 'Hiếm (1)', 'Ít khi (2)', 'Đôi khi (3)', 'Thường xuyên (4)', 'Chắc chắn (5)'];
const IMPACT_LABELS = ['', 'Không đáng kể (1)', 'Nhỏ (2)', 'Trung bình (3)', 'Nghiêm trọng (4)', 'Thảm họa (5)'];

const matrixColor = (p: number, i: number): string => {
  const score = p * i;
  if (score >= 16) return 'bg-rose-600 text-white';
  if (score >= 10) return 'bg-orange-500 text-white';
  if (score >= 5)  return 'bg-amber-400 text-slate-900';
  if (score >= 3)  return 'bg-yellow-200 text-slate-800';
  return 'bg-emerald-100 text-slate-700';
};

const matrixLabel = (p: number, i: number): string => {
  const score = p * i;
  if (score >= 16) return 'CRITICAL';
  if (score >= 10) return 'HIGH';
  if (score >= 5)  return 'MEDIUM';
  return 'LOW';
};

export default function RiskManagementCenter() {
  const [activeTab, setActiveTab] = useState<'LIST' | 'MATRIX' | 'SOP'>('LIST');
  const [risks, setRisks] = useState<RiskItem[]>([
    { id: 'risk_1', category: 'ADMISSION', title: 'Tuyển sinh chuyên Anh khối 10 dưới chỉ tiêu', description: 'Hiện tại mới tuyển được 120 học sinh so với chỉ tiêu tối thiểu 150.', level: 'HIGH', department: 'Phòng Tuyển sinh & PR', probability: 3, impact: 4, owner: 'TP Tuyển sinh', status: 'MITIGATING', sopRef: 'SOP-TS-01' },
    { id: 'risk_2', category: 'PROJECT', title: 'Dự án số hóa School OS trễ hạn giai đoạn 1', description: 'Chậm 8 ngày so với milestone 02/06 do vướng đồng bộ CSDL.', level: 'CRITICAL', department: 'Hành chính & CNTT', probability: 5, impact: 4, owner: 'GĐ CNTT', status: 'OPEN', sopRef: 'SOP-DA-01' },
    { id: 'risk_3', category: 'HR', title: 'Thiếu GV Tin học chất lượng cao', description: 'Một GV chuyên đề nộp đơn xin nghỉ, chưa có nhân sự thay thế.', level: 'MEDIUM', department: 'Tổ Toán - Tin học', probability: 3, impact: 3, owner: 'TTCM Toán-Tin', status: 'OPEN', sopRef: 'SOP-NS-01' },
    { id: 'risk_4', category: 'OPERATIONAL', title: 'Tồn đọng hồ sơ giáo án Tổ Ngữ Văn', description: 'Hơn 15 giáo án chưa được duyệt quá 7 ngày trên hệ thống.', level: 'HIGH', department: 'Tổ Ngữ Văn', probability: 4, impact: 3, owner: 'TTCM Ngữ Văn', status: 'MITIGATING', sopRef: 'SOP-VH-01' },
    { id: 'risk_5', category: 'OPERATIONAL', title: 'Thiếu phụ huynh phản hồi khảo sát HK2', description: 'Chỉ 45% phụ huynh hoàn thành khảo sát học kỳ, thấp hơn mục tiêu 80%.', level: 'LOW', department: 'Phòng Hành chính', probability: 2, impact: 2, owner: 'VP Hành chính', status: 'OPEN', sopRef: '' },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newRisk, setNewRisk] = useState({ title: '', description: '', category: 'OPERATIONAL' as RiskItem['category'], department: '', probability: 3 as RiskItem['probability'], impact: 3 as RiskItem['impact'], owner: '', sopRef: '' });
  const [expandedSop, setExpandedSop] = useState<string | null>('sop_1');

  const sops: SopEntry[] = [
    {
      id: 'sop_1', title: 'SOP-TS-01: Tuyển sinh dưới chỉ tiêu', category: 'ADMISSION',
      trigger: 'Khi tỷ lệ đăng ký < 80% chỉ tiêu trước ngày 15 tháng tuyển sinh',
      steps: [
        { order: 1, action: 'Họp khẩn Ban tuyển sinh đánh giá nguyên nhân', who: 'TP Tuyển sinh', when: 'Ngay lập tức' },
        { order: 2, action: 'Điều chỉnh ngân sách quảng cáo tăng 20%, mở rộng kênh digital', who: 'Marketing Manager', when: 'Trong 24h' },
        { order: 3, action: 'Tổ chức thêm buổi tư vấn trực tiếp / school tour khẩn', who: 'TP Tuyển sinh + BGH', when: 'Trong 3 ngày' },
        { order: 4, action: 'Liên hệ lại toàn bộ lead chưa quyết định (theo pipeline CRM)', who: 'Nhân viên tư vấn', when: 'Trong 2 ngày' },
        { order: 5, action: 'Báo cáo tiến độ cải thiện lên BGH', who: 'TP Tuyển sinh', when: 'Hàng ngày đến khi đạt 90%' },
      ]
    },
    {
      id: 'sop_2', title: 'SOP-DA-01: Dự án CNTT trễ hạn', category: 'PROJECT',
      trigger: 'Khi milestone trễ ≥ 3 ngày làm việc',
      steps: [
        { order: 1, action: 'Phân tích root cause: kỹ thuật, nhân sự hay phụ thuộc bên thứ ba', who: 'GĐ CNTT', when: 'Trong 4h' },
        { order: 2, action: 'Cập nhật Risk Register & báo cáo BGH', who: 'PM Dự án', when: 'Trong 24h' },
        { order: 3, action: 'Tăng nguồn lực hoặc thu hẹp scope milestone', who: 'BGH + GĐ CNTT', when: 'Trong 2 ngày' },
        { order: 4, action: 'Theo dõi daily standup đến khi milestone hoàn thành', who: 'PM Dự án', when: 'Hàng ngày' },
      ]
    },
    {
      id: 'sop_3', title: 'SOP-NS-01: Thiếu hụt giáo viên đột xuất', category: 'HR',
      trigger: 'Khi GV nghỉ không báo trước hoặc thiếu nhân sự > 1 tuần',
      steps: [
        { order: 1, action: 'Kích hoạt danh sách GV thỉnh giảng dự phòng', who: 'Phòng Nhân sự', when: 'Trong 2h' },
        { order: 2, action: 'Phân công GV nội bộ dạy ghép lớp tạm thời', who: 'TTCM phụ trách', when: 'Ngay ngày hôm sau' },
        { order: 3, action: 'Đăng tuyển gấp trên các kênh tuyển dụng', who: 'HR Manager', when: 'Trong 24h' },
        { order: 4, action: 'Báo cáo tình huống lên BGH và phụ huynh nếu ảnh hưởng > 1 tuần', who: 'Phòng Hành chính', when: 'Sau 5 ngày làm việc' },
      ]
    },
    {
      id: 'sop_4', title: 'SOP-VH-01: Ùn ứ công việc vận hành', category: 'OPERATIONAL',
      trigger: 'Khi backlog công việc tồn đọng > 5 ngày làm việc',
      steps: [
        { order: 1, action: 'Rà soát danh sách tồn đọng, phân loại ưu tiên ABC', who: 'Trưởng bộ phận', when: 'Trong 24h' },
        { order: 2, action: 'Huy động nguồn lực hỗ trợ từ bộ phận liên quan', who: 'BGH phụ trách', when: 'Trong 2 ngày' },
        { order: 3, action: 'Cập nhật tiến độ xử lý hàng ngày lên Hệ thống', who: 'Nhân viên phụ trách', when: 'Hàng ngày' },
        { order: 4, action: 'Tổng kết nguyên nhân và cải thiện quy trình', who: 'Trưởng bộ phận', when: 'Sau 7 ngày' },
      ]
    },
  ];

  const trendData = [
    { name: 'T1', 'Mức rủi ro': 35 },
    { name: 'T2', 'Mức rủi ro': 45 },
    { name: 'T3', 'Mức rủi ro': 60 },
    { name: 'T4', 'Mức rủi ro': 55 },
    { name: 'T5', 'Mức rủi ro': 68 },
    { name: 'T6', 'Mức rủi ro': risks.filter(r => r.level === 'CRITICAL').length * 20 + risks.filter(r => r.level === 'HIGH').length * 12 + 20 },
  ];

  const getLevelStyle = (level: RiskItem['level']) => {
    switch (level) {
      case 'LOW': return { badge: 'bg-slate-100 text-slate-700 border border-slate-200/50', border: 'border-l-4 border-l-slate-400' };
      case 'MEDIUM': return { badge: 'bg-amber-50 text-amber-700 border border-amber-200/40', border: 'border-l-4 border-l-amber-500' };
      case 'HIGH': return { badge: 'bg-orange-50 text-orange-700 border border-orange-200/40', border: 'border-l-4 border-l-orange-500' };
      case 'CRITICAL': return { badge: 'bg-rose-50 text-rose-700 border border-rose-200/40 animate-pulse', border: 'border-l-4 border-l-rose-600 shadow-md shadow-rose-200/60' };
      default: return { badge: 'bg-slate-100 text-slate-700', border: '' };
    }
  };

  const levelFromScores = (p: number, i: number): RiskItem['level'] => matrixLabel(p, i) as RiskItem['level'];

  const getCategoryIcon = (cat: RiskItem['category']) => {
    switch (cat) {
      case 'ADMISSION': return <GraduationCap className="w-3.5 h-3.5" />;
      case 'PROJECT': return <Settings className="w-3.5 h-3.5" />;
      case 'HR': return <Users className="w-3.5 h-3.5" />;
      case 'OPERATIONAL': return <Wrench className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryLabel = (cat: RiskItem['category']) => {
    switch (cat) {
      case 'ADMISSION': return 'Tuyển sinh';
      case 'PROJECT': return 'Dự án';
      case 'HR': return 'Nhân sự';
      case 'OPERATIONAL': return 'Vận hành';
    }
  };

  const handleAddRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRisk.title.trim()) return;
    const level = levelFromScores(newRisk.probability, newRisk.impact);
    setRisks(prev => [...prev, { id: `risk_${Date.now()}`, ...newRisk, level, status: 'OPEN' as const }]);
    setNewRisk({ title: '', description: '', category: 'OPERATIONAL', department: '', probability: 3, impact: 3, owner: '', sopRef: '' });
    setShowAddForm(false);
  };

  const updateStatus = (id: string, status: RiskItem['status']) => {
    setRisks(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  // Stats
  const stats = useMemo(() => ({
    critical: risks.filter(r => r.level === 'CRITICAL').length,
    high: risks.filter(r => r.level === 'HIGH').length,
    medium: risks.filter(r => r.level === 'MEDIUM').length,
    low: risks.filter(r => r.level === 'LOW').length,
    open: risks.filter(r => r.status === 'OPEN').length,
  }), [risks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-rose-950 p-6 rounded-2xl text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2.5">
          <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border border-rose-500/20 flex items-center gap-1 w-fit">
            <ShieldAlert className="w-3.5 h-3.5" /> Risk &amp; Auditing
          </span>
          <h2 className="text-xl md:text-2xl font-display font-black leading-tight">Trung tâm Quản trị Rủi ro</h2>
          <div className="flex flex-wrap gap-3 mt-2">
            {[
              { label: 'CRITICAL', count: stats.critical, cls: 'bg-rose-500/30 text-rose-200' },
              { label: 'HIGH', count: stats.high, cls: 'bg-orange-500/30 text-orange-200' },
              { label: 'MEDIUM', count: stats.medium, cls: 'bg-amber-500/30 text-amber-200' },
              { label: 'OPEN', count: stats.open, cls: 'bg-white/10 text-white/80' },
            ].map(s => (
              <span key={s.label} className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${s.cls}`}>
                {s.count} {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl w-fit">
        {([
          { key: 'LIST', label: 'Danh sách rủi ro', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
          { key: 'MATRIX', label: 'Ma trận 5×5', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { key: 'SOP', label: 'Quy trình SOP', icon: <BookOpen className="w-3.5 h-3.5" /> },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.key ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: LIST */}
      {activeTab === 'LIST' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">Sự vụ & Điểm nghẽn rủi ro</h3>
              <button onClick={() => setShowAddForm(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold">
                <Plus className="w-3.5 h-3.5" /> Thêm rủi ro
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddRisk} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl grid gap-3 md:grid-cols-2">
                <input required placeholder="Tiêu đề rủi ro" value={newRisk.title} onChange={e => setNewRisk(p => ({ ...p, title: e.target.value }))} className="col-span-2 text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-600" />
                <textarea placeholder="Mô tả chi tiết" rows={2} value={newRisk.description} onChange={e => setNewRisk(p => ({ ...p, description: e.target.value }))} className="col-span-2 text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-600 resize-none" />
                <select value={newRisk.category} onChange={e => setNewRisk(p => ({ ...p, category: e.target.value as RiskItem['category'] }))} className="text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-600">
                  <option value="ADMISSION">Tuyển sinh</option>
                  <option value="PROJECT">Dự án</option>
                  <option value="HR">Nhân sự</option>
                  <option value="OPERATIONAL">Vận hành</option>
                </select>
                <input placeholder="Bộ phận" value={newRisk.department} onChange={e => setNewRisk(p => ({ ...p, department: e.target.value }))} className="text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-600" />
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Xác suất (1-5)</label>
                  <input type="range" min={1} max={5} value={newRisk.probability} onChange={e => setNewRisk(p => ({ ...p, probability: Number(e.target.value) as RiskItem['probability'] }))} className="w-full accent-rose-500" />
                  <span className="text-[10px] text-slate-500">{PROB_LABELS[newRisk.probability]}</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tác động (1-5)</label>
                  <input type="range" min={1} max={5} value={newRisk.impact} onChange={e => setNewRisk(p => ({ ...p, impact: Number(e.target.value) as RiskItem['impact'] }))} className="w-full accent-rose-500" />
                  <span className="text-[10px] text-slate-500">{IMPACT_LABELS[newRisk.impact]}</span>
                </div>
                <input placeholder="Người phụ trách" value={newRisk.owner} onChange={e => setNewRisk(p => ({ ...p, owner: e.target.value }))} className="text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-600" />
                <input placeholder="SOP tham chiếu (vd: SOP-TS-01)" value={newRisk.sopRef} onChange={e => setNewRisk(p => ({ ...p, sopRef: e.target.value }))} className="text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-600" />
                <div className="col-span-2 flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1.5 border rounded-xl text-xs font-bold text-slate-500">Hủy</button>
                  <button type="submit" className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold">Lưu rủi ro</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {risks.map(risk => {
                const ls = getLevelStyle(risk.level);
                return (
                  <div key={risk.id} className={`p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col gap-3 ${ls.border}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 rounded-md font-mono flex items-center gap-1">
                            {getCategoryIcon(risk.category)} {getCategoryLabel(risk.category)}
                          </span>
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-[9px] font-bold text-indigo-700 dark:text-indigo-300 rounded-md">{risk.department}</span>
                          {risk.sopRef && <span className="px-2 py-0.5 bg-violet-50 text-[9px] font-mono text-violet-700 rounded-md">{risk.sopRef}</span>}
                        </div>
                        <h4 className="text-[12.5px] font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">{risk.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{risk.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                          <span>👤 {risk.owner}</span>
                          <span>P:{risk.probability} × I:{risk.impact} = <strong>{risk.probability * risk.impact}</strong></span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase font-mono tracking-wider ${ls.badge}`}>{risk.level}</span>
                        <select value={risk.status} onChange={e => updateStatus(risk.id, e.target.value as RiskItem['status'])}
                          className="text-[9px] py-0.5 px-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white">
                          <option value="OPEN">🔴 Open</option>
                          <option value="MITIGATING">🟡 Đang xử lý</option>
                          <option value="CLOSED">🟢 Đã đóng</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Trend Chart */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
              <h4 className="font-black text-xs uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-rose-500" /> Xu hướng rủi ro</h4>
              <div className="h-52 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="name" fontSize={9} />
                    <YAxis fontSize={9} />
                    <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="Mức rủi ro" stroke="#f43f5e" strokeWidth={2.5} fill="url(#riskGrad)" dot={{ r: 3, fill: '#f43f5e' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk summary by level */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2.5">
              <h4 className="font-black text-xs uppercase tracking-wide text-slate-500">Phân bổ theo mức độ</h4>
              {[
                { level: 'CRITICAL', count: stats.critical, cls: 'bg-rose-500' },
                { level: 'HIGH', count: stats.high, cls: 'bg-orange-500' },
                { level: 'MEDIUM', count: stats.medium, cls: 'bg-amber-400' },
                { level: 'LOW', count: stats.low, cls: 'bg-emerald-400' },
              ].map(s => (
                <div key={s.level} className="flex items-center gap-3 text-xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.cls} shrink-0`} />
                  <span className="flex-1 font-bold text-slate-600 dark:text-slate-300">{s.level}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.cls}`} style={{ width: `${(s.count / Math.max(1, risks.length)) * 100}%` }} />
                  </div>
                  <span className="font-black text-slate-700 dark:text-slate-200 w-5 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: MATRIX 5×5 */}
      {activeTab === 'MATRIX' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm mb-1">Ma trận Rủi ro 5×5</h3>
            <p className="text-[11px] text-slate-400 mb-5">Trục X: Xác suất xảy ra (Probability) — Trục Y: Mức độ tác động (Impact). Mỗi ô hiển thị số lượng rủi ro.</p>

            <div className="overflow-x-auto">
              <table className="border-collapse text-center text-[11px] font-bold">
                <thead>
                  <tr>
                    <th className="w-28 p-2 text-left text-[10px] text-slate-400 font-black">Impact ↕ / Prob →</th>
                    {[1,2,3,4,5].map(p => (
                      <th key={p} className="w-24 p-2 text-slate-500 dark:text-slate-400 text-[10px]">{PROB_LABELS[p]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[5,4,3,2,1].map(imp => (
                    <tr key={imp}>
                      <td className="p-2 text-[10px] text-slate-400 font-black text-left">{IMPACT_LABELS[imp]}</td>
                      {[1,2,3,4,5].map(prob => {
                        const cellRisks = risks.filter(r => r.probability === prob && r.impact === imp);
                        const cls = matrixColor(prob, imp);
                        return (
                          <td key={prob} className={`p-0 border border-white/60 dark:border-slate-700`}>
                            <div className={`m-0.5 rounded-lg p-2 min-h-[52px] flex flex-col items-center justify-center gap-1 ${cls} transition-all hover:scale-105 cursor-default`}>
                              {cellRisks.length > 0 ? (
                                <>
                                  <span className="text-lg font-black leading-none">{cellRisks.length}</span>
                                  <span className="text-[8px] opacity-75 font-mono">P={prob}×I={imp}</span>
                                </>
                              ) : (
                                <span className="text-[10px] opacity-30">—</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-5 text-[10px] font-bold">
              {[
                { cls: 'bg-rose-600', label: 'CRITICAL (score ≥ 16)' },
                { cls: 'bg-orange-500', label: 'HIGH (score 10-15)' },
                { cls: 'bg-amber-400', label: 'MEDIUM (score 5-9)' },
                { cls: 'bg-emerald-100 border border-emerald-200', label: 'LOW (score < 5)', textCls: 'text-slate-700' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={`w-3.5 h-3.5 rounded ${l.cls}`} />
                  <span className={`text-slate-600 dark:text-slate-300 ${l.textCls}`}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk detail table for matrix */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                  {['Rủi ro','Loại','P','I','Score','Mức độ','Trạng thái','Phụ trách'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[...risks].sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact)).map(r => {
                  const ls = getLevelStyle(r.level);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2.5 font-bold text-slate-800 dark:text-white max-w-xs">{r.title}</td>
                      <td className="px-3 py-2.5"><span className="flex items-center gap-1 text-slate-500">{getCategoryIcon(r.category)}{getCategoryLabel(r.category)}</span></td>
                      <td className="px-3 py-2.5 font-mono text-center">{r.probability}</td>
                      <td className="px-3 py-2.5 font-mono text-center">{r.impact}</td>
                      <td className="px-3 py-2.5 font-mono font-black text-center text-slate-900 dark:text-white">{r.probability * r.impact}</td>
                      <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded text-[9px] font-black ${ls.badge}`}>{r.level}</span></td>
                      <td className="px-3 py-2.5 text-slate-500">{r.status === 'OPEN' ? '🔴 Open' : r.status === 'MITIGATING' ? '🟡 Xử lý' : '🟢 Đóng'}</td>
                      <td className="px-3 py-2.5 text-slate-500">{r.owner}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SOP */}
      {activeTab === 'SOP' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">Quy trình xử lý rủi ro (SOP Playbook)</h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">{sops.length} quy trình</span>
          </div>

          <div className="space-y-3">
            {sops.map(sop => (
              <div key={sop.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedSop(expandedSop === sop.id ? null : sop.id)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-xl shrink-0">{getCategoryIcon(sop.category)}</span>
                    <div className="min-w-0">
                      <div className="font-black text-[12.5px] text-slate-900 dark:text-white">{sop.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">Kích hoạt: {sop.trigger}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded">{sop.steps.length} bước</span>
                    {expandedSop === sop.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {expandedSop === sop.id && (
                  <div className="border-t border-slate-100 dark:border-slate-700 p-4 space-y-3">
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-[11px] text-amber-800 dark:text-amber-300">
                      <span className="font-black">📌 Kích hoạt khi: </span>{sop.trigger}
                    </div>
                    <div className="space-y-2">
                      {sop.steps.map(step => (
                        <div key={step.order} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700">
                          <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{step.order}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-white">{step.action}</p>
                            <div className="flex gap-4 mt-1 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {step.who}</span>
                              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {step.when}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
