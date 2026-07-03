import React, { useState } from 'react';
import { ManagementReview as Review } from './RiskMockData';
import { Users, Calendar, CheckSquare, Plus, FileText, X } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';

interface ManagementReviewProps {
  reviews: Review[];
  onAddReview: (newReview: Review) => void;
}

export default function ManagementReview({ reviews, onAddReview }: { reviews: Review[]; onAddReview: (newReview: Review) => void }) {
  const { success: toastSuccess } = useToast();
  
  const [selectedDetail, setSelectedDetail] = useState<Review | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    chairperson: 'Hiệu trưởng',
    attendeesText: 'GĐ Điều hành, TP Hành chính, KSNB',
    content: '',
    highRisks: true,
    overdueCapas: true,
    auditResults: true,
    complaints: true,
    incidents: true,
    processEfficiency: true,
    owner: 'Thư ký BGH',
  });

  const getStatusStyle = (status: Review['status']) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleDownloadMinutes = (code: string) => {
    toastSuccess(`Đang tải Biên bản cuộc họp ${code}.pdf ...`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.chairperson || !formData.content) {
      return;
    }

    const reviewNumber = reviews.length + 1;
    const newReview: Review = {
      id: `mr_${Date.now()}`,
      code: `MR-26-Q${reviewNumber}`,
      name: formData.name,
      date: formData.date,
      chairperson: formData.chairperson,
      attendees: formData.attendeesText.split(',').map(a => a.trim()).filter(Boolean),
      content: formData.content,
      inputs: {
        highRisks: formData.highRisks,
        overdueCapas: formData.overdueCapas,
        auditResults: formData.auditResults,
        complaints: formData.complaints,
        incidents: formData.incidents,
        processEfficiency: formData.processEfficiency,
      },
      conclusion: '',
      directives: '',
      owner: formData.owner,
      deadline: new Date(new Date(formData.date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'SCHEDULED',
      timeline: [
        {
          id: `tl_${Date.now()}`,
          action: 'Lên lịch họp xem xét lãnh đạo',
          by: 'BGH',
          at: new Date().toISOString()
        }
      ]
    };

    onAddReview(newReview);
    setIsModalOpen(false);
    toastSuccess(`Lên lịch họp "${formData.name}" thành công!`);
    
    // Reset Form
    setFormData({
      name: '',
      date: '',
      chairperson: 'Hiệu trưởng',
      attendeesText: 'GĐ Điều hành, TP Hành chính, KSNB',
      content: '',
      highRisks: true,
      overdueCapas: true,
      auditResults: true,
      complaints: true,
      incidents: true,
      processEfficiency: true,
      owner: 'Thư ký BGH',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Xem xét của Lãnh đạo</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Lên lịch họp
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reviews.map(review => (
          <div key={review.id} onClick={() => setSelectedDetail(review)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:border-rose-300 transition-colors cursor-pointer">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <span className="text-[10px] font-mono font-black text-slate-500 block mb-1">{review.code}</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{review.name}</h4>
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
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium truncate max-w-[120px]">{review.chairperson}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Đầu vào xem xét</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1 text-[11px] ${review.inputs.highRisks ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600 line-through'}`}>
                    <CheckSquare className="w-3 h-3 text-rose-500" /> Rủi ro cao
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] ${review.inputs.overdueCapas ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600 line-through'}`}>
                    <CheckSquare className="w-3 h-3 text-rose-500" /> CAPA quá hạn
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] ${review.inputs.auditResults ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600 line-through'}`}>
                    <CheckSquare className="w-3 h-3 text-rose-500" /> Đánh giá NB
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] ${review.inputs.complaints ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600 line-through'}`}>
                    <CheckSquare className="w-3 h-3 text-rose-500" /> Khiếu nại
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
              <button 
                onClick={() => handleDownloadMinutes(review.code)}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 hover:border-rose-200 transition-colors shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" /> Biên bản
              </button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            Chưa có lịch họp xem xét lãnh đạo nào được tạo.
          </div>
        )}
      </div>

      {/* MODAL: CREATE MEETING */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">Lên lịch họp xem xét của Lãnh đạo</h3>
                <p className="text-[10px] text-rose-200">Đánh giá hệ thống quản lý chất lượng & rủi ro</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tên cuộc họp</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                  placeholder="Ví dụ: Họp xem xét lãnh đạo Quý 2 - 2026"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ngày diễn ra</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Người chủ trì</label>
                  <input 
                    type="text" 
                    value={formData.chairperson}
                    onChange={e => setFormData(prev => ({ ...prev, chairperson: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Thành phần tham gia</label>
                <input 
                  type="text" 
                  value={formData.attendeesText}
                  onChange={e => setFormData(prev => ({ ...prev, attendeesText: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                  placeholder="Phân cách bằng dấu phẩy"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nội dung / Chương trình họp</label>
                <textarea 
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500 min-h-[60px]"
                  placeholder="Nội dung chính hoặc chương trình họp dự kiến..."
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Đầu vào cần xem xét (Inputs)</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.highRisks}
                      onChange={e => setFormData(prev => ({ ...prev, highRisks: e.target.checked }))}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                    />
                    Rủi ro cao
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.overdueCapas}
                      onChange={e => setFormData(prev => ({ ...prev, overdueCapas: e.target.checked }))}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                    />
                    CAPA quá hạn
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.auditResults}
                      onChange={e => setFormData(prev => ({ ...prev, auditResults: e.target.checked }))}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                    />
                    Kết quả đánh giá NB
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.complaints}
                      onChange={e => setFormData(prev => ({ ...prev, complaints: e.target.checked }))}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                    />
                    Khiếu nại phụ huynh
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.incidents}
                      onChange={e => setFormData(prev => ({ ...prev, incidents: e.target.checked }))}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                    />
                    Sự cố & Phản ánh
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.processEfficiency}
                      onChange={e => setFormData(prev => ({ ...prev, processEfficiency: e.target.checked }))}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                    />
                    Hiệu quả quy trình
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Người phụ trách chuẩn bị</label>
                <input 
                  type="text" 
                  value={formData.owner}
                  onChange={e => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Lên lịch họp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedDetail(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <X className="w-5 h-5"/>
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 pr-6 border-b pb-2">Chi tiết - {selectedDetail.code}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nội dung cuộc họp:</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedDetail.content}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Hướng xử lý / Chỉ đạo:</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedDetail.directives || 'Chưa có chỉ đạo cụ thể'}
                  <br/><br/>
                  Kết luận: {selectedDetail.conclusion || 'Đang cập nhật'}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedDetail(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
