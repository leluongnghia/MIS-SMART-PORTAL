'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Kanban, User, CalendarCheck,
  FolderOpen, CreditCard, BarChart3, Megaphone, Settings,
  ChevronLeft, GraduationCap
} from 'lucide-react';

// Import modules
import AdmissionsDashboard from './admissions/AdmissionsDashboard';
import AdmissionsLeadsTable from './admissions/AdmissionsLeadsTable';
import AdmissionsPipelineKanban from './admissions/AdmissionsPipelineKanban';
import AdmissionsLeadDetail from './admissions/AdmissionsLeadDetail';
import AdmissionsAppointments from './admissions/AdmissionsAppointments';

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

  // Sync with prop changes
  React.useEffect(() => {
    const resolved = LEGACY_MAP[propModule] ?? propModule;
    setInternalModule(resolved);
  }, [propModule]);

  const renderModule = () => {
    switch (internalModule) {
      case 'dashboard':    return <AdmissionsDashboard />;
      case 'leads':        return <AdmissionsLeadsTable />;
      case 'pipeline':     return <AdmissionsPipelineKanban />;
      case 'lead_detail':  return <AdmissionsLeadDetail />;
      case 'appointments': return <AdmissionsAppointments />;
      default:             return <PlaceholderModule module={internalModule} />;
    }
  };

  // Internal sub-navigation for admissions modules
  const activeNav = NAV_ITEMS.find(n => n.id === internalModule);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Sub-navigation bar */}
      <div className="border-b border-slate-100 bg-white shadow-xs">
        <div className="flex items-center gap-0 overflow-x-auto px-4">
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
      </div>

      {/* Module content */}
      <div className="p-5">
        {renderModule()}
      </div>
    </div>
  );
}
