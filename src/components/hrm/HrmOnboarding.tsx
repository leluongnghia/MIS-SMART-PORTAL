import React from 'react';
import { CheckSquare, Square, UserCheck, Calendar } from 'lucide-react';
import { OnboardingTask } from '../../types';

interface HrmOnboardingProps {
  tasks: OnboardingTask[];
  lang: string;
}

export default function HrmOnboarding({ tasks, lang }: HrmOnboardingProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono">
          Tiếp nhận nhân sự mới (Onboarding)
        </h3>
        <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg">
          + Tạo luồng Onboarding
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map(task => {
          const completedCount = task.checklist.filter(c => c.done).length;
          const totalCount = task.checklist.length;
          const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

          return (
            <div key={task.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">{task.userName}</h4>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">{task.roleName}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                  task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                  task.status === 'MISSING_DOCS' ? 'bg-rose-100 text-rose-700' :
                  'bg-indigo-100 text-indigo-700'
                }`}>{task.status}</span>
              </div>

              {task.mentorName && (
                <div className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded flex items-center gap-2 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Người hướng dẫn: <strong className="text-slate-800 dark:text-slate-200">{task.mentorName}</strong>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Tiến độ hoàn thành</span>
                  <span className="text-indigo-600">{completedCount}/{totalCount}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                {task.checklist.map(item => (
                  <div key={item.id} className="flex items-start gap-2 text-xs">
                    {item.done ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className={`font-medium ${item.done ? 'text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
