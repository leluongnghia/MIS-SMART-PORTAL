import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles, 
  Info,
  School,
  Calculator,
  BookOpen,
  Megaphone,
  Globe,
  Heart,
  Bus,
  ClipboardList,
  Compass,
  Languages,
  Award,
  Laptop,
  Music,
  Palette,
  ShieldCheck,
  Eye,
  Settings
} from 'lucide-react';
import { Workspace } from '../types';

interface WorkspaceManagerProps {
  onClose: () => void;
  workspaces: Workspace[];
  onUpdateWorkspaces: (updated: Workspace[]) => void;
}

const COLOR_OPTIONS = [
  { label: 'Indigo Hoàng Học', value: 'from-indigo-600 to-violet-750' },
  { label: 'Amber Chỉ Đạo', value: 'from-amber-600 to-amber-850' },
  { label: 'Orange Truyền Thông', value: 'from-orange-500 to-amber-600' },
  { label: 'Cyan Khảo Thí', value: 'from-cyan-600 to-blue-700' },
  { label: 'Emerald học đường', value: 'from-emerald-500 to-green-600' },
  { label: 'Sky vận hành', value: 'from-sky-500 to-indigo-600' },
  { label: 'Blue Toán Học', value: 'from-blue-600 to-indigo-700' },
  { label: 'Teal Văn Thơ', value: 'from-teal-600 to-cyan-700' },
  { label: 'Rose Hành Chính', value: 'from-rose-600 to-pink-700' },
  { label: 'Fuchsia Nghệ Thuật', value: 'from-fuchsia-500 to-pink-650' }
];

const ICON_OPTIONS = [
  { name: 'School', icon: School },
  { name: 'Calculator', icon: Calculator },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Megaphone', icon: Megaphone },
  { name: 'Globe', icon: Globe },
  { name: 'Heart', icon: Heart },
  { name: 'Bus', icon: Bus },
  { name: 'ClipboardList', icon: ClipboardList },
  { name: 'Compass', icon: Compass },
  { name: 'Languages', icon: Languages },
  { name: 'Award', icon: Award },
  { name: 'Laptop', icon: Laptop },
  { name: 'Music', icon: Music },
  { name: 'Palette', icon: Palette },
  { name: 'ShieldCheck', icon: ShieldCheck }
];

