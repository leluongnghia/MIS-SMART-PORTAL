import React from 'react';
import { UserCheck, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { ProbationEvaluation } from '../../types';

interface HrmProbationProps {
  evaluations: ProbationEvaluation[];
  lang: string;
}

export default function HrmProbation({ evaluations, lang }: HrmProbationProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono">
          Quản lý Thử việc / Học việc
        </h3>
        <button 
          onClick={() => alert('Chức năng đang được cập nhật')}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors"
        >
          + Thêm Hồ sơ thử việc
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evaluations.map(eva => {
          const endDate = new Date(eva.endDate);
          const today = new Date();
          const isExpiring = eva.status === 'IN_PROGRESS' && endDate.getTime() - today.getTime() < 14 * 24 * 60 * 60 * 1000 && endDate.getTime() - today.getTime() > 0;
          const isOverdue = eva.status === 'IN_PROGRESS' && endDate.getTime() < today.getTime();

          return (
            <div key={eva.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-3 relative overflow-hidden">
              {(isExpiring || isOverdue) && (
                <div className={`absolute top-0 right-0 left-0 h-1 ${isOverdue ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
              )}
              
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">{eva.userName}</h4>
                  <span className="text-[10px] text-slate-500 font-semibold block">{eva.position}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                  eva.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                  isOverdue ? 'bg-rose-100 text-rose-700' :
                  isExpiring ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {eva.status === 'COMPLETED' ? 'Đã hoàn tất' : isOverdue ? 'Quá hạn ĐG' : isExpiring ? 'Sắp hết hạn' : 'Đang thử việc'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg font-medium">
                <div className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> HD: {eva.mentorName}</div>
                <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {eva.startDate}</div>
                <div className={`flex items-center gap-1 col-span-2 ${isExpiring || isOverdue ? (isOverdue ? 'text-rose-600 font-bold' : 'text-amber-600 font-bold') : ''}`}>
                  <Calendar className="w-3.5 h-3.5" /> Hạn kết thúc: {eva.endDate}
                  {(isExpiring || isOverdue) && <AlertTriangle className="w-3.5 h-3.5 ml-1" />}
                </div>
              </div>

              <div className="text-[11px] text-slate-700 dark:text-slate-300">
                <span className="font-bold block text-[9.5px] uppercase text-slate-400 mb-1">Mục tiêu thử việc:</span>
                {eva.objectives}
              </div>

              {eva.status === 'COMPLETED' && eva.recommendation && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300 mr-2">Đề xuất:</span>
                  <span className={`font-black ${
                    eva.recommendation === 'HIRED' ? 'text-emerald-600' :
                    eva.recommendation === 'EXTENDED' ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {eva.recommendation === 'HIRED' ? 'Tiếp nhận chính thức' :
                     eva.recommendation === 'EXTENDED' ? 'Gia hạn thử việc' : 'Không tiếp nhận'}
                  </span>
                </div>
              )}

              {eva.status === 'IN_PROGRESS' && (
                <div className="mt-2 pt-3">
                  <button className="w-full py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[10px] font-bold rounded-lg transition-colors">
                    Thực hiện Đánh giá & Đề xuất
                  </button>
                </div>
              )}
            </div>
          )
        })}
        {evaluations.length === 0 && (
          <div className="col-span-2 p-8 text-center text-xs text-slate-400 italic bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            Không có nhân sự nào đang thử việc.
          </div>
        )}
      </div>
    </div>
  );
}
