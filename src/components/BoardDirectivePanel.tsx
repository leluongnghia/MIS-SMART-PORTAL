import React, { useState } from 'react';
import { BoardDirective, UserProfile, getSafeAvatar } from '../types';
import { 
  Building2, 
  Sparkles, 
  FileText, 
  Send, 
  UserCheck, 
  AlertOctagon, 
  Clock, 
  ChevronRight, 
  CheckSquare, 
  TrendingUp, 
  Edit3, 
  CheckCircle, 
  Sliders, 
  Trash2,
  Bookmark,
  BellRing,
  EyeOff
} from 'lucide-react';

interface BoardDirectivePanelProps {
  directives: BoardDirective[];
  currentUser: UserProfile;
  onPublish: (newDirective: Omit<BoardDirective, 'id' | 'createdAt' | 'senderId' | 'senderName' | 'senderTitle' | 'senderAvatar' | 'implementations'>) => void;
  onUpdateStatus: (directiveId: string, status: 'DA_TIEP_THU' | 'DANG_TRIEN_KHAI' | 'DA_HOAN_THANH', feedback?: string) => void;
  onDelete?: (directiveId: string) => void;
  onMinimize?: () => void;
}

export default function BoardDirectivePanel({
  directives,
  currentUser,
  onPublish,
  onUpdateStatus,
  onDelete,
  onMinimize
}: BoardDirectivePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'CHI_DAO_CHIEN_LUOC' | 'CHI_THI_KHAN' | 'QUYET_DINH_BO_NHIEM'>('ALL');
  
  // Publish form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'CHI_DAO_CHIEN_LUOC' | 'CHI_THI_KHAN' | 'QUYET_DINH_BO_NHIEM'>('CHI_DAO_CHIEN_LUOC');
  const [urgency, setUrgency] = useState<'KHAN' | 'THUONG' | 'DAC_BIET'>('THUONG');

  // Check if current user is of Board level (CEO or Chairman)
  const isBoardMember = 
    currentUser.id === 'user_chutich' || 
    currentUser.id === 'user_ceo' || 
    currentUser.title.includes('Chủ tịch') || 
    currentUser.title.includes('CEO') ||
    currentUser.title.includes('Giám đốc Điều hành');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onPublish({
      title,
      content,
      category,
      urgency
    });

    setTitle('');
    setContent('');
    setCategory('CHI_DAO_CHIEN_LUOC');
    setUrgency('THUONG');
    setIsOpen(false);
  };

  const filteredDirectives = directives.filter(d => {
    if (selectedCategory === 'ALL') return true;
    return d.category === selectedCategory;
  });

  return (
    <div id="board-directive-panel-section" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
      {/* Delicate modern background glow shapes */}
      <div className="absolute -right-24 -top-24 w-80 h-80 bg-indigo-50/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-24 -bottom-24 w-80 h-80 bg-slate-50 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Info */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-indigo-50 border border-indigo-100/80 text-indigo-600 rounded-xl shrink-0">
            <BellRing className="w-5 h-5 text-indigo-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100/60">
                CHỈ ĐẠO THƯỜNG TRỰC
              </span>
              <span className="text-[10.5px] text-slate-400 font-mono font-medium">• CHỦ TỊCH & CEO</span>
            </div>
            <h2 className="font-display font-bold text-[15px] text-slate-900 tracking-tight">
              Định Hướng Chiến Lược & Chỉ Thị Bản Bộ
            </h2>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              Quyết nghị định hướng đào tạo sư phạm, tuyển sinh và điều động nhân sự từ Thầy Chủ tịch và CEO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isBoardMember && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              id="btn-toggle-board-directive-form"
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-2xs border ${
                isOpen 
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' 
                  : 'bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isOpen ? 'Hủy bản thảo' : 'Ban Hành Chỉ Đạo'}</span>
            </button>
          )}

          {onMinimize && (
            <button
              type="button"
              onClick={onMinimize}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer border border-slate-200"
              title="Ẩn bảng chỉ đạo thường trực"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Write Directive Form */}
      {isOpen && (
        <form 
          onSubmit={handleSubmit} 
          id="board-directive-publish-form" 
          className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-3xs animate-fade-in relative z-10"
        >
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-slate-700 font-mono">
            <Edit3 className="w-4 h-4 text-indigo-600" />
            <span>Soạn thảo quyết nghị chỉ đạo chiến lược</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Tiêu đề chỉ đạo quyết định *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đẩy mạnh đổi mới chuyển đổi số toàn diện học đường học kỳ tới"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white text-slate-800 rounded-lg text-xs placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Nội dung chỉ đạo & Yêu cầu cụ thể *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Nêu chi tiết chủ trương chỉ đạo, lộ trình thực hiện, mục tiêu cam kết từ học khu..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white text-slate-800 rounded-lg text-xs placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-4 bg-white p-4 rounded-lg border border-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-3">
                  Phân loại văn bản chỉ thị
                </label>
                <div className="flex flex-col gap-2.5">
                  {[
                    { key: 'CHI_DAO_CHIEN_LUOC' as const, label: '🎯 Chỉ Đạo Chiến Lược', desc: 'Định hướng giáo dục, quy trình nghiệp vụ lâu dài.' },
                    { key: 'CHI_THI_KHAN' as const, label: '⚠️ Chỉ Thị Khẩn Đặc Biệt', desc: 'Yêu cầu hành động, rà soát ngay lập tức để báo cáo.' },
                    { key: 'QUYET_DINH_BO_NHIEM' as const, label: '🛡️ Quyết Định Điều Động / Nhân sự', desc: 'Thông báo bổ nhiệm công tác, cơ cấu ban điều hành.' }
                  ].map((cat) => (
                    <label key={cat.key} className="flex items-start gap-2.5 text-xs cursor-pointer select-none">
                      <input
                        type="radio"
                        name="directive-category"
                        checked={category === cat.key}
                        onChange={() => setCategory(cat.key)}
                        className="text-indigo-600 focus:ring-indigo-500 mt-0.5"
                      />
                      <div>
                        <span className="font-semibold text-slate-800">{cat.label}</span>
                        <p className="text-[10px] text-slate-400">{cat.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1.5">
                  Độ khẩn cấp hành chính
                </label>
                <div className="flex gap-2">
                  {[
                    { key: 'THUONG' as const, label: 'Thường', style: 'border-slate-200 hover:bg-slate-50 text-slate-600' },
                    { key: 'KHAN' as const, label: 'Khẩn', style: 'border-amber-200 hover:bg-amber-50 text-amber-700' },
                    { key: 'DAC_BIET' as const, label: 'Hỏa Tốc', style: 'border-rose-200 hover:bg-rose-50 text-rose-700' }
                  ].map((urg) => (
                    <button
                      type="button"
                      key={urg.key}
                      onClick={() => setUrgency(urg.key)}
                      className={`flex-1 px-3 py-1.5 border text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        urgency === urg.key 
                          ? urg.key === 'DAC_BIET'
                            ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs'
                            : urg.key === 'KHAN'
                              ? 'bg-amber-550 text-slate-900 border-amber-550 font-bold shadow-xs'
                              : 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                          : urg.style
                      }`}
                    >
                      {urg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2.5 border-t border-slate-150">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 border border-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-indigo-700 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Phát hành chỉ thị chung</span>
            </button>
          </div>
        </form>
      )}

      {/* Category selector tabs */}
      <div className="inline-flex bg-slate-50 p-1 rounded-xl border border-slate-200/65 mt-4 overflow-x-auto max-w-full relative z-10 scrollbar-none">
        {[
          { key: 'ALL' as const, label: 'Tất cả chỉ đạo' },
          { key: 'CHI_DAO_CHIEN_LUOC' as const, label: '🎯 Chiến Lược' },
          { key: 'CHI_THI_KHAN' as const, label: '⚠️ Chỉ thị Khẩn' },
          { key: 'QUYET_DINH_BO_NHIEM' as const, label: '🛡️ Quyết định điều phối' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedCategory(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === tab.key
                ? 'bg-white text-slate-900 border-slate-200 font-bold shadow-2xs border'
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List content of directives */}
      {filteredDirectives.length === 0 ? (
        <div className="mt-4 p-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2 relative z-10">
          <FileText className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="text-xs font-medium">Chưa ghi nhận văn bản chỉ đạo nào từ CEO & Chủ tịch trong phân loại này.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4 relative z-10">
          {filteredDirectives.map((d) => {
            const myRsvp = d.implementations.find(i => i.userId === currentUser.id);
            const counterReceipts = d.implementations.filter(i => i.status === 'DA_TIEP_THU').length;
            const counterWorking = d.implementations.filter(i => i.status === 'DANG_TRIEN_KHAI').length;
            const counterDone = d.implementations.filter(i => i.status === 'DA_HOAN_THANH').length;

            // Highlight border dynamically
            const leftBorderColor = 
              d.category === 'CHI_DAO_CHIEN_LUOC' 
                ? 'border-indigo-500' 
                : d.category === 'CHI_THI_KHAN' 
                  ? 'border-rose-500' 
                  : 'border-emerald-500';

            return (
              <div 
                key={d.id} 
                id={`board-directive-card-${d.id}`}
                className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow duration-200 flex flex-col md:flex-row items-stretch border-l-4 ${leftBorderColor} relative`}
              >
                {/* Left block: Author identity & dynamic stats badges */}
                <div className="p-4 bg-slate-50 border-r border-slate-150 md:w-56 shrink-0 flex flex-col justify-between gap-3 text-xs">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <img 
                        src={getSafeAvatar(d.senderAvatar, d.senderName)} 
                        alt={d.senderName} 
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-3xs shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 leading-snug truncate hover:whitespace-normal">{d.senderName}</p>
                        <p className="text-[10px] text-amber-800 font-semibold font-sans leading-tight mt-0.5">{d.senderTitle}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-mono space-y-1">
                      <div><span className="text-slate-400">Thời gian:</span> {d.createdAt}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Mức khẩn:</span>
                        <span className={`font-bold px-1.5 py-0.2 rounded text-[9.5px] font-mono border ${
                          d.urgency === 'DAC_BIET' 
                            ? 'bg-rose-50 text-rose-700 border-rose-250 animate-pulse' 
                            : d.urgency === 'KHAN' 
                              ? 'bg-amber-50 text-amber-800 border-amber-250' 
                              : 'bg-slate-50 text-slate-550 border-slate-200'
                        }`}>
                          {d.urgency === 'DAC_BIET' ? 'HỎA TỐC ⚡' : d.urgency === 'KHAN' ? 'Khẩn' : 'Thường'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 truncate rounded-xl border border-slate-200 text-[10px] space-y-2 shadow-3xs">
                    <span className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider font-sans">Triển Khai Chấp Hành:</span>
                    <div className="grid grid-cols-3 gap-1.5 text-center font-mono font-semibold">
                      <div className="bg-slate-55 py-1.5 px-0.5 rounded-lg border border-slate-200" title="Đã tiếp thu chỉ đạt">
                        <span className="block text-indigo-700 text-[11px] font-bold mb-0.5">{counterReceipts}</span>
                        <span className="text-[7.5px] text-slate-400 font-sans">Nhận</span>
                      </div>
                      <div className="bg-slate-55 py-1.5 px-0.5 rounded-lg border border-slate-200" title="Đang triển khai thực tế">
                        <span className="block text-amber-600 text-[11px] font-bold mb-0.5">{counterWorking}</span>
                        <span className="text-[7.5px] text-slate-400 font-sans">Làm</span>
                      </div>
                      <div className="bg-slate-55 py-1.5 px-0.5 rounded-lg border border-slate-200" title="Đã báo cáo hoàn thành">
                        <span className="block text-emerald-600 text-[11px] font-bold mb-0.5">{counterDone}</span>
                        <span className="text-[7.5px] text-slate-400 font-sans">Xong</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right block: Real directive context, feedback status, form updates */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold font-mono text-[9px]">
                      <span className={`px-2 py-0.5 rounded border ${
                        d.category === 'CHI_DAO_CHIEN_LUOC'
                          ? 'bg-indigo-50 text-indigo-750 border-indigo-200'
                          : d.category === 'CHI_THI_KHAN'
                            ? 'bg-rose-50 text-rose-750 border-rose-200'
                            : 'bg-emerald-50 text-emerald-750 border-emerald-200'
                      }`}>
                        {d.category === 'CHI_DAO_CHIEN_LUOC' ? '🎯 CHỈ ĐẠO CHIẾN LƯỢC' : d.category === 'CHI_THI_KHAN' ? '⚠️ CHỈ THỊ KHẨN' : '🛡️ QUYẾT ĐỊNH ĐIỀU PHỐI'}
                      </span>
                    </div>

                    <h3 className="font-display font-semibold text-sm text-slate-900 mt-2 flex items-center gap-1.5 tracking-tight">
                      {d.title}
                    </h3>
                    
                    <p className="mt-2 text-slate-650 leading-relaxed whitespace-pre-line text-[11.5px] bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                      {d.content}
                    </p>
                  </div>

                  {/* Actions & Implementation Form */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-3 shrink-0">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-500 font-sans">
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Ký duyệt & báo cáo tiến trình thực thi</span>
                      </div>

                      {myRsvp ? (
                        <span className={`text-[9.5px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${
                          myRsvp.status === 'DA_HOAN_THANH'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : myRsvp.status === 'DANG_TRIEN_KHAI'
                              ? 'bg-amber-50 text-amber-700 border-amber-250'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {
                            myRsvp.status === 'DA_HOAN_THANH' 
                              ? '✓ Đã Hoàn thành' 
                              : myRsvp.status === 'DANG_TRIEN_KHAI' 
                                ? '⏳ Đang triển khai' 
                                : '📥 Đã tiếp thu'
                          }
                        </span>
                      ) : (
                        <span className="text-[9.5px] font-semibold text-amber-600 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 animate-pulse">
                          Chờ ký nhận chấp hành
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        type="text"
                        placeholder="Ý kiến đề xuất hoặc báo cáo mốc triển khai..."
                        id={`directive-feedback-input-${d.id}`}
                        value={feedbackInputs[d.id] || ''}
                        onChange={(e) => setFeedbackInputs({ ...feedbackInputs, [d.id]: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />

                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          onClick={() => {
                            onUpdateStatus(d.id, 'DA_TIEP_THU', feedbackInputs[d.id]);
                            setFeedbackInputs({ ...feedbackInputs, [d.id]: '' });
                          }}
                          className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer shrink-0 border border-slate-200 shadow-2xs"
                          title="Xác nhận đã đọc hiểu chỉ đạo"
                        >
                          Ký Tiếp Thu
                        </button>
                        <button
                          onClick={() => {
                            onUpdateStatus(d.id, 'DANG_TRIEN_KHAI', feedbackInputs[d.id]);
                            setFeedbackInputs({ ...feedbackInputs, [d.id]: '' });
                          }}
                          className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer shrink-0 border border-amber-200 shadow-2xs"
                          title="Bắt đầu triển khai"
                        >
                          Triển Khai
                        </button>
                        <button
                          onClick={() => {
                            onUpdateStatus(d.id, 'DA_HOAN_THANH', feedbackInputs[d.id] || 'Đã hoàn tất.');
                            setFeedbackInputs({ ...feedbackInputs, [d.id]: '' });
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs"
                          title="Báo cáo hoàn tất"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Đã Hoàn Thành</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress feedback reports timelines */}
                    {d.implementations.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">BỘ PHẬN PHẢN HỒI ({d.implementations.length})</span>
                        <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 font-mono text-[10.5px]">
                          {d.implementations.map((imp) => (
                            <div key={imp.userId} className="flex items-start justify-between gap-3 p-2 bg-white rounded border border-slate-200 shadow-3xs">
                              <div>
                                <span className="font-bold text-slate-800">{imp.userName}</span>
                                <span className="text-[9px] text-slate-450 ml-1">({imp.userTitle})</span>
                                {imp.feedback && (
                                  <p className="text-indigo-600 text-[10px] mt-0.5 leading-tight italic font-normal">💬 "{imp.feedback}"</p>
                                )}
                              </div>
                              <div className="shrink-0 text-right">
                                <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${
                                  imp.status === 'DA_HOAN_THANH'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-2 hover:bg-emerald-100'
                                    : imp.status === 'DANG_TRIEN_KHAI'
                                      ? 'bg-amber-50 text-amber-800 border-amber-2 hover:bg-amber-100'
                                      : 'bg-indigo-50 text-indigo-800 border-indigo-2 hover:bg-indigo-100'
                                }`}>
                                  {imp.status === 'DA_HOAN_THANH' ? 'Xong' : imp.status === 'DANG_TRIEN_KHAI' ? 'Làm' : 'Nhận'}
                                </span>
                                <p className="text-[8px] text-slate-400 mt-0.5">{imp.updatedAt}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specific administrative button to delete a directive if CEO or Chairman */}
                {isBoardMember && onDelete && (
                  <div className="absolute right-2.5 top-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Bạn chắc chắn có quyền thu hồi chỉ đạo tối cao này?')) {
                          onDelete(d.id);
                        }
                      }}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer border border-transparent"
                      title="Thu hồi quyết nghị"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
