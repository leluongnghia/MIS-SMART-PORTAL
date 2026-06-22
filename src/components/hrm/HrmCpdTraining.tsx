import React from 'react';
import { BookOpen, Calendar, Users, Award } from 'lucide-react';
import { CpdProgram, CpdParticipant } from '../../types';

interface HrmCpdTrainingProps {
  programs: CpdProgram[];
  participants: CpdParticipant[];
  lang: string;
}

export default function HrmCpdTraining({ programs, participants, lang }: HrmCpdTrainingProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono">
          Chương trình Đào tạo & Bồi dưỡng (CPD)
        </h3>
        <button 
          onClick={() => alert('Chức năng đang được cập nhật')}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors"
        >
          + Thêm Chương trình mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map(prog => {
          const parts = participants.filter(p => p.programId === prog.id);
          
          return (
            <div key={prog.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">{prog.code}</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">{prog.name}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                  prog.status === 'APPROVED' ? 'bg-amber-100 text-amber-700' :
                  prog.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-700' :
                  prog.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-slate-100 text-slate-700'
                }`}>{prog.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10.5px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg font-medium">
                <div className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Thể loại: {prog.type}</div>
                <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> SL tham gia: {parts.length}</div>
                <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Từ: {prog.startDate}</div>
                <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-300" /> Đến: {prog.endDate}</div>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 pt-1">
                <span className="font-bold block text-[10px] uppercase text-slate-400 mb-1">Mục tiêu:</span>
                {prog.objectives}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-2 flex justify-between items-center">
                <div className="flex -space-x-2 overflow-hidden">
                  {parts.slice(0, 3).map((p, i) => (
                    <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-indigo-100 flex-shrink-0 flex justify-center items-center">
                      <span className="text-[8px] font-bold text-indigo-700">{p.userName.charAt(0)}</span>
                    </div>
                  ))}
                  {parts.length > 3 && (
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-100 flex-shrink-0 flex justify-center items-center">
                      <span className="text-[8px] font-bold text-slate-600">+{parts.length - 3}</span>
                    </div>
                  )}
                  {parts.length === 0 && <span className="text-[10px] text-slate-400 italic">Chưa có danh sách</span>}
                </div>
                <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">Xem chi tiết & Cập nhật điểm →</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
