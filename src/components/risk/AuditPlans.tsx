import React, { useState } from 'react';
import { AuditPlan, AuditChecklistItem, NonConformity } from './RiskMockData';
import { CheckCircle2, XCircle, Search, Calendar, Users, Eye, Plus, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';

export default function AuditPlans({ 
  plans, 
  onAddPlan, 
  onUpdatePlan,
  onAddNC 
}: { 
  plans: AuditPlan[]; 
  onAddPlan: (newPlan: AuditPlan) => void;
  onUpdatePlan: (id: string, updated: Partial<AuditPlan>) => void;
  onAddNC: (newNC: any) => void;
}) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<AuditPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    scope: 'SCHOOL' as any,
    startDate: '',
    endDate: '',
    leadAuditor: '',
    auditedDepartment: '',
    criteria: '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.leadAuditor || !formData.auditedDepartment) return;

    const newCode = `AUD-2026-0${plans.length + 1}`;
    const newPlan: AuditPlan = {
      id: `ap_${Date.now()}`,
      code: newCode,
      name: formData.name,
      scope: formData.scope,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.endDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      leadAuditor: formData.leadAuditor,
      auditors: [],
      auditedDepartment: formData.auditedDepartment,
      criteria: formData.criteria || 'Quy chế chất lượng trường học',
      status: 'APPROVED',
      checklist: [
        { id: `cl_${Date.now()}_1`, group: 'Quy trình vận hành', content: 'Có kiểm soát đầu vào hồ sơ học sinh/nhân sự', result: 'PENDING', createCapa: false },
        { id: `cl_${Date.now()}_2`, group: 'An toàn phòng chống dịch', content: 'Tủ thuốc y tế và thiết bị sơ cứu đầy đủ', result: 'PENDING', createCapa: false },
        { id: `cl_${Date.now()}_3`, group: 'Cơ sở vật chất', content: 'Kiểm định chất lượng phòng học đa năng', result: 'PENDING', createCapa: false }
      ],
      timeline: [
        {
          id: `tl_${Date.now()}`,
          action: 'Thiết lập kế hoạch đánh giá nội bộ',
          by: 'Trưởng ban KSNB',
          at: new Date().toISOString()
        }
      ]
    };

    onAddPlan(newPlan);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      name: '',
      scope: 'SCHOOL',
      startDate: '',
      endDate: '',
      leadAuditor: '',
      auditedDepartment: '',
      criteria: '',
    });
    toastSuccess('Tạo kế hoạch đánh giá thành công', `Kế hoạch ${newCode} đã được duyệt áp dụng.`);
  };

  const handleCreateCapa = (item: AuditChecklistItem) => {
    if (!activePlan) return;
    
    const ncCode = `NC-260${Math.floor(Math.random() * 900) + 100}`;
    const newNC = {
      id: `nc_${Date.now()}`,
      code: ncCode,
      source: 'AUDIT' as any,
      department: activePlan.auditedDepartment,
      description: `Không đạt tiêu chí kiểm định: ${item.content} (Phát hiện trong cuộc đánh giá ${activePlan.code})`,
      evidence: item.evidence || 'Phát hiện tại thực tế cuộc đánh giá',
      severity: (item.severityIfFail || 'MINOR') as any,
      initialCause: 'Chưa phân tích nguyên nhân sâu',
      owner: activePlan.leadAuditor,
      responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'WAITING_CAPA' as any,
      timeline: [
        {
          id: `tl_${Date.now()}`,
          action: 'Ghi nhận sự điểm không phù hợp (NC) từ kết quả Đánh giá nội bộ',
          by: activePlan.leadAuditor,
          at: new Date().toISOString()
        }
      ]
    };

    onAddNC(newNC);
    
    // Update checklist item to show CAPA has been requested
    const updatedChecklist = activePlan.checklist.map(cl => 
      cl.id === item.id ? { ...cl, createCapa: false } : cl
    );
    onUpdatePlan(activePlan.id, { checklist: updatedChecklist });

    toastSuccess('Yêu cầu CAPA thành công', `Đã ghi nhận điểm không phù hợp ${ncCode} cho phòng ban.`);
  };

  const handleCompleteAudit = () => {
    if (!activePlan) return;
    onUpdatePlan(activePlan.id, { status: 'COMPLETED' });
    toastSuccess('Hoàn tất đánh giá', `Báo cáo đánh giá ${activePlan.code} đã được đóng hồ sơ.`);
  };

  const handleExportPDF = () => {
    if (!activePlan) return;
    toastSuccess('Xuất file thành công', `Đang tải báo cáo PDF cho cuộc đánh giá ${activePlan.code}...`);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kế hoạch & Chương trình đánh giá</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Tạo kế hoạch
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: List of Plans */}
        <div className={`lg:col-span-${selectedPlan ? '5' : '12'} space-y-3`}>
          {plans.map(plan => (
            <div 
              key={plan.id}
              onClick={() => {
                setSelectedPlan(plan.id === selectedPlan ? null : plan.id);
                setSelectedDetail(plan);
              }}
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
                        
                        {item.result === 'FAIL' && (
                          <button 
                            onClick={() => handleCreateCapa(item)}
                            className="text-[10px] font-bold text-rose-650 hover:text-rose-700 underline flex items-center gap-1 border-0 bg-transparent"
                          >
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
              <button onClick={handleExportPDF} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold rounded-xl dark:bg-slate-800 dark:text-slate-350">Xuất báo cáo PDF</button>
              <button onClick={handleCompleteAudit} disabled={activePlan.status === 'COMPLETED'} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl disabled:opacity-40">Hoàn tất đánh giá</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl p-6 relative animate-slide-in">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 h-8 w-8 rounded-full flex items-center justify-center text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-rose-750">Thiết lập Đợt Đánh giá mới</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-500 font-bold mb-1">Tên chương trình đánh giá *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ví dụ: Đánh giá chất lượng vận hành nội bộ Quý 2"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Phạm vi đánh giá</label>
                  <select 
                    value={formData.scope} 
                    onChange={e => setFormData(prev => ({ ...prev, scope: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
                  >
                    <option value="SCHOOL">Toàn trường (School-wide)</option>
                    <option value="DEPARTMENT">Theo phòng ban</option>
                    <option value="PROCESS">Theo quy trình nghiệp vụ</option>
                    <option value="FACILITY">Cơ sở vật chất & Thiết bị</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Tiêu chuẩn kiểm định</label>
                  <input 
                    type="text" 
                    value={formData.criteria} 
                    onChange={e => setFormData(prev => ({ ...prev, criteria: e.target.value }))}
                    placeholder="Ví dụ: ISO 9001:2015, Quy chế học đường"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Trưởng đoàn đánh giá *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.leadAuditor} 
                    onChange={e => setFormData(prev => ({ ...prev, leadAuditor: e.target.value }))}
                    placeholder="Tên trưởng đoàn"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Đơn vị được đánh giá *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.auditedDepartment} 
                    onChange={e => setFormData(prev => ({ ...prev, auditedDepartment: e.target.value }))}
                    placeholder="Phòng ban / Bộ phận chịu rà soát"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Ngày bắt đầu</label>
                  <input 
                    type="date" 
                    value={formData.startDate} 
                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Ngày kết thúc dự kiến</label>
                  <input 
                    type="date" 
                    value={formData.endDate} 
                    onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-150 text-slate-650 hover:bg-slate-200 rounded-xl font-bold transition-colors dark:bg-slate-800 dark:text-slate-300"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-sm"
                >
                  Lưu & Duyệt Kế hoạch
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
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nội dung / Phạm vi:</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                  <strong>Kế hoạch:</strong> {selectedDetail.name}
                  <br/>
                  <strong>Phạm vi:</strong> {selectedDetail.scope}
                  <br/>
                  <strong>Tiêu chuẩn:</strong> {selectedDetail.criteria}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Hướng xử lý / Trạng thái:</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                  Đánh giá gồm <strong>{selectedDetail.checklist.length}</strong> tiêu chí.
                  <br/><br/>
                  Trạng thái hiện tại: <strong>{selectedDetail.status}</strong>
                  <br/>
                  <em>(Chi tiết các tiêu chí được hiển thị ở khung bên phải màn hình)</em>
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
