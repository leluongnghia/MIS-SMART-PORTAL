'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Kanban, User, CalendarCheck,
  FolderOpen, CreditCard, BarChart3, Megaphone, Settings,
  ChevronLeft, GraduationCap, Plus
} from 'lucide-react';

// Import modules
import AdmissionsDashboard from './admissions/AdmissionsDashboard';
import AdmissionsLeadsTable, { Lead, LEADS_MAU, ModalThemLead, FormThem } from './admissions/AdmissionsLeadsTable';
import { renderModal } from './admissions/portalHelper';
import AdmissionsPipelineKanban from './admissions/AdmissionsPipelineKanban';
import AdmissionsLeadDetail from './admissions/AdmissionsLeadDetail';
import AdmissionsAppointments from './admissions/AdmissionsAppointments';
import AdmissionsDocuments from './admissions/AdmissionsDocuments';
import AdmissionsPayments from './admissions/AdmissionsPayments';
import AdmissionsReports from './admissions/AdmissionsReports';
import AdmissionsCampaigns from './admissions/AdmissionsCampaigns';
import AdmissionsSettings, { type ChuongTrinhHoc } from './admissions/AdmissionsSettings';

const INITIAL_CHUONG_TRINH: ChuongTrinhHoc[] = [
  { id: 'ct1', ten: 'Tiểu học - Chương trình Quốc gia', cap: 'Tiểu học', hoatDong: true, moTa: 'Chương trình chuẩn của Bộ Giáo dục & Đào tạo Việt Nam kết hợp các môn bổ trợ phát triển thể chất và kỹ năng.' },
  { id: 'ct2', ten: 'THCS - Song ngữ Quốc tế', cap: 'THCS', hoatDong: true, moTa: 'Chương trình tích hợp giữa khung chuẩn Việt Nam và hệ Cambridge, giảng dạy bằng cả tiếng Anh và tiếng Việt.' },
  { id: 'ct3', ten: 'THPT - IB', cap: 'THPT', hoatDong: true, moTa: 'Chương trình Tú tài Quốc tế (International Baccalaureate) định hướng du học và săn học bổng.' },
  { id: 'ct4', ten: 'THPT - A-Level', cap: 'THPT', hoatDong: true, moTa: 'Chương trình học của Cambridge International Examinations dành cho học sinh chuẩn bị vào Đại học quốc tế.' },
  { id: 'ct5', ten: 'Mầm non', cap: 'Mầm non', hoatDong: true, moTa: 'Chương trình giáo dục mầm non chất lượng cao, tiếp cận phương pháp Montessori và Reggio Emilia.' }
];

export type AdmissionsModule =
  | 'dashboard'
  | 'leads'
  | 'pipeline'
  | 'lead_detail'
  | 'appointments'
  | 'documents'
  | 'payments'
  | 'reports'
  | 'campaigns'
  | 'settings'
  // Legacy modules kept for backward compat
  | 'applications'
  | 'interviews'
  | 'enrollment'
  | 'classes'
  | 'scholarships'
  | 'email'
  | 'tasks';

interface NavItem {
  id: AdmissionsModule;
  label: string;
  desc: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: '📊 Tổng quan',        desc: 'KPI, phễu tuyển sinh, doanh thu', icon: LayoutDashboard },
  { id: 'leads',        label: '👤 Leads & Thí sinh',  desc: 'Danh sách, lọc, phân công TVV', icon: Users },
  { id: 'pipeline',     label: '📋 Pipeline',          desc: 'Quản lý quy trình 9 bước', icon: Kanban },
  { id: 'appointments', label: '📅 Lịch hẹn & Test',   desc: 'Đặt lịch, theo dõi kết quả', icon: CalendarCheck },
  { id: 'documents',    label: '📁 Hồ sơ',             desc: 'Checklist, upload tài liệu', icon: FolderOpen },
  { id: 'payments',     label: '💳 Thanh toán',        desc: 'VietQR, đối soát, phiếu thu', icon: CreditCard },
  { id: 'reports',      label: '📈 Báo cáo',           desc: 'Funnel, doanh thu, hiệu suất TVV', icon: BarChart3 },
  { id: 'campaigns',    label: '📣 Chiến dịch',        desc: 'Email, Zalo OA, Marketing', icon: Megaphone },
  { id: 'settings',     label: '⚙️ Cài đặt',           desc: 'Giai đoạn, quy tắc, phân quyền', icon: Settings },
];

