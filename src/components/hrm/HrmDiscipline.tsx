import React, { useState } from 'react';
import { ShieldAlert, Calendar, User, FileText, X, Check } from 'lucide-react';
import { DisciplinaryRecord, UserProfile } from '../../types';

interface HrmDisciplineProps {
  records: DisciplinaryRecord[];
  setRecords?: React.Dispatch<React.SetStateAction<DisciplinaryRecord[]>>;
  users?: UserProfile[];
  lang: string;
}

export default function HrmDiscipline({ records, setRecords, users = [], lang }: HrmDisciplineProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    date: '',
    violationType: 'Vi phạm quy chế',
    severity: 'LIGHT' as const,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setRecords) return;
    
    const selectedUser = users.find(u => u.id === formData.userId);
    if (!selectedUser) return;

    const newRecord: DisciplinaryRecord = {
      id: `ds_${Date.now()}`,
      userId: selectedUser.id,
      userName: selectedUser.name,
      date: formData.date,
      violationType: formData.violationType,
      severity: formData.severity,
      description: formData.description,
      status: 'PENDING',
      recordedBy: 'System'
    };
    
    setRecords([newRecord, ...records]);
    setFormData({ userId: '', date: '', violationType: 'Vi phạm quy chế', severity: 'LIGHT', description: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" /> Kỷ luật & Vi phạm
        </h3>
        <button 
          onClick={() => setShowForm(true)}
          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors"
        >
          + Ghi nhận sự việc
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Ghi Nhận Kỷ Luật/Vi Phạm</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nhân sự vi phạm</label>
                <select required value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-slate-900 dark:text-white font-semibold">
                  <option value="">-- Chọn nhân sự --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ngày phát sinh</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-slate-900 dark:text-white font-semibold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mức độ</label>
                  <select required value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value as any})} className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-slate-900 dark:text-white font-semibold">
                    <option value="REMINDER">Nhắc nhở (REMINDER)</option>
                    <option value="LIGHT">Nhẹ (LIGHT)</option>
                    <option value="MEDIUM">Trung bình (MEDIUM)</option>
                    <option value="SEVERE">Nghiêm trọng (SEVERE)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Loại vi phạm</label>
                <input type="text" required value={formData.violationType} onChange={e => setFormData({...formData, violationType: e.target.value})} className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-slate-900 dark:text-white font-semibold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mô tả chi tiết</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-slate-900 dark:text-white resize-none"></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Lưu sự việc</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
