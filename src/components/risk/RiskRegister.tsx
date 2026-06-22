import React, { useState } from 'react';
import { RiskItem } from './RiskMockData';
import { Plus, Search, Filter, AlertTriangle, ShieldAlert } from 'lucide-react';

const PROB_LABELS = ['', 'Hiếm (1)', 'Ít khi (2)', 'Đôi khi (3)', 'Thường xuyên (4)', 'Chắc chắn (5)'];
const IMPACT_LABELS = ['', 'Không đáng kể (1)', 'Nhỏ (2)', 'Trung bình (3)', 'Nghiêm trọng (4)', 'Thảm họa (5)'];

const getLevelStyle = (level: RiskItem['level']) => {
  switch (level) {
    case 'LOW': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'CRITICAL': return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

const getStatusStyle = (status: RiskItem['status']) => {
  switch (status) {
    case 'NEW': return 'bg-blue-50 text-blue-700';
    case 'WATCHING': return 'bg-purple-50 text-purple-700';
    case 'MITIGATING': return 'bg-amber-50 text-amber-700';
    case 'CONTROLLED': return 'bg-emerald-50 text-emerald-700';
    case 'CLOSED': return 'bg-slate-50 text-slate-500';
    case 'RECURRING': return 'bg-rose-50 text-rose-700';
    default: return 'bg-slate-50 text-slate-700';
  }
};

export default function RiskRegister({ risks }: { risks: RiskItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<RiskItem['level'] | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'MATRIX'>('LIST');

  const filteredRisks = risks.filter(r => 
    (filterLevel === 'ALL' || r.level === filterLevel) &&
    (r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full md:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm mã, tên rủi ro..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
            />
          </div>
          <select 
            value={filterLevel} 
            onChange={e => setFilterLevel(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
          >
            <option value="ALL">Tất cả mức độ</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button onClick={() => setViewMode('LIST')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${viewMode === 'LIST' ? 'bg-white dark:bg-slate-900 shadow-sm text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}>Danh sách</button>
            <button onClick={() => setViewMode('MATRIX')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${viewMode === 'MATRIX' ? 'bg-white dark:bg-slate-900 shadow-sm text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}>Ma trận</button>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Ghi nhận
          </button>
        </div>
      </div>

      {viewMode === 'LIST' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Mã</th>
                  <th className="px-4 py-3">Nội dung Rủi ro</th>
                  <th className="px-4 py-3">Bộ phận</th>
                  <th className="px-4 py-3">Mức độ</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Kiểm soát hiện tại</th>
                  <th className="px-4 py-3 text-right">Phụ trách</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRisks.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500">{r.code}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white mb-0.5">{r.title}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{r.description}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.department}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded border text-[10px] font-black uppercase tracking-wider ${getLevelStyle(r.level)}`}>
                        {r.level} ({r.probability * r.impact})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${getStatusStyle(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{r.currentControl}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300 font-medium">{r.owner}</td>
                  </tr>
                ))}
                {filteredRisks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs">Không tìm thấy rủi ro nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'MATRIX' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm overflow-x-auto">
           <table className="border-collapse text-center text-[11px] font-bold mx-auto min-w-[600px]">
            <thead>
              <tr>
                <th className="w-32 p-2 text-left text-[10px] text-slate-400 font-black">Impact ↕ / Prob →</th>
                {[1,2,3,4,5].map(p => (
                  <th key={p} className="w-28 p-2 text-slate-500 dark:text-slate-400 text-[10px]">{PROB_LABELS[p]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[5,4,3,2,1].map(imp => (
                <tr key={imp}>
                  <td className="p-2 text-[10px] text-slate-400 font-black text-left">{IMPACT_LABELS[imp]}</td>
                  {[1,2,3,4,5].map(prob => {
                    const cellRisks = filteredRisks.filter(r => r.probability === prob && r.impact === imp);
                    const score = prob * imp;
                    let cls = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    if (score >= 16) cls = 'bg-rose-500 text-white border-rose-600';
                    else if (score >= 10) cls = 'bg-orange-400 text-white border-orange-500';
                    else if (score >= 5) cls = 'bg-amber-100 text-amber-800 border-amber-200';

                    return (
                      <td key={prob} className="p-1">
                        <div className={`rounded-xl border p-3 min-h-[60px] flex flex-col items-center justify-center gap-1 ${cls} transition-transform hover:scale-105 cursor-pointer`}>
                          {cellRisks.length > 0 ? (
                            <>
                              <span className="text-xl font-black leading-none">{cellRisks.length}</span>
                            </>
                          ) : (
                            <span className="text-[10px] opacity-40">—</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
