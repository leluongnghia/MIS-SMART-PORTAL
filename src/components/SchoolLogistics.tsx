import { serverStorage } from '../libs/client/server-storage';
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translateBooking, translateIssue } from '../utils/translations';
import { useToast } from './ui/Toast';
import { 
  Plus, 
  Check, 
  X, 
  AlertTriangle, 
  Wrench, 
  MapPin, 
  Calendar, 
  Clock, 
  Cpu, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { UserProfile, InventoryItem, BorrowLog } from '../types';
import { MOCK_INVENTORY_ITEMS, MOCK_BORROW_LOGS } from '../mockData';
import { BookOpen, FileText } from 'lucide-react';

interface SchoolLogisticsProps {
  currentUser: UserProfile;
}

interface RoomBooking {
  id: string;
  roomName: string;
  bookDate: string;
  slot: number; // Tiết 1 -> 8
  teacherName: string;
  purpose: string;
  status: 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI';
  createdAt: string;
}

interface MaintenanceReport {
  id: string;
  roomName: string;
  category: 'DIEN_LANH' | 'MAY_CHIEU' | 'AN_NINH' | 'BAN_GHE' | 'KHAC';
  description: string;
  urgency: 'THUONG' | 'CAO' | 'KHAN';
  status: 'CHO_XU_LY' | 'DANG_XU_LY' | 'DA_HOAN_THANH';
  reporterName: string;
  createdAt: string;
  feedback?: string;
}

const ROOMS_LIST = [
  'Phòng Lab AI 1 (Tầng 3)',
  'Phòng máy tính 1 (Tầng 2)',
  'Phòng máy tính 2 (Tầng 2)',
  'Phòng STEAM (Tầng 4)',
  'Thư viện Đa trí tuệ (Tầng 2)',
  'Hội trường lớn (Tầng 1)'
];

export default function SchoolLogistics({ currentUser }: SchoolLogisticsProps) {
  const { lang, t } = useLanguage();
  const { success: toastSuccess, error: toastError } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'ROOMS_ISSUES' | 'INVENTORY'>('ROOMS_ISSUES');

  // Inventory & Library states
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    const saved = serverStorage.getItem('mis_inventory_items_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_INVENTORY_ITEMS;
  });

  const [borrowLogs, setBorrowLogs] = useState<BorrowLog[]>(() => {
    const saved = serverStorage.getItem('mis_borrow_logs_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_BORROW_LOGS;
  });

  // Sync to local storage
  useEffect(() => {
    serverStorage.setItem('mis_inventory_items_v3', JSON.stringify(inventoryItems));
  }, [inventoryItems]);

  useEffect(() => {
    serverStorage.setItem('mis_borrow_logs_v3', JSON.stringify(borrowLogs));
  }, [borrowLogs]);

  // Inventory filters and form states
  const [searchItemQuery, setSearchItemQuery] = useState('');
  const [itemCategoryFilter, setItemCategoryFilter] = useState<'ALL' | 'SACH' | 'THIET_BI'>('ALL');
  const [itemStatusFilter, setItemStatusFilter] = useState<'ALL' | 'SAN_SANG' | 'DANG_CHO_MUON' | 'BAO_HONG' | 'THANH_LY'>('ALL');

  // Borrow form states
  const [borrowItemCode, setBorrowItemCode] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerRole, setBorrowerRole] = useState<'TEACHER' | 'STUDENT'>('STUDENT');
  const [borrowDate, setBorrowDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [borrowDueDate, setBorrowDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().substring(0, 10);
  });
  const [showBorrowForm, setShowBorrowForm] = useState(false);

  // Liquidation / status form states
  const [updateItemCode, setUpdateItemCode] = useState('');
  const [updateItemStatus, setUpdateItemStatus] = useState<'SAN_SANG' | 'DANG_CHO_MUON' | 'BAO_HONG' | 'THANH_LY'>('SAN_SANG');
  const [updateItemCondition, setUpdateItemCondition] = useState<'MOI' | 'BINH_THUONG' | 'CU' | 'HONG'>('BINH_THUONG');
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Handlers for Inventory
  const handleCreateBorrowLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowItemCode || !borrowerName.trim()) return;

    // Check if item exists and has quantity
    const matchedItem = inventoryItems.find(item => item.code === borrowItemCode);
    if (!matchedItem) {
      toastError('Lỗi', 'Không tìm thấy tài sản với mã này trong hệ thống.');
      return;
    }
    if (matchedItem.quantity <= 0) {
      toastError('Lỗi', 'Số lượng trong kho đã hết. Không thể cho mượn.');
      return;
    }

    const newLog: BorrowLog = {
      id: 'br_' + Date.now(),
      itemCode: borrowItemCode,
      itemName: matchedItem.name,
      category: matchedItem.category,
      borrowerName: borrowerName.trim(),
      borrowerRole,
      borrowDate,
      dueDate: borrowDueDate,
      status: 'DANG_MUON'
    };

    // Decrement item quantity and update status if quantity becomes 0
    setInventoryItems(prevItems => prevItems.map(item => {
      if (item.code === borrowItemCode) {
        const nextQty = item.quantity - 1;
        return {
          ...item,
          quantity: nextQty,
          status: nextQty === 0 ? 'DANG_CHO_MUON' : item.status
        };
      }
      return item;
    }));

    setBorrowLogs([newLog, ...borrowLogs]);
    setBorrowItemCode('');
    setBorrowerName('');
    setShowBorrowForm(false);
    toastSuccess('Thành công', 'Đăng ký phiếu mượn tài sản thành công!');
  };

  const handleReturnItem = (logId: string) => {
    const log = borrowLogs.find(l => l.id === logId);
    if (!log) return;

    setBorrowLogs(prevLogs => prevLogs.map(l => {
      if (l.id === logId) {
        return {
          ...l,
          status: 'DA_TRA',
          returnDate: new Date().toISOString().substring(0, 10)
        };
      }
      return l;
    }));

    // Increment item quantity and mark ready
    setInventoryItems(prevItems => prevItems.map(item => {
      if (item.code === log.itemCode) {
        return {
          ...item,
          quantity: item.quantity + 1,
          status: item.status === 'DANG_CHO_MUON' ? 'SAN_SANG' : item.status
        };
      }
      return item;
    }));

    toastSuccess('Thành công', 'Đã ghi nhận trả tài sản thành công!');
  };

  const handleUpdateItemStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateItemCode) return;

    const matchedItem = inventoryItems.find(item => item.code === updateItemCode);
    if (!matchedItem) {
      toastError('Lỗi', 'Không tìm thấy tài sản với mã này.');
      return;
    }

    setInventoryItems(prevItems => prevItems.map(item => {
      if (item.code === updateItemCode) {
        return {
          ...item,
          status: updateItemStatus,
          condition: updateItemCondition
        };
      }
      return item;
    }));

    setUpdateItemCode('');
    setShowUpdateForm(false);
    toastSuccess('Thành công', 'Cập nhật trạng thái và kiểm kê tài sản thành công!');
  };

  // 1. Quản lý Đăng ký phòng
  const [bookings, setBookings] = useState<RoomBooking[]>(() => {
    const saved = serverStorage.getItem('mis_logistics_bookings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'BK001',
        roomName: 'Phòng Lab AI 1 (Tầng 3)',
        bookDate: '2026-06-08',
        slot: 3,
        teacherName: 'Thầy Trần Hoàng Nam',
        purpose: 'Thực hành huấn luyện thị giác máy tính OpenCV',
        status: 'DA_DUYET',
        createdAt: '2026-06-05'
      },
      {
        id: 'BK002',
        roomName: 'Thư viện Đa trí tuệ (Tầng 2)',
        bookDate: '2026-06-09',
        slot: 5,
        teacherName: 'Thầy Trần Quốc Đạt',
        purpose: 'Hoạt động kịch nghệ hóa tiết đọc sách Văn học',
        status: 'CHO_DUYET',
        createdAt: '2026-06-06'
      }
    ];
  });

  // 2. Quản lý Báo hỏng thiết bị
  const [issues, setIssues] = useState<MaintenanceReport[]>(() => {
    const saved = serverStorage.getItem('mis_logistics_issues');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'MH001',
        roomName: 'Phòng 302 (Khối 10)',
        category: 'DIEN_LANH',
        description: 'Điều hòa Panasonic bị chảy nước ở dàn lạnh và phát tiếng kêu lớn, không mát.',
        urgency: 'CAO',
        status: 'DANG_XU_LY',
        reporterName: 'Cô Lê Thị Thanh Nhàn',
        createdAt: '2026-06-06 09:15'
      },
      {
        id: 'MH002',
        roomName: 'Phòng máy tính 2 (Tầng 2)',
        category: 'MAY_CHIEU',
        description: 'Máy chiếu Epson có hiện tượng nháy hình liên tục, bóng đèn chiếu mờ.',
        urgency: 'THUONG',
        status: 'CHO_XU_LY',
        reporterName: 'Thầy Trần Hoàng Nam',
        createdAt: '2026-06-07 11:30'
      }
    ];
  });

  useEffect(() => {
    serverStorage.setItem('mis_logistics_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    serverStorage.setItem('mis_logistics_issues', JSON.stringify(issues));
  }, [issues]);

  // Form Booking States
  const [newBooking, setNewBooking] = useState({
    roomName: ROOMS_LIST[0],
    bookDate: new Date().toISOString().substring(0, 10),
    slot: '1',
    purpose: ''
  });
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Form Báo hỏng States
  const [newIssue, setNewIssue] = useState<{
    roomName: string;
    category: MaintenanceReport['category'];
    description: string;
    urgency: MaintenanceReport['urgency'];
  }>({
    roomName: '',
    category: 'DIEN_LANH',
    description: '',
    urgency: 'THUONG'
  });
  const [showIssueForm, setShowIssueForm] = useState(false);

  // Ghi chú khi bảo trì
  const [maintenanceNotes, setMaintenanceNotes] = useState<Record<string, string>>({});

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.purpose) return;

    const booking: RoomBooking = {
      id: `BK${Date.now().toString().slice(-4)}`,
      roomName: newBooking.roomName,
      bookDate: newBooking.bookDate,
      slot: Number(newBooking.slot),
      teacherName: currentUser.name,
      purpose: newBooking.purpose,
      status: 'CHO_DUYET',
      createdAt: new Date().toISOString().substring(0, 10)
    };

    setBookings([booking, ...bookings]);
    setNewBooking({ roomName: ROOMS_LIST[0], bookDate: new Date().toISOString().substring(0, 10), slot: '1', purpose: '' });
    setShowBookingForm(false);
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssue.roomName || !newIssue.description) return;

    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const report: MaintenanceReport = {
      id: `MH${Date.now().toString().slice(-4)}`,
      roomName: newIssue.roomName,
      category: newIssue.category,
      description: newIssue.description,
      urgency: newIssue.urgency,
      status: 'CHO_XU_LY',
      reporterName: currentUser.name,
      createdAt: timeStr
    };

    setIssues([report, ...issues]);
    setNewIssue({ roomName: '', category: 'DIEN_LANH', description: '', urgency: 'THUONG' });
    setShowIssueForm(false);
  };

  const handleUpdateBookingStatus = (id: string, status: 'DA_DUYET' | 'TU_CHOI') => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleUpdateIssueStatus = (id: string, status: 'DANG_XU_LY' | 'DA_HOAN_THANH') => {
    const note = maintenanceNotes[id] || '';
    setIssues(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          status,
          feedback: note.trim() ? `[Phản hồi kỹ thuật]: ${note.trim()}` : undefined
        };
      }
      return i;
    }));
    setMaintenanceNotes(prev => ({ ...prev, [id]: '' }));
  };

  const filteredInventory = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchItemQuery.toLowerCase()) || item.code.toLowerCase().includes(searchItemQuery.toLowerCase());
      const matchesCategory = itemCategoryFilter === 'ALL' || item.category === itemCategoryFilter;
      const matchesStatus = itemStatusFilter === 'ALL' || item.status === itemStatusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventoryItems, searchItemQuery, itemCategoryFilter, itemStatusFilter]);

  const canManageInventory = currentUser.role === 'ADMIN' || currentUser.title.includes('Thư viện') || currentUser.workspaceId === 'HANH_CHINH';

  return (
    <div className="w-full space-y-6 animate-fade-in" id="school-logistics-root">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-650 via-teal-800 to-indigo-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden border border-teal-500/20 shadow-lg">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-teal-200 text-[10px] font-extrabold uppercase tracking-widest border border-white/10 flex items-center gap-1.5 w-fit">
            <Wrench className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            FACILITIES &amp; LOGISTICS CENTER
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-tight">
            {lang === 'vi' ? 'Vận hành và thiết bị học đường' : 'Facilities & Logistics Center'}
          </h1>
          <p className="text-xs md:text-sm text-teal-100/80 leading-relaxed font-light">
            {lang === 'vi' ? 'Phân hệ hậu cần hỗ trợ giáo viên đăng ký phòng chức năng và báo hỏng thiết bị trực tiếp tới tổ Hành chính.' : 'Logistics module assisting teachers in booking laboratory/functional rooms and reporting equipment issues.'}
          </p>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 select-none">
        <button
          onClick={() => setActiveSubTab('ROOMS_ISSUES')}
          className={'px-6 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ' + (
            activeSubTab === 'ROOMS_ISSUES' ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          📅 Đặt phòng &amp; Báo hỏng thiết bị
        </button>
        <button
          onClick={() => setActiveSubTab('INVENTORY')}
          className={'px-6 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ' + (
            activeSubTab === 'INVENTORY' ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          📚 Thư viện &amp; Kho thiết bị (Inventory)
        </button>
      </div>

      {activeSubTab === 'ROOMS_ISSUES' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* 1. PHÂN HỆ ĐĂNG KÝ PHÒNG CHỨC NĂNG */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
            <div>
              <h3 className="font-display font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <MapPin className="text-teal-600 w-4.5 h-4.5" />
                {lang === 'vi' ? 'Đặt lịch phòng chức năng' : 'Functional Room Bookings'}
              </h3>
              <p className="text-[10.5px] text-slate-500">{lang === 'vi' ? 'Mượn phòng Lab AI, máy tính, thư viện cho hoạt động thực nghiệm.' : 'Book AI lab, computer labs, or library for experimental activities.'}</p>
            </div>
            
            <button
              onClick={() => setShowBookingForm(!showBookingForm)}
              className="px-2.5 py-1 bg-teal-650 hover:bg-teal-750 text-white text-[10.5px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all no-print"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Đăng ký phòng' : 'Book Room'}</span>
            </button>
          </div>

          {/* Form Booking */}
          {showBookingForm && (
            <form onSubmit={handleCreateBooking} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-205 dark:border-slate-800 space-y-3 font-sans">
              <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200">{lang === 'vi' ? 'Đăng ký sử dụng phòng học chức năng' : 'Book a Functional Room'}</h4>
              
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Chọn phòng học' : 'Select Room'}</label>
                  <select
                    value={newBooking.roomName}
                    onChange={(e) => setNewBooking({...newBooking, roomName: e.target.value})}
                    className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-805 dark:text-slate-350 focus:outline-none"
                  >
                    {ROOMS_LIST.map(r => (
                      <option key={r} value={r}>{lang === 'vi' ? r : (
                        r.includes('Lab AI 1') ? 'AI Lab Room 1 (3rd Floor)' :
                        r.includes('máy tính 1') ? 'Computer Lab 1 (2nd Floor)' :
                        r.includes('máy tính 2') ? 'Computer Lab 2 (2nd Floor)' :
                        r.includes('STEAM') ? 'STEAM Room (4th Floor)' :
                        r.includes('Đa trí tuệ') ? 'Multi-Intelligence Library (2nd Floor)' :
                        'Grand Auditorium (1st Floor)'
                      )}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Ngày mượn' : 'Booking Date'}</label>
                    <input
                      type="date"
                      required
                      value={newBooking.bookDate}
                      onChange={(e) => setNewBooking({...newBooking, bookDate: e.target.value})}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-350"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Mượn vào Tiết mấy' : 'Select Class Slot'}</label>
                    <select
                      value={newBooking.slot}
                      onChange={(e) => setNewBooking({...newBooking, slot: e.target.value})}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-350"
                    >
                      <option value="1">{lang === 'vi' ? 'Tiết 1 (Sáng)' : 'Slot 1 (Morning)'}</option>
                      <option value="2">{lang === 'vi' ? 'Tiết 2 (Sáng)' : 'Slot 2 (Morning)'}</option>
                      <option value="3">{lang === 'vi' ? 'Tiết 3 (Sáng)' : 'Slot 3 (Morning)'}</option>
                      <option value="4">{lang === 'vi' ? 'Tiết 4 (Sáng)' : 'Slot 4 (Morning)'}</option>
                      <option value="5">{lang === 'vi' ? 'Tiết 5 (Chiều)' : 'Slot 5 (Afternoon)'}</option>
                      <option value="6">{lang === 'vi' ? 'Tiết 6 (Chiều)' : 'Slot 6 (Afternoon)'}</option>
                      <option value="7">{lang === 'vi' ? 'Tiết 7 (Chiều)' : 'Slot 7 (Afternoon)'}</option>
                      <option value="8">{lang === 'vi' ? 'Tiết 8 (Chiều)' : 'Slot 8 (Afternoon)'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Mục đích sử dụng cụ thể' : 'Specific Purpose of Use'}</label>
                  <textarea
                    rows={2}
                    required
                    placeholder={lang === 'vi' ? 'Ví dụ: Dạy thực hành lập trình Python Robot...' : 'e.g. Practical teaching of Python Robot programming...'}
                    value={newBooking.purpose}
                    onChange={(e) => setNewBooking({...newBooking, purpose: e.target.value})}
                    className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    {lang === 'vi' ? 'Huỷ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-teal-650 hover:bg-teal-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    {lang === 'vi' ? 'Gửi yêu cầu' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* List Bookings */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {bookings.map(b => translateBooking(b, lang)).map(book => {
              const isAdmin = currentUser.role === 'ADMIN';
              const statusBadge = book.status === 'DA_DUYET' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : book.status === 'TU_CHOI'
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse';

              const statusText = book.status === 'DA_DUYET' 
                ? (lang === 'vi' ? 'Đã xác nhận' : 'Confirmed')
                : book.status === 'TU_CHOI'
                ? (lang === 'vi' ? 'Từ chối' : 'Rejected')
                : (lang === 'vi' ? 'Chờ duyệt' : 'Pending Approval');

              return (
                <div key={book.id} className="p-4 border border-slate-200 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/40 space-y-2 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-3 flex-wrap">
                    <div>
                      <strong className="text-slate-850 dark:text-white font-bold text-xs flex items-center gap-1">
                        🏢 {book.roomName}
                      </strong>
                      <div className="flex gap-3 text-[10px] text-slate-450 mt-1 flex-wrap">
                        <span>{lang === 'vi' ? '📅 Ngày' : '📅 Date'}: <strong>{book.bookDate}</strong></span>
                        <span>{lang === 'vi' ? '⏰ Tiết' : '⏰ Slot'}: <strong>{book.slot}</strong></span>
                        <span>{lang === 'vi' ? '👤 Mượn bởi' : '👤 Booked by'}: <strong>{book.teacherName}</strong></span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-tight ${statusBadge}`}>
                      {statusText}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-slate-600 dark:text-slate-350 bg-slate-550/5 p-2.5 rounded-lg border border-slate-100 dark:border-transparent font-medium">
                    {book.purpose}
                  </p>

                  {isAdmin && book.status === 'CHO_DUYET' && (
                    <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-850 pt-2 mt-1.5 no-print">
                      <button
                        onClick={() => handleUpdateBookingStatus(book.id, 'TU_CHOI')}
                        className="px-2.5 py-0.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] rounded cursor-pointer flex items-center gap-0.5"
                      >
                        <X className="w-3 h-3" /> {lang === 'vi' ? 'Từ chối' : 'Reject'}
                      </button>
                      <button
                        onClick={() => handleUpdateBookingStatus(book.id, 'DA_DUYET')}
                        className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded cursor-pointer flex items-center gap-0.5"
                      >
                        <Check className="w-3 h-3" /> {lang === 'vi' ? 'Xác nhận mượn' : 'Confirm'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. PHÂN HỆ BÁO HỎNG & BẢO TRÌ THIẾT BỊ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
            <div>
              <h3 className="font-display font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Wrench className="text-teal-600 w-4.5 h-4.5" />
                {lang === 'vi' ? 'Báo hỏng & Sửa chữa thiết bị' : 'Equipment Maintenance'}
              </h3>
              <p className="text-[10.5px] text-slate-500">{lang === 'vi' ? 'Khai báo quạt máy, điều hòa, máy chiếu lỗi cần phòng HC-QT hỗ trợ.' : 'Report faulty ACs, fans, projectors for administration team to repair.'}</p>
            </div>
            
            <button
              onClick={() => setShowIssueForm(!showIssueForm)}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10.5px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all no-print"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
              <span>{lang === 'vi' ? 'Báo hỏng' : 'Report Issue'}</span>
            </button>
          </div>

          {/* Form Báo hỏng */}
          {showIssueForm && (
            <form onSubmit={handleCreateIssue} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-205 dark:border-slate-800 space-y-3 font-sans">
              <h4 className="text-xs font-bold text-rose-800 dark:text-rose-455">{lang === 'vi' ? 'Báo cáo thiết bị hư hỏng, sự cố' : 'Report Faulty Equipment'}</h4>
              
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Vị trí / Tên phòng' : 'Location / Room Name'}</label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'vi' ? 'Ví dụ: Phòng 302, Thư viện...' : 'e.g. Room 302, Library...'}
                      value={newIssue.roomName}
                      onChange={(e) => setNewIssue({...newIssue, roomName: e.target.value})}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Nhóm thiết bị' : 'Equipment Category'}</label>
                    <select
                      value={newIssue.category}
                      onChange={(e: any) => setNewIssue({...newIssue, category: e.target.value})}
                      className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-805 dark:text-slate-350 focus:outline-none"
                    >
                      <option value="DIEN_LANH">{lang === 'vi' ? 'Điều hòa / Quạt máy' : 'AC / Fan'}</option>
                      <option value="MAY_CHIEU">{lang === 'vi' ? 'Máy chiếu / Màn hình' : 'Projector / Screen'}</option>
                      <option value="AN_NINH">{lang === 'vi' ? 'Cửa / Khóa / Camera' : 'Door / Lock / Camera'}</option>
                      <option value="BAN_GHE">{lang === 'vi' ? 'Bàn ghế / Bảng viết' : 'Desk / Whiteboard'}</option>
                      <option value="KHAC">{lang === 'vi' ? 'Thiết bị khác' : 'Other Equipment'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Mức độ khẩn cấp' : 'Urgency Level'}</label>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setNewIssue({...newIssue, urgency: 'THUONG'})}
                      className={`py-1.5 border rounded-lg ${newIssue.urgency === 'THUONG' ? 'bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800 dark:border-slate-600' : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-500'}`}
                    >
                      {lang === 'vi' ? 'Thường' : 'Normal'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewIssue({...newIssue, urgency: 'CAO'})}
                      className={`py-1.5 border rounded-lg ${newIssue.urgency === 'CAO' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-500'}`}
                    >
                      {lang === 'vi' ? 'Cao' : 'High'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewIssue({...newIssue, urgency: 'KHAN'})}
                      className={`py-1.5 border rounded-lg ${newIssue.urgency === 'KHAN' ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-500'}`}
                    >
                      {lang === 'vi' ? 'Khẩn cấp' : 'Emergency'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-450 block mb-1">{lang === 'vi' ? 'Mô tả chi tiết sự cố' : 'Detailed Incident Description'}</label>
                  <textarea
                    rows={2}
                    required
                    placeholder={lang === 'vi' ? 'Mô tả cụ thể hiện trạng (Ví dụ: Máy chiếu nhấp nháy đèn báo lỗi Lamp đỏ...)' : 'Describe issue (e.g. Projector flashing red Lamp light...)'}
                    value={newIssue.description}
                    onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                    className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowIssueForm(false)}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    {lang === 'vi' ? 'Huỷ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    {lang === 'vi' ? 'Báo cáo sự cố' : 'Report Incident'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* List Issues */}
          <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
            {issues.map(i => translateIssue(i, lang)).map(item => {
              const isAdmin = currentUser.role === 'ADMIN';
              const urgencyBadge = item.urgency === 'KHAN' 
                ? 'bg-rose-50 border-rose-200 text-rose-700 font-extrabold animate-pulse'
                : item.urgency === 'CAO'
                ? 'bg-orange-50 border-orange-200 text-orange-700 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-650';

              const statusText = item.status === 'DA_HOAN_THANH'
                ? (lang === 'vi' ? 'Đã sửa xong' : 'Completed')
                : item.status === 'DANG_XU_LY'
                ? (lang === 'vi' ? 'Đang sửa chữa' : 'In Progress')
                : (lang === 'vi' ? 'Chờ tiếp nhận' : 'Pending');

              const statusBadge = item.status === 'DA_HOAN_THANH'
                ? 'bg-emerald-50 border-emerald-150 text-emerald-700'
                : item.status === 'DANG_XU_LY'
                ? 'bg-amber-50 border-amber-150 text-amber-705'
                : 'bg-slate-100 border-slate-200 text-slate-500';

              return (
                <div key={item.id} className="p-4 border border-slate-200 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/40 space-y-2.5">
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <div>
                      <strong className="text-slate-900 dark:text-white font-bold text-xs flex items-center gap-1.5">
                        📍 {item.roomName}
                      </strong>
                      <span className="text-[10px] text-slate-400 mt-1 block">{lang === 'vi' ? 'Người báo' : 'Reporter'}: <strong>{item.reporterName}</strong> - {item.createdAt}</span>
                    </div>

                    <div className="flex gap-1">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${urgencyBadge}`}>
                        {item.urgency === 'KHAN' ? (lang === 'vi' ? 'Khẩn cấp' : 'Emergency') : item.urgency === 'CAO' ? (lang === 'vi' ? 'Cao' : 'High') : (lang === 'vi' ? 'Thường' : 'Normal')}
                      </span>
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-extrabold uppercase ${statusBadge}`}>
                        {statusText}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed font-sans bg-slate-550/5 p-2 rounded-lg border border-slate-100/50 dark:border-transparent dark:bg-slate-900/40">
                    {item.description}
                  </p>

                  {/* Feedback bảo trì nếu có */}
                  {item.feedback && (
                    <p className="text-[10.5px] text-teal-800 dark:text-teal-400 leading-normal italic font-semibold pl-2 border-l-2 border-teal-500">
                      {item.feedback}
                    </p>
                  )}

                  {/* Action panel cho BGH/ADMIN */}
                  {isAdmin && item.status !== 'DA_HOAN_THANH' && (
                    <div className="border-t border-slate-100 dark:border-slate-850 pt-2.5 space-y-2 no-print">
                      <input
                        type="text"
                        placeholder={lang === 'vi' ? 'Ghi chú báo cáo sửa chữa (ví dụ: đã thay bóng đèn)...' : 'Maintenance report notes (e.g., replaced projector bulb)...'}
                        value={maintenanceNotes[item.id] || ''}
                        onChange={(e) => setMaintenanceNotes({ ...maintenanceNotes, [item.id]: e.target.value })}
                        className="w-full text-[10.5px] border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                      />
                      <div className="flex justify-end gap-2">
                        {item.status === 'CHO_XU_LY' && (
                          <button
                            onClick={() => handleUpdateIssueStatus(item.id, 'DANG_XU_LY')}
                            className="px-2.5 py-0.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded cursor-pointer flex items-center gap-0.5 shadow-3xs"
                          >
                            <Wrench className="w-3.5 h-3.5" /> {lang === 'vi' ? 'Điều phối kỹ thuật' : 'Dispatch Tech'}
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateIssueStatus(item.id, 'DA_HOAN_THANH')}
                          className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-[10px] rounded cursor-pointer flex items-center gap-0.5 shadow-3xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> {lang === 'vi' ? 'Báo sửa xong' : 'Mark Fixed'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
      ) : (
        <div className="space-y-6 text-xs animate-fade-in">
          
          {/* Inventory Controls Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Catalog list */}
            <div className="xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-3xs">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-display font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <BookOpen className="text-teal-600 w-4.5 h-4.5" />
                    Danh mục Tài sản &amp; Sách Thư viện
                  </h3>
                  <p className="text-[10.5px] text-slate-500">Xem và lọc danh sách sách thư viện cùng các trang thiết bị trường học.</p>
                </div>
                
                <div className="flex gap-2">
                  {canManageInventory && (
                    <>
                      <button
                        type="button"
                        onClick={() => { setShowBorrowForm(!showBorrowForm); setShowUpdateForm(false); }}
                        className="px-2.5 py-1.5 bg-teal-650 hover:bg-teal-750 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Cho mượn
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowUpdateForm(!showUpdateForm); setShowBorrowForm(false); }}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-250 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Wrench className="w-3 h-3" /> Kiểm kê/Thanh lý
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Filters & Search */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input 
                  value={searchItemQuery}
                  onChange={(e) => setSearchItemQuery(e.target.value)}
                  className="text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 focus:outline-none" 
                  placeholder="Tìm theo tên hoặc mã tài sản..."
                />
                <select 
                  value={itemCategoryFilter}
                  onChange={(e: any) => setItemCategoryFilter(e.target.value)}
                  className="text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300"
                >
                  <option value="ALL">Tất cả danh mục</option>
                  <option value="SACH">Sách (SACH)</option>
                  <option value="THIET_BI">Thiết bị (THIET_BI)</option>
                </select>
                <select 
                  value={itemStatusFilter}
                  onChange={(e: any) => setItemStatusFilter(e.target.value)}
                  className="text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="SAN_SANG">Sẵn sàng</option>
                  <option value="DANG_CHO_MUON">Đang cho mượn</option>
                  <option value="BAO_HONG">Báo hỏng</option>
                  <option value="THANH_LY">Thanh lý</option>
                </select>
              </div>

              {/* Forms */}
              {showBorrowForm && (
                <form onSubmit={handleCreateBorrowLog} className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-850 rounded-xl space-y-3">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Đăng ký cho mượn tài sản / sách</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Mã tài sản</label>
                      <select 
                        value={borrowItemCode} 
                        onChange={(e) => setBorrowItemCode(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                        required
                      >
                        <option value="">-- Chọn tài sản --</option>
                        {inventoryItems.filter(item => item.quantity > 0 && item.status === 'SAN_SANG').map(item => (
                          <option key={item.id} value={item.code}>{item.name} ({item.code} - còn {item.quantity})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Tên người mượn</label>
                      <input 
                        value={borrowerName} 
                        onChange={(e) => setBorrowerName(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-white text-slate-800 dark:text-slate-200 focus:outline-none" 
                        placeholder="Nguyễn Văn A..." 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Vai trò</label>
                      <select 
                        value={borrowerRole} 
                        onChange={(e: any) => setBorrowerRole(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-350 focus:outline-none"
                      >
                        <option value="STUDENT">Học sinh</option>
                        <option value="TEACHER">Giáo viên</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Ngày mượn</label>
                      <input 
                        type="date"
                        value={borrowDate} 
                        onChange={(e) => setBorrowDate(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-white text-slate-800 dark:text-slate-200"
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Hạn trả dự kiến</label>
                      <input 
                        type="date"
                        value={borrowDueDate} 
                        onChange={(e) => setBorrowDueDate(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-white text-slate-800 dark:text-slate-200"
                        required 
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowBorrowForm(false)} className="px-3 py-1.5 border border-slate-200 rounded-lg font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900">Hủy</button>
                    <button type="submit" className="px-3.5 py-1.5 bg-teal-655 text-white font-bold rounded-lg">Cho mượn</button>
                  </div>
                </form>
              )}

              {showUpdateForm && (
                <form onSubmit={handleUpdateItemStatus} className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-850 rounded-xl space-y-3">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Kiểm kê tình trạng &amp; Thanh lý tài sản</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Tài sản cần cập nhật</label>
                      <select 
                        value={updateItemCode} 
                        onChange={(e) => setUpdateItemCode(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                        required
                      >
                        <option value="">-- Chọn tài sản --</option>
                        {inventoryItems.map(item => (
                          <option key={item.id} value={item.code}>{item.name} ({item.code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Trạng thái vận hành</label>
                      <select 
                        value={updateItemStatus} 
                        onChange={(e: any) => setUpdateItemStatus(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-805 dark:text-slate-350 focus:outline-none"
                      >
                        <option value="SAN_SANG">Sẵn sàng</option>
                        <option value="DANG_CHO_MUON">Đang cho mượn</option>
                        <option value="BAO_HONG">Báo hỏng</option>
                        <option value="THANH_LY">Thanh lý (Liquidated)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Hiện trạng vật lý</label>
                      <select 
                        value={updateItemCondition} 
                        onChange={(e: any) => setUpdateItemCondition(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-805 dark:text-slate-350 focus:outline-none"
                      >
                        <option value="MOI">Mới 100%</option>
                        <option value="BINH_THUONG">Bình thường</option>
                        <option value="CU">Cũ/Đã qua sử dụng</option>
                        <option value="HONG">Hỏng hóc/Cần sửa chữa</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowUpdateForm(false)} className="px-3 py-1.5 border border-slate-200 rounded-lg font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900">Hủy</button>
                    <button type="submit" className="px-3.5 py-1.5 bg-rose-650 text-white font-bold rounded-lg">Cập nhật kiểm kê</button>
                  </div>
                </form>
              )}

              {/* Table list */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5">Mã TS</th>
                      <th className="px-4 py-2.5">Tên tài sản</th>
                      <th className="px-4 py-2.5">Vị trí</th>
                      <th className="text-center px-4 py-2.5">SL tồn kho</th>
                      <th className="px-4 py-2.5">Tình trạng</th>
                      <th className="px-4 py-2.5">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                    {filteredInventory.map(item => {
                      const conditionBadge = item.condition === 'MOI' 
                        ? 'bg-emerald-50 border-emerald-150 text-emerald-700'
                        : item.condition === 'HONG'
                        ? 'bg-rose-50 border-rose-150 text-rose-700 animate-pulse'
                        : 'bg-slate-50 border-slate-200 text-slate-650';
                      
                      const statusBadge = item.status === 'SAN_SANG'
                        ? 'bg-emerald-550/10 text-emerald-700 border-emerald-200/50'
                        : item.status === 'THANH_LY'
                        ? 'bg-rose-550/10 text-rose-700 border-rose-200/50'
                        : 'bg-amber-550/10 text-amber-705 border-amber-200/50';

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                          <td className="px-4 py-2.5 font-bold font-mono text-slate-700 dark:text-slate-350">{item.code}</td>
                          <td className="px-4 py-2.5">
                            <strong>{item.name}</strong>
                            <span className="text-[10px] text-slate-450 block">{item.category === 'SACH' ? '📚 Sách giáo khoa' : '⚙️ Trang thiết bị'}</span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-500">{item.location}</td>
                          <td className="px-4 py-2.5 text-center font-bold text-slate-800 dark:text-slate-200">{item.quantity}</td>
                          <td className="px-4 py-2.5">
                            <span className={'px-2 py-0.5 rounded border text-[9.5px] font-bold ' + conditionBadge}>
                              {item.condition === 'MOI' ? 'Mới' : item.condition === 'BINH_THUONG' ? 'Tốt' : item.condition === 'CU' ? 'Cũ' : 'Hỏng'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={'px-2 py-0.5 rounded border text-[9.5px] font-bold ' + statusBadge}>
                              {item.status === 'SAN_SANG' ? 'Sẵn sàng' : item.status === 'DANG_CHO_MUON' ? 'Đang mượn' : item.status === 'BAO_HONG' ? 'Hỏng hóc' : 'Thanh lý'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Borrow return logs */}
            <div className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-3xs">
              <div>
                <h3 className="font-display font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <FileText className="text-teal-600 w-4.5 h-4.5" />
                  Nhật ký Mượn - Trả tài sản
                </h3>
                <p className="text-[10.5px] text-slate-500">Tra cứu quá trình bàn giao mượn trả tài sản giảng dạy.</p>
              </div>

              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {borrowLogs.map(log => {
                  const isReturned = log.status === 'DA_TRA';
                  const isOverdue = log.status === 'QUA_HAN';
                  const badgeStyle = isReturned
                    ? 'bg-emerald-50 border-emerald-150 text-emerald-700'
                    : isOverdue
                    ? 'bg-rose-50 border-rose-150 text-rose-700 animate-pulse'
                    : 'bg-amber-50 border-amber-150 text-amber-705';

                  return (
                    <div key={log.id} className="p-3.5 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2 bg-slate-50/35 dark:bg-slate-950/20 font-sans">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <strong className="text-slate-800 dark:text-white font-bold block">{log.itemName}</strong>
                          <span className="text-[9.5px] text-slate-450 block font-mono mt-0.5">{log.itemCode}</span>
                        </div>
                        <span className={'px-2 py-0.5 rounded border text-[9px] font-black uppercase ' + badgeStyle}>
                          {log.status === 'DA_TRA' ? 'Đã trả' : log.status === 'QUA_HAN' ? 'Quá hạn' : 'Đang mượn'}
                        </span>
                      </div>
                      
                      <div className="space-y-0.5 text-[10.5px] text-slate-650 dark:text-slate-400 font-sans border-t border-slate-100 dark:border-slate-850 pt-2">
                        <p>👤 Người mượn: <strong>{log.borrowerName}</strong> ({log.borrowerRole === 'TEACHER' ? 'GV' : 'HS'})</p>
                        <p>📅 Ngày mượn: {log.borrowDate}</p>
                        <p>⏰ Hạn trả: <strong className={isOverdue ? 'text-rose-600' : 'text-slate-700'}>{log.dueDate}</strong></p>
                        {log.returnDate && <p>✅ Ngày thực tế trả: <strong>{log.returnDate}</strong></p>}
                      </div>

                      {canManageInventory && !isReturned && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleReturnItem(log.id)}
                            className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-705 text-white font-bold text-[9.5px] rounded cursor-pointer flex items-center gap-0.5"
                          >
                            <Check className="w-3 h-3" /> Xác nhận Trả tài sản
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {borrowLogs.length === 0 && (
                  <p className="text-center py-8 text-slate-400 italic">Chưa ghi nhận lịch sử bàn giao nào.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
