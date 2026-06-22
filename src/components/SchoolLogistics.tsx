import { serverStorage } from '../libs/client/server-storage';
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from './ui/Toast';
import { 
  Plus, Check, X, AlertTriangle, Wrench, MapPin, Calendar, Clock, 
  Cpu, CheckCircle, AlertCircle, LayoutDashboard, Box, ArrowRightLeft, 
  Settings, ClipboardCheck, Archive, FileText, BarChart, Search, Filter
} from 'lucide-react';
import { 
  UserProfile, AssetItem, AssetHandover, AssetTransfer, 
  MaintenanceReport, InventoryItem, InventoryTransaction 
} from '../types';
import { 
  MOCK_ASSETS, MOCK_ASSET_HANDOVERS, MOCK_ASSET_TRANSFERS, 
  MOCK_MAINTENANCE_REPORTS, MOCK_INVENTORY_ITEMS, MOCK_INVENTORY_TRANSACTIONS 
} from '../mockData';

interface RoomBooking {
  id: string;
  roomName: string;
  bookDate: string;
  slot: number;
  teacherName: string;
  purpose: string;
  status: 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI';
  createdAt: string;
}

const ROOMS_LIST = [
  'Phòng Lab AI 1 (Tầng 3)',
  'Phòng máy tính 1 (Tầng 2)',
  'Phòng máy tính 2 (Tầng 2)',
  'Phòng STEAM (Tầng 4)',
  'Thư viện Đa trí tuệ (Tầng 2)',
  'Hội trường lớn (Tầng 1)'
];

interface SchoolLogisticsProps {
  currentUser: UserProfile;
}

