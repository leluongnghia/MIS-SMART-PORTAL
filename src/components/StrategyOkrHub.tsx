import React, { useState, useMemo } from 'react';
import { Target, Sparkles, Plus, Award, ChevronRight, BarChart3, CheckCircle2, ClipboardList, Users, Calendar, AlertTriangle, TrendingUp, Trash2, Edit3, X } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

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

interface KpiItem {
  id: string;
  name: string;
  category: string;
  target: string;
  actual: string;
  unit: string;
  progress: number;
  status: 'DAT' | 'CHUA_DAT' | 'VUOT';
  owner: string;
}

interface MeetingTask {
  id: string;
  content: string;
  owner: string;
  deadline: string;
  done: boolean;
}

interface MeetingRecord {
  id: string;
  title: string;
  date: string;
  chair: string;
  attendees: string;
  content: string;
  tasks: MeetingTask[];
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
  const [activeTab, setActiveTab] = useState<'OKR' | 'KPI' | 'MEETING'>('OKR');
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

  // KPI State
  const [kpis, setKpis] = useState<KpiItem[]>([
    { id: 'k1', name: 'Tỷ lệ tốt nghiệp', category: 'Học tập', target: '100', actual: '99.2', unit: '%', progress: 99, status: 'DAT', owner: 'BGH' },
    { id: 'k2', name: 'Học sinh giỏi cấp tỉnh', category: 'Thành tích', target: '50', actual: '62', unit: 'giải', progress: 100, status: 'VUOT', owner: 'Tổ CM' },
    { id: 'k3', name: 'Tỷ lệ phụ huynh hài lòng', category: 'Dịch vụ', target: '90', actual: '88', unit: '%', progress: 98, status: 'CHUA_DAT', owner: 'BGH' },
    { id: 'k4', name: 'Tỷ lệ GV đạt chuẩn', category: 'Nhân sự', target: '100', actual: '95', unit: '%', progress: 95, status: 'CHUA_DAT', owner: 'Phòng NS' },
    { id: 'k5', name: 'Doanh thu học phí', category: 'Tài chính', target: '15', actual: '14.2', unit: 'tỷ VND', progress: 95, status: 'CHUA_DAT', owner: 'Phòng TC' },
    { id: 'k6', name: 'Học sinh đạt Cambridge', category: 'Học tập', target: '95', actual: '78', unit: '%', progress: 82, status: 'CHUA_DAT', owner: 'Tổ Anh' },
  ]);
  const [showAddKpi, setShowAddKpi] = useState(false);
  const [newKpi, setNewKpi] = useState({ name: '', category: 'Học tập', target: '', actual: '', unit: '%', owner: 'BGH' });

