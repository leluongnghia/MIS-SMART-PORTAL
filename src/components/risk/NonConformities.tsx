import React, { useState } from 'react';
import { NonConformity, Capa } from './RiskMockData';
import { AlertTriangle, Plus, Search, FileText, ArrowRight, X } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';

export default function NonConformities({ 
  ncs, 
  onAddNC, 
  onAddCapa, 
  onUpdateNCStatus 
}: { 
  ncs: NonConformity[]; 
  onAddNC: (newNC: NonConformity) => void;
  onAddCapa: (newCapa: Capa) => void;
  onUpdateNCStatus: (id: string, status: any) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNcModalOpen, setIsNcModalOpen] = useState(false);
  const [isCapaModalOpen, setIsCapaModalOpen] = useState(false);
  const [selectedNc, setSelectedNc] = useState<NonConformity | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<NonConformity['severity'] | 'ALL'>('ALL');
  const { success: toastSuccess } = useToast();

  const [selectedDetail, setSelectedDetail] = useState<NonConformity | null>(null);

  const [ncFormData, setNcFormData] = useState({
    description: '',
    source: 'PROCESS_CHECK' as any,
    department: '',
    severity: 'MINOR' as any,
    initialCause: '',
    owner: '',
    responseDeadline: '',
  });

  const [capaFormData, setCapaFormData] = useState({
    correctiveAction: '',
    preventiveAction: '',
    owner: '',
    deadline: '',
  });

  const filteredNcs = ncs.filter(nc => 
    (nc.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    nc.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterSeverity === 'ALL' || nc.severity === filterSeverity)
  );

  const getSeverityStyle = (severity: NonConformity['severity']) => {
    switch (severity) {
      case 'MINOR': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MAJOR': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRITICAL': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusBadge = (status: NonConformity['status']) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700';
      case 'ROOT_CAUSE_ANALYSIS': return 'bg-purple-100 text-purple-700';
      case 'WAITING_CAPA': return 'bg-orange-100 text-orange-700';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700';
      case 'WAITING_VERIFICATION': return 'bg-indigo-100 text-indigo-700';
      case 'CLOSED': return 'bg-emerald-100 text-emerald-700';
      case 'RECURRING': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleCreateNc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ncFormData.description || !ncFormData.department || !ncFormData.owner) return;

    const newCode = `NC-260${ncs.length + 1}`;
    const newNC: NonConformity = {
      id: `nc_${Date.now()}`,
      code: newCode,
      source: ncFormData.source,
      department: ncFormData.department,
      description: ncFormData.description,
      evidence: 'Ghi nhận trực tiếp từ kiểm tra giám sát',
      severity: ncFormData.severity,
      initialCause: ncFormData.initialCause || 'Đang phân tích',
      owner: ncFormData.owner,
      responseDeadline: ncFormData.responseDeadline || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'NEW',
      timeline: [
        {
          id: `tl_${Date.now()}`,
          action: 'Ghi nhận điểm không phù hợp (NC) mới',
          by: 'Hệ thống KSNB',
          at: new Date().toISOString()
        }
      ]
    };

    onAddNC(newNC);
    setIsNcModalOpen(false);
    // Reset Form
    setNcFormData({
      description: '',
      source: 'PROCESS_CHECK',
      department: '',
      severity: 'MINOR',
      initialCause: '',
      owner: '',
      responseDeadline: '',
    });
    toastSuccess('Ghi nhận NC thành công', `Đã ghi nhận điểm không phù hợp ${newCode}.`);
  };

  const handleOpenCapaModal = (nc: NonConformity) => {
    setSelectedNc(nc);
    setCapaFormData({
      correctiveAction: '',
      preventiveAction: '',
      owner: nc.owner,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setIsCapaModalOpen(true);
  };

  const handleCreateCapa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNc || !capaFormData.correctiveAction || !capaFormData.owner) return;

    const capaCode = `CAPA-26-0${Math.floor(Math.random() * 90) + 10}`;
    const newCapa: Capa = {
      id: `capa_${Date.now()}`,
      code: capaCode,
      ncId: selectedNc.id,
      source: `NC ${selectedNc.code}`,
      problemDescription: selectedNc.description,
      rootCause: selectedNc.initialCause || 'Phân tích nguyên nhân sâu',
      correctiveAction: capaFormData.correctiveAction,
      preventiveAction: capaFormData.preventiveAction || 'Chưa thiết lập hành động phòng ngừa',
      owner: capaFormData.owner,
      department: selectedNc.department,
      startDate: new Date().toISOString().split('T')[0],
      deadline: capaFormData.deadline,
      status: 'IN_PROGRESS',
      timeline: [
        {
          id: `tl_${Date.now()}`,
          action: 'Thiết lập kế hoạch hành động khắc phục CAPA',
          by: selectedNc.owner,
          at: new Date().toISOString()
        }
      ]
    };

    onAddCapa(newCapa);
    onUpdateNCStatus(selectedNc.id, 'IN_PROGRESS');
    setIsCapaModalOpen(false);
    setSelectedNc(null);
    toastSuccess('Thiết lập CAPA thành công', `Đã tạo kế hoạch khắc phục ${capaCode} cho NC ${selectedNc.code}.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm mã NC, mô tả..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
            />
          </div>
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
          >
            <option value="ALL">Tất cả mức độ</option>
            <option value="MINOR">Minor</option>
            <option value="MAJOR">Major</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
        <button 
          onClick={() => setIsNcModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
        >
          <Plus className="w-4 h-4" /> Ghi nhận NC
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredNcs.map(nc => (
          <div key={nc.id} onClick={() => setSelectedDetail(nc)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="font-mono text-xs font-black text-slate-700 dark:text-slate-300">{nc.code}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getSeverityStyle(nc.severity)}`}>{nc.severity}</span>
            </div>
            
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-snug">{nc.description}</p>
            
            <div className="text-[11px] text-slate-500 space-y-1.5 mb-4 flex-1">
              <div className="flex justify-between">
                <span>Nguồn: <strong className="text-slate-700 dark:text-slate-300">{nc.source}</strong></span>
                <span>BP: <strong className="text-slate-700 dark:text-slate-300">{nc.department}</strong></span>
              </div>
              <div className="truncate">Nguyên nhân sơ bộ: {nc.initialCause}</div>
              <div className="text-slate-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Hạn phản hồi: <strong className={new Date(nc.responseDeadline) < new Date() && nc.status !== 'CLOSED' ? 'text-rose-600 font-bold' : ''}>{nc.responseDeadline}</strong>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-auto">
              <span className={`px-2 py-1 rounded text-[10px] font-bold ${getStatusBadge(nc.status)}`}>{nc.status.replace(/_/g, ' ')}</span>
              {['WAITING_CAPA', 'ROOT_CAUSE_ANALYSIS', 'NEW'].includes(nc.status) ? (
                <button 
                  onClick={() => handleOpenCapaModal(nc)}
                  className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 px-2.5 py-1.5 rounded-lg border-0 cursor-pointer transition-colors"
                >
                  Lập CAPA <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <button className="text-[10px] font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 bg-transparent border-0">
                  <FileText className="w-3 h-3" /> Chi tiết
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* NC Modal Form */}
      {isNcModalOpen && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl p-6 relative animate-slide-in">
            <button 
              type="button" 
              onClick={() => setIsNcModalOpen(false)}
              className="absolute right-4 top-4 h-8 w-8 rounded-full flex items-center justify-center text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-rose-750">Ghi nhận điểm không phù hợp (NC)</h3>

            <form onSubmit={handleCreateNc} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-500 font-bold mb-1">Mô tả sự không phù hợp *</label>
                  <textarea 
                    required 
                    value={ncFormData.description} 
                    onChange={e => setNcFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả sự sai lệch so với quy trình, tiêu chuẩn quy định"
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Nguồn phát sinh</label>
                  <select 
                    value={ncFormData.source} 
                    onChange={e => setNcFormData(prev => ({ ...prev, source: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
                  >
                    <option value="PROCESS_CHECK">Giám sát quy trình</option>
                    <option value="AUDIT">Đánh giá nội bộ</option>
                    <option value="PARENT_COMPLAINT">Ý kiến phụ huynh</option>
                    <option value="FACILITY_INCIDENT">Sự cố thiết bị/CSVC</option>
                    <option value="BOARD_DIRECTIVE">Chỉ đạo BGH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Mức độ nghiêm trọng</label>
                  <select 
                    value={ncFormData.severity} 
                    onChange={e => setNcFormData(prev => ({ ...prev, severity: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
                  >
                    <option value="MINOR">Minor (Nhẹ)</option>
                    <option value="MAJOR">Major (Nặng)</option>
                    <option value="CRITICAL">Critical (Khẩn cấp)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Bộ phận vi phạm *</label>
                  <input 
                    type="text" 
                    required 
                    value={ncFormData.department} 
                    onChange={e => setNcFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Bộ phận để xảy ra lỗi"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Người chịu trách nhiệm giải trình *</label>
                  <input 
                    type="text" 
                    required 
                    value={ncFormData.owner} 
                    onChange={e => setNcFormData(prev => ({ ...prev, owner: e.target.value }))}
                    placeholder="Chủ biên giải trình NC"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 font-bold mb-1">Nguyên nhân sơ bộ</label>
                  <input 
                    type="text" 
                    value={ncFormData.initialCause} 
                    onChange={e => setNcFormData(prev => ({ ...prev, initialCause: e.target.value }))}
                    placeholder="Nguyên nhân ban đầu tự xác định"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Hạn phản hồi giải trình</label>
                  <input 
                    type="date" 
                    value={ncFormData.responseDeadline} 
                    onChange={e => setNcFormData(prev => ({ ...prev, responseDeadline: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsNcModalOpen(false)}
                  className="px-4 py-2 bg-slate-150 text-slate-650 hover:bg-slate-200 rounded-xl font-bold transition-colors dark:bg-slate-800 dark:text-slate-300"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-sm"
                >
                  Lưu & Ghi nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CAPA Form Modal */}
      {isCapaModalOpen && selectedNc && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl p-6 relative animate-slide-in">
            <button 
              type="button" 
              onClick={() => setIsCapaModalOpen(false)}
              className="absolute right-4 top-4 h-8 w-8 rounded-full flex items-center justify-center text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wider text-rose-750">Lập kế hoạch CAPA</h3>
            <p className="text-[11px] text-slate-500 mb-4 font-medium">Ref: NC {selectedNc.code} - {selectedNc.description}</p>

            <form onSubmit={handleCreateCapa} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-500 font-bold mb-1">Hành động khắc phục tức thời (Corrective Action) *</label>
                  <textarea 
                    required 
                    value={capaFormData.correctiveAction} 
                    onChange={e => setCapaFormData(prev => ({ ...prev, correctiveAction: e.target.value }))}
                    placeholder="Các hành động cần làm ngay để xử lý triệt để hậu quả sai sót"
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 font-bold mb-1">Biện pháp phòng ngừa tái diễn (Preventive Action)</label>
                  <textarea 
                    value={capaFormData.preventiveAction} 
                    onChange={e => setCapaFormData(prev => ({ ...prev, preventiveAction: e.target.value }))}
                    placeholder="Thay đổi quy trình/chốt chặn thiết lập để ngăn ngừa lỗi lặp lại trong tương lai"
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Người chịu trách nhiệm triển khai *</label>
                  <input 
                    type="text" 
                    required 
                    value={capaFormData.owner} 
                    onChange={e => setCapaFormData(prev => ({ ...prev, owner: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Thời hạn hoàn thành kế hoạch *</label>
                  <input 
                    type="date" 
                    required 
                    value={capaFormData.deadline} 
                    onChange={e => setCapaFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsCapaModalOpen(false)}
                  className="px-4 py-2 bg-slate-150 text-slate-650 hover:bg-slate-200 rounded-xl font-bold transition-colors dark:bg-slate-800 dark:text-slate-300"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-sm"
                >
                  Duyệt & Ban hành CAPA
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
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nội dung chi tiết:</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedDetail.description}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Hướng xử lý / Nguyên nhân sơ bộ:</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedDetail.initialCause || 'Chưa có thông tin'}
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
