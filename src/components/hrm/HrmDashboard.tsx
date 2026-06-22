import React from 'react';
import { Users, UserPlus, Briefcase, GraduationCap, ShieldAlert, Award, ArrowUpRight } from 'lucide-react';
import { UserProfile, HrContract, CpdProgram, DisciplinaryRecord } from '../../types';
import { LeaveRequest } from '../HrmCenter';

interface HrmDashboardProps {
  users: UserProfile[];
  contracts: HrContract[];
  cpdPrograms: CpdProgram[];
  disciplines: DisciplinaryRecord[];
  leaves: LeaveRequest[];
  lang: string;
}

export default function HrmDashboard({ users, contracts, cpdPrograms, disciplines, leaves, lang }: HrmDashboardProps) {
  const teachersCount = users.filter(u => u.title?.toLowerCase().includes('giáo viên') || u.title?.toLowerCase().includes('tổ trưởng')).length;
  const staffCount = users.length - teachersCount;
  
  const expiringContracts = contracts.filter(c => c.status === 'EXPIRING' || c.status === 'ACTIVE').length; // Giả lập sắp hết hạn
  const activeLeaves = leaves.filter(l => l.status === 'APPROVED_DEPT' || l.status === 'PENDING').length;
  const activeDisciplines = disciplines.filter(d => d.status === 'PENDING' || d.status === 'MONITORING').length;

  const stats = [
    { label: lang === 'vi' ? 'Tổng nhân sự' : 'Total Staff', value: users.length, icon: Users, color: 'bg-blue-500' },
    { label: lang === 'vi' ? 'Giáo viên' : 'Teachers', value: teachersCount, icon: GraduationCap, color: 'bg-emerald-500' },
    { label: lang === 'vi' ? 'Nhân viên VP/Hỗ trợ' : 'Support Staff', value: staffCount, icon: Briefcase, color: 'bg-indigo-500' },
    { label: lang === 'vi' ? 'HĐ sắp hết hạn' : 'Expiring Contracts', value: expiringContracts, icon: Award, color: 'bg-amber-500' },
    { label: lang === 'vi' ? 'Đang xin nghỉ' : 'On Leave', value: activeLeaves, icon: UserPlus, color: 'bg-purple-500' },
    { label: lang === 'vi' ? 'Vi phạm đang xử lý' : 'Active Disciplinary', value: activeDisciplines, icon: ShieldAlert, color: 'bg-rose-500' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">{s.label}</p>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{s.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${s.color} bg-opacity-10 dark:bg-opacity-20`}>
              <s.icon className={`w-6 h-6 ${s.color.replace('bg-', 'text-')}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 mb-4 flex items-center justify-between">
            <span>Phân bổ theo phòng ban</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </h3>
          <div className="space-y-3">
            {['TOAN_TIN', 'VAN', 'NGOAI_NGU', 'HANH_CHINH', 'DICH_VU_HOC_DUONG'].map(dept => {
              const count = users.filter(u => u.workspaceId === dept).length;
              const pct = users.length > 0 ? (count / users.length) * 100 : 0;
              return (
                <div key={dept}>
                  <div className="flex justify-between text-xs mb-1 font-semibold text-slate-600 dark:text-slate-300">
                    <span>{dept}</span>
                    <span>{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 mb-4 flex items-center justify-between">
            <span>Đào tạo & CPD đang diễn ra</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </h3>
          <div className="space-y-3">
            {cpdPrograms.slice(0, 5).map(cpd => (
              <div key={cpd.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{cpd.name}</span>
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                    cpd.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                  }`}>{cpd.status}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Đối tượng: {cpd.targetAudience} | Bắt đầu: {cpd.startDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