  // Meeting State
  const [meetings, setMeetings] = useState<MeetingRecord[]>([
    {
      id: 'm1', title: 'Họp Hội đồng tháng 6/2026', date: '2026-06-10', chair: 'Hiệu trưởng', attendees: 'BGH, TTCM, Phòng ban',
      content: 'Đánh giá kết quả cuối năm học, phê duyệt kế hoạch tuyển sinh 2026-2027, định hướng phát triển cơ sở vật chất.',
      tasks: [
        { id: 't1', content: 'Hoàn thiện báo cáo tổng kết năm học', owner: 'PHT Học thuật', deadline: '2026-06-20', done: false },
        { id: 't2', content: 'Trình phê duyệt kế hoạch tuyển sinh', owner: 'Phòng Tuyển sinh', deadline: '2026-06-18', done: true },
      ]
    }
  ]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>('m1');
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: '', date: '', chair: '', attendees: '', content: '' });
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

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

  // KPI Handlers
  const handleAddKpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKpi.name.trim() || !newKpi.target.trim()) return;
    const progress = newKpi.actual && newKpi.target ? Math.min(100, Math.round((parseFloat(newKpi.actual) / parseFloat(newKpi.target)) * 100)) : 0;
    const status: KpiItem['status'] = progress >= 100 ? 'VUOT' : progress >= 90 ? 'DAT' : 'CHUA_DAT';
    setKpis(prev => [...prev, { id: `k_${Date.now()}`, ...newKpi, progress, status }]);
    setNewKpi({ name: '', category: 'Học tập', target: '', actual: '', unit: '%', owner: 'BGH' });
    setShowAddKpi(false);
  };

  // Meeting Handlers
  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title.trim() || !newMeeting.date) return;
    const m: MeetingRecord = { id: `m_${Date.now()}`, ...newMeeting, tasks: [] };
    setMeetings(prev => [m, ...prev]);
    setSelectedMeetingId(m.id);
    setNewMeeting({ title: '', date: '', chair: '', attendees: '', content: '' });
    setShowAddMeeting(false);
  };

  const handleAddTask = (meetingId: string) => {
    if (!newTaskContent.trim()) return;
    const task: MeetingTask = { id: `t_${Date.now()}`, content: newTaskContent.trim(), owner: newTaskOwner || 'BGH', deadline: newTaskDeadline, done: false };
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, tasks: [...m.tasks, task] } : m));
    setNewTaskContent(''); setNewTaskOwner(''); setNewTaskDeadline('');
  };

  const toggleTask = (meetingId: string, taskId: string) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, tasks: m.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) } : m));
  };

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);

  // Radar data for KPI overview
  const radarData = [
    { subject: 'Học tập', A: Math.round(kpis.filter(k => k.category === 'Học tập').reduce((s, k) => s + k.progress, 0) / Math.max(1, kpis.filter(k => k.category === 'Học tập').length)) },
    { subject: 'Thành tích', A: Math.round(kpis.filter(k => k.category === 'Thành tích').reduce((s, k) => s + k.progress, 0) / Math.max(1, kpis.filter(k => k.category === 'Thành tích').length)) },
    { subject: 'Nhân sự', A: Math.round(kpis.filter(k => k.category === 'Nhân sự').reduce((s, k) => s + k.progress, 0) / Math.max(1, kpis.filter(k => k.category === 'Nhân sự').length)) },
    { subject: 'Tài chính', A: Math.round(kpis.filter(k => k.category === 'Tài chính').reduce((s, k) => s + k.progress, 0) / Math.max(1, kpis.filter(k => k.category === 'Tài chính').length)) },
    { subject: 'Dịch vụ', A: Math.round(kpis.filter(k => k.category === 'Dịch vụ').reduce((s, k) => s + k.progress, 0) / Math.max(1, kpis.filter(k => k.category === 'Dịch vụ').length)) },
  ];

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
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
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

      {/* Tab Navigation */}
      <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl w-fit">
        {([
          { key: 'OKR', label: 'OKR & Chiến lược', icon: <Target className="w-3.5 h-3.5" /> },
          { key: 'KPI', label: 'Chỉ tiêu KPI', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { key: 'MEETING', label: 'Họp Hội đồng', icon: <Calendar className="w-3.5 h-3.5" /> },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.key ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: OKR */}
      {activeTab === 'OKR' && (
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
                className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs transition-all hover:shadow-md hover:scale-[1.005] duration-300"
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
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full" style={{ width: `${obj.progress}%` }}></div>
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
      )} {/* end OKR tab */}

      {/* TAB: KPI */}
      {activeTab === 'KPI' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: KPI Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">Bảng Chỉ tiêu KPI năm học</h3>
              <button onClick={() => setShowAddKpi(v => !v)} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">
                <Plus className="w-3.5 h-3.5" /> Thêm KPI
              </button>
            </div>

            {showAddKpi && (
              <form onSubmit={handleAddKpi} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 p-4 rounded-2xl grid gap-3 md:grid-cols-3">
                <input required placeholder="Tên chỉ tiêu" value={newKpi.name} onChange={e => setNewKpi(p => ({ ...p, name: e.target.value }))} className="col-span-2 text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                <select value={newKpi.category} onChange={e => setNewKpi(p => ({ ...p, category: e.target.value }))} className="text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700">
                  {['Học tập','Thành tích','Nhân sự','Tài chính','Dịch vụ'].map(c => <option key={c}>{c}</option>)}
                </select>
                <input placeholder="Mục tiêu (số)" required value={newKpi.target} onChange={e => setNewKpi(p => ({ ...p, target: e.target.value }))} className="text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                <input placeholder="Thực tế (số)" value={newKpi.actual} onChange={e => setNewKpi(p => ({ ...p, actual: e.target.value }))} className="text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                <input placeholder="Đơn vị (%, tỷ, ...)" value={newKpi.unit} onChange={e => setNewKpi(p => ({ ...p, unit: e.target.value }))} className="text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                <input placeholder="Bộ phận phụ trách" value={newKpi.owner} onChange={e => setNewKpi(p => ({ ...p, owner: e.target.value }))} className="text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                <div className="flex gap-2 md:col-span-2">
                  <button type="button" onClick={() => setShowAddKpi(false)} className="flex-1 py-1.5 border rounded-xl text-xs font-bold text-slate-500">Hủy</button>
                  <button type="submit" className="flex-1 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">Lưu KPI</button>
                </div>
              </form>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                    {['Chỉ tiêu','Phân loại','Mục tiêu','Thực tế','Tiến độ','Trạng thái','Phụ trách'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {kpis.map(kpi => {
                    const statusCls = kpi.status === 'VUOT' ? 'bg-emerald-100 text-emerald-700' : kpi.status === 'DAT' ? 'bg-sky-100 text-sky-700' : 'bg-rose-50 text-rose-700';
                    const statusLabel = kpi.status === 'VUOT' ? '🚀 Vượt' : kpi.status === 'DAT' ? '✓ Đạt' : '⚠ Chưa đạt';
                    const barColor = kpi.status === 'VUOT' ? 'bg-emerald-500' : kpi.status === 'DAT' ? 'bg-sky-500' : 'bg-rose-400';
                    return (
                      <tr key={kpi.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{kpi.name}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-bold">{kpi.category}</span></td>
                        <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{kpi.target} {kpi.unit}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{kpi.actual} {kpi.unit}</td>
                        <td className="px-4 py-3 w-32">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${Math.min(100, kpi.progress)}%` }} />
                            </div>
                            <span className="font-mono font-bold text-slate-600 dark:text-slate-300 shrink-0">{kpi.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-black ${statusCls}`}>{statusLabel}</span></td>
                        <td className="px-4 py-3 text-slate-500">{kpi.owner}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Radar Chart */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
              <h4 className="font-black text-xs uppercase tracking-wide text-slate-500 mb-4 flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-indigo-500" /> Tổng hợp theo lĩnh vực</h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                    <Radar name="KPI" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Tiến độ']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3">
              <h4 className="font-black text-xs uppercase tracking-wide text-slate-500">Tóm tắt</h4>
              {[
                { label: '🚀 Vượt chỉ tiêu', count: kpis.filter(k => k.status === 'VUOT').length, color: 'text-emerald-600' },
                { label: '✓ Đạt chỉ tiêu', count: kpis.filter(k => k.status === 'DAT').length, color: 'text-sky-600' },
                { label: '⚠ Chưa đạt', count: kpis.filter(k => k.status === 'CHUA_DAT').length, color: 'text-rose-600' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300">{s.label}</span>
                  <span className={`font-black text-lg ${s.color}`}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: MEETING */}
      {activeTab === 'MEETING' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Meeting List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">Biên bản họp</h3>
              <button onClick={() => setShowAddMeeting(v => !v)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">
                <Plus className="w-3.5 h-3.5" /> Tạo cuộc họp
              </button>
            </div>

            {showAddMeeting && (
              <form onSubmit={handleAddMeeting} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl space-y-2.5">
                <input required placeholder="Tên cuộc họp" value={newMeeting.title} onChange={e => setNewMeeting(p => ({ ...p, title: e.target.value }))} className="w-full text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                <input required type="date" value={newMeeting.date} onChange={e => setNewMeeting(p => ({ ...p, date: e.target.value }))} className="w-full text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                <input placeholder="Chủ trì" value={newMeeting.chair} onChange={e => setNewMeeting(p => ({ ...p, chair: e.target.value }))} className="w-full text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                <input placeholder="Thành phần tham dự" value={newMeeting.attendees} onChange={e => setNewMeeting(p => ({ ...p, attendees: e.target.value }))} className="w-full text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                <textarea placeholder="Nội dung họp" rows={3} value={newMeeting.content} onChange={e => setNewMeeting(p => ({ ...p, content: e.target.value }))} className="w-full text-xs p-2 border rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 resize-none" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddMeeting(false)} className="flex-1 py-1.5 border rounded-xl text-xs font-bold text-slate-500">Hủy</button>
                  <button type="submit" className="flex-1 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">Lưu</button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {meetings.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMeetingId(m.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${selectedMeetingId === m.id ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-700' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200'}`}
                >
                  <div className="font-black text-[12.5px] text-slate-900 dark:text-white">{m.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> {m.date}
                    <Users className="w-3 h-3 ml-1" /> {m.chair}
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">{m.tasks.length} việc</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 rounded font-mono">{m.tasks.filter(t => t.done).length} xong</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Meeting Detail */}
          <div className="lg:col-span-8">
            {selectedMeeting ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white">
                  <div className="text-[10px] font-mono uppercase tracking-widest opacity-70 mb-1">Biên bản họp</div>
                  <h3 className="text-lg font-black">{selectedMeeting.title}</h3>
                  <div className="flex gap-4 mt-2 text-xs opacity-80">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {selectedMeeting.date}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Chủ trì: {selectedMeeting.chair}</span>
                  </div>
                </div>
                <div className="p-5 space-y-5">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Thành phần tham dự</div>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{selectedMeeting.attendees}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Nội dung cuộc họp</div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">{selectedMeeting.content}</p>
                  </div>

                  {/* Action Items */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giao việc sau họp ({selectedMeeting.tasks.filter(t => t.done).length}/{selectedMeeting.tasks.length} hoàn thành)</div>
                    </div>
                    <div className="space-y-2">
                      {selectedMeeting.tasks.map(task => (
                        <div key={task.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${task.done ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                          <button onClick={() => toggleTask(selectedMeeting.id, task.id)} className={`mt-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-indigo-400'}`}>
                            {task.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold ${task.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>{task.content}</p>
                            <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {task.owner}</span>
                              {task.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.deadline}</span>}
                            </div>
                          </div>
                          {!task.done && new Date(task.deadline) < new Date() && (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Task */}
                    <div className="mt-3 flex gap-2">
                      <input placeholder="Nội dung giao việc..." value={newTaskContent} onChange={e => setNewTaskContent(e.target.value)} className="flex-1 text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white" />
                      <input placeholder="Người phụ trách" value={newTaskOwner} onChange={e => setNewTaskOwner(e.target.value)} className="w-32 text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white" />
                      <input type="date" value={newTaskDeadline} onChange={e => setNewTaskDeadline(e.target.value)} className="w-36 text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white" />
                      <button onClick={() => handleAddTask(selectedMeeting.id)} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shrink-0">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400 text-sm bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                Chọn cuộc họp để xem biên bản
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
