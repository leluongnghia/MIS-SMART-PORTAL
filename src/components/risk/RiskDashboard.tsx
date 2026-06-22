import React, { useMemo } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { MOCK_RISKS, MOCK_NCS, MOCK_CAPAS, MOCK_AUDIT_PLANS } from './RiskMockData';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';

export default function RiskDashboard() {
  const stats = useMemo(() => {
    const openRisks = MOCK_RISKS.filter(r => ['NEW', 'WATCHING', 'MITIGATING'].includes(r.status));
    const criticalRisks = openRisks.filter(r => r.level === 'CRITICAL').length;
    const highRisks = openRisks.filter(r => r.level === 'HIGH').length;

    const openNCs = MOCK_NCS.filter(r => !['CLOSED'].includes(r.status));
    const overdueNCs = openNCs.filter(r => new Date(r.responseDeadline) < new Date());

    const openCapas = MOCK_CAPAS.filter(r => !['CLOSED', 'EFFECTIVE'].includes(r.status));
    const overdueCapas = openCapas.filter(r => r.status === 'OVERDUE' || new Date(r.deadline) < new Date());

    return {
      risks: { total: openRisks.length, critical: criticalRisks, high: highRisks },
      ncs: { total: openNCs.length, overdue: overdueNCs.length },
      capas: { total: openCapas.length, overdue: overdueCapas.length },
    };
  }, []);

  const trendData = [
    { name: 'T1', 'Mức rủi ro': 35 },
    { name: 'T2', 'Mức rủi ro': 45 },
    { name: 'T3', 'Mức rủi ro': 60 },
    { name: 'T4', 'Mức rủi ro': 55 },
    { name: 'T5', 'Mức rủi ro': 68 },
    { name: 'T6', 'Mức rủi ro': stats.risks.critical * 20 + stats.risks.high * 12 + 20 },
  ];

  const ncByDeptData = [
    { name: 'Nhân sự', count: 2 },
    { name: 'Tuyển sinh', count: 4 },
    { name: 'Hành chính', count: 3 },
    { name: 'CSVC', count: 1 },
    { name: 'IT', count: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rủi ro đang mở</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.risks.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex gap-3 text-xs">
            <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">{stats.risks.critical} Critical</span>
            <span className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded">{stats.risks.high} High</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Điểm không phù hợp (NC)</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.ncs.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex gap-2 text-xs">
            {stats.ncs.overdue > 0 ? (
              <span className="text-rose-600 font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {stats.ncs.overdue} quá hạn</span>
            ) : (
              <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Đúng tiến độ</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">CAPA đang mở</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.capas.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex gap-2 text-xs">
             {stats.capas.overdue > 0 ? (
              <span className="text-rose-600 font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {stats.capas.overdue} quá hạn</span>
            ) : (
              <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Đúng tiến độ</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Đánh giá nội bộ</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{MOCK_AUDIT_PLANS.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs font-bold text-slate-500">
            Năm học 2025-2026
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
          <h4 className="font-black text-xs uppercase tracking-wide text-slate-500 mb-4 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-rose-500" /> Xu hướng mức độ rủi ro</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="name" fontSize={10} tickMargin={10} />
                <YAxis fontSize={10} />
                <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="Mức rủi ro" stroke="#f43f5e" strokeWidth={2.5} fill="url(#riskGrad)" dot={{ r: 4, fill: '#f43f5e' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
          <h4 className="font-black text-xs uppercase tracking-wide text-slate-500 mb-4 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-500" /> NC theo phòng ban</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ncByDeptData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
                <XAxis type="number" fontSize={10} />
                <YAxis dataKey="name" type="category" fontSize={10} width={70} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {ncByDeptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#f59e0b', '#3b82f6', '#10b981', '#f43f5e', '#6366f1'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
