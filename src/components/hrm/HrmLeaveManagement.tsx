import React, { useState } from 'react';
import { Calendar, User, X, Check } from 'lucide-react';
import { LeaveRequest } from '../HrmCenter';
import { UserProfile } from '../../types';

interface HrmLeaveManagementProps {
  leaves: LeaveRequest[];
  setLeaves?: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  currentUser?: UserProfile | null;
  lang: string;
}

export default function HrmLeaveManagement({ leaves, setLeaves, currentUser, lang }: HrmLeaveManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leaveDate: '',
    slots: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setLeaves || !currentUser) return;
    
    const slotsArray = newLeave.slots.split(',').map(s => parseInt(s.replace(/\D/g, ''))).filter(n => !isNaN(n));
    const newRequest: LeaveRequest = {
      id: `lv_${Date.now()}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      departmentId: currentUser.workspaceId || 'N/A',
      leaveDate: newLeave.leaveDate,
      slots: slotsArray.length > 0 ? slotsArray : [1, 2, 3, 4, 5],
      reason: newLeave.reason,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    
    setLeaves([newRequest, ...leaves]);
    setNewLeave({ leaveDate: '', slots: '', reason: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" /> {lang === 'vi' ? 'Quản lý Nghỉ phép / Nghỉ việc' : 'Leave Management'}
        </h3>
        <button 
          onClick={() => setShowForm(true)}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors"
        >
          {lang === 'vi' ? '+ Lập Đơn xin nghỉ phép' : '+ New Leave Request'}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {lang === 'vi' ? 'Lập Đơn Xin Nghỉ Phép' : 'Create Leave Request'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {lang === 'vi' ? 'Ngày nghỉ' : 'Leave Date'}
                </label>
                <input 
                  type="date" 
                  required
                  value={newLeave.leaveDate}
                  onChange={e => setNewLeave({...newLeave, leaveDate: e.target.value})}
                  className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {lang === 'vi' ? 'Các tiết nghỉ (Cách nhau bằng dấu phẩy, để trống nếu nghỉ cả ngày)' : 'Slots (Comma separated, empty for full day)'}
                </label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Tiết 1, Tiết 2"
                  value={newLeave.slots}
                  onChange={e => setNewLeave({...newLeave, slots: e.target.value})}
                  className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {lang === 'vi' ? 'Lý do xin nghỉ' : 'Reason'}
                </label>
                <textarea 
                  required
                  rows={3}
                  value={newLeave.reason}
                  onChange={e => setNewLeave({...newLeave, reason: e.target.value})}
                  className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white resize-none"
                ></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                  {lang === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  {lang === 'vi' ? 'Gửi Đơn' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
