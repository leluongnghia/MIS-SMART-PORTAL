import React from 'react';
import { ManagementReview as Review } from './RiskMockData';
import { Users, Calendar, CheckSquare, Plus, FileText } from 'lucide-react';

export default function ManagementReview({ reviews }: { reviews: Review[] }) {
  const getStatusStyle = (status: Review['status']) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Xem xét của Lãnh đạo</h3>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors">
          <Plus className="w-4 h-4" /> Lên lịch họp
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reviews.map(review => (
          <div key={review.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:border-rose-300 transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <span className="text-[10px] font-mono font-black text-slate-500 block mb-1">{review.code}</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{review.name}</h4>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(review.status)}`}>
                {review.status}
              </span>
            </div>
            
            <div className="p-4 space-y-3 flex-1">
              <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium">{review.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium">{review.chairperson}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Đầu vào xem xét</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1 text-[11px] ${review.inputs.highRisks ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600 line-through'}`}>
                    <CheckSquare className="w-3 h-3" /> Rủi ro cao
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] ${review.inputs.overdueCapas ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600 line-through'}`}>
                    <CheckSquare className="w-3 h-3" /> CAPA quá hạn
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] ${review.inputs.auditResults ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600 line-through'}`}>
                    <CheckSquare className="w-3 h-3" /> Đánh giá NB
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] ${review.inputs.complaints ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600 line-through'}`}>
                    <CheckSquare className="w-3 h-3" /> Khiếu nại
                  </div>
                </div>
              </div>

              {review.status === 'COMPLETED' && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Kết luận & Chỉ đạo</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{review.conclusion || review.directives || "Đã hoàn thành xem xét."}</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
              <div className="text-[10px] text-slate-500">
                Phụ trách: <strong className="text-slate-700 dark:text-slate-300">{review.owner}</strong>
              </div>
              <button className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg">
                <FileText className="w-3.5 h-3.5" /> Biên bản
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
