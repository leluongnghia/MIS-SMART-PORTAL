import React from 'react';
import { ShieldAlert, Calendar, User, FileText } from 'lucide-react';
import { DisciplinaryRecord } from '../../types';

interface HrmDisciplineProps {
  records: DisciplinaryRecord[];
  lang: string;
}

export default function HrmDiscipline({ records, lang }: HrmDisciplineProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" /> Kỷ luật & Vi phạm
        </h3>
        <button 
          onClick={() => alert('Chức năng đang được cập nhật')}
          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors"
        >
          + Ghi nhận sự việc
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase text-[9.5px]">
            <tr>
              <th className="px-4 py-3">Nhân sự vi phạm</th>
              <th className="px-4 py-3">Ngày phát sinh</th>
              <th className="px-4 py-3">Loại / Mức độ</th>
              <th className="px-4 py-3">Nội dung</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {r.userName}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-[10.5px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {r.date}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{r.violationType}</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    r.severity === 'REMINDER' ? 'bg-slate-100 text-slate-600' :
                    r.severity === 'LIGHT' ? 'bg-amber-100 text-amber-700' :
                    r.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>{r.severity}</span>
                </td>
                <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-400 max-w-[250px] truncate">
                  <div className="flex items-start gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span title={r.description}>{r.description}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    r.status === 'PENDING' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    r.status === 'MONITORING' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-slate-50 text-slate-600 border border-slate-100'
                  }`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">Không có hồ sơ kỷ luật nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
