import React, { useState } from 'react';
import { RiskItem, RiskLevel } from './RiskMockData';
import { Plus, Search, Filter, AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';

const PROB_LABELS = ['', 'Hiếm (1)', 'Ít khi (2)', 'Đôi khi (3)', 'Thường xuyên (4)', 'Chắc chắn (5)'];
const IMPACT_LABELS = ['', 'Không đáng kể (1)', 'Nhỏ (2)', 'Trung bình (3)', 'Nghiêm trọng (4)', 'Thảm họa (5)'];

const getLevelStyle = (level: RiskItem['level']) => {
  switch (level) {
    case 'LOW': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'CRITICAL': return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

const getStatusStyle = (status: RiskItem['status']) => {
  switch (status) {
    case 'NEW': return 'bg-blue-50 text-blue-700';
    case 'WATCHING': return 'bg-purple-50 text-purple-700';
    case 'MITIGATING': return 'bg-amber-50 text-amber-700';
    case 'CONTROLLED': return 'bg-emerald-50 text-emerald-700';
    case 'CLOSED': return 'bg-slate-50 text-slate-500';
    case 'RECURRING': return 'bg-rose-50 text-rose-700';
    default: return 'bg-slate-50 text-slate-700';
  }
};

export default function RiskRegister({ risks, onAddRisk }: { risks: RiskItem[]; onAddRisk: (newRisk: RiskItem) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<RiskItem['level'] | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'MATRIX'>('LIST');
  const { success: toastSuccess } = useToast();

  const [selectedDetail, setSelectedDetail] = useState<RiskItem | null>(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'SAFETY' as any,
    department: '',
    owner: '',
    probability: 3 as 1 | 2 | 3 | 4 | 5,
    impact: 3 as 1 | 2 | 3 | 4 | 5,
    currentControl: '',
    mitigationAction: '',
    deadline: '',
  });

  const filteredRisks = risks.filter(r => 
    (filterLevel === 'ALL' || r.level === filterLevel) &&
    (r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.department || !formData.owner) return;

    const score = formData.probability * formData.impact;
    let level: RiskLevel = 'LOW';
    if (score >= 16) level = 'CRITICAL';
    else if (score >= 10) level = 'HIGH';
    else if (score >= 5) level = 'MEDIUM';

    const newCode = `RSK-${2600 + risks.length + 1}`;

    const newRisk: RiskItem = {
      id: `r_${Date.now()}`,
      code: newCode,
      category: formData.category,
      title: formData.title,
      description: formData.description,
      level,
      department: formData.department,
      probability: formData.probability,
      impact: formData.impact,
      owner: formData.owner,
      status: 'NEW',
      currentControl: formData.currentControl || 'Chưa thiết lập',
      mitigationAction: formData.mitigationAction || 'Chưa thiết lập',
      deadline: formData.deadline || new Date().toISOString().split('T')[0],
      timeline: [
        {
          id: `tl_${Date.now()}`,
          action: 'Ghi nhận rủi ro mới',
          by: 'BGH / KSNB',
          at: new Date().toISOString()
        }
      ]
    };

    onAddRisk(newRisk);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: 'SAFETY',
      department: '',
      owner: '',
      probability: 3,
      impact: 3,
      currentControl: '',
      mitigationAction: '',
      deadline: '',
    });
    toastSuccess('Ghi nhận rủi ro thành công', `Đã ghi nhận rủi ro ${newCode} vào hệ thống.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full md:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm mã, tên rủi ro..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
            />
          </div>
          <select 
            value={filterLevel} 
            onChange={e => setFilterLevel(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-white"
          >
            <option value="ALL">Tất cả mức độ</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button onClick={() => setViewMode('LIST')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${viewMode === 'LIST' ? 'bg-white dark:bg-slate-900 shadow-sm text-rose-650' : 'text-slate-500 hover:text-slate-750'}`}>Danh sách</button>
            <button onClick={() => setViewMode('MATRIX')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${viewMode === 'MATRIX' ? 'bg-white dark:bg-slate-900 shadow-sm text-rose-650' : 'text-slate-500 hover:text-slate-750'}`}>Ma trận</button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm animate-pulse-subtle"
          >
            <Plus className="w-4 h-4" /> Ghi nhận
          </button>
        </div>
      </div>

      {viewMode === 'LIST' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Mã</th>
                  <th className="px-4 py-3">Nội dung Rủi ro</th>
                  <th className="px-4 py-3">Bộ phận</th>
                  <th className="px-4 py-3">Mức độ</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Kiểm soát hiện tại</th>
                  <th className="px-4 py-3 text-right">Phụ trách</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRisks.map(r => (
                  <tr key={r.id} onClick={() => setSelectedDetail(r)} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-mono text-slate-500">{r.code}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white mb-0.5">{r.title}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{r.description}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.department}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded border text-[10px] font-black uppercase tracking-wider ${getLevelStyle(r.level)}`}>
                        {r.level} ({r.probability * r.impact})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${getStatusStyle(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{r.currentControl}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300 font-medium">{r.owner}</td>
                  </tr>
                ))}
                {filteredRisks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs">Không tìm thấy rủi ro nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'MATRIX' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm overflow-x-auto">
           <table className="border-collapse text-center text-[11px] font-bold mx-auto min-w-[600px]">
            <thead>
              <tr>
                <th className="w-32 p-2 text-left text-[10px] text-slate-400 font-black">Impact ↕ / Prob →</th>
                {[1,2,3,4,5].map(p => (
                  <th key={p} className="w-28 p-2 text-slate-500 dark:text-slate-400 text-[10px]">{PROB_LABELS[p]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[5,4,3,2,1].map(imp => (
                <tr key={imp}>
                  <td className="p-2 text-[10px] text-slate-400 font-black text-left">{IMPACT_LABELS[imp]}</td>
                  {[1,2,3,4,5].map(prob => {
                    const cellRisks = filteredRisks.filter(r => r.probability === prob && r.impact === imp);
                    const score = prob * imp;
                    let cls = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    if (score >= 16) cls = 'bg-rose-500 text-white border-rose-600';
                    else if (score >= 10) cls = 'bg-orange-400 text-white border-orange-500';
                    else if (score >= 5) cls = 'bg-amber-100 text-amber-800 border-amber-200';

                    return (
                      <td key={prob} className="p-1">
                        <div className={`rounded-xl border p-3 min-h-[60px] flex flex-col items-center justify-center gap-1 ${cls} transition-transform hover:scale-105 cursor-pointer`}>
                          {cellRisks.length > 0 ? (
                            <>
                              <span className="text-xl font-black leading-none">{cellRisks.length}</span>
                            </>
                          ) : (
                            <span className="text-[10px] opacity-40">—</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-rose-700">Ghi nhận Rủi ro mới</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-500 font-bold mb-1">Tên rủi ro *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Mô tả ngắn sự vụ/rủi ro tiềm ẩn"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 font-bold mb-1">Mô tả chi tiết</label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Nhập thông tin chi tiết về các yếu tố cấu thành rủi ro"
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Danh mục</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
                  >
                    <option value="SAFETY">An toàn trường học</option>
                    <option value="OPERATIONAL">Vận hành nội bộ</option>
                    <option value="DATA">Bảo mật dữ liệu</option>
                    <option value="HR">Nhân sự đào tạo</option>
                    <option value="FACILITY">Cơ sở vật chất</option>
                    <option value="ADMISSION">Tuyển sinh & CRM</option>
                    <option value="PARENT_SERVICE">Dịch vụ & CSKH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Bộ phận liên quan *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.department} 
                    onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Ví dụ: Phòng CSVC, IT, Bảo vệ"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Người chịu trách nhiệm *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.owner} 
                    onChange={e => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                    placeholder="Tên người phụ trách chính"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Hạn xử lý khắc phục</label>
                  <input 
                    type="date" 
                    value={formData.deadline} 
                    onChange={e => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Khả năng xảy ra (1-5)</label>
                  <select 
                    value={formData.probability} 
                    onChange={e => setFormData(prev => ({ ...prev, probability: Number(e.target.value) as any }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
                  >
                    {[1,2,3,4,5].map(num => (
                      <option key={num} value={num}>{PROB_LABELS[num]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Mức độ tác động (1-5)</label>
                  <select 
                    value={formData.impact} 
                    onChange={e => setFormData(prev => ({ ...prev, impact: Number(e.target.value) as any }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
                  >
                    {[1,2,3,4,5].map(num => (
                      <option key={num} value={num}>{IMPACT_LABELS[num]}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 font-bold mb-1">Biện pháp kiểm soát hiện tại</label>
                  <input 
                    type="text" 
                    value={formData.currentControl} 
                    onChange={e => setFormData(prev => ({ ...prev, currentControl: e.target.value }))}
                    placeholder="Chốt kiểm soát đang áp dụng hiện thời"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 font-bold mb-1">Hành động khắc phục đề xuất</label>
                  <input 
                    type="text" 
                    value={formData.mitigationAction} 
                    onChange={e => setFormData(prev => ({ ...prev, mitigationAction: e.target.value }))}
                    placeholder="Hành động cụ thể giảm thiểu rủi ro"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-150 text-slate-600 hover:bg-slate-200 rounded-xl font-bold transition-colors dark:bg-slate-800 dark:text-slate-300"
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
                  {selectedDetail.title}
                  <br/><br/>
                  {selectedDetail.description}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Hướng xử lý / Biện pháp:</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedDetail.mitigationAction || 'Chưa có hướng xử lý'}
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
