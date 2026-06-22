import React from 'react';
import { ArrowRightLeft, Calendar, User } from 'lucide-react';
import { TransferRecord } from '../../types';

interface HrmTransfersProps {
  records: TransferRecord[];
  getWorkspaceName: (wId: string) => string;
  lang: string;
}

export default function HrmTransfers({ records, getWorkspaceName, lang }: HrmTransfersProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-indigo-600" /> Thuyên chuyển & Bổ nhiệm
        </h3>
        <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg">
          + Lập Đề xuất
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase text-[9.5px]">
            <tr>
              <th className="px-4 py-3">Nhân sự</th>
              <th className="px-4 py-3">Phòng ban cũ</th>
              <th className="px-4 py-3">Phòng ban mới</th>
              <th className="px-4 py-3">Lý do</th>
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
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-medium">
                  {getWorkspaceName(r.currentDept)}
                </td>
                <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">
                  {getWorkspaceName(r.newDept)}
                </td>
                <td className="px-4 py-3 text-[11px] text-slate-500">
                  {r.reason}
                  <div className="mt-1 text-[9px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Hiệu lực: {r.effectiveDate}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    r.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    r.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">Không có hồ sơ thuyên chuyển nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
