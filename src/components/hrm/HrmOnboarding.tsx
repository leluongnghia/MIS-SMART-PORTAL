import React, { useState } from 'react';
import { CheckSquare, Square, UserCheck, Calendar } from 'lucide-react';
import { OnboardingTask } from '../../types';

interface HrmOnboardingProps {
  tasks: any[];
  setTasks: (t: any[]) => void;
  candidates: any[];
  lang: string;
}

export default function HrmOnboarding({ tasks, setTasks, candidates, lang }: HrmOnboardingProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({ candidateId: '', mentorName: '' });

  const hiredCandidates = candidates.filter(c => c.status === 'HIRED');

  const handleCreateOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.candidateId) return;
    
    const candidate = candidates.find(c => c.id === newTask.candidateId);
    if (!candidate) return;

    const task = {
      id: `ob_${Date.now()}`,
      userId: candidate.id,
      userName: candidate.name,
      roleName: candidate.jobPosition,
      department: 'Phòng ban mới',
      mentorName: newTask.mentorName || 'Admin',
      startDate: new Date().toISOString().split('T')[0],
      status: 'IN_PROGRESS',
      checklist: [
        { id: 'c1', text: 'Nộp hồ sơ cứng (Sơ yếu lý lịch, Bằng cấp)', done: false },
        { id: 'c2', text: 'Cấp phát thẻ nhân viên & Đồng phục', done: false },
        { id: 'c3', text: 'Ký thỏa thuận bảo mật & Nội quy', done: false },
        { id: 'c4', text: 'Tạo tài khoản email & phần mềm', done: false }
      ]
    };
    
    setTasks([task, ...tasks]);
    setShowAddForm(false);
    setNewTask({ candidateId: '', mentorName: '' });
  };

  const toggleChecklist = (taskId: string, checkId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          checklist: t.checklist.map((c: any) => c.id === checkId ? { ...c, done: !c.done } : c)
        };
      }
      return t;
    }));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-mono">
          Tiếp nhận nhân sự mới (Onboarding)
        </h3>
        <button 
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg"
        >
          + Tạo luồng Onboarding
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateOnboarding} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tạo Onboarding cho Ứng viên mới nhận việc</h4>
          <div className="grid grid-cols-2 gap-3">
            <select className="p-2 text-xs rounded border w-full" value={newTask.candidateId} onChange={e => setNewTask({...newTask, candidateId: e.target.value})} required>
              <option value="">-- Chọn Ứng viên --</option>
              {hiredCandidates.map(c => <option key={c.id} value={c.id}>{c.name} - {c.jobPosition}</option>)}
            </select>
            <input type="text" placeholder="Người hướng dẫn (Mentor)" className="p-2 text-xs rounded border w-full" value={newTask.mentorName} onChange={e => setNewTask({...newTask, mentorName: e.target.value})} />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded">Hủy</button>
            <button type="submit" className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded font-bold">Tạo Onboarding</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map(task => {
          const completedCount = task.checklist.filter((c: any) => c.done).length;
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
                  task.status === 'COMPLETED' || progress === 100 ? 'bg-emerald-100 text-emerald-700' :
                  task.status === 'MISSING_DOCS' ? 'bg-rose-100 text-rose-700' :
                  'bg-indigo-100 text-indigo-700'
                }`}>{progress === 100 ? 'COMPLETED' : task.status}</span>
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
                {task.checklist.map((item: any) => (
                  <button 
                    key={item.id} 
                    onClick={() => toggleChecklist(task.id, item.id)}
                    className="flex items-start gap-2 text-xs w-full text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 rounded"
                  >
                    {item.done ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className={`font-medium ${item.done ? 'text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
