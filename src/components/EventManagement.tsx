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
  ClipboardList
} from 'lucide-react';
import { ParentSupportTicket, CommunicationContent, Survey, SchoolEvent, CrisisIncident } from '../types';

import CreateTicketForm from './CreateTicketForm';
import CreateCommunicationForm from './CreateCommunicationForm';
import CreateEventForm from './CreateEventForm';
import CreateSurveyForm from './CreateSurveyForm';
import CreateCrisisForm from './CreateCrisisForm';

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function EventManagement() {
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'surveys'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'EVENTS' | 'SURVEYS'>('EVENTS');

  const openForm = (type: 'TICKETS' | 'COMMUNICATIONS' | 'EVENTS' | 'CRISIS' | 'SURVEYS') => {
    setFormType(type);
    setIsFormOpen(true);
  };

  const getCreateButtonConfig = () => {
    switch(activeTab) {
      case 'events': return { label: 'Tạo Sự kiện', action: () => openForm('EVENTS'), icon: Plus, color: 'bg-rose-600 hover:bg-rose-700' };
      case 'surveys': return { label: 'Tạo Khảo sát', action: () => openForm('SURVEYS'), icon: Plus, color: 'bg-amber-600 hover:bg-amber-700' };
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
          { id: 'surveys', label: 'Khảo sát', icon: ClipboardList }
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
        {activeTab === 'communications' && <CommunicationsView />}
        {activeTab === 'events' && <EventsView />}
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
              <CreateCommunicationForm 
                onClose={() => setIsFormOpen(false)}
                onSubmit={(data) => {
                  console.log('Communication Submitted:', data);
                  setIsFormOpen(false);
                  alert(`Tạo nội dung truyền thông thành công: ${data.title} (Trạng thái: ${data.status})`);
                }}
              />
            )}
            {formType === 'EVENTS' && (
              <CreateEventForm 
                onClose={() => setIsFormOpen(false)}
                onSubmit={(data) => {
                  console.log('Event Submitted:', data);
                  setIsFormOpen(false);
                  alert(`Tạo sự kiện thành công: ${data.eventName} (Trạng thái: ${data.status})`);
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

function CommunicationsView() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <Megaphone className="w-12 h-12 text-slate-300 mb-3" />
      <h3 className="text-lg font-bold text-slate-900">Chiến dịch Truyền thông</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">Quản lý nội dung, phê duyệt và gửi tin nhắn (Email, SMS, App Push) tới toàn trường.</p>
    </div>
  );
}

function EventsView() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <CalendarDays className="w-12 h-12 text-slate-300 mb-3" />
      <h3 className="text-lg font-bold text-slate-900">Sự kiện & Timeline</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">Lên kế hoạch sự kiện, theo dõi checklist và quản lý ngân sách tổ chức sự kiện.</p>
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
