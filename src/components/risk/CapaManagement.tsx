import React, { useState } from 'react';
import { Capa } from './RiskMockData';
import { CheckCircle2, XCircle, Search, Clock, ShieldAlert, ArrowRight } from 'lucide-react';

export default function CapaManagement({ capas }: { capas: Capa[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCapas = capas.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.problemDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: Capa['status']) => {
    switch (status) {
      case 'NEW': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ANALYZING': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'OVERDUE': return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'WAITING_VERIFICATION': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'EFFECTIVE': return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'INEFFECTIVE': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm mã CAPA, mô tả..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-black uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Mã CAPA</th>
                <th className="px-4 py-3">Nguồn / Vấn đề</th>
                <th className="px-4 py-3">Hành động khắc phục (CA)</th>
                <th className="px-4 py-3">Phụ trách</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Xác minh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCapas.map(capa => {
                const isOverdue = new Date(capa.deadline) < new Date() && !['CLOSED', 'EFFECTIVE'].includes(capa.status);
                
                return (
                  <tr key={capa.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono font-black text-slate-700 dark:text-slate-300">{capa.code}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Ref: {capa.ncId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white max-w-[200px] truncate">{capa.problemDescription}</div>
                      <div className="text-[10px] text-slate-500">Từ: {capa.source}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">{capa.correctiveAction}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">{capa.owner}</div>
                      <div className="text-[10px] text-slate-400">{capa.department}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                        {isOverdue && <Clock className="w-3 h-3" />}
                        {capa.deadline}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded border text-[10px] font-bold tracking-wide ${getStatusStyle(isOverdue && capa.status !== 'OVERDUE' ? 'OVERDUE' : capa.status)}`}>
                        {isOverdue && capa.status !== 'OVERDUE' ? 'OVERDUE' : capa.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {capa.status === 'WAITING_VERIFICATION' ? (
                        <button className="flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Duyệt
                        </button>
                      ) : capa.status === 'EFFECTIVE' ? (
                        <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đạt hiệu quả
                        </div>
                      ) : capa.status === 'INEFFECTIVE' ? (
                        <div className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Ko hiệu quả
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
