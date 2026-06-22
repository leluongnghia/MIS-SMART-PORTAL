import React, { useState } from 'react';
import { AuditPlan } from './RiskMockData';
import { CheckCircle2, XCircle, Search, Calendar, Users, Eye, Plus, AlertCircle } from 'lucide-react';

export default function AuditPlans({ plans }: { plans: AuditPlan[] }) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const getStatusBadge = (status: AuditPlan['status']) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-600';
      case 'APPROVED': return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
      case 'REPORTED': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const activePlan = plans.find(p => p.id === selectedPlan);

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kế hoạch & Chương trình đánh giá</h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors">
          <Plus className="w-3.5 h-3.5" /> Tạo kế hoạch
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: List of Plans */}
        <div className={`lg:col-span-${selectedPlan ? '5' : '12'} space-y-3`}>
          {plans.map(plan => (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id === selectedPlan ? null : plan.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedPlan === plan.id ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-[10px] font-bold text-slate-400">{plan.code}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${getStatusBadge(plan.status)}`}>{plan.status}</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2">{plan.name}</h4>
              <div className="space-y-1.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {plan.startDate} - {plan.endDate}</div>
                <div className="flex items-center gap-1.5"><Users className="w-3 h-3" /> Trưởng đoàn: {plan.leadAuditor}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Plan Details & Checklist */}
        {selectedPlan && activePlan && (
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col h-[600px] overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">{activePlan.name}</h4>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>Phạm vi: {activePlan.scope}</span>
                <span>Tiêu chuẩn: {activePlan.criteria}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Checklist đánh giá</h5>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-bold text-slate-600 dark:text-slate-400">
                  {activePlan.checklist.length} tiêu chí
                </span>
              </div>

              <div className="space-y-3">
                {activePlan.checklist.map(item => (
                  <div key={item.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{item.group}</span>
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1.5">{item.content}</p>
                        {item.evidence && (
                          <div className="mt-2 text-[11px] text-slate-500 bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 border-dashed">
                            <span className="font-bold mr-1">Bằng chứng:</span>{item.evidence}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {item.result === 'PASS' && <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded"><CheckCircle2 className="w-3 h-3" /> ĐẠT</span>}
                        {item.result === 'FAIL' && <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded"><XCircle className="w-3 h-3" /> KHÔNG ĐẠT</span>}
                        {item.result === 'OBSERVE' && <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded"><Eye className="w-3 h-3" /> THEO DÕI</span>}
                        {item.result === 'PENDING' && <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">CHƯA ĐÁNH GIÁ</span>}
                        
                        {item.createCapa && item.result === 'FAIL' && (
                          <button className="text-[10px] font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Yêu cầu CAPA
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-2">
              <button className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl">Xuất báo cáo PDF</button>
              <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">Hoàn tất đánh giá</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