export default function WorkspaceManager({ onClose, workspaces, onUpdateWorkspaces }: WorkspaceManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New Workspace state
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0].value);
  const [newIconName, setNewIconName] = useState('School');
  const [isAdding, setIsAdding] = useState(false);

  // Edit Workspace state
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editIconName, setEditIconName] = useState('');

  const [notif, setNotif] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotif({ type, text });
    setTimeout(() => {
      setNotif(null);
    }, 4000);
  };

  const handleStartEdit = (ws: Workspace) => {
    setEditingId(ws.id);
    setEditName(ws.name);
    setEditDesc(ws.description);
    setEditColor(ws.color);
    setEditIconName(ws.iconName);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) {
      showNotification('error', 'Tên phòng ban không được phép để trống!');
      return;
    }
    const updated = workspaces.map(w => {
      if (w.id === id) {
        return {
          ...w,
          name: editName.trim(),
          description: editDesc.trim(),
          color: editColor,
          iconName: editIconName
        };
      }
      return w;
    });
    onUpdateWorkspaces(updated);
    setEditingId(null);
    showNotification('success', `Đã lưu thay đổi phòng ban "${editName}" thành công.`);
  };

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showNotification('error', 'Tên phòng ban không được để trống!');
      return;
    }

    // Auto generate ID if empty
    const generatedId = newId.trim() || 'TO_' + newName
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'D')
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 15);

    // Validate unique ID
    if (workspaces.some(w => w.id === generatedId)) {
      showNotification('error', `Mã định danh "${generatedId}" đã tồn tại. Vui lòng nhập mã id khác.`);
      return;
    }

    const newWS: Workspace = {
      id: generatedId,
      name: newName.trim(),
      description: newDesc.trim(),
      color: newColor,
      iconName: newIconName
    };

    onUpdateWorkspaces([...workspaces, newWS]);
    
    // Reset form
    setNewId('');
    setNewName('');
    setNewDesc('');
    setNewColor(COLOR_OPTIONS[0].value);
    setNewIconName('School');
    setIsAdding(false);
    showNotification('success', `Đã tạo thêm phòng chức năng/tổ chuyên môn "${newWS.name}" thành công!`);
  };

  const handleDeleteWorkspace = (id: string, name: string) => {
    if (id === 'BGH' || id === 'ALL') {
      showNotification('error', 'Đây là phòng chức năng mặc định cấp hệ thống, không được sửa hoặc xóa.');
      return;
    }

    const confirmDel = window.confirm(`Bạn có chắc chắn muốn xóa phòng chức năng "${name}"? Thao tác này sẽ loại bỏ phân loại của phòng này.`);
    if (confirmDel) {
      const filtered = workspaces.filter(w => w.id !== id);
      onUpdateWorkspaces(filtered);
      showNotification('success', `Đã xóa phòng chức năng "${name}" thành công.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header decoration */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/25">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-xs uppercase tracking-wider text-indigo-300">
                THIẾT LẬP CƠ CẤU NHÀ TRƯỜNG ĐA TRÍ TUỆ
              </h3>
              <h2 className="text-sm font-bold text-slate-100">
                Quản lý các Phòng Chức năng / Tổ Chuyên môn
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Outer banner / Alerts */}
        {notif && (
          <div className={`px-6 py-3 text-xs flex items-center justify-between font-semibold ${
            notif.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100' 
              : 'bg-rose-50 text-rose-800 border-b border-rose-100'
          }`}>
            <span>{notif.type === 'success' ? '✓ ' : '⚠️ '} {notif.text}</span>
            <button onClick={() => setNotif(null)} className="text-slate-450 hover:text-slate-700">Đóng</button>
          </div>
        )}

        {/* Content body split path */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col gap-6">

          {/* Quick explanations */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex gap-3 text-xs text-indigo-900 leading-relaxed">
            <Info className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Hướng dẫn điều tiết cơ cấu và phòng chuyên môn:</p>
              <p className="mt-0.5 text-slate-650 font-sans">
                Tại Trường Đa Trí Tuệ (MIS), mỗi phòng ban tương ứng với một <strong>"Không gian làm việc (Workspace)"</strong> để điều phối chỉ thị. Khi thay đổi hoặc bổ sung phòng chức năng ở đây, bạn sẽ ngay lập tức cập nhật cấu trúc phân lọc trên sơ đồ Kanban, bảng lịch, danh bạ nhân sự, cũng như trong các tùy chọn giao việc.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 relative items-start">
            
            {/* List side */}
            <div className="flex-1 w-full flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Danh sách phòng ban hiện có ({workspaces.filter(w => w.id !== 'ALL').length})
                </h4>
                {!isAdding && (
                  <button
                    onClick={() => {
                      setIsAdding(true);
                      setEditingId(null);
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Tổ / Phòng Mới
                  </button>
                )}
              </div>

              {/* Grid of rooms */}
              <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-1">
                {workspaces.filter(w => w.id !== 'ALL').map(ws => {
                  const isEditing = editingId === ws.id;

                  // Find icon matching
                  const matchedIconRecord = ICON_OPTIONS.find(io => io.name === (isEditing ? editIconName : ws.iconName)) || ICON_OPTIONS[0];
                  const IconComponent = matchedIconRecord.icon;

                  // Dynamic gradient extraction preview for edit or display
                  const currentGradient = isEditing ? editColor : ws.color;

                  return (
                    <div 
                      key={ws.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isEditing 
                          ? 'border-indigo-500 bg-indigo-50/15'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/30'
                      }`}
                    >
                      {isEditing ? (
                        /* EDIT MODE CONTAINER */
                        <div className="flex flex-col gap-3.5">
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase bg-indigo-100/50 px-2 py-0.5 rounded">
                              Đang Sửa ID: {ws.id}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleSaveEdit(ws.id)}
                                className="p-1 px-2.5 bg-indigo-600 text-white rounded-md text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-700 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" /> Lưu
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 px-2.5 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tên tổ / Phòng ban</label>
                              <input 
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold focus:outline-indigo-500"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Màu chủ đạo (Gradient)</label>
                              <select
                                value={editColor}
                                onChange={(e) => setEditColor(e.target.value)}
                                className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold focus:outline-indigo-500"
                              >
                                {COLOR_OPTIONS.map(co => (
                                  <option key={co.value} value={co.value}>{co.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mô tả chức năng/Quy mô</label>
                            <input 
                              type="text"
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:outline-indigo-500"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Biểu tượng Lucide Icon</label>
                            <div className="flex flex-wrap gap-1 bg-slate-50 p-2 rounded-lg border border-slate-100 max-h-24 overflow-y-auto">
                              {ICON_OPTIONS.map(io => {
                                const OptionIcon = io.icon;
                                const isSelected = editIconName === io.name;
                                return (
                                  <button
                                    key={io.name}
                                    type="button"
                                    onClick={() => setEditIconName(io.name)}
                                    className={`p-1.5 rounded-md border text-slate-600 transition-colors flex items-center justify-center cursor-pointer ${
                                      isSelected 
                                        ? 'bg-indigo-600 border-indigo-700 text-white' 
                                        : 'hover:bg-slate-200 border-slate-200'
                                    }`}
                                    title={io.name}
                                  >
                                    <OptionIcon className="w-3.5 h-3.5" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* STANDARD DISPLAY MODE */
                        <div className="flex items-start md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentGradient} text-white flex items-center justify-center shrink-0 shadow-md shadow-slate-200`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-slate-800">{ws.name}</span>
                                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 text-[8px] rounded font-mono font-bold tracking-wide uppercase">
                                  ID: {ws.id}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-sans max-w-sm">
                                {ws.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
                            <button
                              onClick={() => handleStartEdit(ws)}
                              className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-indigo-600 rounded-lg cursor-pointer transition-colors"
                              title="Sửa thông tin"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {ws.id !== 'BGH' && (
                              <button
                                onClick={() => handleDeleteWorkspace(ws.id, ws.name)}
                                className="p-1.5 border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                                title="Xóa phòng chức năng này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Creation side panel */}
            {isAdding && (
              <div className="w-full md:w-[320px] bg-slate-50 border border-slate-250 p-5 rounded-2xl shrink-0 self-start">
                <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Thêm tổ phòng mới
                  </h4>
                  <button 
                    onClick={() => setIsAdding(false)} 
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mã định danh (ID)</label>
                    <input 
                      type="text"
                      placeholder="VD: ANH_VAN, KY_NANG"
                      value={newId}
                      onChange={(e) => setNewId(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                      className="px-2.5 py-1.5 border border-slate-250 bg-white rounded-lg text-xs font-mono focus:outline-indigo-500"
                    />
                    <p className="text-[9px] text-slate-400 font-sans leading-none mt-0.5">Để trống sẽ tự động phân tách theo tiếng Việt không dấu.</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tên phòng chức năng</label>
                    <input 
                      type="text"
                      placeholder="VD: Tổ Chuyên môn Anh Văn"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-250 bg-white rounded-lg text-xs font-semibold focus:outline-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mô tả chức trách / Chuyên môn</label>
                    <textarea 
                      placeholder="VD: Chỉ đạo giảng dạy tiếng Anh quốc tế và bản xứ..."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-250 bg-white rounded-lg text-xs leading-normal h-16 resize-none focus:outline-indigo-500 font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Đại diện tông màu (Color gradient)</label>
                    <select
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-250 bg-white rounded-lg text-xs focus:outline-indigo-500 font-semibold"
                    >
                      {COLOR_OPTIONS.map(co => (
                        <option key={co.value} value={co.value}>{co.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Chọn Biểu tượng</label>
                    <div className="flex flex-wrap gap-1 bg-white p-2 rounded-lg border border-slate-200 max-h-24 overflow-y-auto">
                      {ICON_OPTIONS.map(io => {
                        const OptionIcon = io.icon;
                        const isSelected = newIconName === io.name;
                        return (
                          <button
                            key={io.name}
                            type="button"
                            onClick={() => setNewIconName(io.name)}
                            className={`p-1.5 rounded border text-slate-600 transition-colors flex items-center justify-center cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-700 text-white' 
                                : 'hover:bg-slate-200 border-slate-150'
                            }`}
                            title={io.name}
                          >
                            <OptionIcon className="w-3.5 h-3.5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1 text-center font-sans shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Chấp thuận Tạo tổ mới
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-150 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-4 py-2 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Đóng bảng thiết lập
          </button>
        </div>

      </div>
    </div>
  );
}