export default function SchoolLogistics({ currentUser }: SchoolLogisticsProps) {
  const { lang, t } = useLanguage();
  const { success: toastSuccess, error: toastError } = useToast();
  
  // Navigation
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ASSETS' | 'HANDOVER' | 'TRANSFER' | 'MAINTENANCE' | 'INVENTORY' | 'BOOKING'>('DASHBOARD');

  // DATA STATES (Mock -> localStorage persistence)
  const [assets, setAssets] = useState<AssetItem[]>(() => {
    const saved = serverStorage.getItem('mis_logistics_assets');
    return saved ? JSON.parse(saved) : MOCK_ASSETS;
  });
  const [handovers, setHandovers] = useState<AssetHandover[]>(() => {
    const saved = serverStorage.getItem('mis_logistics_handovers');
    return saved ? JSON.parse(saved) : MOCK_ASSET_HANDOVERS;
  });
  const [transfers, setTransfers] = useState<AssetTransfer[]>(() => {
    const saved = serverStorage.getItem('mis_logistics_transfers');
    return saved ? JSON.parse(saved) : MOCK_ASSET_TRANSFERS;
  });
  const [reports, setReports] = useState<MaintenanceReport[]>(() => {
    const saved = serverStorage.getItem('mis_logistics_reports');
    return saved ? JSON.parse(saved) : MOCK_MAINTENANCE_REPORTS;
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = serverStorage.getItem('mis_logistics_inventory');
    return saved ? JSON.parse(saved) : MOCK_INVENTORY_ITEMS;
  });
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => {
    const saved = serverStorage.getItem('mis_logistics_transactions');
    return saved ? JSON.parse(saved) : MOCK_INVENTORY_TRANSACTIONS;
  });
  const [bookings, setBookings] = useState<RoomBooking[]>(() => {
    const saved = serverStorage.getItem('mis_logistics_bookings_v2');
    return saved ? JSON.parse(saved) : [
      { id: 'BK001', roomName: 'Phòng Lab AI 1 (Tầng 3)', bookDate: '2026-06-08', slot: 3, teacherName: 'Thầy Trần Hoàng Nam', purpose: 'Thực hành huấn luyện thị giác máy tính OpenCV', status: 'DA_DUYET', createdAt: '2026-06-05' },
      { id: 'BK002', roomName: 'Thư viện Đa trí tuệ (Tầng 2)', bookDate: '2026-06-09', slot: 5, teacherName: 'Thầy Trần Quốc Đạt', purpose: 'Hoạt động kịch nghệ hóa tiết đọc sách Văn học', status: 'CHO_DUYET', createdAt: '2026-06-06' }
    ];
  });

  // Watchers to save to localStorage
  useEffect(() => { serverStorage.setItem('mis_logistics_assets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { serverStorage.setItem('mis_logistics_handovers', JSON.stringify(handovers)); }, [handovers]);
  useEffect(() => { serverStorage.setItem('mis_logistics_transfers', JSON.stringify(transfers)); }, [transfers]);
  useEffect(() => { serverStorage.setItem('mis_logistics_reports', JSON.stringify(reports)); }, [reports]);
  useEffect(() => { serverStorage.setItem('mis_logistics_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { serverStorage.setItem('mis_logistics_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { serverStorage.setItem('mis_logistics_bookings_v2', JSON.stringify(bookings)); }, [bookings]);

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.workspaceId === 'HANH_CHINH';

  // HELPER: Dashboard Stats
  const stats = useMemo(() => {
    return {
      totalAssets: assets.length,
      usingAssets: assets.filter(a => a.status === 'DANG_SU_DUNG').length,
      repairAssets: assets.filter(a => a.status === 'DANG_SUA_CHUA').length,
      pendingHandovers: handovers.filter(h => h.status === 'CHO_DUYET').length,
      pendingTransfers: transfers.filter(t => t.status === 'CHO_DUYET').length,
      pendingReports: reports.filter(r => r.status === 'CHO_TIEP_NHAN').length,
    };
  }, [assets, handovers, transfers, reports]);

  // UI STATES
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // HANDLERS
  const handleApproveHandover = (id: string, isApproved: boolean) => {
    setHandovers(prev => prev.map(h => {
      if (h.id === id) {
        if (isApproved) {
          // Update asset status
          setAssets(ast => ast.map(a => a.id === h.assetId ? { ...a, status: 'DANG_SU_DUNG', assignedTo: h.receiverId, assignedName: h.receiverName, location: h.location } : a));
        }
        return { ...h, status: isApproved ? 'DA_BAN_GIAO' : 'TU_CHOI', approvedBy: currentUser.name };
      }
      return h;
    }));
    toastSuccess('Thành công', isApproved ? 'Đã duyệt phiếu bàn giao!' : 'Đã từ chối phiếu bàn giao!');
  };

  const handleApproveTransfer = (id: string, isApproved: boolean) => {
    setTransfers(prev => prev.map(t => {
      if (t.id === id) {
        if (isApproved) {
          setAssets(ast => ast.map(a => a.id === t.assetId ? { ...a, location: t.toLocation } : a));
        }
        return { ...t, status: isApproved ? 'DA_CHUYEN' : 'TU_CHOI', approvedBy: currentUser.name };
      }
      return t;
    }));
    toastSuccess('Thành công', isApproved ? 'Đã duyệt phiếu điều chuyển!' : 'Đã từ chối phiếu điều chuyển!');
  };

  const handleUpdateReportStatus = (id: string, newStatus: MaintenanceReport['status']) => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        if (newStatus === 'DA_HOAN_THANH') {
          setAssets(ast => ast.map(a => a.id === r.assetId ? { ...a, status: 'SAN_SANG', condition: 'TOT' } : a));
          return { ...r, status: newStatus, completionDate: new Date().toISOString().substring(0, 10), assignedTechnician: currentUser.name };
        } else if (newStatus === 'DANG_SUA') {
          setAssets(ast => ast.map(a => a.id === r.assetId ? { ...a, status: 'DANG_SUA_CHUA' } : a));
          return { ...r, status: newStatus, assignedTechnician: currentUser.name };
        }
        return { ...r, status: newStatus };
      }
      return r;
    }));
    toastSuccess('Thành công', 'Đã cập nhật trạng thái sửa chữa!');
  };

  // RENDER TABS
  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-3xs">
          <p className="text-slate-500 text-[11px] font-bold uppercase mb-1">Tổng tài sản</p>
          <h4 className="text-2xl font-black text-slate-800 dark:text-white">{stats.totalAssets}</h4>
          <p className="text-[10px] text-teal-600 font-bold mt-1">{stats.usingAssets} đang sử dụng</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-3xs">
          <p className="text-slate-500 text-[11px] font-bold uppercase mb-1">Đang bảo trì</p>
          <h4 className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats.repairAssets}</h4>
          <p className="text-[10px] text-rose-500 font-bold mt-1">Cần theo dõi</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-3xs">
          <p className="text-slate-500 text-[11px] font-bold uppercase mb-1">Phiếu chờ duyệt</p>
          <h4 className="text-2xl font-black text-amber-600">{stats.pendingHandovers + stats.pendingTransfers}</h4>
          <p className="text-[10px] text-amber-600 font-bold mt-1">Bàn giao &amp; Điều chuyển</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-3xs">
          <p className="text-slate-500 text-[11px] font-bold uppercase mb-1">Yêu cầu sửa chữa</p>
          <h4 className="text-2xl font-black text-blue-600">{stats.pendingReports}</h4>
          <p className="text-[10px] text-blue-600 font-bold mt-1">Chờ tiếp nhận</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs">
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <BarChart className="w-4 h-4 text-indigo-500" /> Hoạt động mới nhất
        </h4>
        <div className="space-y-3">
          {handovers.slice(0, 2).map(h => (
            <div key={h.id} className="text-xs p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex justify-between items-center">
              <div>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">[Bàn giao]</span> {h.assetName} cho {h.receiverName}
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${h.status === 'CHO_DUYET' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{h.status}</span>
            </div>
          ))}
          {reports.slice(0, 2).map(r => (
            <div key={r.id} className="text-xs p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex justify-between items-center">
              <div>
                <span className="font-bold text-rose-600 dark:text-rose-400">[Báo hỏng]</span> {r.assetName} - {r.issueDescription}
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${r.status === 'CHO_TIEP_NHAN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAssets = () => {
    const filtered = assets.filter(a => {
      const matchQ = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchC = filterCategory === 'ALL' || a.category === filterCategory;
      const matchS = filterStatus === 'ALL' || a.status === filterStatus;
      return matchQ && matchC && matchS;
    });

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex gap-2 flex-wrap bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 rounded-xl shadow-3xs">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              placeholder="Tìm mã hoặc tên tài sản..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none">
            <option value="ALL">Tất cả danh mục</option>
            <option value="CNTT">CNTT &amp; Điện tử</option>
            <option value="THIET_BI_GIANG_DAY">Thiết bị giảng dạy</option>
            <option value="NOI_THAT">Nội thất</option>
            <option value="THU_VIEN">Thư viện</option>
            <option value="KHAC">Khác</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none">
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SAN_SANG">Sẵn sàng</option>
            <option value="DANG_SU_DUNG">Đang sử dụng</option>
            <option value="DANG_SUA_CHUA">Đang sửa chữa</option>
            <option value="THANH_LY">Đã thanh lý</option>
          </select>
          {isAdmin && (
            <button className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Thêm mới
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Mã TS</th>
                <th className="px-4 py-3 font-semibold">Tên tài sản</th>
                <th className="px-4 py-3 font-semibold">Vị trí</th>
                <th className="px-4 py-3 font-semibold">Người QL</th>
                <th className="px-4 py-3 font-semibold">Tình trạng</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">{item.code}</td>
                  <td className="px-4 py-3">
                    <strong className="text-slate-800 dark:text-slate-200">{item.name}</strong>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.category}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.location}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.assignedName || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.condition === 'MOI' || item.condition === 'TOT' ? 'bg-emerald-100 text-emerald-700' : item.condition === 'HONG' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'SAN_SANG' ? 'bg-blue-100 text-blue-700' : item.status === 'DANG_SU_DUNG' ? 'bg-teal-100 text-teal-700' : item.status === 'DANG_SUA_CHUA' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderHandovers = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Phiếu Bàn giao &amp; Cấp phát</h3>
        <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Tạo phiếu cấp phát
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {handovers.map(h => (
          <div key={h.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-3xs flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <strong className="text-sm text-slate-800 dark:text-slate-200">{h.assetName}</strong>
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">{h.assetCode}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${h.status === 'CHO_DUYET' ? 'bg-amber-100 text-amber-700' : h.status === 'DA_BAN_GIAO' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {h.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                <span>👤 Người nhận: <strong>{h.receiverName}</strong></span>
                <span>📍 Vị trí: <strong>{h.location}</strong></span>
                <span>📅 Ngày cấp: <strong>{h.handoverDate}</strong></span>
              </div>
              {h.notes && <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded mt-1">Ghi chú: {h.notes}</p>}
            </div>
            {isAdmin && h.status === 'CHO_DUYET' && (
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleApproveHandover(h.id, false)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg border border-rose-200 transition-colors">Từ chối</button>
                <button onClick={() => handleApproveHandover(h.id, true)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors">Duyệt cấp phát</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTransfers = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Phiếu Điều chuyển tài sản</h3>
        <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Đề xuất điều chuyển
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {transfers.map(t => (
          <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-3xs flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-1 w-full">
              <div className="flex items-center gap-2 mb-2">
                <strong className="text-sm text-slate-800 dark:text-slate-200">{t.assetName}</strong>
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">{t.assetCode}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.status === 'CHO_DUYET' ? 'bg-amber-100 text-amber-700' : t.status === 'DA_CHUYEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {t.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800/50 w-fit px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-rose-600">{t.fromLocation}</span>
                <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-emerald-600">{t.toLocation}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                👤 Đề xuất bởi: <strong>{t.requestorName}</strong> | 📅 Ngày: {t.requestDate}
                <p className="mt-0.5 text-slate-700 dark:text-slate-300">Lý do: {t.reason}</p>
              </div>
            </div>
            {isAdmin && t.status === 'CHO_DUYET' && (
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button onClick={() => handleApproveTransfer(t.id, false)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg border border-rose-200 transition-colors">Từ chối</button>
                <button onClick={() => handleApproveTransfer(t.id, true)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors">Duyệt điều chuyển</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Báo hỏng &amp; Theo dõi Sửa chữa</h3>
        <button className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-rose-600/20">
          <AlertTriangle className="w-3.5 h-3.5" /> Báo hỏng thiết bị
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(r => (
          <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-3xs flex flex-col gap-3 relative overflow-hidden">
            {r.priority === 'CAO' && <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>}
            <div>
              <div className="flex justify-between items-start gap-2 mb-1">
                <strong className="text-sm text-slate-800 dark:text-slate-200 leading-tight">{r.assetName}</strong>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold whitespace-nowrap ${r.status === 'CHO_TIEP_NHAN' ? 'bg-rose-100 text-rose-700' : r.status === 'DANG_SUA' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {r.status.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{r.assetCode}</span>
            </div>
            
            <div className="text-xs text-slate-600 dark:text-slate-300 bg-rose-50 dark:bg-rose-900/10 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
              <span className="font-bold text-rose-700 dark:text-rose-400">Tình trạng lỗi: </span>
              {r.issueDescription}
            </div>

            <div className="text-[11px] text-slate-500 flex flex-col gap-0.5">
              <span>👤 Người báo: <strong>{r.reporterName}</strong> ({r.reportDate})</span>
              {r.assignedTechnician && <span>👷 Kỹ thuật viên: <strong>{r.assignedTechnician}</strong></span>}
              {r.resolutionNotes && <span className="text-emerald-700 dark:text-emerald-400 mt-1">✅ KQ: {r.resolutionNotes}</span>}
            </div>

            {isAdmin && r.status !== 'DA_HOAN_THANH' && (
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {r.status === 'CHO_TIEP_NHAN' && (
                  <button onClick={() => handleUpdateReportStatus(r.id, 'DANG_SUA')} className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors">Tiếp nhận sửa</button>
                )}
                {r.status === 'DANG_SUA' && (
                  <button onClick={() => handleUpdateReportStatus(r.id, 'DA_HOAN_THANH')} className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors">Đã sửa xong</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Kho Vật tư Tiêu hao</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">Lịch sử X/N</button>
          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Tạo phiếu Xuất
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-3xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Mã VT</th>
              <th className="px-4 py-3 font-semibold">Tên vật tư</th>
              <th className="px-4 py-3 font-semibold">Đơn vị</th>
              <th className="px-4 py-3 font-semibold text-right">Tồn kho</th>
              <th className="px-4 py-3 font-semibold">Cảnh báo</th>
              <th className="px-4 py-3 font-semibold">Vị trí</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {inventory.map(item => {
              const isLow = item.currentStock <= item.minStockLevel;
              return (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">{item.code}</td>
                  <td className="px-4 py-3">
                    <strong className="text-slate-800 dark:text-slate-200">{item.name}</strong>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.category}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.unit}</td>
                  <td className={`px-4 py-3 text-right font-black text-sm ${isLow ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {item.currentStock}
                  </td>
                  <td className="px-4 py-3">
                    {isLow && <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 animate-pulse">Sắp hết</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.location}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBooking = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Đặt lịch Phòng Chức Năng</h3>
        <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Đăng ký phòng
        </button>
      </div>

      <div className="space-y-3">
        {bookings.map(book => {
          const statusBadge = book.status === 'DA_DUYET' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : book.status === 'TU_CHOI'
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse';

          return (
            <div key={book.id} className="p-4 border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 shadow-3xs flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <strong className="text-sm text-slate-850 dark:text-white font-bold">
                    🏢 {book.roomName}
                  </strong>
                  <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-tight ${statusBadge}`}>
                    {book.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex gap-4 text-[11px] text-slate-500">
                  <span>📅 Ngày: <strong>{book.bookDate}</strong></span>
                  <span>⏰ Tiết: <strong>{book.slot}</strong></span>
                  <span>👤 Mượn bởi: <strong>{book.teacherName}</strong></span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg font-medium">
                  {book.purpose}
                </p>
              </div>
              {isAdmin && book.status === 'CHO_DUYET' && (
                <div className="flex items-center gap-2 shrink-0 md:self-center">
                  <button onClick={() => {
                    setBookings(prev => prev.map(b => b.id === book.id ? { ...b, status: 'TU_CHOI' } : b))
                  }} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg border border-rose-200">Từ chối</button>
                  <button onClick={() => {
                    setBookings(prev => prev.map(b => b.id === book.id ? { ...b, status: 'DA_DUYET' } : b))
                  }} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg">Xác nhận</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6 animate-fade-in" id="school-logistics-root">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-800 to-indigo-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden border border-slate-700 shadow-lg">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 text-[10px] font-extrabold uppercase tracking-widest border border-white/10 flex items-center gap-1.5 w-fit">
            <Box className="w-3.5 h-3.5 text-amber-400" />
            FACILITIES &amp; LOGISTICS CENTER
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-tight">
            Quản lý Tài sản &amp; Thiết bị học đường
          </h1>
          <p className="text-xs md:text-sm text-indigo-100/80 leading-relaxed font-light">
            Trung tâm kiểm soát toàn diện thiết bị, nội thất, cơ sở hạ tầng, cấp phát vật tư và quản lý bảo trì tài sản nhà trường.
          </p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full xl:w-64 shrink-0 space-y-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-3xs flex flex-col gap-1">
            <button onClick={() => setActiveTab('DASHBOARD')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'DASHBOARD' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
              <LayoutDashboard className="w-4 h-4" /> Tổng quan (Dashboard)
            </button>
            <button onClick={() => setActiveTab('ASSETS')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'ASSETS' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
              <Box className="w-4 h-4" /> Danh mục Tài sản
            </button>
            <button onClick={() => setActiveTab('HANDOVER')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'HANDOVER' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
              <ClipboardCheck className="w-4 h-4" /> Bàn giao &amp; Cấp phát
            </button>
            <button onClick={() => setActiveTab('TRANSFER')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'TRANSFER' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
              <ArrowRightLeft className="w-4 h-4" /> Quản lý Điều chuyển
            </button>
            <button onClick={() => setActiveTab('MAINTENANCE')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'MAINTENANCE' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
              <Wrench className="w-4 h-4" /> Báo hỏng &amp; Sửa chữa
            </button>
            <button onClick={() => setActiveTab('INVENTORY')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'INVENTORY' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
              <Archive className="w-4 h-4" /> Kho Vật tư tiêu hao
            </button>
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
            <button onClick={() => setActiveTab('BOOKING')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'BOOKING' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
              <Calendar className="w-4 h-4" /> Đặt phòng chức năng
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'DASHBOARD' && renderDashboard()}
          {activeTab === 'ASSETS' && renderAssets()}
          {activeTab === 'HANDOVER' && renderHandovers()}
          {activeTab === 'TRANSFER' && renderTransfers()}
          {activeTab === 'MAINTENANCE' && renderMaintenance()}
          {activeTab === 'INVENTORY' && renderInventory()}
          {activeTab === 'BOOKING' && renderBooking()}
        </div>
      </div>
    </div>
  );
}
