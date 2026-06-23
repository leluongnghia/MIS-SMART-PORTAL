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
  Activity
} from 'lucide-react';
import { ParentSupportTicket, Survey, CommunicationCampaign, SchoolEvent, CrisisIncident } from '../types';

import CreateTicketForm from './CreateTicketForm';

type TabType = 'TICKETS' | 'SURVEYS' | 'COMMUNICATIONS' | 'EVENTS' | 'CRISIS';

export default function EventManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('TICKETS');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const tabs = [
    { id: 'TICKETS', label: 'CSKH & Phản ánh', icon: MessageSquare },
    { id: 'SURVEYS', label: 'Khảo sát', icon: FileText },
    { id: 'COMMUNICATIONS', label: 'Truyền thông', icon: Megaphone },
    { id: 'EVENTS', label: 'Sự kiện', icon: CalendarDays },
    { id: 'CRISIS', label: 'Khủng hoảng', icon: AlertTriangle },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">CSKH, Truyền thông & Sự kiện</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Trung tâm quản lý quan hệ phụ huynh và truyền thông trường học</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-indigo-500 transition-all font-medium placeholder:font-normal"
            />
          </div>
          <button className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo mới</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-3 border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-[73px] z-10">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 ring-inset'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'TICKETS' && <TicketsView />}
        {activeTab === 'SURVEYS' && <SurveysView />}
        {activeTab === 'COMMUNICATIONS' && <CommunicationsView />}
        {activeTab === 'EVENTS' && <EventsView />}
        {activeTab === 'CRISIS' && <CrisisView />}
      </div>

      {/* Drawer Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm transition-opacity">
          <div 
            className="w-full max-w-4xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <CreateTicketForm 
              onClose={() => setIsFormOpen(false)}
              onSubmit={(data) => {
                console.log('Ticket Submitted:', data);
                setIsFormOpen(false);
                alert(`Tạo ticket thành công với mã: ${data.ticketCode} (Trạng thái: ${data.status})`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB VIEWS (MVP) ────────────────────────────────────────────────────────

function TicketsView() {
  const mockTickets: ParentSupportTicket[] = [
    { 
      id: 'TKT-001', ticketCode: 'CSKH-2026-0001', receivedAt: '2026-06-20', channel: 'Cổng phụ huynh', receivedBy: 'user_1',
      title: 'Phản ánh chất lượng bữa ăn trưa', description: '', parentName: 'Nguyễn Văn A', parentPhone: '0901234567', relationship: 'Bố', 
      studentName: 'Nguyễn Văn B (10A1)', status: 'OPEN', priority: 'high', category: 'OTHER', createdAt: '2026-06-20', updatedAt: '2026-06-20',
      slaDueAt: '2026-06-22', isSensitive: false, riskFlag: false, visibleToParent: true, departmentOwner: 'Dịch vụ học đường', createdBy: 'parent', timeline: []
    },
    { 
      id: 'TKT-002', ticketCode: 'CSKH-2026-0002', receivedAt: '2026-06-18', channel: 'Điện thoại', receivedBy: 'user_1',
      title: 'Thắc mắc về học phí kỳ 2', description: '', parentName: 'Lê Thị C', parentPhone: '0901234568', relationship: 'Mẹ', 
      studentName: 'Lê D (11B2)', status: 'RESOLVED', priority: 'medium', category: 'FINANCE', createdAt: '2026-06-18', updatedAt: '2026-06-20',
      slaDueAt: '2026-06-20', isSensitive: false, riskFlag: false, visibleToParent: true, departmentOwner: 'Kế toán', createdBy: 'user_1', timeline: []
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
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${t.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
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
