import React from 'react';
import { X, Keyboard, CheckCircle2, Layout, Zap, Calendar, Users, Brain, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[85vh]">
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">{isEn ? 'Quick Guide' : 'Hướng dẫn nhanh'}</h2>
              <p className="text-[11px] text-slate-500">{isEn ? 'Tips & keyboard shortcuts for EduTask' : 'Mẹo và phím tắt thao tác trên EduTask'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Keyboard shortcuts */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Keyboard className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{isEn ? 'Keyboard Shortcuts' : 'Phím tắt thao tác'}</h3>
              </div>
              
              <ul className="space-y-3">
                {[
                  { key: 'Ctrl + /', desc: isEn ? 'Open global search' : 'Mở ô tìm kiếm toàn cục' },
                  { key: 'Esc', desc: isEn ? 'Close open dialogs' : 'Đóng các cửa sổ đang mở' },
                ].map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 text-xs">{item.desc}</span>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-semibold text-slate-700">{item.key}</kbd>
                  </li>
                ))}
              </ul>
              
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mt-6">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{isEn ? 'Pro Tips' : 'Mẹo tối ưu'}</h3>
              </div>
              <ul className="space-y-2.5">
                {(isEn ? [
                  'Use priority filters to tackle urgent tasks first',
                  'Switch to compact table view on smaller screens',
                  'Check the calendar to avoid scheduling conflicts',
                ] : [
                  'Sử dụng bộ lọc ưu tiên để giải quyết việc gấp',
                  'Chuyển đổi view sang dạng Bảng gọn nhẹ khi màn hình nhỏ',
                  'Xem lịch để tránh chồng lấn thời gian Bồi dưỡng chuyên môn',
                ]).map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-slate-600 items-start">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-xs leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Layout className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{isEn ? 'Key Features' : 'Tính năng chính'}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Layout className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{isEn ? 'Kanban Board' : 'Quản lý Kanban'}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{isEn ? 'Drag and drop task cards to quickly update progress status.' : 'Kéo thả thẻ nhiệm vụ để thay đổi trạng thái tiến độ nhanh chóng.'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{isEn ? 'Work Calendar' : 'Lịch Biểu'}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{isEn ? 'View all milestones and events at a glance for the week/month.' : 'Hỗ trợ quan sát tổng thể các cột mốc, sự kiện trong tuần/tháng.'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{isEn ? 'Multi-Intelligences (MI) & OKRs' : 'Đa Trí Tuệ (MI) & OKR'}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{isEn ? 'Deep analysis of 8 multiple intelligence domains for teaching staff.' : 'Phân tích chuyên sâu 8 mảng Đa trí tuệ của đội ngũ giáo viên.'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{isEn ? 'Staff Profiles' : 'Hồ sơ nhân sự'}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{isEn ? 'View task info, KPIs and professional development certifications.' : 'Xem thông tin nhiệm vụ, KPI và chứng chỉ Bồi dưỡng chuyên môn.'}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
           <button 
             onClick={onClose}
             className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors"
           >
             {isEn ? 'Got It' : 'Đã hiểu'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;
