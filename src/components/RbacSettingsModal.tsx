import React, { useState } from 'react';
import { RbacConfig, Role, RolePermissions } from '../types';
import { 
  X, 
  Shield, 
  UserCheck, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Play, 
  Send, 
  CheckSquare, 
  XCircle, 
  MessageSquare, 
  Settings,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

interface RbacSettingsModalProps {
  onClose: () => void;
  config: RbacConfig;
  onSaveConfig: (newConfig: RbacConfig) => void;
}

export const DEFAULT_RBAC_CONFIG: RbacConfig = {
  ADMIN: {
    createTask: true,
    editTask: true,
    deleteTask: true,
    changeStatus: true,
    submitReport: true,
    approveReport: true,
    rejectReport: true,
    addComment: true,
    manageWorkspaces: true,
  },
  MANAGER: {
    createTask: true,
    editTask: true,
    deleteTask: false,
    changeStatus: true,
    submitReport: true,
    approveReport: true,
    rejectReport: true,
    addComment: true,
    manageWorkspaces: false,
  },
  STAFF: {
    createTask: false,
    editTask: false,
    deleteTask: false,
    changeStatus: true,
    submitReport: true,
    approveReport: false,
    rejectReport: false,
    addComment: true,
    manageWorkspaces: false,
  }
};

const permissionsMeta: { key: keyof RolePermissions; label: string; desc: string; icon: React.ReactNode }[] = [
  { 
    key: 'createTask', 
    label: 'Khởi tạo chỉ đạo / nhiệm vụ', 
    desc: 'Cho phép tạo nhiệm vụ và phân công cho giáo viên trong cơ cấu của mình.',
    icon: <Plus className="w-4 h-4 text-indigo-600" />
  },
  { 
    key: 'editTask', 
    label: 'Chỉnh sửa chỉ đạo', 
    desc: 'Có quyền sửa đổi tiêu đề, nội dung mô tả, hạn chót và độ ưu tiên của công việc.',
    icon: <Edit3 className="w-4 h-4 text-sky-600" />
  },
  { 
    key: 'deleteTask', 
    label: 'Xóa chỉ đạo', 
    desc: 'Quyền xóa hoàn toàn nhiệm vụ và chỉ thị ra khỏi hệ thống quản trị học vụ.',
    icon: <Trash2 className="w-4 h-4 text-rose-600" />
  },
  { 
    key: 'changeStatus', 
    label: 'Cập nhật tiến độ học vụ', 
    desc: 'Cho phép thay đổi trạng thái công vụ (ví dụ: chuyển từ Chưa bắt đầu sang Đang tiến hành).',
    icon: <Play className="w-4 h-4 text-emerald-600" />
  },
  { 
    key: 'submitReport', 
    label: 'Nộp báo cáo & minh chứng', 
    desc: 'Cho phép viết thuyết minh kết quả giảng dạy và biểu mẫu liên kết minh chứng chất lượng.',
    icon: <Send className="w-4 h-4 text-teal-600" />
  },
  { 
    key: 'approveReport', 
    label: 'Nghiệm thu / Phê duyệt báo cáo', 
    desc: 'Có thẩm quyền thẩm định và phê duyệt nhiệm vụ hoàn thành xuất sắc hay đạt chuẩn.',
    icon: <CheckSquare className="w-4 h-4 text-green-600" />
  },
  { 
    key: 'rejectReport', 
    label: 'Yêu cầu điều chỉnh từ chối', 
    desc: 'Thẩm quyền từ chối báo cáo kết quả và gửi trả ghi chú đề nghị bổ sung hồ sơ.',
    icon: <XCircle className="w-4 h-4 text-amber-600" />
  },
  { 
    key: 'addComment', 
    label: 'Đóng góp ý kiến thảo luận', 
    desc: 'Cho phép viết ý kiến chỉ đạo bổ trợ hoặc phản hồi chuyên môn trong từng nhiệm vụ.',
    icon: <MessageSquare className="w-4 h-4 text-violet-600" />
  },
  { 
    key: 'manageWorkspaces', 
    label: 'Quản lý Tổ chuyên môn / Phòng ban', 
    desc: 'Cho phép thay đổi cơ cấu, thêm phòng chức năng, đổi tên Tổ toán tin, văn phòng...',
    icon: <Settings className="w-4 h-4 text-slate-600" />
  }
];

export default function RbacSettingsModal({ onClose, config, onSaveConfig }: RbacSettingsModalProps) {
  const [localConfig, setLocalConfig] = useState<RbacConfig>(() => {
    // Deep copy to prevent mutating father component on active toggles
    return JSON.parse(JSON.stringify(config));
  });

  const [activeTab, setActiveTab] = useState<Role>('ADMIN');

  const handleToggle = (role: Role, key: keyof RolePermissions) => {
    setLocalConfig(prev => {
      const updatedPermissions = {
        ...prev[role],
        [key]: !prev[role][key]
      };
      return {
        ...prev,
        [role]: updatedPermissions
      };
    });
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục thiết lập phân quyền mặc định của trường học không?')) {
      setLocalConfig(JSON.parse(JSON.stringify(DEFAULT_RBAC_CONFIG)));
    }
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in" id="rbac-settings-overlay">
      <div 
        id="rbac-settings-modal"
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-scale-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold leading-tight">Cấu hình phân quyền chi tiết (RBAC)</h2>
              <p className="text-[11px] text-slate-300">Vận dụng quy chế trường học vào quản trị nhiệm vụ, kiểm duyệt chỉ đạo dựa trên 3 vai trò chính</p>
            </div>
          </div>
          <button 
            id="rbac-btn-close-header"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info banners */}
        <div className="bg-indigo-50 border-b border-indigo-150 py-3 px-6 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-indigo-900 leading-normal">
            <strong>Nguyên tắc hoạt động:</strong> Khi thay đổi cấu hình tại đây, tất cả cán bộ, giáo viên thuộc nhóm tương ứng sẽ bị giới hạn hoặc được cấp quyền hành sự tức thì trên toàn bộ hệ thống gồm các phòng chức năng và tổ chuyên môn.
          </p>
        </div>

        {/* Content Box with Tab selector & Permission listing */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
          
          {/* Sidebar Roles Choice tab */}
          <div className="w-full md:w-64 p-5 bg-slate-50 shrink-0 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-2 font-mono">Đối tượng cán bộ</span>
            
            {/* ADMIN tab button */}
            <button
              id="rbac-tab-admin"
              onClick={() => setActiveTab('ADMIN')}
              className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'ADMIN'
                  ? 'bg-slate-905 border-slate-800 text-white ring-1 ring-offset-1 ring-slate-800 shadow-sm bg-slate-900'
                  : 'bg-white border-slate-150 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shield className={`w-4 h-4 ${activeTab === 'ADMIN' ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <h4 className="text-xs font-bold leading-none">Ban Giám Hiệu</h4>
                  <span className={`text-[8px] mt-1 font-mono block ${activeTab === 'ADMIN' ? 'text-slate-300' : 'text-slate-500'}`}>ADMIN ROLE</span>
                </div>
              </div>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${activeTab === 'ADMIN' ? 'bg-amber-500/20 text-amber-200' : 'bg-slate-200 text-slate-600'}`}>
                {Object.values(localConfig.ADMIN).filter(Boolean).length}/9
              </span>
            </button>

            {/* MANAGER tab button */}
            <button
              id="rbac-tab-manager"
              onClick={() => setActiveTab('MANAGER')}
              className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'MANAGER'
                  ? 'bg-slate-905 border-slate-800 text-white ring-1 ring-offset-1 ring-slate-800 shadow-sm bg-slate-900'
                  : 'bg-white border-slate-150 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className={`w-4 h-4 ${activeTab === 'MANAGER' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div>
                  <h4 className="text-xs font-bold leading-none">Tổ Trưởng / Trưởng bộ phận</h4>
                  <span className={`text-[8px] mt-1 font-mono block ${activeTab === 'MANAGER' ? 'text-slate-300' : 'text-slate-500'}`}>MANAGER ROLE</span>
                </div>
              </div>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${activeTab === 'MANAGER' ? 'bg-indigo-500/20 text-indigo-200' : 'bg-slate-200 text-slate-600'}`}>
                {Object.values(localConfig.MANAGER).filter(Boolean).length}/9
              </span>
            </button>

            {/* STAFF tab button */}
            <button
              id="rbac-tab-staff"
              onClick={() => setActiveTab('STAFF')}
              className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'STAFF'
                  ? 'bg-slate-905 border-slate-800 text-white ring-1 ring-offset-1 ring-slate-800 shadow-sm bg-slate-900'
                  : 'bg-white border-slate-150 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className={`w-4 h-4 ${activeTab === 'STAFF' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <h4 className="text-xs font-bold leading-none">Cán bộ / Giáo viên</h4>
                  <span className={`text-[8px] mt-1 font-mono block ${activeTab === 'STAFF' ? 'text-slate-300' : 'text-slate-500'}`}>STAFF ROLE</span>
                </div>
              </div>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${activeTab === 'STAFF' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-200 text-slate-600'}`}>
                {Object.values(localConfig.STAFF).filter(Boolean).length}/9
              </span>
            </button>

            <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 leading-relaxed gap-1.5 flex flex-col bg-amber-50/40 p-3 rounded-lg border">
              <span className="font-bold text-amber-900">Mách nhỏ:</span>
              <span>Ban Giám Hiệu thường có toàn quyền để kiểm tra toàn trường, còn Giáo viên thường được thiết lập quyền nộp báo cáo và cập nhật tiến độ công việc riêng.</span>
            </div>
          </div>

          {/* Right permissions switcher body */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider block font-mono">Bảng chi tiết quyền hạn</span>
                <h3 className="text-sm font-bold text-slate-800">
                  Phân quyền cho nhóm: <span className="underline decoration-indigo-500">{
                    activeTab === 'ADMIN' ? 'Ban Giám Hiệu (ADMIN)' : activeTab === 'MANAGER' ? 'Tổ trưởng / Trưởng bộ phận (MANAGER)' : 'Cán bộ / Giáo viên / Nhân viên (STAFF)'
                  }</span>
                </h3>
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase bg-slate-100 px-2.5 py-0.5 rounded">
                Active
              </div>
            </div>

            <div className="space-y-3" id="rbac-permission-list">
              {permissionsMeta.map((p) => {
                const isChecked = localConfig[activeTab][p.key];
                const inputId = `rbac-${activeTab}-${p.key}`;
                return (
                  <label 
                    key={p.key}
                    htmlFor={inputId}
                    className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked 
                        ? 'border-indigo-150 bg-indigo-50/20 hover:bg-indigo-50/40' 
                        : 'border-slate-150 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex gap-3 mr-4">
                      <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-3xs shrink-0 self-start">
                        {p.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight block">{p.label}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5 font-normal">{p.desc}</p>
                      </div>
                    </div>
                    
                    {/* Switch-toggle */}
                    <div className="relative inline-flex items-center shrink-0 mt-1">
                      <input
                        type="checkbox"
                        id={inputId}
                        checked={isChecked}
                        onChange={() => handleToggle(activeTab, p.key)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-150">
          <button
            id="rbac-btn-reset-defaults"
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-650 hover:text-slate-900 font-semibold cursor-pointer border border-slate-200 bg-white rounded-lg transition-colors hover:shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              id="rbac-btn-cancel"
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold rounded-lg transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              id="rbac-btn-save-confirm"
              type="button"
              onClick={handleSave}
              className="px-5 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Lưu thiết lập
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
