'use client';
import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, TrendingUp, CheckSquare, Search, FileText, XCircle, FileWarning } from 'lucide-react';
import { MOCK_RISKS, MOCK_AUDIT_PLANS, MOCK_NCS, MOCK_CAPAS, MOCK_REVIEWS, MOCK_INCIDENTS } from './risk/RiskMockData';

import RiskDashboard from './risk/RiskDashboard';
import RiskRegister from './risk/RiskRegister';
import AuditPlans from './risk/AuditPlans';
import NonConformities from './risk/NonConformities';
import CapaManagement from './risk/CapaManagement';
import ManagementReview from './risk/ManagementReview';
import Incidents from './risk/Incidents';

type Tab = 'DASHBOARD' | 'REGISTER' | 'AUDIT' | 'NC' | 'CAPA' | 'REVIEW' | 'INCIDENT';

export default function RiskManagementCenter() {
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  
  // Local states for interactivity
  const [risks, setRisks] = useState(MOCK_RISKS);
  const [plans, setPlans] = useState(MOCK_AUDIT_PLANS);
  const [ncs, setNcs] = useState(MOCK_NCS);
  const [capas, setCapas] = useState(MOCK_CAPAS);
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number; countColor?: string }[] = [
    { key: 'DASHBOARD', label: 'Tổng quan', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: 'REGISTER', label: 'Sổ rủi ro', icon: <ShieldAlert className="w-3.5 h-3.5" />, count: risks.filter(r => r.status !== 'CLOSED').length, countColor: 'bg-rose-100 text-rose-700' },
    { key: 'AUDIT', label: 'Đánh giá nội bộ', icon: <CheckSquare className="w-3.5 h-3.5" /> },
    { key: 'NC', label: 'Điểm không phù hợp', icon: <FileWarning className="w-3.5 h-3.5" />, count: ncs.filter(r => r.status !== 'CLOSED').length, countColor: 'bg-amber-100 text-amber-700' },
    { key: 'CAPA', label: 'Hành động KP/PN (CAPA)', icon: <XCircle className="w-3.5 h-3.5" />, count: capas.filter(r => r.status === 'OVERDUE').length, countColor: 'bg-rose-500 text-white animate-pulse' },
    { key: 'REVIEW', label: 'Xem xét lãnh đạo', icon: <Search className="w-3.5 h-3.5" /> },
    { key: 'INCIDENT', label: 'Sự cố & Phản ánh', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-rose-950 p-6 rounded-2xl text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2.5">
          <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border border-rose-500/20 flex items-center gap-1 w-fit">
            <ShieldAlert className="w-3.5 h-3.5" /> ISO 9001:2015 & ISO 21001:2018
          </span>
          <h2 className="text-xl md:text-2xl font-display font-black leading-tight">Hệ thống Kiểm soát Nội bộ & CAPA</h2>
          <p className="text-rose-200/80 text-sm max-w-2xl">
            Quản trị rủi ro vận hành trường học, theo dõi kết quả đánh giá chất lượng nội bộ, và quản lý các hành động khắc phục phòng ngừa (CAPA) một cách tập trung.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl w-fit max-w-full overflow-x-auto">
        {tabs.map(tab => (
          <button 
            key={tab.key} 
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.key 
                ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.icon} {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ml-1 ${tab.countColor}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'DASHBOARD' && <RiskDashboard />}
        {activeTab === 'REGISTER' && <RiskRegister risks={risks} onAddRisk={(newRisk) => setRisks(prev => [newRisk, ...prev])} />}
        {activeTab === 'AUDIT' && <AuditPlans plans={plans} onAddPlan={(newPlan) => setPlans(prev => [newPlan, ...prev])} onUpdatePlan={(id, updated) => setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))} onAddNC={(newNC) => setNcs(prev => [newNC, ...prev])} />}
        {activeTab === 'NC' && <NonConformities ncs={ncs} onAddNC={(newNC) => setNcs(prev => [newNC, ...prev])} onAddCapa={(newCapa) => setCapas(prev => [newCapa, ...prev])} onUpdateNCStatus={(id, status) => setNcs(prev => prev.map(nc => nc.id === id ? { ...nc, status } : nc))} />}
        {activeTab === 'CAPA' && <CapaManagement capas={capas} ncs={ncs} onAddCapa={(newCapa) => setCapas(prev => [newCapa, ...prev])} onUpdateCapaStatus={(id, status, extra) => setCapas(prev => prev.map(c => c.id === id ? { ...c, status, ...extra } : c))} />}
        {activeTab === 'REVIEW' && <ManagementReview reviews={reviews} onAddReview={(newReview) => setReviews(prev => [newReview, ...prev])} />}
        {activeTab === 'INCIDENT' && <Incidents incidents={incidents} onAddIncident={(newIncident) => setIncidents(prev => [newIncident, ...prev])} onConvertToNC={(newNC) => setNcs(prev => [newNC, ...prev])} onUpdateIncidentStatus={(id, status) => setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status } : inc))} />}
      </div>
    </div>
  );
}
