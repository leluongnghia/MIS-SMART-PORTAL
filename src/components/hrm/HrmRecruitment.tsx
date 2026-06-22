import React, { useState } from 'react';
import { UserPlus, Calendar, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';
import { RecruitmentJob, Candidate } from '../../types';

interface HrmRecruitmentProps {
  jobs: RecruitmentJob[];
  candidates: any[];
  setCandidates: (c: any[]) => void;
  lang: string;
}

export default function HrmRecruitment({ jobs, candidates, setCandidates, lang }: HrmRecruitmentProps) {
  const [activeJobId, setActiveJobId] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', email: '', phone: '', jobId: '' });

  const filteredCandidates = activeJobId === 'ALL' 
    ? candidates 
    : candidates.filter(c => c.jobId === activeJobId);

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidate.name || !newCandidate.jobId) return;
    const job = jobs.find(j => j.id === newCandidate.jobId);
    
    const candidate = {
      id: `can_${Date.now()}`,
      jobId: newCandidate.jobId,
      jobPosition: job?.position || 'Ứng viên tự do',
      name: newCandidate.name,
      email: newCandidate.email,
      phone: newCandidate.phone,
      source: 'Website',
      status: 'NEW',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    
    setCandidates([candidate, ...candidates]);
    setShowAddForm(false);
    setNewCandidate({ name: '', email: '', phone: '', jobId: '' });
  };

  const updateCandidateStatus = (id: string, newStatus: string) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
      {/* Vị trí tuyển dụng */}
      <div className="lg:col-span-4 space-y-4">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono border-b pb-2 flex justify-between items-center">
          <span>Vị trí tuyển dụng</span>
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors"
          >
            + Thêm Ứng viên
          </button>
        </h3>
        <button 
          onClick={() => setActiveJobId('ALL')}
          className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all ${
            activeJobId === 'ALL' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-800' : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800'
          }`}
        >
          Tất cả ứng viên
        </button>
        {jobs.map(job => (
          <button
            key={job.id}
            onClick={() => setActiveJobId(job.id)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              activeJobId === job.id 
                ? 'bg-indigo-50 border-indigo-200 shadow-sm dark:bg-indigo-900/40 dark:border-indigo-800' 
                : 'bg-white border-slate-200 hover:border-indigo-200 dark:bg-slate-900 dark:border-slate-800'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-black text-slate-900 dark:text-slate-100">{job.position}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                job.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>{job.status}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold space-y-1">
              <p>Mã: <span className="font-mono text-slate-700 dark:text-slate-300">{job.code}</span></p>
              <p>Số lượng: <span className="text-indigo-600">{job.targetCount}</span></p>
              <p>Hạn chót: {job.deadline}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Danh sách ứng viên */}
      <div className="lg:col-span-8 space-y-4">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono border-b pb-2 flex justify-between">
          <span>Danh sách Ứng viên</span>
          <span className="text-indigo-600">{filteredCandidates.length} ứng viên</span>
        </h3>
        
        {showAddForm && (
          <form onSubmit={handleAddCandidate} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 mb-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Thêm Ứng viên mới</h4>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Họ và tên" className="p-2 text-xs rounded border w-full" value={newCandidate.name} onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} required />
              <select className="p-2 text-xs rounded border w-full" value={newCandidate.jobId} onChange={e => setNewCandidate({...newCandidate, jobId: e.target.value})} required>
                <option value="">-- Chọn Vị trí --</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.position}</option>)}
              </select>
              <input type="email" placeholder="Email" className="p-2 text-xs rounded border w-full" value={newCandidate.email} onChange={e => setNewCandidate({...newCandidate, email: e.target.value})} />
              <input type="text" placeholder="Số điện thoại" className="p-2 text-xs rounded border w-full" value={newCandidate.phone} onChange={e => setNewCandidate({...newCandidate, phone: e.target.value})} />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded">Hủy</button>
              <button type="submit" className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded font-bold">Lưu Ứng viên</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredCandidates.map(can => (
            <div key={can.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{can.name}</h4>
                  <span className="text-[10px] text-slate-500 block">{can.jobPosition}</span>
                </div>
                <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${
                  can.status === 'NEW' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  can.status === 'INTERVIEW' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  can.status === 'HIRED' || can.status === 'TRIAL' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                  'bg-slate-50 text-slate-700 border-slate-200'
                }`}>{can.status}</span>
              </div>
              <div className="text-[10px] text-slate-500 space-y-1 font-semibold">
                <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {can.phone}</p>
                <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {can.email}</p>
                <p className="flex items-center gap-1"><UserPlus className="w-3 h-3" /> Nguồn: {can.source}</p>
              </div>
              {can.interviewDate && (
                <div className="text-[10px] bg-slate-50 dark:bg-slate-800 p-2 rounded text-slate-700 dark:text-slate-300 font-medium">
                  <p className="flex items-center gap-1"><Calendar className="w-3 h-3 text-indigo-500" /> Lịch: {can.interviewDate}</p>
                  {can.evaluation && <p className="mt-1 italic text-slate-500">"{can.evaluation}"</p>}
                </div>
              )}
              <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {can.status !== 'HIRED' && (
                  <button onClick={() => updateCandidateStatus(can.id, 'HIRED')} className="flex-1 py-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Nhận việc
                  </button>
                )}
                {can.status !== 'REJECTED' && (
                  <button onClick={() => updateCandidateStatus(can.id, 'REJECTED')} className="flex-1 py-1 text-[10px] font-bold bg-rose-50 text-rose-700 rounded hover:bg-rose-100 flex items-center justify-center gap-1">
                    <XCircle className="w-3 h-3" /> Loại
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredCandidates.length === 0 && (
            <p className="col-span-2 text-center text-xs text-slate-400 py-8 italic">Không có ứng viên nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}
