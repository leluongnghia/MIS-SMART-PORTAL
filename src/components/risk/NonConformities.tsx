import React, { useState } from 'react';
import { NonConformity } from './RiskMockData';
import { AlertTriangle, Plus, Search, FileText, ArrowRight } from 'lucide-react';

export default function NonConformities({ ncs }: { ncs: NonConformity[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNcs = ncs.filter(nc => 
    nc.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    nc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityStyle = (severity: NonConformity['severity']) => {
    switch (severity) {
      case 'MINOR': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MAJOR': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRITICAL': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusBadge = (status: NonConformity['status']) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700';
      case 'ROOT_CAUSE_ANALYSIS': return 'bg-purple-100 text-purple-700';
      case 'WAITING_CAPA': return 'bg-orange-100 text-orange-700';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700';
      case 'WAITING_VERIFICATION': return 'bg-indigo-100 text-indigo-700';
      case 'CLOSED': return 'bg-emerald-100 text-emerald-700';
      case 'RECURRING': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm mã NC, mô tả..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
          />
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors">
          <Plus className="w-4 h-4" /> Ghi nhận NC
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredNcs.map(nc => (
          <div key={nc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <span className="font-mono text-xs font-black text-slate-700 dark:text-slate-300">{nc.code}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${getSeverityStyle(nc.severity)}`}>{nc.severity}</span>
            </div>
            
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-snug">{nc.description}</p>
            
            <div className="text-[11px] text-slate-500 space-y-1.5 mb-4 flex-1">
              <div className="flex justify-between">
                <span>Nguồn: <strong className="text-slate-700 dark:text-slate-300">{nc.source}</strong></span>
                <span>BP: <strong className="text-slate-700 dark:text-slate-300">{nc.department}</strong></span>
              </div>
              <div className="truncate">Nguyên nhân sơ bộ: {nc.initialCause}</div>
              <div className="text-slate-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Hạn phản hồi: <strong className={new Date(nc.responseDeadline) < new Date() && nc.status !== 'CLOSED' ? 'text-rose-600' : ''}>{nc.responseDeadline}</strong>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-auto">
              <span className={`px-2 py-1 rounded text-[10px] font-bold ${getStatusBadge(nc.status)}`}>{nc.status.replace(/_/g, ' ')}</span>
              {['WAITING_CAPA', 'ROOT_CAUSE_ANALYSIS'].includes(nc.status) ? (
                <button className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-lg">
                  Lập CAPA <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <button className="text-[10px] font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Chi tiết
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
