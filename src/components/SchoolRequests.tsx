import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translateRequest, translateTitle } from '../utils/translations';
import { 
  Plus, 
  Check, 
  X, 
  FileText, 
  DollarSign, 
  Briefcase, 
  Settings, 
  HelpCircle,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../types';

interface SchoolRequestsProps {
  currentUser: UserProfile;
}

export interface SchoolRequestItem {
  id: string;
  title: string;
  type: 'VAN_PHONG_PHAM' | 'SU_KIEN_NGOAI_KHOA' | 'TAM_UNG_KINH_PHI' | 'CO_SO_VAT_CHAT' | 'KHAC';
  senderName: string;
  department: string;
  amount?: number; // Kinh phí đề xuất
  description: string;
  approverRole: 'BGH' | 'TO_TRUONG' | 'KE_TOAN';
  status: 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI';
  feedback?: string;
  createdAt: string;
  approvalFlowType?: 'SINGLE' | '3_LEVEL';
  currentStepIndex?: number;
  steps?: { role: 'TO_TRUONG' | 'KE_TOAN' | 'BGH'; status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING'; approvedBy?: string; feedback?: string; timestamp?: string }[];
}

const REQUEST_TYPES = [
  { value: 'VAN_PHONG_PHAM', label: 'Văn phòng phẩm & Học cụ', labelEn: 'Office Supplies & Tools', icon: FileText, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
  { value: 'SU_KIEN_NGOAI_KHOA', label: 'Sự kiện & Ngoại khóa', labelEn: 'Events & Extracurriculars', icon: Briefcase, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
  { value: 'TAM_UNG_KINH_PHI', label: 'Tạm ứng & Thanh toán', labelEn: 'Advances & Payments', icon: DollarSign, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
  { value: 'CO_SO_VAT_CHAT', label: 'Nâng cấp Cơ sở vật chất', labelEn: 'Facilities Upgrades', icon: Settings, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40' },
  { value: 'KHAC', label: 'Yêu cầu hành chính khác', labelEn: 'Other Administrative', icon: HelpCircle, color: 'text-slate-500 bg-slate-50 dark:bg-slate-900/40' }
];

export default function SchoolRequests({ currentUser }: SchoolRequestsProps) {
  const { lang, t } = useLanguage();

  const isApproverForStep = (user: UserProfile, stepRole: 'TO_TRUONG' | 'KE_TOAN' | 'BGH') => {
    if (user.role === 'ADMIN') return true;
    if (stepRole === 'TO_TRUONG') return user.role === 'MANAGER';
    if (stepRole === 'KE_TOAN') {
      return user.role === 'MANAGER' && (user.workspaceId === 'HANH_CHINH' || user.title?.toLowerCase().includes('kế toán') || user.title?.toLowerCase().includes('accountant'));
    }
    if (stepRole === 'BGH') return user.role === 'ADMIN';
    return false;
  };

  // LocalStorage State
  const [requests, setRequests] = useState<SchoolRequestItem[]>(() => {
    const saved = localStorage.getItem('mis_school_requests');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'RQ001',
        title: 'Mua 15 chuột máy tính và 2 cáp HDMI cho phòng máy 2',
        type: 'VAN_PHONG_PHAM',
        senderName: 'Thầy Trần Hoàng Nam',
        department: 'Tổ Tin Học',
        amount: 2800000,
        description: 'Phòng máy tính số 2 có nhiều chuột bị hỏng con lăn và liệt chuột trái, ảnh hưởng đến tiết thực hành AI của học sinh khối 11. Cần thay gấp 15 con chuột và mua thêm cáp HDMI kết nối máy chiếu.',
        approverRole: 'BGH',
        status: 'DA_DUYET',
        feedback: 'Đồng ý duyệt cấp kinh phí. Giao bộ phận Thiết bị tiến hành mua sắm bàn giao trước ngày 10/06.',
        createdAt: '2026-06-04'
      },
      {
        id: 'RQ002',
        title: 'Tổ chức chuyên đề Ngoại khóa "Hùng biện tiếng Anh khối 10"',
        type: 'SU_KIEN_NGOAI_KHOA',
        senderName: 'Cô Lê Thị Thanh Nhàn',
        department: 'Tổ Ngoại Ngữ',
        amount: 5500000,
        description: 'Kế hoạch tổ chức cuộc thi hùng biện tiếng Anh cấp trường cho học sinh lớp 10 vào chiều thứ Sáu tuần sau. Kinh phí bao gồm: thuê âm thanh, mua quà thưởng cho 3 đội xuất sắc và nước uống cho ban giám khảo.',
        approverRole: 'BGH',
        status: 'CHO_DUYET',
        createdAt: '2026-06-06',
        approvalFlowType: '3_LEVEL',
        currentStepIndex: 0,
        steps: [
          { role: 'TO_TRUONG', status: 'PENDING' },
          { role: 'KE_TOAN', status: 'WAITING' },
          { role: 'BGH', status: 'WAITING' }
        ]
      },
      {
        id: 'RQ003',
        title: 'Tạm ứng chi phí mua sách tham khảo chương trình phổ thông mới',
        type: 'TAM_UNG_KINH_PHI',
        senderName: 'Thầy Trần Quốc Đạt',
        department: 'Tổ Ngữ Văn',
        amount: 1200000,
        description: 'Tạm ứng mua bộ sách tham khảo ngữ văn lớp 10 và 11 của các bộ sách Cánh diều, Kết nối tri thức phục vụ soạn giáo án đổi mới phương pháp giảng dạy.',
        approverRole: 'KE_TOAN',
        status: 'CHO_DUYET',
        createdAt: '2026-06-07'
      },
      {
        id: 'RQ004',
        title: 'Lắp thêm quạt treo tường cho phòng học 401',
        type: 'CO_SO_VAT_CHAT',
        senderName: 'Cô Hoàng Thị Mai',
        department: 'Khối học vụ',
        description: 'Phòng học 401 hiện chỉ có 4 quạt trần hoạt động yếu, học sinh ngồi góc lớp rất nóng trong thời tiết nắng nóng cao điểm. Đề xuất lắp thêm 2 quạt treo tường công suất lớn ở hai góc phòng học.',
        approverRole: 'BGH',
        status: 'TU_CHOI',
        feedback: 'Phòng Thiết bị kiểm tra lại hệ thống điện phòng 401 trước. Do tải điện phòng 401 đã quá công suất định mức, việc lắp thêm quạt có thể gây chập điện. Đề xuất chuyển sang bảo trì lại hệ thống điều hòa hiện có.',
        createdAt: '2026-06-05'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mis_school_requests', JSON.stringify(requests));
  }, [requests]);

  // UI States
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form States
  const [newReq, setNewReq] = useState({
    title: '',
    type: 'VAN_PHONG_PHAM' as SchoolRequestItem['type'],
    amount: '',
    description: '',
    approverRole: 'BGH' as SchoolRequestItem['approverRole'],
    approvalFlowType: 'SINGLE' as 'SINGLE' | '3_LEVEL'
  });

  // Approver notes
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReq.title || !newReq.description) return;

    const request: SchoolRequestItem = {
      id: `RQ${Date.now().toString().slice(-3)}`,
      title: newReq.title,
      type: newReq.type,
      senderName: currentUser.name,
      department: currentUser.role === 'ADMIN' ? 'Ban Giám hiệu' : 'Tổ chuyên môn',
      amount: newReq.amount ? Number(newReq.amount) : undefined,
      description: newReq.description,
      approverRole: newReq.approverRole,
      status: 'CHO_DUYET',
      createdAt: new Date().toISOString().substring(0, 10),
      approvalFlowType: newReq.approvalFlowType,
      currentStepIndex: newReq.approvalFlowType === '3_LEVEL' ? 0 : undefined,
      steps: newReq.approvalFlowType === '3_LEVEL' ? [
        { role: 'TO_TRUONG', status: 'PENDING' },
        { role: 'KE_TOAN', status: 'WAITING' },
        { role: 'BGH', status: 'WAITING' }
      ] : undefined
    };

    setRequests([request, ...requests]);
    setNewReq({
      title: '',
      type: 'VAN_PHONG_PHAM',
      amount: '',
      description: '',
      approverRole: 'BGH',
      approvalFlowType: 'SINGLE'
    });
    setShowAddForm(false);
  };

  const handleUpdateStatus = (id: string, status: 'DA_DUYET' | 'TU_CHOI') => {
    const feedback = decisionNotes[id] || '';
    setRequests(prev => prev.map(r => {
      if (r.id === id) {
        if (r.approvalFlowType === '3_LEVEL' && r.steps) {
          const updatedSteps = [...r.steps];
          const currIdx = r.currentStepIndex ?? 0;
          
          if (status === 'DA_DUYET') {
            updatedSteps[currIdx] = {
              ...updatedSteps[currIdx],
              status: 'APPROVED',
              approvedBy: currentUser.name,
              feedback: feedback || 'Phê duyệt bước này.',
              timestamp: new Date().toISOString().substring(0, 10)
            };
            
            const nextIdx = currIdx + 1;
            if (nextIdx < updatedSteps.length) {
              updatedSteps[nextIdx] = {
                ...updatedSteps[nextIdx],
                status: 'PENDING'
              };
              return {
                ...r,
                steps: updatedSteps,
                currentStepIndex: nextIdx,
                feedback: `Phê duyệt bước ${currIdx + 1}/3 thành công. Chờ cấp tiếp theo duyệt.`
              };
            } else {
              // All steps approved
              return {
                ...r,
                steps: updatedSteps,
                status: 'DA_DUYET',
                feedback: feedback || 'Đã phê duyệt thông qua toàn bộ quy trình 3 cấp.'
              };
            }
          } else {
            // Rejected at current step
            updatedSteps[currIdx] = {
              ...updatedSteps[currIdx],
              status: 'REJECTED',
              approvedBy: currentUser.name,
              feedback: feedback || 'Từ chối bước này.',
              timestamp: new Date().toISOString().substring(0, 10)
            };
            return {
              ...r,
              steps: updatedSteps,
              status: 'TU_CHOI',
              feedback: feedback || `Bị từ chối tại bước ${currIdx + 1} bởi ${currentUser.name}`
            };
          }
        } else {
          // Single level approval
          return {
            ...r,
            status,
            feedback: feedback.trim() ? feedback.trim() : (status === 'DA_DUYET' ? (lang === 'vi' ? 'Đã phê duyệt đạt yêu cầu.' : 'Approved.') : (lang === 'vi' ? 'Từ chối đề xuất.' : 'Rejected.'))
          };
        }
      }
      return r;
    }));
    // Reset note
    setDecisionNotes(prev => ({ ...prev, [id]: '' }));
  };

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchType = filterType === 'ALL' || r.type === filterType;
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchType && matchStatus;
  }).map(r => translateRequest(r, lang));

  // Statistics calculation
  const totalRequests = requests.length;
  const pendingCount = requests.filter(r => r.status === 'CHO_DUYET').length;
  const approvedCount = requests.filter(r => r.status === 'DA_DUYET').length;
  const totalApprovedBudget = requests
    .filter(r => r.status === 'DA_DUYET' && r.amount)
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  // Format currency VNĐ
  const formatVND = (num?: number) => {
    if (!num) return '-';
    if (lang === 'en') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num / 25000);
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in" id="school-requests-root">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-800 to-indigo-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden border border-indigo-500/20 shadow-lg">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-purple-200 text-[10px] font-extrabold uppercase tracking-widest border border-white/10 flex items-center gap-1.5 w-fit">
            <FileCheck className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            REQUEST &amp; APPROVAL PORTAL
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-tight">
            {lang === 'vi' ? 'Cổng đề xuất và phê duyệt học đường' : 'Requests & Approvals Hub'}
          </h1>
          <p className="text-xs md:text-sm text-indigo-100/80 leading-relaxed font-light">
            {lang === 'vi' ? 'Số hóa quy trình duyệt mua sắm học cụ, tổ chức sự kiện ngoại khóa và đề xuất tạm ứng kinh phí.' : 'Digitizing approvals for school supplies purchasing, extracurricular events, and budget cash advances.'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-3xs">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">{lang === 'vi' ? 'Tổng đề xuất' : 'Total Requests'}</span>
            <h4 className="text-xl font-display font-black text-slate-900 dark:text-white leading-none mt-1">{totalRequests}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-3xs">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">{lang === 'vi' ? 'Chờ duyệt' : 'Pending'}</span>
            <h4 className="text-xl font-display font-black text-slate-900 dark:text-white leading-none mt-1 text-amber-505">{pendingCount}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-3xs">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">{lang === 'vi' ? 'Đã thông qua' : 'Approved'}</span>
            <h4 className="text-xl font-display font-black text-slate-900 dark:text-white leading-none mt-1 text-emerald-600">{approvedCount}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-3xs">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">{lang === 'vi' ? 'Ngân sách đã chi' : 'Disbursed Budget'}</span>
            <h4 className="text-sm font-display font-black text-slate-900 dark:text-white leading-none mt-1">{formatVND(totalApprovedBudget)}</h4>
          </div>
        </div>
      </div>

      {/* Main Panel layout */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs space-y-5">
        
        {/* Actions & Filters */}
        <div className="flex flex-col md:flex-row justify-between gap-3 items-start md:items-center border-b border-slate-100 dark:border-slate-850 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-705 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              <option value="ALL">{lang === 'vi' ? 'Tất cả loại đề xuất' : 'All Categories'}</option>
              <option value="VAN_PHONG_PHAM">{lang === 'vi' ? 'Văn phòng phẩm / Học cụ' : 'Office Supplies & Tools'}</option>
              <option value="SU_KIEN_NGOAI_KHOA">{lang === 'vi' ? 'Sự kiện & Ngoại khóa' : 'Events & Extracurriculars'}</option>
              <option value="TAM_UNG_KINH_PHI">{lang === 'vi' ? 'Tạm ứng & Thanh toán' : 'Advances & Payments'}</option>
              <option value="CO_SO_VAT_CHAT">{lang === 'vi' ? 'Nâng cấp Cơ sở vật chất' : 'Facilities Upgrades'}</option>
              <option value="KHAC">{lang === 'vi' ? 'Hành chính khác' : 'Other Administrative'}</option>
            </select>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-705 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              <option value="ALL">{lang === 'vi' ? 'Tất cả trạng thái' : 'All Statuses'}</option>
              <option value="CHO_DUYET">{lang === 'vi' ? 'Đang chờ duyệt' : 'Pending Approval'}</option>
              <option value="DA_DUYET">{lang === 'vi' ? 'Đã thông qua' : 'Approved'}</option>
              <option value="TU_CHOI">{lang === 'vi' ? 'Đã từ chối' : 'Rejected'}</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-705 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'vi' ? 'Tạo đề xuất mới' : 'Create Request'}</span>
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleCreateRequest} className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-up font-sans">
            <h3 className="font-display font-black text-sm text-indigo-950 dark:text-white">{lang === 'vi' ? 'Gửi phiếu đề xuất mới' : 'Submit New Request'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Tiêu đề đề xuất' : 'Request Title'}</label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'vi' ? 'Ví dụ: Đề xuất mua dung dịch hóa học thực nghiệm lớp 12' : 'e.g., Request for experimental chemical solutions Grade 12'}
                  value={newReq.title}
                  onChange={(e) => setNewReq({ ...newReq, title: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Loại đề xuất' : 'Request Type'}</label>
                <select
                  value={newReq.type}
                  onChange={(e: any) => setNewReq({ ...newReq, type: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="VAN_PHONG_PHAM">{lang === 'vi' ? 'Văn phòng phẩm & Học cụ' : 'Office Supplies & Classroom Tools'}</option>
                  <option value="SU_KIEN_NGOAI_KHOA">{lang === 'vi' ? 'Sự kiện & Ngoại khóa' : 'Events & Extracurricular Activities'}</option>
                  <option value="TAM_UNG_KINH_PHI">{lang === 'vi' ? 'Tạm ứng & Thanh toán' : 'Cash Advance & Payments'}</option>
                  <option value="CO_SO_VAT_CHAT">{lang === 'vi' ? 'Nâng cấp Cơ sở vật chất' : 'Facilities & Equipment Upgrades'}</option>
                  <option value="KHAC">{lang === 'vi' ? 'Hành chính khác' : 'Other Administrative Request'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Kinh phí ước tính (VNĐ) - không bắt buộc' : 'Estimated Budget (VND) - optional'}</label>
                <input
                  type="number"
                  placeholder={lang === 'vi' ? 'Ví dụ: 1500000' : 'e.g., 1500000'}
                  value={newReq.amount}
                  onChange={(e) => setNewReq({ ...newReq, amount: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Quy trình phê duyệt' : 'Approval Process'}</label>
                <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setNewReq({ ...newReq, approvalFlowType: 'SINGLE' })}
                    className={`flex-1 text-center py-2 text-[10px] font-bold rounded-lg transition-all ${newReq.approvalFlowType === 'SINGLE' ? 'bg-indigo-650 text-white shadow-3xs' : 'text-slate-500 hover:bg-slate-55 dark:hover:bg-slate-800'}`}
                  >
                    {lang === 'vi' ? '1 Cấp (Đơn lẻ)' : 'Single Stage'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewReq({ ...newReq, approvalFlowType: '3_LEVEL' })}
                    className={`flex-1 text-center py-2 text-[10px] font-bold rounded-lg transition-all ${newReq.approvalFlowType === '3_LEVEL' ? 'bg-indigo-650 text-white shadow-3xs' : 'text-slate-500 hover:bg-slate-55 dark:hover:bg-slate-800'}`}
                  >
                    {lang === 'vi' ? '3 Cấp (Tuần tự)' : '3-Level Flow'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                {newReq.approvalFlowType === 'SINGLE' ? (
                  <>
                    <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Cấp phê duyệt yêu cầu' : 'Approval Authority'}</label>
                    <select
                      value={newReq.approverRole}
                      onChange={(e: any) => setNewReq({ ...newReq, approverRole: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="BGH">{lang === 'vi' ? 'Ban Giám hiệu (BGH)' : 'School Board (BGH)'}</option>
                      <option value="TO_TRUONG">{lang === 'vi' ? 'Tổ trưởng bộ môn' : 'Department Head'}</option>
                      <option value="KE_TOAN">{lang === 'vi' ? 'Phòng Kế toán (Tài chính)' : 'Accounting Department'}</option>
                    </select>
                  </>
                ) : (
                  <>
                    <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Quy trình phê duyệt tuần tự' : 'Sequential Approval Order'}</label>
                    <div className="text-[10.5px] p-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between font-semibold">
                      <span>Tổ trưởng chuyên môn</span>
                      <span className="text-slate-400">➔</span>
                      <span>Kế toán trưởng (Ngân sách)</span>
                      <span className="text-slate-400">➔</span>
                      <span>Ban Giám hiệu (Chung cuộc)</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Lý do chi tiết & Phương án thực hiện' : 'Detailed Justification & Action Plan'}</label>
              <textarea
                rows={3}
                required
                placeholder={lang === 'vi' ? 'Ghi rõ thông tin cần thiết: Số lượng, thông số kỹ thuật, cách thức sử dụng để thẩm định nhanh chóng...' : 'Provide details: Quantity, specifications, usage to speed up review...'}
                value={newReq.description}
                onChange={(e) => setNewReq({ ...newReq, description: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none text-slate-850 dark:text-slate-200"
              />
            </div>

            <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-850 pt-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                {lang === 'vi' ? 'Hủy bỏ' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-755 text-white font-bold text-xs rounded-xl cursor-pointer shadow-3xs"
              >
                {lang === 'vi' ? 'Gửi phiếu đề xuất' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-350" />
              <p className="text-xs font-medium">{lang === 'vi' ? 'Không tìm thấy phiếu đề xuất nào phù hợp bộ lọc.' : 'No requests match the selected filters.'}</p>
            </div>
          ) : (
            filteredRequests.map(req => {
              const reqType = REQUEST_TYPES.find(t => t.value === req.type) || REQUEST_TYPES[4];
              const TypeIcon = reqType.icon;
              
              const statusBadge = req.status === 'DA_DUYET' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/30'
                : req.status === 'TU_CHOI'
                ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/30'
                : 'bg-amber-50 border-amber-200 text-amber-705 dark:bg-amber-950/40 dark:border-amber-900/30 animate-pulse';

              const roleLabels = {
                BGH: lang === 'vi' ? 'Ban Giám hiệu' : 'School Board',
                TO_TRUONG: lang === 'vi' ? 'Tổ trưởng chuyên môn' : 'Department Head',
                KE_TOAN: lang === 'vi' ? 'Phòng Kế toán' : 'Accounting Dept'
              };

              const activeStep = req.approvalFlowType === '3_LEVEL' && req.steps && req.currentStepIndex !== undefined
                ? req.steps[req.currentStepIndex]
                : null;

              const canApprove = req.status === 'CHO_DUYET' && (
                activeStep 
                  ? isApproverForStep(currentUser, activeStep.role)
                  : (currentUser.role === 'ADMIN' || isApproverForStep(currentUser, req.approverRole))
              );

              return (
                <div 
                  key={req.id} 
                  className="p-5 border border-slate-200 dark:border-slate-855 rounded-2xl bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-800 transition-all space-y-3"
                >
                  <div className="flex justify-between items-start gap-3 flex-wrap">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${reqType.color}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded tracking-wider">
                            {req.id}
                          </span>
                          {req.approvalFlowType === '3_LEVEL' && (
                            <span className="text-[9px] font-extrabold uppercase text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-950/70 px-1.5 py-0.5 rounded tracking-wider border border-indigo-200/40 font-mono">
                              3 CẤP
                            </span>
                          )}
                          <span className="text-[10px] text-slate-450 font-medium">
                            {lang === 'vi' ? 'Phân loại:' : 'Category:'} <strong>{lang === 'vi' ? reqType.label : reqType.labelEn}</strong>
                          </span>
                        </div>
                        <h4 className="text-xs md:text-sm font-display font-black text-slate-900 dark:text-white mt-1 leading-tight">
                          {req.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${statusBadge}`}>
                        {req.status === 'DA_DUYET' ? (lang === 'vi' ? 'Đã duyệt' : 'Approved') : req.status === 'TU_CHOI' ? (lang === 'vi' ? 'Đã từ chối' : 'Rejected') : (lang === 'vi' ? 'Chờ duyệt' : 'Pending')}
                      </span>
                      {req.amount && (
                        <span className="text-xs font-display font-black text-emerald-600 dark:text-emerald-450 mt-1">
                          {formatVND(req.amount)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3-Level Visual Approval Timeline */}
                  {req.approvalFlowType === '3_LEVEL' && req.steps && (
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800/70 p-4 rounded-xl space-y-3 font-sans">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-[9.5px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                          {lang === 'vi' ? 'TIẾN TRÌNH PHÊ DUYỆT TUẦN TỰ' : 'SEQUENTIAL APPROVAL PROGRESS'}
                        </span>
                        {req.status === 'CHO_DUYET' && (
                          <span className="text-[9.5px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200/50">
                            {lang === 'vi' ? `Chờ duyệt ở Cấp ${req.currentStepIndex !== undefined ? req.currentStepIndex + 1 : 1}` : `Awaiting Level ${req.currentStepIndex !== undefined ? req.currentStepIndex + 1 : 1}`}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative pt-1">
                        {/* Connecting Line */}
                        <div className="hidden sm:block absolute left-4 right-4 top-[16px] h-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>
                        
                        {req.steps.map((step, idx) => {
                          const stepLabels = {
                            TO_TRUONG: lang === 'vi' ? 'Cấp 1: Tổ trưởng' : 'L1: Dept Head',
                            KE_TOAN: lang === 'vi' ? 'Cấp 2: Kế toán' : 'L2: Finance',
                            BGH: lang === 'vi' ? 'Cấp 3: BGH' : 'L3: Board'
                          };
                          
                          let stepStatusColor = 'text-slate-400 bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-800';
                          let stepLabelColor = 'text-slate-400 dark:text-slate-500';
                          let StepIcon = Clock;
                          let pulseClass = '';

                          if (step.status === 'APPROVED') {
                            stepStatusColor = 'text-emerald-600 bg-emerald-50 border-emerald-250 dark:bg-emerald-950/40 dark:border-emerald-900/50';
                            stepLabelColor = 'text-emerald-700 dark:text-emerald-400 font-bold';
                            StepIcon = Check;
                          } else if (step.status === 'PENDING') {
                            stepStatusColor = 'text-amber-600 bg-amber-50 border-amber-250 dark:bg-amber-950/40 dark:border-amber-900/50';
                            stepLabelColor = 'text-amber-750 dark:text-amber-400 font-black';
                            StepIcon = Clock;
                            pulseClass = 'animate-pulse scale-105';
                          } else if (step.status === 'REJECTED') {
                            stepStatusColor = 'text-rose-600 bg-rose-50 border-rose-250 dark:bg-rose-950/40 dark:border-rose-900/50';
                            stepLabelColor = 'text-rose-700 dark:text-rose-400 font-bold';
                            StepIcon = X;
                          }

                          return (
                            <div key={idx} className="flex items-center sm:flex-col sm:items-center gap-3 sm:gap-1.5 flex-1 relative z-10">
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${stepStatusColor} ${pulseClass} shadow-2xs`}>
                                <StepIcon className="w-4 h-4" />
                              </div>
                              <div className="text-left sm:text-center space-y-0.5">
                                <div className={`text-[10px] ${stepLabelColor}`}>{stepLabels[step.role]}</div>
                                <div className="text-[8.5px] text-slate-450 font-medium">
                                  {step.status === 'APPROVED' && (
                                    <span className="text-emerald-600 font-semibold">
                                      {step.approvedBy} {step.timestamp && `(${step.timestamp})`}
                                    </span>
                                  )}
                                  {step.status === 'PENDING' && <span className="text-amber-600 font-semibold">{lang === 'vi' ? 'Đang duyệt' : 'Awaiting'}</span>}
                                  {step.status === 'REJECTED' && <span className="text-rose-600 font-semibold">{lang === 'vi' ? 'Từ chối bởi' : 'Rejected by'} {step.approvedBy}</span>}
                                  {step.status === 'WAITING' && <span>{lang === 'vi' ? 'Chờ lượt' : 'Queueing'}</span>}
                                </div>
                                {step.feedback && (
                                  <div className="text-[9px] italic text-slate-500 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={step.feedback}>
                                    "{step.feedback}"
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] leading-relaxed text-slate-650 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-100 dark:border-transparent font-medium">
                    <p className="whitespace-pre-line">{req.description}</p>
                    
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-850 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9.5px] text-slate-450">
                      <div>{lang === 'vi' ? 'Người đề xuất' : 'Requester'}: <strong className="text-slate-700 dark:text-slate-300">{req.senderName}</strong></div>
                      <div>{lang === 'vi' ? 'Bộ phận' : 'Department'}: <strong className="text-slate-700 dark:text-slate-300">{req.department}</strong></div>
                      <div>{lang === 'vi' ? 'Cấp thẩm định' : 'Approver Level'}: <strong className="text-slate-700 dark:text-slate-300">{roleLabels[req.approverRole]}</strong></div>
                      <div>{lang === 'vi' ? 'Ngày lập' : 'Created Date'}: <strong className="text-slate-700 dark:text-slate-300">{req.createdAt}</strong></div>
                    </div>
                  </div>

                  {/* Feedback notes */}
                  {req.feedback && (
                    <div className="p-3 bg-indigo-50/30 dark:bg-indigo-950/20 border-l-3 border-indigo-500/80 rounded-r-xl text-[10.5px] leading-normal text-slate-600 dark:text-slate-300 font-sans flex items-start gap-2">
                      <span className="font-bold text-indigo-700 dark:text-indigo-400 shrink-0">{lang === 'vi' ? 'Phản hồi duyệt:' : 'Approval Feedback:'}</span>
                      <span className="italic">{req.feedback}</span>
                    </div>
                  )}

                  {/* Approver Panel */}
                  {canApprove && (
                    <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-2 no-print font-sans">
                      <label className="text-[9.5px] font-bold uppercase text-slate-400 block">
                        {lang === 'vi' 
                          ? `Ý kiến phê duyệt (${activeStep ? roleLabels[activeStep.role] : roleLabels[req.approverRole]})`
                          : `Approver Comments (${activeStep ? roleLabels[activeStep.role] : roleLabels[req.approverRole]})`}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === 'vi' ? 'Nhập ý kiến phê duyệt hoặc lý do từ chối cụ thể...' : 'Enter approval or rejection feedback details...'}
                        value={decisionNotes[req.id] || ''}
                        onChange={(e) => setDecisionNotes({ ...decisionNotes, [req.id]: e.target.value })}
                        className="w-full text-[10.5px] border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-white dark:bg-slate-955 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'TU_CHOI')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10.5px] rounded-lg cursor-pointer flex items-center gap-1 shadow-3xs"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{lang === 'vi' ? 'Từ chối duyệt' : 'Reject'}</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'DA_DUYET')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] rounded-lg cursor-pointer flex items-center gap-1 shadow-3xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{lang === 'vi' ? (activeStep && req.currentStepIndex !== 2 ? 'Duyệt cấp này' : 'Phê duyệt chung cuộc') : (activeStep && req.currentStepIndex !== 2 ? 'Approve Step' : 'Final Approve')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
