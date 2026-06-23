import React, { useState } from 'react';
import { Capa, NonConformity, CapaStatus } from './RiskMockData';
import { CheckCircle2, XCircle, Search, Clock, Plus, X } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';

interface CapaManagementProps {
  capas: Capa[];
  ncs: NonConformity[];
  onAddCapa: (newCapa: Capa) => void;
  onUpdateCapaStatus: (id: string, status: CapaStatus, extra?: Partial<Capa>) => void;
}

export default function CapaManagement({ capas, ncs, onAddCapa, onUpdateCapaStatus }: CapaManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { success: toastSuccess } = useToast();

  // Modals state
  const [isAddCapaOpen, setIsAddCapaOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [selectedCapa, setSelectedCapa] = useState<Capa | null>(null);

  // Form state
  const [newCapaForm, setNewCapaForm] = useState({
    ncId: '',
    source: 'Ghi nhận trực tiếp',
    problemDescription: '',
    rootCause: '',
    correctiveAction: '',
    preventiveAction: '',
    owner: '',
    department: '',
    deadline: '',
  });

  // Verify form state
  const [verifyForm, setVerifyForm] = useState({
    verifyResult: 'EFFECTIVE' as 'EFFECTIVE' | 'INEFFECTIVE',
    verifyConclusion: '',
    verifier: 'Ban Kiểm soát Nội bộ',
  });

  const filteredCapas = capas.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.problemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: Capa['status']) => {
    switch (status) {
      case 'NEW': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ANALYZING': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'OVERDUE': return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'WAITING_VERIFICATION': return 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse';
      case 'EFFECTIVE': return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'INEFFECTIVE': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleAddCapa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCapaForm.problemDescription || !newCapaForm.correctiveAction || !newCapaForm.owner || !newCapaForm.department) {
      return;
    }

    const codeNumber = capas.length + 1;
    const newCapa: Capa = {
      id: `capa_${Date.now()}`,
      code: `CAPA-26-${codeNumber < 10 ? '0' + codeNumber : codeNumber}`,
      ncId: newCapaForm.ncId || 'N/A',
      source: newCapaForm.source,
      problemDescription: newCapaForm.problemDescription,
      rootCause: newCapaForm.rootCause || 'Đang phân tích',
      correctiveAction: newCapaForm.correctiveAction,
      preventiveAction: newCapaForm.preventiveAction || 'Đang thiết lập',
      owner: newCapaForm.owner,
      department: newCapaForm.department,
      startDate: new Date().toISOString().split('T')[0],
      deadline: newCapaForm.deadline || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'NEW',
      timeline: [
        {
          id: `tl_${Date.now()}`,
          action: 'Tạo phiếu CAPA mới',
          by: 'Hệ thống KSNB',
          at: new Date().toISOString(),
        }
      ]
    };

    onAddCapa(newCapa);
    setIsAddCapaOpen(false);
    toastSuccess('Tạo hành động khắc phục phòng ngừa (CAPA) thành công!');
    setNewCapaForm({
      ncId: '',
      source: 'Ghi nhận trực tiếp',
      problemDescription: '',
      rootCause: '',
      correctiveAction: '',
      preventiveAction: '',
      owner: '',
      department: '',
      deadline: '',
    });
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCapa) return;

    onUpdateCapaStatus(selectedCapa.id, verifyForm.verifyResult, {
      verifier: verifyForm.verifier,
      verifyConclusion: verifyForm.verifyConclusion,
      verifyDate: new Date().toISOString().split('T')[0],
    });

    setIsVerifyOpen(false);
    toastSuccess(`Xác minh CAPA thành công: Trạng thái ${verifyForm.verifyResult === 'EFFECTIVE' ? 'Hiệu quả' : 'Không hiệu quả'}`);
    setVerifyForm({
      verifyResult: 'EFFECTIVE',
      verifyConclusion: '',
      verifier: 'Ban Kiểm soát Nội bộ',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm mã CAPA, mô tả..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none focus:border-rose-500"
          />
        </div>
        <button 
          onClick={() => setIsAddCapaOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tạo CAPA
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-black uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Mã CAPA</th>
                <th className="px-4 py-3">Nguồn / Vấn đề</th>
                <th className="px-4 py-3">Hành động khắc phục (CA)</th>
                <th className="px-4 py-3">Phụ trách</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Xác minh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCapas.map(capa => {
                const isOverdue = new Date(capa.deadline) < new Date() && !['CLOSED', 'EFFECTIVE'].includes(capa.status);
                
                return (
                  <tr key={capa.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono font-black text-slate-700 dark:text-slate-300">{capa.code}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Ref NC: {capa.ncId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white max-w-[200px] truncate" title={capa.problemDescription}>
                        {capa.problemDescription}
                      </div>
                      <div className="text-[10px] text-slate-500">Từ: {capa.source}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2" title={capa.correctiveAction}>
                        {capa.correctiveAction}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">{capa.owner}</div>
                      <div className="text-[10px] text-slate-400">{capa.department}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                        {isOverdue && <Clock className="w-3 h-3 text-rose-500 animate-pulse" />}
                        {capa.deadline}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded border text-[10px] font-bold tracking-wide ${getStatusStyle(isOverdue && capa.status !== 'OVERDUE' ? 'OVERDUE' : capa.status)}`}>
                        {(isOverdue && capa.status !== 'OVERDUE' ? 'OVERDUE' : capa.status).replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {capa.status === 'WAITING_VERIFICATION' ? (
                        <button 
                          onClick={() => {
                            setSelectedCapa(capa);
                            setIsVerifyOpen(true);
                          }}
                          className="flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 font-bold border border-indigo-200 transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Duyệt
                        </button>
                      ) : capa.status === 'EFFECTIVE' ? (
                        <div className="text-[10px] text-emerald-600 font-bold flex flex-col gap-0.5">
                          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Đạt hiệu quả</span>
                          {capa.verifier && <span className="text-[8px] text-slate-400 font-normal">Xác minh: {capa.verifier}</span>}
                        </div>
                      ) : capa.status === 'INEFFECTIVE' ? (
                        <div className="text-[10px] text-rose-600 font-bold flex flex-col gap-0.5">
                          <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-rose-500" /> Ko hiệu quả</span>
                          {capa.verifier && <span className="text-[8px] text-slate-400 font-normal">Xác minh: {capa.verifier}</span>}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredCapas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Không tìm thấy hành động CAPA nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CREATE CAPA */}
      {isAddCapaOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">Ghi nhận hành động CAPA mới</h3>
                <p className="text-[10px] text-rose-200">Khắc phục & Phòng ngừa sự cố, rủi ro, điểm không phù hợp</p>
              </div>
              <button onClick={() => setIsAddCapaOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddCapa} className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mã điểm KPH liên quan</label>
                  <select 
                    value={newCapaForm.ncId}
                    onChange={e => {
                      const selected = ncs.find(nc => nc.id === e.target.value);
                      setNewCapaForm(prev => ({
                        ...prev,
                        ncId: e.target.value,
                        problemDescription: selected ? selected.description : prev.problemDescription,
                        department: selected ? selected.department : prev.department,
                        owner: selected ? selected.owner : prev.owner,
                        source: selected ? `NC: ${selected.code}` : prev.source,
                      }));
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                  >
                    <option value="">-- Không liên quan NC --</option>
                    {ncs.map(nc => (
                      <option key={nc.id} value={nc.id}>[{nc.code}] - {nc.description.substring(0, 40)}...</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nguồn phát hiện</label>
                  <input 
                    type="text" 
                    value={newCapaForm.source}
                    onChange={e => setNewCapaForm(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                    placeholder="Ví dụ: Đánh giá nội bộ, Phản ánh..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mô tả vấn đề / lỗi</label>
                <textarea 
                  value={newCapaForm.problemDescription}
                  onChange={e => setNewCapaForm(prev => ({ ...prev, problemDescription: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500 min-h-[60px]"
                  placeholder="Mô tả chi tiết sự cố hoặc điểm không phù hợp cần khắc phục"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hành động khắc phục (CA)</label>
                  <textarea 
                    value={newCapaForm.correctiveAction}
                    onChange={e => setNewCapaForm(prev => ({ ...prev, correctiveAction: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500 min-h-[60px]"
                    placeholder="Hành động xử lý tức thời để khắc phục hậu quả"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hành động phòng ngừa (PA)</label>
                  <textarea 
                    value={newCapaForm.preventiveAction}
                    onChange={e => setNewCapaForm(prev => ({ ...prev, preventiveAction: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500 min-h-[60px]"
                    placeholder="Hành động cải tiến quy trình để tránh lặp lại"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phòng ban</label>
                  <input 
                    type="text" 
                    value={newCapaForm.department}
                    onChange={e => setNewCapaForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                    placeholder="Phòng Ban"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Người phụ trách</label>
                  <input 
                    type="text" 
                    value={newCapaForm.owner}
                    onChange={e => setNewCapaForm(prev => ({ ...prev, owner: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                    placeholder="Tên người phụ trách"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Thời hạn hoàn thành</label>
                  <input 
                    type="date" 
                    value={newCapaForm.deadline}
                    onChange={e => setNewCapaForm(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddCapaOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Lưu phiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VERIFY CAPA */}
      {isVerifyOpen && selectedCapa && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">Xác minh hiệu quả CAPA</h3>
                <p className="text-[10px] text-rose-200">Đánh giá và đóng phiếu CAPA mã {selectedCapa.code}</p>
              </div>
              <button onClick={() => setIsVerifyOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleVerifySubmit} className="p-5 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-400">VẤN ĐỀ CẦN XỬ LÝ:</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{selectedCapa.problemDescription}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-2">HÀNH ĐỘNG KHẮC PHỤC ĐÃ THỰC HIỆN:</div>
                <div className="text-xs text-slate-700 dark:text-slate-300">{selectedCapa.correctiveAction}</div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Đánh giá kết quả hành động</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVerifyForm(prev => ({ ...prev, verifyResult: 'EFFECTIVE' }))}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      verifyForm.verifyResult === 'EFFECTIVE'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 mb-1" />
                    <span className="text-xs">Hiệu quả (Effective)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyForm(prev => ({ ...prev, verifyResult: 'INEFFECTIVE' }))}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      verifyForm.verifyResult === 'INEFFECTIVE'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 font-bold ring-2 ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500'
                    }`}
                  >
                    <XCircle className="w-5 h-5 mb-1" />
                    <span className="text-xs">Không hiệu quả</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kết luận xác minh chi tiết</label>
                <textarea 
                  value={verifyForm.verifyConclusion}
                  onChange={e => setVerifyForm(prev => ({ ...prev, verifyConclusion: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500 min-h-[80px]"
                  placeholder="Ghi rõ bằng chứng chứng minh tính hiệu quả hoặc nguyên nhân không đạt yêu cầu..."
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Người xác minh</label>
                <input 
                  type="text" 
                  value={verifyForm.verifier}
                  onChange={e => setVerifyForm(prev => ({ ...prev, verifier: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsVerifyOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-colors shadow-sm ${
                    verifyForm.verifyResult === 'EFFECTIVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Xác nhận duyệt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
