'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  FileText,
  Megaphone,
  CalendarDays,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Activity,
  UserSquare,
  Send,
  Calendar,
  X,
  Users,
  CalendarHeart,
  ShieldAlert,
  ClipboardList,
  MapPin,
  Radio
} from 'lucide-react';
import { ParentSupportTicket, CommunicationContent, Survey, SchoolEvent, CrisisIncident } from '../types';

import CreateTicketForm from './CreateTicketForm';
import CreateCampaignForm from './CreateCampaignForm';
import CreateEventForm from './CreateEventForm';
import CreateSurveyForm from './CreateSurveyForm';
import CreateCrisisForm from './CreateCrisisForm';

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function EventManagement({ initialData, actions }: any) {
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'surveys'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'EVENTS' | 'SURVEYS' | 'TICKETS' | 'COMMUNICATIONS' | 'CRISIS'>('EVENTS');

  const openForm = (type: 'TICKETS' | 'COMMUNICATIONS' | 'EVENTS' | 'CRISIS' | 'SURVEYS') => {
    setFormType(type);
    setIsFormOpen(true);
  };

  const getCreateButtonConfig = () => {
    switch(activeTab) {
      case 'events': return { label: 'Tạo Sự kiện', action: () => openForm('EVENTS'), icon: Plus, color: 'bg-rose-600 hover:bg-rose-700' };
      case 'communications': return { label: 'Tạo Chiến dịch', action: () => openForm('COMMUNICATIONS'), icon: Plus, color: 'bg-emerald-600 hover:bg-emerald-700' };
      case 'surveys': return { label: 'Tạo Khảo sát', action: () => openForm('SURVEYS'), icon: Plus, color: 'bg-amber-600 hover:bg-amber-700' };
      case 'crisis': return { label: 'Báo cáo Sự cố', action: () => openForm('CRISIS'), icon: Plus, color: 'bg-red-600 hover:bg-red-700' };
      default: return { label: 'Tạo mới', action: () => openForm('EVENTS'), icon: Plus, color: 'bg-indigo-600 hover:bg-indigo-700' };
    }
  };

  const createBtn = getCreateButtonConfig();

  return (
    <div className="p-6 pb-24 h-screen overflow-y-auto bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sự kiện & Khảo sát</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Quản lý sự kiện, truyền thông và khảo sát toàn trường</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={createBtn.action}
            className={`flex items-center gap-2 px-4 py-2 ${createBtn.color} text-white font-bold rounded-xl transition-all shadow-sm active:scale-95`}
          >
            <createBtn.icon className="w-4 h-4" /> {createBtn.label}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'events', label: 'Sự kiện', icon: CalendarHeart },
          { id: 'communications', label: 'Truyền thông', icon: Megaphone },
          { id: 'surveys', label: 'Khảo sát', icon: ClipboardList },
          { id: 'crisis', label: 'Khủng hoảng', icon: ShieldAlert }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap
              ${activeTab === tab.id ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} /> 
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'tickets' && <TicketsView />}
        {activeTab === 'communications' && <CommunicationsView campaigns={initialData?.campaigns || []} actions={actions} />}
        {activeTab === 'events' && <EventsView events={initialData?.data || []} actions={actions} />}
        {activeTab === 'crisis' && <CrisisView />}
        {activeTab === 'surveys' && <SurveysView />}
      </div>

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] lg:w-[800px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isFormOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full relative flex flex-col">
          <div className="flex-1 overflow-hidden">
            {formType === 'TICKETS' && (
              <CreateTicketForm 
                onClose={() => setIsFormOpen(false)} 
                onSubmit={(data) => {
                  console.log('Ticket Submitted:', data);
                  setIsFormOpen(false);
                  alert(`Tạo ticket thành công: ${data.ticketCode}`);
                }} 
              />
            )}
            {formType === 'COMMUNICATIONS' && (
              <CreateCampaignForm 
                onClose={() => setIsFormOpen(false)}
                onSubmit={async (data) => {
                  console.log('Campaign Submitted:', data);
                  if (actions?.createCampaign) {
                    const res = await actions.createCampaign(data);
                    if (res.success) {
                      setIsFormOpen(false);
                      alert(`Tạo chiến dịch truyền thông thành công: ${data.title}`);
                    } else {
                      alert(`Lỗi: ${res.error}`);
                    }
                  } else {
                    setIsFormOpen(false);
                  }
                }}
              />
            )}
            {formType === 'EVENTS' && (
              <CreateEventForm 
                onClose={() => setIsFormOpen(false)}
                onSubmit={async (data) => {
                  console.log('Event Submitted:', data);
                  if (actions?.createEvent) {
                    const res = await actions.createEvent(data);
                    if (res.success) {
                      setIsFormOpen(false);
                      alert(`Tạo sự kiện thành công: ${data.eventName || data.title} (Trạng thái: ${data.status})`);
                    } else {
                      alert(`Lỗi: ${res.error}`);
                    }
                  } else {
                    setIsFormOpen(false);
                  }
                }}
              />
            )}
            {formType === 'SURVEYS' && (
              <CreateSurveyForm 
                onClose={() => setIsFormOpen(false)}
                onSubmit={(data) => {
                  console.log('Survey Submitted:', data);
                  setIsFormOpen(false);
                  alert(`Tạo khảo sát thành công: ${data.surveyTitle} (Trạng thái: ${data.status})`);
                }}
              />
            )}
            {formType === 'CRISIS' && (
              <CreateCrisisForm 
                onClose={() => setIsFormOpen(false)}
                onSubmit={(data) => {
                  console.log('Crisis Submitted:', data);
                  setIsFormOpen(false);
                  alert(`Báo cáo vụ việc khủng hoảng thành công: ${data.title} (Trạng thái: ${data.status})`);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB VIEWS (MVP) ────────────────────────────────────────────────────────

function TicketsView() {
  const mockTickets: ParentSupportTicket[] = [
    { 
      id: 'TKT-001', ticketCode: 'CSKH-2026-0001', receivedAt: '2026-06-20', channel: 'Cổng phụ huynh', 
      title: 'Phản ánh chất lượng bữa ăn trưa', description: '', parentName: 'Nguyễn Văn A', parentPhone: '0901234567', relationship: 'Bố', 
      studentName: 'Nguyễn Văn B (10A1)', status: 'NEW', priority: 'high', category: 'OTHER', departmentOwner: 'Dịch vụ', receivedBy: 'System', 
      slaDueAt: '2026-06-22', isSensitive: false, riskFlag: false, visibleToParent: true, createdBy: 'System', timeline: [], createdAt: '2026-06-20', updatedAt: '2026-06-20' 
    },
    { 
      id: 'TKT-002', ticketCode: 'CSKH-2026-0002', receivedAt: '2026-06-21', channel: 'Hotline', 
      title: 'Hỏi về lịch thi học kỳ', description: '', parentName: 'Trần Thị C', parentPhone: '0912345678', relationship: 'Mẹ', 
      studentName: 'Trần Văn D (11A2)', status: 'IN_PROGRESS', priority: 'medium', category: 'OTHER', departmentOwner: 'Học vụ', receivedBy: 'System', 
      slaDueAt: '2026-06-23', isSensitive: false, riskFlag: false, visibleToParent: true, createdBy: 'System', timeline: [], createdAt: '2026-06-21', updatedAt: '2026-06-22' 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Tổng Ticket" value="128" icon={MessageSquare} color="indigo" />
        <StatCard title="Chờ xử lý" value="12" icon={Clock} color="amber" />
        <StatCard title="Đang xử lý" value="5" icon={Activity} color="blue" />
        <StatCard title="Quá hạn SLA" value="1" icon={AlertCircle} color="red" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Người gửi</th>
              <th className="px-4 py-3">Phân loại</th>
              <th className="px-4 py-3">Mức độ</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockTickets.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-mono text-slate-500">{t.id}</td>
                <td className="px-4 py-3 font-bold text-slate-900">{t.title}</td>
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-700">{t.parentName}</div>
                  <div className="text-[11px] text-slate-500">PH {t.studentName}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{t.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${t.priority === 'critical' || t.priority === 'high' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                    {t.priority.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${t.status === 'NEW' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SurveysView() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <FileText className="w-12 h-12 text-slate-300 mb-3" />
      <h3 className="text-lg font-bold text-slate-900">Quản lý Khảo sát</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">Tạo và gửi biểu mẫu khảo sát ý kiến phụ huynh, học sinh và cán bộ nhân viên.</p>
    </div>
  );
}

function CommunicationsView({ campaigns, actions }: any) {
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showApproverModal, setShowApproverModal] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState<any[]>([]);

  const handleSelectCampaign = async (c: any) => {
    setSelectedCampaign(c);
    if (actions?.getApprovalHistory) {
      const res = await actions.getApprovalHistory(c.id);
      if (res && res.data) {
        setApprovalHistory(res.data);
      } else {
        setApprovalHistory([]);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'approved': return 'bg-sky-100 text-sky-700';
      case 'published': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-slate-200 text-slate-800';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Nháp';
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'published': return 'Đã đăng';
      case 'paused': return 'Tạm dừng';
      case 'cancelled': return 'Đã hủy';
      default: return status || 'Nháp';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Tổng Chiến dịch" value={campaigns.length} icon={Radio} color="indigo" />
        <StatCard title="Đang chạy" value={campaigns.filter((c: any) => c.status === 'published').length} icon={Activity} color="emerald" />
        <StatCard title="Chờ duyệt" value={campaigns.filter((c: any) => c.status === 'pending').length} icon={Clock} color="amber" />
        <StatCard title="Lượt tiếp cận" value={campaigns.reduce((sum: number, c: any) => sum + (c.metrics?.reach || 0), 0).toLocaleString()} icon={Users} color="blue" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Chiến dịch</th>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Phụ trách</th>
              <th className="px-4 py-3">Reach / Engage</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaigns.map((c: any) => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => handleSelectCampaign(c)}>
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-900">{c.title}</div>
                  <div className="text-[11px] text-slate-500 truncate max-w-xs">{c.objective}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">
                  {new Date(c.startAt).toLocaleDateString('vi-VN')} - {new Date(c.endAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3 text-slate-600 font-medium">{c.managerId}</td>
                <td className="px-4 py-3">
                  <div className="text-sm font-bold text-slate-700">{c.metrics?.reach?.toLocaleString() || 0} / {c.metrics?.engagement?.toLocaleString() || 0}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(c.status)}`}>
                    {getStatusText(c.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCampaign && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-900">Chi tiết Chiến dịch Truyền thông</h3>
              <button onClick={() => setSelectedCampaign(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(selectedCampaign.status)}`}>
                    {getStatusText(selectedCampaign.status)}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">{selectedCampaign.title}</h2>
                <p className="text-slate-600 text-sm mt-2 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedCampaign.objective}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-500 uppercase">Thời gian</div>
                  <div className="text-sm font-medium text-slate-800">
                    {new Date(selectedCampaign.startAt).toLocaleDateString('vi-VN')} ➔ {new Date(selectedCampaign.endAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-500 uppercase">Người phụ trách</div>
                  <div className="text-sm font-medium text-slate-800">{selectedCampaign.managerId}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-500 uppercase">Đối tượng mục tiêu</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCampaign.audience.map((a: string) => <span key={a} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">{a}</span>)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-500 uppercase">Kênh truyền thông</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCampaign.channels.map((c: string) => <span key={c} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">{c}</span>)}
                  </div>
                </div>
              </div>

              <ApprovalHistoryTimeline history={approvalHistory} />

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-sm text-slate-800 flex items-center justify-between">
                  <span>Lịch đăng bài chi tiết</span>
                  <span className="text-xs text-slate-500 font-normal">{selectedCampaign.payload?.postSchedule?.length || 0} bài đăng</span>
                </div>
                <div className="divide-y divide-slate-100 bg-white">
                  {selectedCampaign.payload?.postSchedule?.map((post: any, idx: number) => (
                    <div key={idx} className="p-3 flex flex-col md:flex-row md:items-center gap-3 hover:bg-slate-50/50">
                      <div className="w-24 text-sm font-bold text-slate-700">{post.date}</div>
                      <div className="px-2 py-1 bg-sky-100 text-sky-700 font-bold text-xs rounded-md w-24 text-center">{post.channel}</div>
                      <div className="flex-1 text-sm text-slate-600 truncate">{post.topic}</div>
                      <div className="w-28 text-right">
                        <select 
                          className={`text-xs font-bold rounded-lg border-0 bg-transparent cursor-pointer ${post.status === 'published' ? 'text-green-600' : 'text-slate-500'}`}
                          defaultValue={post.status || 'draft'}
                          onChange={(e) => {
                            const newSchedule = [...selectedCampaign.payload.postSchedule];
                            newSchedule[idx].status = e.target.value;
                            if (actions?.updateCampaignSchedule) {
                              actions.updateCampaignSchedule(selectedCampaign.id, newSchedule);
                            }
                          }}
                        >
                          <option value="draft">Nháp</option>
                          <option value="scheduled">Đã lên lịch</option>
                          <option value="published">Đã đăng</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {(!selectedCampaign.payload?.postSchedule || selectedCampaign.payload.postSchedule.length === 0) && (
                    <div className="text-sm text-slate-500 text-center py-4">Chưa có lịch đăng bài.</div>
                  )}
                </div>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                <h4 className="font-bold text-sky-900 mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> Báo cáo hiệu quả</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-sky-700 block mb-1">Lượt tiếp cận (Reach)</label>
                    <input type="number" defaultValue={selectedCampaign.metrics?.reach || 0} className="w-full text-sm border-sky-200 rounded-lg focus:ring-sky-500" 
                      onBlur={(e) => {
                        if (actions?.updateCampaignMetrics) {
                          actions.updateCampaignMetrics(selectedCampaign.id, { ...selectedCampaign.metrics, reach: parseInt(e.target.value) || 0 });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-sky-700 block mb-1">Tương tác (Engagement)</label>
                    <input type="number" defaultValue={selectedCampaign.metrics?.engagement || 0} className="w-full text-sm border-sky-200 rounded-lg focus:ring-sky-500" 
                      onBlur={(e) => {
                        if (actions?.updateCampaignMetrics) {
                          actions.updateCampaignMetrics(selectedCampaign.id, { ...selectedCampaign.metrics, engagement: parseInt(e.target.value) || 0 });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-sky-700 block mb-1">Leads Tuyển sinh</label>
                    <input type="number" defaultValue={selectedCampaign.metrics?.leads || 0} className="w-full text-sm border-sky-200 rounded-lg focus:ring-sky-500" 
                      onBlur={(e) => {
                        if (actions?.updateCampaignMetrics) {
                          actions.updateCampaignMetrics(selectedCampaign.id, { ...selectedCampaign.metrics, leads: parseInt(e.target.value) || 0 });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              {selectedCampaign.status === 'pending' ? (
                <div className="flex gap-2">
                  <button onClick={async () => {
                    const comment = prompt("Nhập nhận xét (tùy chọn):", "Đồng ý triển khai");
                    if (actions?.processApproval) {
                      await actions.processApproval(approvalHistory.length > 0 ? approvalHistory[0].approvalRequestId : '', 'APPROVE', comment || 'Đã duyệt');
                      setSelectedCampaign(null);
                    }
                  }} className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700">Duyệt Kế hoạch</button>
                  <button onClick={async () => {
                    const comment = prompt("Nhập lý do từ chối/yêu cầu sửa:", "");
                    if (comment && actions?.processApproval) {
                      await actions.processApproval(approvalHistory.length > 0 ? approvalHistory[0].approvalRequestId : '', 'REQUEST_REVISION', comment);
                      setSelectedCampaign(null);
                    }
                  }} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50">Yêu cầu sửa</button>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {selectedCampaign.status === 'draft' && <button onClick={() => setShowApproverModal(true)} className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-md hover:bg-amber-700">Gửi duyệt</button>}
                  {selectedCampaign.status === 'approved' && <button onClick={() => { if (actions?.updateCampaignStatus) actions.updateCampaignStatus(selectedCampaign.id, 'published'); setSelectedCampaign(null); }} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700">Bắt đầu chạy</button>}
                  {selectedCampaign.status === 'published' && <button onClick={() => { if (actions?.updateCampaignStatus) actions.updateCampaignStatus(selectedCampaign.id, 'paused'); setSelectedCampaign(null); }} className="px-3 py-1.5 bg-slate-600 text-white text-xs font-bold rounded-md hover:bg-slate-700">Tạm dừng</button>}
                  {selectedCampaign.status === 'paused' && <button onClick={() => { if (actions?.updateCampaignStatus) actions.updateCampaignStatus(selectedCampaign.id, 'published'); setSelectedCampaign(null); }} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700">Tiếp tục chạy</button>}
                </div>
              )}
              <button onClick={() => setSelectedCampaign(null)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-sm">Đóng</button>
            </div>
          </div>
        </div>
      )}

      <SelectApproverModal 
        isOpen={showApproverModal} 
        onClose={() => setShowApproverModal(false)}
        onSubmit={async (approverId) => {
          if (actions?.submitForApproval) {
            await actions.submitForApproval(selectedCampaign.id, 'CAMPAIGN', approverId, selectedCampaign.title);
            setShowApproverModal(false);
            setSelectedCampaign(null);
          }
        }} 
      />
    </div>
  );
}

function SelectApproverModal({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (approverId: string) => void }) {
  const [approverId, setApproverId] = useState('BGH_Reviewer'); // Mock default

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-900">Gửi Phê Duyệt</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">Vui lòng chọn người có thẩm quyền để duyệt nội dung này.</p>
          <label className="text-xs font-bold text-slate-600 mb-1 block">Người duyệt</label>
          <select 
            className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500"
            value={approverId}
            onChange={(e) => setApproverId(e.target.value)}
          >
            <option value="BGH_Reviewer">Ban Giám Hiệu (BGH_Reviewer)</option>
            <option value="TruongPhong_PR">Trưởng phòng Truyền thông (TruongPhong_PR)</option>
            <option value="Leader_HocVu">Trưởng phòng Học vụ (Leader_HocVu)</option>
          </select>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-bold text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Hủy</button>
          <button onClick={() => onSubmit(approverId)} className="px-4 py-2 text-white font-bold text-sm bg-indigo-600 rounded-lg hover:bg-indigo-700">Gửi yêu cầu</button>
        </div>
      </div>
    </div>
  );
}

function ApprovalHistoryTimeline({ history }: { history: any[] }) {
  if (!history || history.length === 0) return null;
  return (
    <div className="space-y-4">
      <h4 className="font-bold text-slate-900 flex items-center gap-2">
        <Clock className="w-4 h-4 text-indigo-500" /> Lịch sử Phê duyệt
      </h4>
      <div className="border-l-2 border-slate-100 ml-2 pl-4 space-y-4 relative">
        {history.map((evt, idx) => (
          <div key={idx} className="relative">
            <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${evt.action === 'SUBMIT' ? 'bg-amber-400' : evt.action === 'APPROVE' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <div className="text-sm font-bold text-slate-800">
              {evt.actorName} <span className="text-slate-500 font-normal">đã {evt.action === 'SUBMIT' ? 'gửi yêu cầu duyệt' : evt.action === 'APPROVE' ? 'phê duyệt' : evt.action === 'REJECT' ? 'từ chối' : 'yêu cầu chỉnh sửa'}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{new Date(evt.createdAt).toLocaleString('vi-VN')}</div>
            {evt.comment && <div className="mt-1 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">{evt.comment}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function EventsView({ events, actions }: any) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showApproverModal, setShowApproverModal] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState<any[]>([]);

  const handleSelectEvent = async (e: any) => {
    setSelectedEvent(e);
    if (actions?.getApprovalHistory) {
      const res = await actions.getApprovalHistory(e.id);
      if (res && res.data) {
        setApprovalHistory(res.data);
      } else {
        setApprovalHistory([]);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700';
      case 'pending_approval': return 'bg-amber-100 text-amber-700';
      case 'approved': return 'bg-sky-100 text-sky-700';
      case 'preparing': return 'bg-indigo-100 text-indigo-700';
      case 'in_progress': return 'bg-emerald-100 text-emerald-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Nháp';
      case 'pending_approval': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'preparing': return 'Đang chuẩn bị';
      case 'in_progress': return 'Đang diễn ra';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status || 'Nháp';
    }
  };

  const upcomingEvents = events.filter((e: any) => new Date(e.date) >= new Date()).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Tổng Sự kiện" value={events.length} icon={CalendarDays} color="indigo" />
        <StatCard title="Chờ duyệt" value={events.filter((e: any) => e.status === 'pending_approval').length} icon={Clock} color="amber" />
        <StatCard title="Sắp diễn ra" value={upcomingEvents.length} icon={Activity} color="blue" />
        <StatCard title="Hoàn thành" value={events.filter((e: any) => e.status === 'completed').length} icon={CheckCircle2} color="emerald" />
      </div>

      <div className="flex justify-end gap-2">
        <div className="bg-white rounded-lg p-1 border border-slate-200 flex">
          <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 text-sm font-bold rounded-md ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Danh sách</button>
          <button onClick={() => setViewMode('calendar')} className={`px-4 py-1.5 text-sm font-bold rounded-md ${viewMode === 'calendar' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Lịch</button>
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Tên sự kiện</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Địa điểm</th>
                <th className="px-4 py-3">Phụ trách</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => handleSelectEvent(t)}>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{t.title}</div>
                    <div className="text-[11px] text-slate-500">{t.type || 'Sự kiện'}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {new Date(t.date).toLocaleDateString('vi-VN')} {t.startAt ? ` - ${new Date(t.startAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}` : ''}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t.location || t.payload?.location || 'Chưa xác định'}</td>
                  <td className="px-4 py-3 text-slate-600">{t.department}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(t.status)}`}>
                      {getStatusText(t.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1 hover:bg-slate-100 rounded-md text-slate-400" onClick={(e) => { e.stopPropagation(); handleSelectEvent(t); }}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[400px]">
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
              <div key={d} className="bg-slate-50 py-2 text-center text-xs font-bold text-slate-500">{d}</div>
            ))}
            {/* Giả lập lịch 30 ngày */}
            {Array.from({ length: 30 }).map((_, i) => {
              const currentDate = new Date();
              currentDate.setDate(1 + i); // Mock
              const dayEvents = events.filter((e: any) => new Date(e.date).getDate() === currentDate.getDate() && new Date(e.date).getMonth() === currentDate.getMonth());
              
              return (
                <div key={i} className="bg-white min-h-[100px] p-2 hover:bg-slate-50 transition-colors">
                  <div className="text-xs font-bold text-slate-400 mb-1">{i + 1}</div>
                  <div className="space-y-1">
                    {dayEvents.map((e: any) => (
                      <div key={e.id} onClick={() => handleSelectEvent(e)} className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer truncate ${getStatusColor(e.status)}`}>
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-900">Chi tiết sự kiện</h3>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(selectedEvent.status)}`}>
                    {getStatusText(selectedEvent.status)}
                  </span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{selectedEvent.type || 'Sự kiện'}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">{selectedEvent.title}</h2>
                <p className="text-slate-600 text-sm mt-2">{selectedEvent.payload?.objective || selectedEvent.payload?.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{new Date(selectedEvent.date).toLocaleDateString('vi-VN')} {selectedEvent.startAt ? ` - ${new Date(selectedEvent.startAt).toLocaleTimeString('vi-VN')}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{selectedEvent.location || selectedEvent.payload?.location || 'Chưa xác định'}</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">Phụ trách: <strong>{selectedEvent.department}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">Ngân sách: <strong>{selectedEvent.budget ? selectedEvent.budget.toLocaleString() + ' VNĐ' : 'Không có'}</strong></span>
                  </div>
                </div>
              </div>

              <ApprovalHistoryTimeline history={approvalHistory} />

              {selectedEvent.payload?.checklist && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-indigo-500" /> Checklist chuẩn bị
                  </h4>
                  <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-white">
                    {selectedEvent.payload.checklist.map((item: any, idx: number) => (
                      <label key={idx} className="flex items-start gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors group">
                        <input type="checkbox" defaultChecked={item.done} className="mt-0.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" 
                          onChange={(e) => {
                            const newChecklist = [...selectedEvent.payload.checklist];
                            newChecklist[idx].done = e.target.checked;
                            if (actions?.updateEventChecklist) actions.updateEventChecklist(selectedEvent.id, newChecklist);
                          }}
                        />
                        <div>
                          <p className={`text-sm font-medium ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.title}</p>
                          {item.assigneeId && <p className="text-xs text-slate-500 mt-0.5">Phụ trách: {item.assigneeId}</p>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent.status === 'completed' && !selectedEvent.payload?.postEventReport && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-bold text-blue-900 mb-2">Báo cáo sau sự kiện</h4>
                  <p className="text-sm text-blue-700 mb-4">Sự kiện đã hoàn thành. Vui lòng cập nhật báo cáo tổng kết.</p>
                  <button onClick={() => {
                    const report = prompt("Nhập nội dung báo cáo ngắn gọn:");
                    if (report && actions?.submitPostEventReport) {
                      actions.submitPostEventReport(selectedEvent.id, { summary: report, date: new Date().toISOString() });
                      alert("Đã lưu báo cáo!");
                    }
                  }} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">Viết báo cáo</button>
                </div>
              )}

              {selectedEvent.payload?.postEventReport && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-emerald-500" /> Báo cáo tổng kết
                  </h4>
                  <p className="text-sm text-slate-700">{selectedEvent.payload.postEventReport.summary}</p>
                  <p className="text-[10px] text-slate-400 mt-2">Cập nhật lúc: {new Date(selectedEvent.payload.postEventReport.date).toLocaleString('vi-VN')}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              {selectedEvent.status === 'pending_approval' ? (
                <div className="flex gap-2">
                  <button onClick={async () => {
                    const comment = prompt("Nhập nhận xét (tùy chọn):", "Đồng ý triển khai");
                    if (actions?.processApproval) {
                      await actions.processApproval(approvalHistory.length > 0 ? approvalHistory[0].approvalRequestId : '', 'APPROVE', comment || 'Đã duyệt');
                      setSelectedEvent(null);
                    }
                  }} className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700">Duyệt Kế Hoạch</button>
                  <button onClick={async () => {
                    const comment = prompt("Nhập lý do từ chối/yêu cầu sửa:", "");
                    if (comment && actions?.processApproval) {
                      await actions.processApproval(approvalHistory.length > 0 ? approvalHistory[0].approvalRequestId : '', 'REQUEST_REVISION', comment);
                      setSelectedEvent(null);
                    }
                  }} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50">Yêu cầu sửa</button>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {selectedEvent.status === 'draft' && <button onClick={() => setShowApproverModal(true)} className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-md hover:bg-amber-700">Gửi duyệt</button>}
                  {selectedEvent.status === 'approved' && <button onClick={() => { if (actions?.updateEventStatus) actions.updateEventStatus(selectedEvent.id, 'preparing'); setSelectedEvent(null); }} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700">Bắt đầu chuẩn bị</button>}
                  {selectedEvent.status === 'preparing' && <button onClick={() => { if (actions?.updateEventStatus) actions.updateEventStatus(selectedEvent.id, 'in_progress'); setSelectedEvent(null); }} className="px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-md hover:bg-sky-700">Bắt đầu sự kiện</button>}
                  {selectedEvent.status === 'in_progress' && <button onClick={() => { if (actions?.updateEventStatus) actions.updateEventStatus(selectedEvent.id, 'completed'); setSelectedEvent(null); }} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-md hover:bg-green-700">Đánh dấu hoàn thành</button>}
                  
                  {selectedEvent.status !== 'completed' && selectedEvent.status !== 'cancelled' && (
                    <button onClick={() => { if (actions?.updateEventStatus) actions.updateEventStatus(selectedEvent.id, 'cancelled'); setSelectedEvent(null); }} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-md hover:bg-red-50">Hủy sự kiện</button>
                  )}
                </div>
              )}
              <button onClick={() => setSelectedEvent(null)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-sm">Đóng</button>
            </div>
          </div>
        </div>
      )}

      <SelectApproverModal 
        isOpen={showApproverModal} 
        onClose={() => setShowApproverModal(false)}
        onSubmit={async (approverId) => {
          if (actions?.submitForApproval) {
            await actions.submitForApproval(selectedEvent.id, 'EVENT', approverId, selectedEvent.title);
            setShowApproverModal(false);
            setSelectedEvent(null);
          }
        }} 
      />
    </div>
  );
}

function CrisisView() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <AlertTriangle className="w-12 h-12 text-slate-300 mb-3" />
      <h3 className="text-lg font-bold text-slate-900">Nhật ký Khủng hoảng</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">Ghi nhận các sự cố nghiêm trọng, kích hoạt quy trình xử lý khủng hoảng truyền thông.</p>
    </div>
  );
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorMap[color as keyof typeof colorMap]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-2xl font-black text-slate-900">{value}</div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-0.5">{title}</div>
      </div>
    </div>
  );
}
