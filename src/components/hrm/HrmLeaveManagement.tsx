import React from 'react';
import { Calendar, User } from 'lucide-react';
import { LeaveRequest } from '../HrmCenter';

interface HrmLeaveManagementProps {
  leaves: LeaveRequest[];
  lang: string;
}

export default function HrmLeaveManagement({ leaves, lang }: HrmLeaveManagementProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" /> Quản lý Nghỉ phép / Nghỉ việc
        </h3>
        <button 
          onClick={() => alert('Chức năng lập đơn đang được cập nhật')}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors"
        >
          + Lập Đơn xin nghỉ phép
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase text-[9.5px]">
            <tr>
              <th className="px-4 py-3">Nhân sự</th>
              <th className="px-4 py-3 text-center">Ngày nghỉ</th>
              <th className="px-4 py-3 text-center">Tiết</th>
              <th className="px-4 py-3">Lý do</th>
              <th className="px-4 py-3 text-center">Trạng thái (Liên kết Workflow)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {leaves.map(l => (
              <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {l.teacherName}
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                  {l.leaveDate}
                </td>
                <td className="px-4 py-3 text-center font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  {l.slots.join(', ')}
                </td>
                <td className="px-4 py-3 text-[11px] text-slate-500 max-w-[200px] truncate" title={l.reason}>
                  {l.reason}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase cursor-pointer hover:opacity-80 transition-opacity ${
                    l.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    l.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    l.status === 'APPROVED_DEPT' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                    'bg-amber-50 text-amber-600 border border-amber-100'
                  }`} title="Nhấn để xem trên Workflow Approvals">
                    {l.status} ↗
                  </span>
                </td>
              </tr>
            ))}
            {leaves.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">Không có dữ liệu nghỉ phép.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
