import React, { useState } from 'react';
import { Incident, NonConformity, NCSeverity, NCSource } from './RiskMockData';
import { AlertOctagon, MessageSquare, ArrowRight, User, Plus, X } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';

interface IncidentsProps {
  incidents: Incident[];
  onAddIncident: (newIncident: Incident) => void;
  onConvertToNC: (newNC: NonConformity) => void;
  onUpdateIncidentStatus: (id: string, status: Incident['status']) => void;
}

export default function Incidents({ 
  incidents, 
  onAddIncident, 
  onConvertToNC, 
  onUpdateIncidentStatus 
}: IncidentsProps) {
  const { success: toastSuccess } = useToast();
  
  // Modals state
  const [isAddIncidentOpen, setIsAddIncidentOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<Incident | null>(null);

  // Add Incident Form state
  const [incidentForm, setIncidentForm] = useState({
    source: 'Hotline',
    reporter: '',
    content: '',
    impact: 'MEDIUM' as Incident['impact'],
    department: '',
    owner: '',
  });

  // Convert to NC Form state
  const [convertForm, setConvertForm] = useState({
    description: '',
    source: 'FACILITY_INCIDENT' as NCSource,
    department: '',
    severity: 'MINOR' as NCSeverity,
    initialCause: '',
    owner: '',
    responseDeadline: '',
  });

  const getImpactBadge = (impact: Incident['impact']) => {
    switch (impact) {
      case 'CRITICAL': return 'bg-rose-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-amber-400 text-white';
      case 'LOW': return 'bg-emerald-400 text-white';
      default: return 'bg-slate-300 text-white';
    }
  };

  const getStatusBadge = (status: Incident['status']) => {
    switch (status) {
      case 'OPEN': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'INVESTIGATING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'RESOLVED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleAddIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentForm.reporter || !incidentForm.content || !incidentForm.department || !incidentForm.owner) {
      return;
    }

    const codeNumber = incidents.length + 1;
    const newIncident: Incident = {
      id: `inc_${Date.now()}`,
      code: `INC-26${codeNumber < 10 ? '0' + codeNumber : codeNumber}`,
      source: incidentForm.source,
      reporter: incidentForm.reporter,
      content: incidentForm.content,
      impact: incidentForm.impact,
      department: incidentForm.department,
      owner: incidentForm.owner,
      status: 'OPEN',
      createRiskOrCapa: true,
      timeline: [
        {
          id: `tl_${Date.now()}`,
          action: 'Ghi nhận phản ánh/sự cố mới',
          by: incidentForm.reporter,
          at: new Date().toISOString()
        }
      ]
    };

    onAddIncident(newIncident);
    setIsAddIncidentOpen(false);
    toastSuccess(`Báo cáo sự cố ${newIncident.code} thành công!`);

    // Reset Form
    setIncidentForm({
      source: 'Hotline',
      reporter: '',
      content: '',
      impact: 'MEDIUM',
      department: '',
      owner: '',
    });
  };

  const handleOpenConvert = (inc: Incident) => {
    setSelectedIncident(inc);
    
    // Map impact to severity
    let mappedSeverity: NCSeverity = 'MINOR';
    if (inc.impact === 'CRITICAL') mappedSeverity = 'CRITICAL';
    else if (inc.impact === 'HIGH') mappedSeverity = 'MAJOR';

    // Map source
    let mappedSource: NCSource = 'FACILITY_INCIDENT';
    if (inc.source.toLowerCase().includes('facebook') || inc.source.toLowerCase().includes('phụ huynh')) {
      mappedSource = 'PARENT_COMPLAINT';
    }

    setConvertForm({
      description: `[Sự cố ${inc.code}] ${inc.content}`,
      source: mappedSource,
      department: inc.department,
      severity: mappedSeverity,
      initialCause: 'Chưa xác định nguyên nhân gốc rễ',
      owner: inc.owner,
      responseDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setIsConvertOpen(true);
  };

  const handleConvertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;

    const ncCode = `NC-260${Date.now().toString().slice(-3)}`;
    const newNC: NonConformity = {
      id: `nc_${Date.now()}`,
      code: ncCode,
      source: convertForm.source,
      department: convertForm.department,
      description: convertForm.description,
      evidence: `Biên bản ghi nhận sự cố ${selectedIncident.code}`,
      severity: convertForm.severity,
      initialCause: convertForm.initialCause,
      owner: convertForm.owner,
      responseDeadline: convertForm.responseDeadline,
      status: 'NEW',
      relatedRiskId: selectedIncident.relatedRiskId || undefined,
      timeline: [
        {
          id: `tl_${Date.now()}`,
          action: `Chuyển đổi từ Sự cố ${selectedIncident.code}`,
          by: 'Hệ thống KSNB',
          at: new Date().toISOString()
        }
      ]
    };

    // Add to NC list
    onConvertToNC(newNC);
    // Update incident status to RESOLVED/CLOSED
    onUpdateIncidentStatus(selectedIncident.id, 'RESOLVED');

    setIsConvertOpen(false);
    toastSuccess(`Đã chuyển đổi sự cố ${selectedIncident.code} thành điểm KPH ${ncCode}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Phản ánh & Sự cố</h3>
        <button 
          onClick={() => setIsAddIncidentOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Báo cáo sự cố
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-black uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Nguồn / Người báo</th>
                <th className="px-4 py-3">Nội dung sự việc</th>
                <th className="px-4 py-3 text-center">Tác động</th>
                <th className="px-4 py-3">Phụ trách xử lý</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {incidents.map(inc => (
                <tr key={inc.id} onClick={() => setSelectedDetail(inc)} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono font-black text-slate-500">{inc.code}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-0.5">
                      {inc.source.toLowerCase().includes('facebook') ? <MessageSquare className="w-3 h-3 text-blue-500" /> : <User className="w-3 h-3 text-slate-400" />}
                      {inc.source}
                    </div>
                    <div className="text-[11px] text-slate-500">{inc.reporter}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-white">{inc.content}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Liên quan: {inc.department}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider ${getImpactBadge(inc.impact)}`}>{inc.impact}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{inc.owner}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded border text-[10px] font-bold ${getStatusBadge(inc.status)}`}>{inc.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {['OPEN', 'INVESTIGATING'].includes(inc.status) && (
                      <button 
                        onClick={() => handleOpenConvert(inc)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1.5 rounded-lg border border-rose-100 transition-colors"
                      >
                        <AlertOctagon className="w-3 h-3 text-rose-500" /> Thành NC/CAPA <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {incidents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Không có sự cố nào được ghi nhận</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REPORT INCIDENT */}
      {isAddIncidentOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">Báo cáo phản ánh / Sự cố mới</h3>
                <p className="text-[10px] text-rose-200">Ghi nhận phản hồi từ khách hàng hoặc sự cố vận hành</p>
              </div>
              <button onClick={() => setIsAddIncidentOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddIncidentSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nguồn sự cố</label>
                  <select 
                    value={incidentForm.source}
                    onChange={e => setIncidentForm(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                  >
                    <option value="Hotline">Hotline / Call Center</option>
                    <option value="Facebook">Mạng xã hội / Facebook</option>
                    <option value="Giáo viên">Giáo viên báo cáo</option>
                    <option value="Giám thị">Giám thị báo cáo</option>
                    <option value="Khác">Nguồn khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Người báo cáo</label>
                  <input 
                    type="text" 
                    value={incidentForm.reporter}
                    onChange={e => setIncidentForm(prev => ({ ...prev, reporter: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                    placeholder="Tên phụ huynh, GV, NV..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nội dung sự việc</label>
                <textarea 
                  value={incidentForm.content}
                  onChange={e => setIncidentForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500 min-h-[60px]"
                  placeholder="Mô tả tóm tắt nội dung phản ánh hoặc sự cố xảy ra..."
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mức độ tác động</label>
                <select 
                  value={incidentForm.impact}
                  onChange={e => setIncidentForm(prev => ({ ...prev, impact: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                >
                  <option value="LOW">Thấp (Low)</option>
                  <option value="MEDIUM">Trung bình (Medium)</option>
                  <option value="HIGH">Cao (High)</option>
                  <option value="CRITICAL">Nghiêm trọng (Critical)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bộ phận liên quan</label>
                  <input 
                    type="text" 
                    value={incidentForm.department}
                    onChange={e => setIncidentForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                    placeholder="Ví dụ: Bếp, Y tế, CSVC..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Người phụ trách xử lý</label>
                  <input 
                    type="text" 
                    value={incidentForm.owner}
                    onChange={e => setIncidentForm(prev => ({ ...prev, owner: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                    placeholder="Tên người phụ trách"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddIncidentOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONVERT INCIDENT TO NC */}
      {isConvertOpen && selectedIncident && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">Chuyển thành Điểm KPH (NC)</h3>
                <p className="text-[10px] text-rose-200">Đưa sự việc {selectedIncident.code} vào quy trình KSNB</p>
              </div>
              <button onClick={() => setIsConvertOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConvertSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mô tả điểm không phù hợp (NC)</label>
                <textarea 
                  value={convertForm.description}
                  onChange={e => setConvertForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500 min-h-[60px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phân loại nguồn NC</label>
                  <select 
                    value={convertForm.source}
                    onChange={e => setConvertForm(prev => ({ ...prev, source: e.target.value as NCSource }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                  >
                    <option value="FACILITY_INCIDENT">Sự cố cơ sở vật chất</option>
                    <option value="STUDENT_INCIDENT">Sự cố liên quan học sinh</option>
                    <option value="PARENT_COMPLAINT">Ý kiến/Khiếu nại phụ huynh</option>
                    <option value="OTHER">Lý do khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mức độ nghiêm trọng</label>
                  <select 
                    value={convertForm.severity}
                    onChange={e => setConvertForm(prev => ({ ...prev, severity: e.target.value as NCSeverity }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                  >
                    <option value="MINOR">Nhỏ (Minor)</option>
                    <option value="MAJOR">Lớn (Major)</option>
                    <option value="CRITICAL">Nghiêm trọng (Critical)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nhận định nguyên nhân ban đầu</label>
                <input 
                  type="text" 
                  value={convertForm.initialCause}
                  onChange={e => setConvertForm(prev => ({ ...prev, initialCause: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bộ phận khắc phục</label>
                  <input 
                    type="text" 
                    value={convertForm.department}
                    onChange={e => setConvertForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Thời hạn phản hồi / xử lý</label>
                  <input 
                    type="date" 
                    value={convertForm.responseDeadline}
                    onChange={e => setConvertForm(prev => ({ ...prev, responseDeadline: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsConvertOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Xác nhận chuyển NC
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
                  {selectedDetail.content}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Hướng xử lý / Trạng thái:</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedDetail.status === 'OPEN' ? 'Đang chờ xử lý' : 'Đã phản hồi hoặc có hướng xử lý'}
                  <br/><br/>
                  Trạng thái hiện tại: <strong>{selectedDetail.status}</strong>
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
