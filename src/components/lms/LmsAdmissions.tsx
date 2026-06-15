'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Mail, Plus, Phone, Search, Send, CheckCircle, FileSpreadsheet, RefreshCw
} from 'lucide-react';
import { UserProfile } from '../../types';
import { syncEnrolledCrmLeadsToLifecycle } from '../../utils/crmStudentSync';
import { VIETNAM_GRADE_LEVELS } from '../../utils/vietnameseCurriculum';
import { exportToCsv } from '../../utils/exportUtils';

interface LmsStudent {
  id: string;
  name: string;
  className: string;
  gender?: string;
  birthDate?: string;
  phone?: string;
  parentName: string;
  parentPhone?: string;
  parentEmail: string;
  parentGender?: string;
  emergencyContact?: string;
  address?: string;
}

interface LmsAdmissionsProps {
  currentUser: UserProfile;
  leads: any[];
  setLeads: React.Dispatch<React.SetStateAction<any[]>>;
  lang: 'VI' | 'EN';
  t: any;
  lmsStudents: LmsStudent[];
  setLmsStudents: React.Dispatch<React.SetStateAction<LmsStudent[]>>;
  setTuitionFees: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function LmsAdmissions({
  currentUser,
  leads = [],
  setLeads,
  lang,
  t,
  lmsStudents = [],
  setLmsStudents,
  setTuitionFees,
}: LmsAdmissionsProps) {
  // Local states for Admissions
  const [searchLeadQuery, setSearchLeadQuery] = useState('');
  const [statusLeadFilter, setStatusLeadFilter] = useState<'ALL' | 'CONSULTING' | 'TESTING' | 'RESERVED' | 'ENROLLED'>('ALL');
  const [activeLeadId, setActiveLeadId] = useState<string>('');
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    parentName: '',
    phone: '',
    email: '',
    grade: 'Lớp 10',
    source: 'Facebook Ads',
    notes: '',
  });

  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [emailTemplate, setEmailTemplate] = useState<'OPEN_DAY' | 'SCHOLARSHIP'>('OPEN_DAY');
  const [emailSubject, setEmailSubject] = useState(
    'MIS Hà Nội: Thư mời tham dự Open Day - Khơi dậy tiềm năng cùng Đa Trí Tuệ'
  );
  const [emailProgress, setEmailProgress] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');
  const [sentCount, setSentCount] = useState(0);
  const [emailResult, setEmailResult] = useState('');

  useEffect(() => {
    if (leads.length > 0 && !activeLeadId) {
      setActiveLeadId(leads[0].id);
    }
  }, [leads, activeLeadId]);

  // Sync ENROLLED leads to the shared student lifecycle stores.
  useEffect(() => {
    const enrolledLeads = leads.filter(l => l.stage === 'ENROLLED');
    if (enrolledLeads.length === 0) return;

    const syncResult = syncEnrolledCrmLeadsToLifecycle(enrolledLeads);
    if (syncResult.addedLmsStudentIds.length > 0 || syncResult.updatedLmsStudentIds.length > 0) {
      setLmsStudents(syncResult.lmsStudents as LmsStudent[]);
    }
    if (syncResult.addedInvoiceNos.length > 0) {
      setTuitionFees(syncResult.tuitionFees);
    }
  }, [leads, setLmsStudents, setTuitionFees]);

  const campaignRecipientCount = leads.filter(lead => lead.email).length;

  // Add a new lead
  const handleAddLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name.trim() || !newLeadForm.phone.trim()) return;

    const isPhoneDup = leads.some(l => l.phone === newLeadForm.phone.trim());
    const isEmailDup = newLeadForm.email.trim() && leads.some(l => l.email && l.email.toLowerCase() === newLeadForm.email.trim().toLowerCase());

    if (isPhoneDup || isEmailDup) {
      const confirmMsg = `Phát hiện thông tin học sinh trùng lặp:\n${isPhoneDup ? '- Số điện thoại đã tồn tại\n' : ''}${isEmailDup ? '- Email đã tồn tại\n' : ''}\nBạn có chắc chắn vẫn muốn thêm học sinh này?`;
      if (!window.confirm(confirmMsg)) return;
    }

    const newL = {
      id: `lead_${Date.now()}`,
      studentName: newLeadForm.name.trim(),
      parentName: newLeadForm.parentName.trim() || 'Người liên hệ',
      phone: newLeadForm.phone.trim(),
      email: newLeadForm.email.trim(),
      stage: 'CONSULTING',
      source: newLeadForm.source,
      consultant: currentUser.name,
      grade: newLeadForm.grade || 'Lớp 10',
      notes: newLeadForm.notes.trim() || 'Chưa ghi chú cụ thể.',
      interactions: [
        {
          date: new Date().toISOString().split('T')[0],
          type: 'Tạo mới',
          content: 'Được phân bổ lead qua cổng tuyển sinh LMS'
        }
      ]
    };
    setLeads([newL, ...leads]);
    setNewLeadForm({ name: '', parentName: '', phone: '', email: '', grade: 'Lớp 10', source: 'Facebook Ads', notes: '' });
  };

  // Add notes to a lead
  const handleAddNote = (leadId: string) => {
    const text = noteInputs[leadId];
    if (!text?.trim()) return;
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const currentInteractions = l.interactions || [];
        return { 
          ...l, 
          notes: `${l.notes}\n[Ghi chú mới]: ${text.trim()}`,
          interactions: [
            ...currentInteractions,
            {
              date: new Date().toISOString().split('T')[0],
              type: 'Ghi chú',
              content: text.trim()
            }
          ]
        };
      }
      return l;
    }));
    setNoteInputs(prev => ({ ...prev, [leadId]: '' }));
  };

  // Update lead status
  const updateLeadStatus = (leadId: string, stage: 'CONSULTING' | 'TESTING' | 'RESERVED' | 'ENROLLED') => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const currentInteractions = l.interactions || [];
        return { 
          ...l, 
          stage,
          interactions: [
            ...currentInteractions,
            {
              date: new Date().toISOString().split('T')[0],
              type: 'Chuyển trạng thái',
              content: `Thay đổi trạng thái sang ${stage}`
            }
          ]
        };
      }
      return l;
    }));
  };

  // Send campaign
  const handleSendMassEmail = async () => {
    const recipients = leads
      .filter(lead => lead.email)
      .map(lead => ({
        email: lead.email,
        name: lead.parentName,
      }));

    if (recipients.length === 0) {
      setEmailResult('Chưa có lead nào có email hợp lệ để gửi chiến dịch.');
      return;
    }

    setEmailProgress('SENDING');
    setSentCount(0);
    setEmailResult('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0f172a;">
        <h2 style="color:#047857;">${emailSubject}</h2>
        <p>Kính gửi Quý Phụ huynh,</p>
        ${emailTemplate === 'OPEN_DAY'
          ? '<p>Trường MIS trân trọng kính mời Quý Phụ huynh tham dự Open Day để tìm hiểu chương trình giáo dục Đa Trí Tuệ và định hướng học tập cá nhân hóa.</p><p><strong>Thời gian dự kiến:</strong> Thứ bảy, ngày 15/06/2026.</p>'
          : '<p>MIS thông báo chương trình học bổng tìm kiếm tài năng Đa Trí Tuệ dành cho học sinh có năng lực nổi bật ở Toán học, Ngôn ngữ và Nghệ thuật.</p><p><strong>Giá trị học bổng:</strong> lên tới 70% học phí.</p>'
        }
        <p>Trân trọng,<br/>Ban Tuyển sinh MIS</p>
      </div>
    `;

    try {
      const response = await fetch('/api/email/send-campaign', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          campaignName: emailTemplate,
          recipients,
          subject: emailSubject,
          html,
          text: emailSubject,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.error || 'Không thể gửi chiến dịch email.');
      }
      setSentCount(data.processed || 0);
      setEmailProgress('SENT');
      setEmailResult(
        data.provider === 'SMTP'
          ? `Đã xử lý ${data.processed} email qua SMTP, thành công ${data.sent?.length || 0}, lỗi ${data.failed?.length || 0}, còn lại ${data.remaining || 0}.`
          : `SMTP chưa cấu hình; server đã ghi log chiến dịch thử (${data.processed} email).`
      );
    } catch (error: any) {
      setEmailProgress('IDLE');
      setEmailResult(`Lỗi gửi chiến dịch: ${error.message || error}`);
    }
  };

  const handleExportLeadsCsv = () => {
    const headers = ['Ma Lead', 'Hoc sinh', 'Phu huynh', 'So dien thoai', 'Khoi', 'Nguon', 'Tu van vien', 'Trang thai', 'Ghi chu'];
    const rows = leads.map(l => [
      l.id,
      l.studentName || l.name,
      l.parentName,
      l.phone,
      l.grade,
      l.source,
      l.consultant || 'Hệ thống',
      l.stage === 'CONSULTING' ? 'Consulting' : l.stage === 'TESTING' ? 'Testing' : l.stage === 'RESERVED' ? 'Reserved' : 'Enrolled',
      l.notes
    ]);
    exportToCsv('MIS_CRM_Leads_Report.csv', headers, rows);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* CRM Leads Table List */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-3xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="font-display font-black text-slate-905 dark:text-white text-sm flex items-center gap-2">
                <Users className="text-emerald-600 w-4.5 h-4.5" />
                {t.leadManager}
              </h3>
            </div>
            <button
              onClick={handleExportLeadsCsv}
              className="px-2.5 py-1 text-[10.5px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-805 dark:border-slate-705 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg shadow-3xs transition-all cursor-pointer flex items-center gap-1.5 no-print"
              title="Xuất danh sách Leads ra Excel/CSV"
              type="button"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Xuất Excel Leads
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-850">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm tên hoặc số điện thoại..."
                value={searchLeadQuery}
                onChange={(e) => setSearchLeadQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <select
                value={statusLeadFilter}
                onChange={(e: any) => setStatusLeadFilter(e.target.value)}
                className="w-full text-xs px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-650 dark:text-slate-350 cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái lead</option>
                <option value="CONSULTING">Đang tư vấn &amp; Lead</option>
                <option value="TESTING">Thi test &amp; Đặt lịch</option>
                <option value="RESERVED">Giữ chỗ &amp; Hồ sơ</option>
                <option value="ENROLLED">Đã nhập học</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-605 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold">
                  <th className="px-4 py-2.5">Học sinh</th>
                  <th className="px-4 py-2.5">Khối</th>
                  <th className="px-4 py-2.5">Số điện thoại</th>
                  <th className="px-4 py-2.5">Tư vấn viên</th>
                  <th className="px-4 py-2.5">Nguồn</th>
                  <th className="px-4 py-2.5 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(() => {
                  const filteredLeads = leads.filter(l => {
                    const nameVal = l.studentName || l.name || '';
                    const matchesQuery = nameVal.toLowerCase().includes(searchLeadQuery.toLowerCase()) || l.phone.includes(searchLeadQuery);
                    const matchesStatus = statusLeadFilter === 'ALL' || l.stage === statusLeadFilter;
                    return matchesQuery && matchesStatus;
                  });

                  if (filteredLeads.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-xs text-slate-400 font-medium bg-slate-50/20 dark:bg-slate-950/20">
                          Không tìm thấy Leads nào phù hợp với bộ lọc tìm kiếm.
                        </td>
                      </tr>
                    );
                  }

                  return filteredLeads.map(lead => {
                    const isActive = lead.id === activeLeadId;
                    const statusColors = lead.stage === 'CONSULTING' ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : lead.stage === 'TESTING' ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : lead.stage === 'RESERVED' ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : lead.stage === 'ENROLLED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-800 border-slate-200';

                    return (
                      <tr 
                        key={lead.id}
                        onClick={() => setActiveLeadId(lead.id)}
                        className={`hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition-colors cursor-pointer ${isActive ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}`}
                      >
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px]">👤</span>
                            <div>
                              <span className="block">{lead.studentName || lead.name}</span>
                              <span className="text-[9px] text-slate-450 dark:text-slate-500 block font-normal">PH: {lead.parentName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400 font-medium">{lead.grade}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono">{lead.phone}</td>
                        <td className="px-4 py-3 font-sans whitespace-nowrap">
                          <select 
                            value={lead.consultant || 'Cô Thanh Nhàn'}
                            onChange={(e) => {
                              e.stopPropagation();
                              const val = e.target.value;
                              setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, consultant: val } : l));
                            }}
                            className="border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[11px] bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-305 focus:outline-none cursor-pointer"
                          >
                            <option value="Cô Thanh Nhàn">Cô Thanh Nhàn</option>
                            <option value="Thầy Đức Nam">Thầy Đức Nam</option>
                            <option value="Thầy Quốc Đạt">Thầy Quốc Đạt</option>
                            <option value="Cô Minh Tuyết">Cô Minh Tuyết</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 font-medium text-[11px]">🎈 {lead.source}</td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight border ${statusColors}`}>
                            {lead.stage === 'CONSULTING' ? 'Tư vấn & Lead' 
                              : lead.stage === 'TESTING' ? 'Thi test' 
                              : lead.stage === 'RESERVED' ? 'Giữ chỗ' 
                              : 'Nhập học'}
                          </span>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          {/* Lead Action details & Counsel logging per lead */}
          {leads.find(l => l.id === activeLeadId) && (
            (() => {
              const activeLead = leads.find(l => l.id === activeLeadId)!;
              return (
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 mt-2 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800 pb-2 flex-wrap gap-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span>📝</span> Bản lưu tư vấn cho: <strong className="text-emerald-700 dark:text-emerald-400">{activeLead.studentName || activeLead.name}</strong>
                    </h4>
                    <div className="flex gap-1 flex-wrap">
                      <button 
                        onClick={() => updateLeadStatus(activeLead.id, 'CONSULTING')}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer ${activeLead.stage === 'CONSULTING' ? 'bg-blue-650 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'}`}
                      >
                        Đang tư vấn
                      </button>
                      <button 
                        onClick={() => updateLeadStatus(activeLead.id, 'TESTING')}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer ${activeLead.stage === 'TESTING' ? 'bg-amber-650 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'}`}
                      >
                        Thi test
                      </button>
                      <button 
                        onClick={() => updateLeadStatus(activeLead.id, 'RESERVED')}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer ${activeLead.stage === 'RESERVED' ? 'bg-purple-650 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'}`}
                      >
                        Giữ chỗ
                      </button>
                      <button 
                        onClick={() => updateLeadStatus(activeLead.id, 'ENROLLED')}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer ${activeLead.stage === 'ENROLLED' ? 'bg-emerald-650 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'}`}
                      >
                        Nhập học
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-650 dark:text-slate-400 whitespace-pre-wrap leading-relaxed font-sans bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    {activeLead.notes}
                  </p>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Nhập ghi chú phản hồi cuộc gọi, tư vấn học bổng, mối quan tâm..."
                      value={noteInputs[activeLead.id] || ''}
                      onChange={(e) => setNoteInputs({ ...noteInputs, [activeLead.id]: e.target.value })}
                      className="flex-1 text-xs border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                    <button
                      onClick={() => handleAddNote(activeLead.id)}
                      className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      Ghi chú
                    </button>
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {/* Sidebar Quick adding leads UI */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Add New CRM Lead */}
          <form onSubmit={handleAddLeadSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-3xs p-5 space-y-4">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              Báo cáo Nhận Leads Độc quyền Mới
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Họ tên học sinh</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Hoàng Anh Thư"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Họ tên phụ huynh</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Nguyễn Văn Hải"
                  value={newLeadForm.parentName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, parentName: e.target.value })}
                  className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Số điện thoại liên hệ</label>
                <input 
                  type="tel" 
                  required
                  placeholder="Số điện thoại phụ huynh"
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-200 font-mono"
                />
                {newLeadForm.phone.trim() && leads.some(l => l.phone === newLeadForm.phone.trim()) && (
                  <p className="text-[10px] text-rose-655 font-bold mt-1 animate-pulse">⚠️ Số điện thoại đã tồn tại trên CRM</p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Email liên hệ</label>
                <input 
                  type="email" 
                  placeholder="Ví dụ: parent.email@gmail.com"
                  value={newLeadForm.email}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                  className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-200"
                />
                {newLeadForm.email.trim() && leads.some(l => l.email && l.email.toLowerCase() === newLeadForm.email.trim().toLowerCase()) && (
                  <p className="text-[10px] text-rose-655 font-bold mt-1 animate-pulse">⚠️ Email đã tồn tại trên CRM</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Khối dự tuyển</label>
                  <select
                    value={newLeadForm.grade}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, grade: e.target.value })}
                    className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-200 cursor-pointer"
                  >
                    {VIETNAM_GRADE_LEVELS.map(level => (
                      <option key={level} value={level}>{level.replace('Lớp', 'Khối')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Kênh tiếp cận</label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                    className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="Facebook Ads">Facebook Ads</option>
                    <option value="Web Form">Web Form</option>
                    <option value="Hotline">Hotline</option>
                    <option value="Giới thiệu">Giới thiệu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Ghi chú nhu cầu ban đầu</label>
                <textarea 
                  rows={2}
                  placeholder="Ghi nhận mối quan tâm chuyên sâu..."
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-200 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Phân bổ Lead vào Hệ thống
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Mass Emailing Campaigns Hub */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-3xs p-6 space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-display font-black text-slate-905 dark:text-white text-sm flex items-center gap-2">
            <Mail className="text-emerald-600 w-5 h-5 animate-bounce" />
            {t.massEmail}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tích hợp API email hàng loại, kích hoạt chương trình truyền thông Open Day tới 1000+ phụ huynh.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Form setups on left */}
          <div className="md:col-span-5 space-y-3.5 text-left">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Chọn mẫu Email chiến dịch</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEmailTemplate('OPEN_DAY');
                    setEmailSubject('MIS Hà Nội: Thư mời tham dự Open Day - Khơi dậy tiềm năng cùng Đa Trí Tuệ');
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between cursor-pointer ${
                    emailTemplate === 'OPEN_DAY' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-900 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <strong className="block font-bold">Thư mời Open Day</strong>
                  <span className="text-[9.5px] text-slate-500 dark:text-slate-450 block mt-0.5">Xúc tiến tuyển sinh</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmailTemplate('SCHOLARSHIP');
                    setEmailSubject('MIS School: Chương trình học bổng tìm kiếm tài năng Đa Trí Tuệ (Tinh hoa Toán học & Ngữ văn)');
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between cursor-pointer ${
                    emailTemplate === 'SCHOLARSHIP' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-900 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <strong className="block font-bold">Học bổng Ươm mầm</strong>
                  <span className="text-[9.5px] text-slate-500 dark:text-slate-450 block mt-0.5">Khuyến tài định kỳ 2026</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Tiêu đề email (Cầm tay soạn thảo)</label>
              <input 
                type="text" 
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full text-xs font-semibold p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-955"
              />
            </div>

            {emailProgress === 'SENDING' ? (
              <div className="bg-slate-500/5 border p-4 rounded-xl space-y-2 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    API Đang đẩy thư hàng loạt...
                  </span>
                  <strong className="font-mono text-emerald-700 dark:text-emerald-450">{sentCount} / {campaignRecipientCount} Leads</strong>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (sentCount / Math.max(1, campaignRecipientCount)) * 100)}%` }} />
                </div>
              </div>
            ) : emailProgress === 'SENT' ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-3.5 rounded-xl flex items-start gap-2 text-emerald-905">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-800 dark:text-emerald-400">Gửi chiến dịch thư thành công!</p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-500 mt-1">{emailResult || `Đã xử lý ${sentCount} email tiềm năng qua API gửi thư của MIS LMS.`}</p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSendMassEmail}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Kích hoạt mass-email qua SMTP API
              </button>
            )}

            {emailProgress !== 'SENT' && emailResult && (
              <div className="rounded-xl border border-amber-250 bg-amber-50 dark:bg-amber-950/10 px-3 py-2 text-[11px] font-semibold text-amber-800 dark:text-amber-400">
                {emailResult}
              </div>
            )}
          </div>

          {/* Email template preview inside right */}
          <div className="md:col-span-7 bg-slate-50 dark:bg-slate-950 rounded-xl p-4.5 border border-slate-150 dark:border-slate-850 relative text-left">
            <span className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 uppercase">Preview</span>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg space-y-3 shadow-6xs text-xs text-slate-700 dark:text-slate-300">
              <p className="font-bold text-slate-800 dark:text-slate-200">Kính gửi Quý Phụ huynh học sinh,</p>
              {emailTemplate === 'OPEN_DAY' ? (
                <div className="space-y-2 leading-relaxed">
                  <p>Trường Phổ thông Liên cấp Đa Trí Tuệ (MIS) hân hoan kính mời quý phụ huynh tới tham dự ngày hội <strong>Open Day 2026</strong> để tiếp cận chương trình giáo dục định hướng cá nhân hóa năng lực học tập thông qua 8 loại hình đa thông thái.</p>
                  <p className="p-2 border-l-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-medium italic text-emerald-800 dark:text-emerald-350">Thời gian: Thứ bảy, ngày 15 tháng 6 năm 2026 tại khuôn viên nhà trường.</p>
                </div>
              ) : (
                <div className="space-y-2 leading-relaxed">
                  <p>Nhằm phát huy tối đa tư duy Toán, Ngôn ngữ, Nghệ thuật cho học viên năng khiếu, MIS ban hành quỹ học bổng trị giá lên tới <strong>70% học phí</strong> trọn năm học quý báu.</p>
                  <p className="p-2 border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-955/40 text-[11px] font-medium italic text-amber-850 dark:text-amber-350">Áp dụng cho học sinh có điểm trung bình học thuật đạt từ Khá trở lên.</p>
                </div>
              )}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 text-[10.5px] text-slate-400">
                <p className="font-semibold text-slate-500 dark:text-slate-350">Ban Tuyển sinh &amp; Gắn kết Cộng đồng MIS Hà Nội</p>
                <p>Hệ thống hỗ trợ bởi MIS LMS</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
