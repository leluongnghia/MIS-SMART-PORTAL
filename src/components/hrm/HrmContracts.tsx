import React, { useState } from 'react';
import { FileText, Calendar, AlertCircle } from 'lucide-react';
import { UserProfile, Candidate } from '../../types';

interface HrmContractsProps {
  contracts: any[];
  setContracts: (c: any[]) => void;
  users: UserProfile[];
  candidates: any[];
  lang: string;
}

export default function HrmContracts({ contracts, setContracts, users, candidates, lang }: HrmContractsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContract, setNewContract] = useState({ userId: '', contractType: 'Hợp đồng lao động xác định thời hạn (12 tháng)' });

  // Lấy danh sách nhân viên và ứng viên đã onboarding/hired
  const eligibleUsers = [
    ...users.map(u => ({ id: u.id, name: u.name, type: 'USER' })),
    ...candidates.filter(c => c.status === 'HIRED').map(c => ({ id: c.id, name: c.name, type: 'CANDIDATE' }))
  ];

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContract.userId) return;
    
    const user = eligibleUsers.find(u => u.id === newContract.userId);
    if (!user) return;

    const signDate = new Date();
    const expDate = new Date();
    expDate.setFullYear(signDate.getFullYear() + 1);

    const contract = {
      id: `ct_${Date.now()}`,
      contractNumber: `HDLD-${signDate.getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      userId: user.id,
      userName: user.name,
      contractType: newContract.contractType,
      signDate: signDate.toISOString().split('T')[0],
      expirationDate: expDate.toISOString().split('T')[0],
      status: 'ACTIVE',
      baseSalary: 10000000,
      createdAt: signDate.toISOString()
    };
    
    setContracts([contract, ...contracts]);
    setShowAddForm(false);
    setNewContract({ userId: '', contractType: 'Hợp đồng lao động xác định thời hạn (12 tháng)' });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono">
          Quản lý Hợp đồng Nhân sự
        </h3>
        <button 
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg"
        >
          + Thêm Hợp đồng
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateContract} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tạo Hợp đồng mới</h4>
          <div className="grid grid-cols-2 gap-3">
            <select className="p-2 text-xs rounded border w-full" value={newContract.userId} onChange={e => setNewContract({...newContract, userId: e.target.value})} required>
              <option value="">-- Chọn Nhân sự / Ứng viên --</option>
              {eligibleUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.type === 'CANDIDATE' ? 'Ứng viên mới' : 'Nhân sự'})</option>)}
            </select>
            <select className="p-2 text-xs rounded border w-full" value={newContract.contractType} onChange={e => setNewContract({...newContract, contractType: e.target.value})} required>
              <option value="Hợp đồng thử việc (2 tháng)">Hợp đồng thử việc (2 tháng)</option>
              <option value="Hợp đồng lao động xác định thời hạn (12 tháng)">Hợp đồng lao động xác định thời hạn (12 tháng)</option>
              <option value="Hợp đồng lao động không xác định thời hạn">Hợp đồng lao động không xác định thời hạn</option>
              <option value="Hợp đồng cộng tác viên/thỉnh giảng">Hợp đồng cộng tác viên/thỉnh giảng</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded">Hủy</button>
            <button type="submit" className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded font-bold">Ký Hợp đồng</button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase text-[9.5px]">
            <tr>
              <th className="px-4 py-3">Số Hợp đồng</th>
              <th className="px-4 py-3">Nhân sự</th>
              <th className="px-4 py-3">Loại hợp đồng</th>
              <th className="px-4 py-3 text-center">Ngày ký - Hết hạn</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {contracts.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {c.contractNumber}
                  </div>
                </td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">{c.userName}</td>
                <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">{c.contractType}</td>
                <td className="px-4 py-3 text-center font-mono text-[10.5px] text-slate-500">
                  {c.signDate} <br/> <span className="text-slate-400">đến</span> {c.expirationDate}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                    c.status === 'EXPIRING' ? 'bg-amber-100 text-amber-700' :
                    c.status === 'EXPIRED' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {c.status === 'EXPIRING' && <AlertCircle className="w-3 h-3" />}
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
            {contracts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">Không có hợp đồng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
