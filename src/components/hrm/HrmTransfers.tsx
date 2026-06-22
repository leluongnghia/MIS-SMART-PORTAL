import React, { useState } from 'react';
import { ArrowRightLeft, Calendar, User, X, Check } from 'lucide-react';
import { TransferRecord, UserProfile } from '../../types';

interface HrmTransfersProps {
  records: TransferRecord[];
  setRecords?: React.Dispatch<React.SetStateAction<TransferRecord[]>>;
  users?: UserProfile[];
  getWorkspaceName: (wId: string) => string;
  lang: string;
}

export default function HrmTransfers({ records, setRecords, users = [], getWorkspaceName, lang }: HrmTransfersProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    newDept: '',
    reason: '',
    effectiveDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setRecords) return;
    
    const selectedUser = users.find(u => u.id === formData.userId);
    if (!selectedUser) return;

    const newRecord: TransferRecord = {
      id: `tr_${Date.now()}`,
      userId: selectedUser.id,
      userName: selectedUser.name,
      currentDept: selectedUser.workspaceId || 'N/A',
      newDept: formData.newDept,
      reason: formData.reason,
      effectiveDate: formData.effectiveDate,
      status: 'PENDING',
      proposedBy: 'System'
    };
    
    setRecords([newRecord, ...records]);
    setFormData({ userId: '', newDept: '', reason: '', effectiveDate: '' });
    setShowForm(false);
  };

  const departments = [
    { id: 'BGH', name: 'Ban Giám hiệu' },
    { id: 'TUYEN_SINH_PR', name: 'Tuyển sinh & PR' },
    { id: 'QUOC_TE', name: 'Chương trình Quốc tế' },
    { id: 'KHAO_THI', name: 'Khảo thí' },
    { id: 'TOAN_TIN', name: 'Tổ Toán - Tin' },
    { id: 'VAN', name: 'Tổ Ngữ văn' },
    { id: 'NGOAI_NGU', name: 'Tổ Ngoại ngữ' }
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-indigo-600" /> Thuyên chuyển & Bổ nhiệm
        </h3>
        <button 
          onClick={() => setShowForm(true)}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors"
        >
          + Lập Đề xuất
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Lập Đề Xuất Thuyên Chuyển</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nhân sự</label>
                <select required value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white font-semibold">
                  <option value="">-- Chọn nhân sự --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phòng ban mới</label>
                <select required value={formData.newDept} onChange={e => setFormData({...formData, newDept: e.target.value})} className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white font-semibold">
                  <option value="">-- Chọn phòng ban --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ngày hiệu lực</label>
                <input type="date" required value={formData.effectiveDate} onChange={e => setFormData({...formData, effectiveDate: e.target.value})} className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white font-semibold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lý do</label>
                <textarea required rows={3} value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white resize-none"></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Xác nhận</button>
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
