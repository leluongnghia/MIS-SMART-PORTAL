import React, { useState, useMemo } from 'react';
import { Target, Search, Plus, PhoneCall, Mail, Calendar, Sparkles, Megaphone, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Lead {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
  stage: 'LEAD' | 'CONSULTING' | 'TOUR' | 'REGISTERED' | 'ENROLLED';
  source: 'Social' | 'Website' | 'Referral' | 'Event';
  notes: string;
  interactions: { date: string; type: string; content: string }[];
}

export default function SchoolCrmHub() {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: 'lead_1',
      studentName: 'Nguyễn Minh Anh',
      parentName: 'Nguyễn Văn Hải',
      phone: '0912345678',
      email: 'hai.nguyen@gmail.com',
      stage: 'LEAD',
      source: 'Social',
      notes: 'Đăng ký tìm hiểu lớp 10 chất lượng cao chuyên Anh.',
      interactions: [
        { date: '2026-06-09', type: 'Đăng ký Form', content: 'Quan tâm chính sách học bổng đầu vào' }
      ]
    },
    {
      id: 'lead_2',
      studentName: 'Trần Bảo Nam',
      parentName: 'Lê Thị Thu',
      phone: '0987654321',
      email: 'thu.le@gmail.com',
      stage: 'CONSULTING',
      source: 'Website',
      notes: 'Đang tư vấn lộ trình học song bằng Cambridge.',
      interactions: [
        { date: '2026-06-08', type: 'Gọi điện', content: 'Tư vấn biểu phí và chương trình bồi dưỡng học sinh' }
      ]
    },
    {
      id: 'lead_3',
      studentName: 'Phạm Tiến Dũng',
      parentName: 'Phạm Văn Thành',
      phone: '0905123456',
      email: 'thanh.pham@gmail.com',
      stage: 'TOUR',
      source: 'Referral',
      notes: 'Hẹn lịch tham quan trường (School Tour) vào thứ bảy này.',
      interactions: [
        { date: '2026-06-09', type: 'Đặt lịch', content: 'Xác nhận tham quan cơ sở vật chất tầng 3' }
      ]
    },
    {
      id: 'lead_4',
      studentName: 'Lê Quỳnh Chi',
      parentName: 'Đỗ Thị Lan',
      phone: '0944112233',
      email: 'lan.do@gmail.com',
      stage: 'REGISTERED',
      source: 'Event',
      notes: 'Đã nộp hồ sơ xét tuyển và lệ phí kiểm định đầu vào.',
      interactions: [
        { date: '2026-06-05', type: 'Đóng phí', content: 'Hoàn tất phí đăng ký xét tuyển 2.000.000đ' }
      ]
    },
    {
      id: 'lead_5',
      studentName: 'Hoàng Minh Ngọc',
      parentName: 'Hoàng Văn Lâm',
      phone: '0933445566',
      email: 'lam.hoang@gmail.com',
      stage: 'ENROLLED',
      source: 'Website',
      notes: 'Đã hoàn tất học phí đợt 1 và xác nhận nhập học chính thức.',
      interactions: [
        { date: '2026-06-01', type: 'Nhập học', content: 'Xác nhận thu học phí học kỳ I và phát đồng phục' }
      ]
    }
  ]);

  // Selected Lead Details Modal
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId) || null, [leads, selectedLeadId]);

  // Form State
  const [showAddLead, setShowAddLead] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSource, setNewSource] = useState<'Social' | 'Website' | 'Referral' | 'Event'>('Social');
  const [newNotes, setNewNotes] = useState('');

  const [interactionType, setInteractionType] = useState('Gọi điện');
  const [interactionContent, setInteractionContent] = useState('');

  // Source chart data
  const sourceChartData = useMemo(() => {
    const counts = { Social: 0, Website: 0, Referral: 0, Event: 0 };
    leads.forEach(l => {
      counts[l.source] = (counts[l.source] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newParentName.trim() || !newPhone.trim()) return;

    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      studentName: newStudentName.trim(),
      parentName: newParentName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      stage: 'LEAD',
      source: newSource,
      notes: newNotes.trim(),
      interactions: [
        { date: new Date().toISOString().split('T')[0], type: 'Tạo Lead', content: 'Thêm mới vào hệ thống CRM' }
      ]
    };

    setLeads([...leads, newLead]);
    setNewStudentName('');
    setNewParentName('');
    setNewPhone('');
    setNewEmail('');
    setNewNotes('');
    setShowAddLead(false);
  };

  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !interactionContent.trim()) return;

    setLeads(prev => prev.map(l => {
      if (l.id === selectedLeadId) {
        return {
          ...l,
          interactions: [
            ...l.interactions,
            {
              date: new Date().toISOString().split('T')[0],
              type: interactionType,
              content: interactionContent.trim()
            }
          ]
        };
      }
      return l;
    }));

    setInteractionContent('');
  };

  const handleMoveStage = (leadId: string, targetStage: Lead['stage']) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          stage: targetStage,
          interactions: [
            ...l.interactions,
            {
              date: new Date().toISOString().split('T')[0],
              type: 'Chuyển trạng thái',
              content: `Di chuyển sang bước: ${targetStage}`
            }
          ]
        };
      }
      return l;
    }));
  };

  const stages: { key: Lead['stage']; label: string; bg: string; text: string }[] = [
    { key: 'LEAD', label: 'Lead tiềm năng', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700' },
    { key: 'CONSULTING', label: 'Đang tư vấn', bg: 'bg-blue-50/50 border-blue-150', text: 'text-blue-700' },
    { key: 'TOUR', label: 'Tham quan trường', bg: 'bg-amber-50/50 border-amber-150', text: 'text-amber-700' },
    { key: 'REGISTERED', label: 'Đã nộp hồ sơ', bg: 'bg-purple-50/50 border-purple-150', text: 'text-purple-700' },
    { key: 'ENROLLED', label: 'Đã nhập học', bg: 'bg-emerald-50/50 border-emerald-150', text: 'text-emerald-700' }
  ];

  return (
    <div className="space-y-6">
      {/* Admissions Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2.5">
          <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border border-indigo-500/20 flex items-center gap-1 w-fit">
            <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
            Admissions CRM
          </span>
          <h2 className="text-xl md:text-2xl font-display font-black leading-tight">Quy trình và dữ liệu tuyển sinh tích hợp</h2>
          <p className="text-xs text-slate-350 max-w-3xl font-light leading-relaxed">
            Theo dõi phễu chuyển đổi tuyển sinh từ đầu vào quảng cáo đến tư vấn phụ huynh, đặt lịch tham quan trường và hoàn tất thủ tục nhập học.
          </p>
        </div>
      </div>

      {/* CRM Funnel Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Chỉ tiêu toàn khóa</span>
          <strong className="text-2xl font-display font-black text-slate-900 dark:text-white mt-1.5 block">1,500 <span className="text-xs text-slate-400 font-bold font-sans">học sinh</span></strong>
          <span className="text-[10.5px] text-slate-500 mt-1 block">Năm học 2025-2026</span>
        </div>

        <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Đã nhập học (Enrolled)</span>
          <strong className="text-2xl font-display font-black text-emerald-600 mt-1.5 block">1,280 <span className="text-xs text-slate-400 font-bold font-sans">học sinh</span></strong>
          <span className="text-[10.5px] text-emerald-600 font-bold mt-1 block">Đạt 85.3% chỉ tiêu tuyển sinh</span>
        </div>

        <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Tổng số Leads</span>
          <strong className="text-2xl font-display font-black text-indigo-600 mt-1.5 block">{leads.length} <span className="text-xs text-slate-400 font-bold font-sans">đầu mối</span></strong>
          <span className="text-[10.5px] text-slate-500 mt-1 block">Đang hoạt động trong phễu</span>
        </div>

        <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Tỷ lệ chuyển đổi trung bình</span>
          <strong className="text-2xl font-display font-black text-indigo-650 dark:text-indigo-400 mt-1.5 block">15.8%</strong>
          <span className="text-[10.5px] text-slate-500 mt-1 block">Từ Lead sang Nhập học chính thức</span>
        </div>
      </div>

      {/* Main Admissions Pipeline Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">Phễu tuyển sinh</h3>
          <button
            onClick={() => setShowAddLead(!showAddLead)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Lead Tiềm Năng</span>
          </button>
        </div>

        {showAddLead && (
          <form onSubmit={handleAddLead} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-4 max-w-3xl">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono">Khởi tạo Lead mới</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Tên Học sinh</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  placeholder="Họ tên học sinh..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Tên Phụ huynh</label>
                <input
                  type="text"
                  required
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  placeholder="Họ tên phụ huynh..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Số điện thoại</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  placeholder="Số điện thoại liên hệ..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Địa chỉ Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  placeholder="Email liên hệ..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Nguồn marketing</label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value as any)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="Social">Mạng xã hội (Social)</option>
                  <option value="Website">Cổng thông tin (Website)</option>
                  <option value="Referral">Người giới thiệu (Referral)</option>
                  <option value="Event">Sự kiện tuyển sinh (Event)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Ghi chú nhu cầu</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  placeholder="Lớp đăng ký, nhu cầu bán trú..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddLead(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-650"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
              >
                Lưu Học Sinh Tiềm Năng
              </button>
            </div>
          </form>
        )}

        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stages.map(col => {
            const colLeads = leads.filter(l => l.stage === col.key);

            return (
              <div
                key={col.key}
                className={`p-4 rounded-2xl border ${col.bg} flex flex-col min-h-[350px]`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 mb-3">
                  <span className={`text-xs font-extrabold ${col.text}`}>{col.label}</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[9.5px] font-mono font-bold text-slate-500">
                    {colLeads.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colLeads.map(lead => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className="p-3 bg-white border border-slate-200 dark:border-slate-800/80 rounded-xl hover:border-indigo-400 transition-all cursor-pointer shadow-3xs hover:shadow-2xs select-none"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[11.5px] font-bold text-slate-900 dark:text-white truncate">
                          {lead.studentName}
                        </h4>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-[8.5px] font-mono text-slate-500 rounded font-semibold shrink-0">
                          {lead.source}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 mt-1.5">
                        PH: {lead.parentName} • SĐT: {lead.phone}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100/55 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Xem tương tác</span>
                        <div className="flex items-center gap-1">
                          {lead.stage !== 'ENROLLED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextIndex = stages.findIndex(s => s.key === lead.stage) + 1;
                                if (nextIndex < stages.length) {
                                  handleMoveStage(lead.id, stages[nextIndex].key);
                                }
                              }}
                              className="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded text-[9px] font-bold transition-all"
                            >
                              Chuyển tiếp →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-600 font-mono tracking-wider">
                  Lead Profile 360
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  HS: {selectedLead.studentName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLeadId(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Tên phụ huynh</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{selectedLead.parentName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Điện thoại liên lạc</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{selectedLead.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Email phụ huynh</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{selectedLead.email || 'Chưa cung cấp'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Nguồn tiếp cận</span>
                <span className="font-bold text-indigo-600 mt-0.5 block">{selectedLead.source}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700">
              <span className="font-semibold block mb-1">Ghi chú hiện trạng:</span>
              "{selectedLead.notes}"
            </div>

            {/* Interaction Logs */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Lịch sử tương tác ({selectedLead.interactions.length})</span>
              
              <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-100 p-2.5 rounded-xl">
                {selectedLead.interactions.map((it, idx) => (
                  <div key={idx} className="p-2 bg-slate-50/50 rounded-lg text-[11px] border border-slate-100/50">
                    <span className="font-mono text-slate-400">{it.date}</span> • <strong className="text-indigo-650">{it.type}</strong>: {it.content}
                  </div>
                ))}
              </div>

              {/* Add Interaction Log Form */}
              <form onSubmit={handleAddInteraction} className="flex gap-2 items-center">
                <select
                  value={interactionType}
                  onChange={(e) => setInteractionType(e.target.value)}
                  className="px-2 py-1.5 text-[11px] border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Gọi điện">Gọi điện</option>
                  <option value="Email">Gửi Email</option>
                  <option value="Tham quan">School Tour</option>
                  <option value="Họp trực tiếp">Gặp trực tiếp</option>
                </select>
                <input
                  type="text"
                  required
                  value={interactionContent}
                  onChange={(e) => setInteractionContent(e.target.value)}
                  placeholder="Ghi nội dung chi tiết thảo luận với phụ huynh..."
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Gửi Log
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Campaign Analytics */}
      <div className="bg-white border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-4">
        <div>
          <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono">
            📊 Phân tích Nguồn truyền thông & tuyển sinh (Marketing Source Analytics)
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">Đo lường số lượng học sinh đăng ký dựa theo nguồn kênh chiến dịch quảng cáo.</p>
        </div>

        <div className="h-52 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={9.5} />
              <YAxis stroke="#94a3b8" fontSize={9.5} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