// Map legacy module IDs to new modules
const LEGACY_MAP: Partial<Record<AdmissionsModule, AdmissionsModule>> = {
  applications: 'documents',
  interviews: 'appointments',
  enrollment: 'pipeline',
  classes: 'leads',
  scholarships: 'leads',
  email: 'campaigns',
  tasks: 'dashboard',
};

function PlaceholderModule({ module }: { module: AdmissionsModule }) {
  const navItem = NAV_ITEMS.find(n => n.id === module);
  const Icon = navItem?.icon || GraduationCap;
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
        <Icon className="h-8 w-8 text-blue-500" />
      </div>
      <div className="text-center">
        <p className="text-lg font-black text-slate-700">{navItem?.label || module}</p>
        <p className="mt-1 text-sm font-semibold text-slate-400">{navItem?.desc}</p>
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2 text-xs font-bold text-amber-600">
          🚧 Module đang được phát triển — sẽ ra mắt sớm
        </p>
      </div>
    </div>
  );
}

export default function AdmissionsEnterpriseDashboard({
  activeModule: propModule = 'dashboard',
}: {
  activeModule?: AdmissionsModule;
}) {
  // Resolve legacy module IDs
  const resolvedModule = LEGACY_MAP[propModule] ?? propModule;
  const [internalModule, setInternalModule] = useState<AdmissionsModule>(resolvedModule);
  const [leads, setLeads] = useState<Lead[]>(LEADS_MAU);
  const [hienModal, setHienModal] = useState(false);
  const [chuongTrinhList, setChuongTrinhList] = useState<ChuongTrinhHoc[]>(INITIAL_CHUONG_TRINH);

  // Sync with prop changes
  React.useEffect(() => {
    const resolved = LEGACY_MAP[propModule] ?? propModule;
    setInternalModule(resolved);
  }, [propModule]);

  const handleLuuLead = (data: FormThem) => {
    const leadMoi: Lead = {
      id: `l${Date.now()}`,
      hoTen: data.hoTenHocSinh,
      sdt: data.sdtPhuHuynh,
      email: data.emailPhuHuynh || '—',
      nguonLead: data.nguonLead,
      khoi: data.khoi,
      tvv: data.tvv,
      tvvAvatar: data.tvv.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      trangThai: 'Mới',
      diemLead: 50,
      ngayTao: new Date().toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
    };
    setLeads(prev => [leadMoi, ...prev]);
  };

  const renderModule = () => {
    switch (internalModule) {
      case 'dashboard':    return <AdmissionsDashboard />;
      case 'leads':        return <AdmissionsLeadsTable leads={leads} setLeads={setLeads} chuongTrinhList={chuongTrinhList.filter(c => c.hoatDong).map(c => c.ten)} />;
      case 'pipeline':     return <AdmissionsPipelineKanban />;
      case 'lead_detail':  return <AdmissionsLeadDetail />;
      case 'appointments': return <AdmissionsAppointments />;
      case 'documents':    return <AdmissionsDocuments />;
      case 'payments':     return <AdmissionsPayments />;
      case 'reports':      return <AdmissionsReports />;
      case 'campaigns':    return <AdmissionsCampaigns />;
      case 'settings':     return <AdmissionsSettings chuongTrinhList={chuongTrinhList} setChuongTrinhList={setChuongTrinhList} />;
      default:             return <PlaceholderModule module={internalModule} />;
    }
  };

  // Internal sub-navigation for admissions modules
  const activeNav = NAV_ITEMS.find(n => n.id === internalModule);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Sub-navigation bar */}
      <div className="border-b border-slate-100 bg-white shadow-xs">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-0 overflow-x-auto">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = item.id === internalModule;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setInternalModule(item.id)}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition ${
                    isActive
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setHienModal(true)}
            className="my-2 flex h-8 shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm lead mới
          </button>
        </div>
      </div>

      {/* Module content */}
      <div className="p-5">
        {renderModule()}
      </div>

      {/* Modal Thêm Lead */}
      {hienModal && renderModal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setHienModal(false)}
          />
          {/* Panel trượt từ bên phải */}
          <div className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl">
            <ModalThemLead
              onDong={() => setHienModal(false)}
              onLuu={handleLuuLead}
              chuongTrinhList={chuongTrinhList.filter(c => c.hoatDong).map(c => c.ten)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
