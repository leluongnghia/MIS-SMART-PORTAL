import React, { useState } from 'react';
import { UserPlus, Calendar, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';
import { RecruitmentJob, Candidate } from '../../types';

interface HrmRecruitmentProps {
  jobs: RecruitmentJob[];
  candidates: Candidate[];
  lang: string;
}

export default function HrmRecruitment({ jobs, candidates, lang }: HrmRecruitmentProps) {
  const [activeJobId, setActiveJobId] = useState<string>('ALL');

  const filteredCandidates = activeJobId === 'ALL' 
    ? candidates 
    : candidates.filter(c => c.jobId === activeJobId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
      {/* Vị trí tuyển dụng */}
      <div className="lg:col-span-4 space-y-4">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono border-b pb-2">
          Vị trí tuyển dụng
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
                  can.status === 'TRIAL' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
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
                <button className="flex-1 py-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Cập nhật
                </button>
                <button className="flex-1 py-1 text-[10px] font-bold bg-rose-50 text-rose-700 rounded hover:bg-rose-100 flex items-center justify-center gap-1">
                  <XCircle className="w-3 h-3" /> Loại
                </button>
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
