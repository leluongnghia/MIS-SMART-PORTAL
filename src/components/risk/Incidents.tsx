import React from 'react';
import { Incident } from './RiskMockData';
import { AlertOctagon, MessageSquare, ArrowRight, User } from 'lucide-react';

export default function Incidents({ incidents }: { incidents: Incident[] }) {
  const getImpactBadge = (impact: Incident['impact']) => {
    switch (impact) {
      case 'CRITICAL': return 'bg-rose-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-amber-400 text-white';
      case 'LOW': return 'bg-emerald-400 text-white';
      default: return 'bg-slate-300 text-white';
    }
  };

  const getStatusBadge = (status: Incident['status']) => {
    switch (status) {
      case 'OPEN': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'INVESTIGATING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'RESOLVED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Phản ánh & Sự cố</h3>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-black uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Nguồn / Người báo</th>
              <th className="px-4 py-3">Nội dung sự việc</th>
              <th className="px-4 py-3 text-center">Tác động</th>
              <th className="px-4 py-3">Phụ trách xử lý</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {incidents.map(inc => (
              <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 font-mono font-black text-slate-500">{inc.code}</td>
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-0.5">
                    {inc.source === 'Facebook' ? <MessageSquare className="w-3 h-3 text-blue-500" /> : <User className="w-3 h-3 text-slate-400" />}
                    {inc.source}
                  </div>
                  <div className="text-[11px] text-slate-500">{inc.reporter}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-white">{inc.content}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Liên quan: {inc.department}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider ${getImpactBadge(inc.impact)}`}>{inc.impact}</span>
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{inc.owner}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded border text-[10px] font-bold ${getStatusBadge(inc.status)}`}>{inc.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {inc.status !== 'CLOSED' && (
                    <button className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1.5 rounded-lg transition-colors">
                      <AlertOctagon className="w-3 h-3" /> Thành NC/CAPA <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
