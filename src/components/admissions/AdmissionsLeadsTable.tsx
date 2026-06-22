'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Dialog } from '@/src/components/ui/dialog';
import {
  Search, Plus, Download, Upload, Filter, Eye, Edit2, MoreHorizontal,
  Users, MessageSquare, ClipboardList, CalendarCheck, GraduationCap,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LayoutGrid, List, Settings2,
  X, Phone, Mail, MapPin, ChevronDown, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createLead, getAllLeadsForExport, updateLead, type LeadStatus } from '@/src/app/[locale]/(admin)/leads/actions';

// ─── Types ────────────────────────────────────────────────────────────────────
type TrangThai = 'Mới' | 'Đang tư vấn' | 'Đăng ký test' | 'Nộp hồ sơ' | 'Giữ chỗ' | 'Nhập học' | 'Không tiếp tục';
const MAP_STATUS_TO_DB: Record<TrangThai, LeadStatus> = {
  'Mới': 'received',
  'Đang tư vấn': 'consulting',
  'Đăng ký test': 'test_scheduled',
  'Nộp hồ sơ': 'docs_submitted',
  'Giữ chỗ': 'seat_reserved',
  'Nhập học': 'enrolled',
  'Không tiếp tục': 'cancelled',
};

export interface Lead {
  id: string;
  hoTen: string;
  sdt: string;
  email: string;
  nguonLead: string;
  khoi: string;
  tvv: string;
  tvvAvatar: string;
  trangThai: TrangThai;
  diemLead: number;
  ngayTao: string;
}

export interface FormThem {
  hoTenHocSinh: string;
  ngaySinh: string;
  gioiTinh: string;
  truongHienTai: string;
  khoi: string;
  chuongTrinh: string;
  hoTenPhuHuynh: string;
  sdtPhuHuynh: string;
  emailPhuHuynh: string;
  diaChiPhuHuynh: string;
  nguonLead: string;
  chiendich: string;
  tvv: string;
  ghiChu: string;
}

const FIRST_NAMES = ['Nguyễn', 'Trần', 'Phạm', 'Võ', 'Lê', 'Hoàng', 'Đỗ', 'Phan', 'Trịnh', 'Bùi', 'Đặng', 'Lương', 'Ngô'];
const MIDDLE_NAMES = ['Gia', 'Bảo', 'Minh', 'Đức', 'Quang', 'Hồng', 'Thị', 'Văn', 'Tuấn', 'Mai', 'Thanh', 'Quốc', 'Anh'];
const LAST_NAMES = ['Anh', 'Ngọc', 'Hân', 'Châu', 'Minh', 'Khang', 'Nam', 'Chi', 'Huy', 'Bảo', 'Sơn', 'Linh', 'Dương'];
const TVV_LIST = ['Lê Minh Khang', 'Phạm Gia Huy', 'Nguyễn Thu Hà', 'Đỗ Hoàng Nam', 'Trần Bảo Ngọc'];
const NGUON_LIST = ['Website', 'Facebook Ads', 'Zalo OA', 'Google Ads', 'Giới thiệu', 'Sự kiện', 'TikTok Ads'];
const KHOI_LIST = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'];
const TRANG_THAI_LIST: TrangThai[] = ['Mới', 'Đang tư vấn', 'Đăng ký test', 'Nộp hồ sơ', 'Giữ chỗ', 'Nhập học', 'Không tiếp tục'];

function generateMockRemainingLeads(count: number): Lead[] {
  const result: Lead[] = [];
  for (let i = 11; i <= count; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const mn = MIDDLE_NAMES[(i * 3) % MIDDLE_NAMES.length];
    const ln = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const hoTen = `${fn} ${mn} ${ln}`;
    const sdt = `09${(i * 13) % 10}${(i * 17) % 10}${i % 10} ${(i * 19) % 10}${(i * 23) % 10}${(i * 29) % 10} ${(i * 31) % 10}${(i * 37) % 10}${(i * 41) % 10}`;
    const email = `${ln.toLowerCase()}.${mn.toLowerCase()}@gmail.com`;
    const nguonLead = NGUON_LIST[i % NGUON_LIST.length];
    const khoi = KHOI_LIST[i % KHOI_LIST.length];
    const tvv = TVV_LIST[i % TVV_LIST.length];
    const tvvAvatar = tvv.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const trangThai = TRANG_THAI_LIST[i % TRANG_THAI_LIST.length];
    const diemLead = 30 + ((i * 11) % 70);
    const ngayTao = `1${i % 8}/05/2025 ${String(8 + i % 10).padStart(2, '0')}:${String((i * 11) % 60).padStart(2, '0')}`;
    result.push({
      id: `l${i}`,
      hoTen,
      sdt,
      email,
      nguonLead,
      khoi,
      tvv,
      tvvAvatar,
      trangThai,
      diemLead,
      ngayTao
    });
  }
  return result;
}

export const LEADS_MAU: Lead[] = [
  { id: 'l1', hoTen: 'Nguyễn Gia Bảo', sdt: '0912 345 678', email: 'giaobao@gmail.com', nguonLead: 'Website', khoi: 'Lớp 1', tvv: 'Lê Minh Khang', tvvAvatar: 'LK', trangThai: 'Đang tư vấn', diemLead: 85, ngayTao: '18/05/2025 09:15' },
  { id: 'l2', hoTen: 'Trần Bảo Ngọc', sdt: '0934 567 890', email: 'baongoc.tran@gmail.com', nguonLead: 'Facebook Ads', khoi: 'Lớp 6', tvv: 'Phạm Gia Huy', tvvAvatar: 'PH', trangThai: 'Đăng ký test', diemLead: 78, ngayTao: '18/05/2025 08:42' },
  { id: 'l3', hoTen: 'Phạm Minh Anh', sdt: '0901 234 567', email: 'minhanh.pm@gmail.com', nguonLead: 'Zalo OA', khoi: 'Lớp 3', tvv: 'Nguyễn Thu Hà', tvvAvatar: 'NH', trangThai: 'Giữ chỗ', diemLead: 92, ngayTao: '17/05/2025 16:30' },
  { id: 'l4', hoTen: 'Võ Đức Minh', sdt: '0987 654 321', email: 'ductminh.vd@gmail.com', nguonLead: 'Giới thiệu', khoi: 'Lớp 9', tvv: 'Đỗ Hoàng Nam', tvvAvatar: 'DN', trangThai: 'Nhập học', diemLead: 95, ngayTao: '17/05/2025 14:10' },
  { id: 'l5', hoTen: 'Lê Quang Huy', sdt: '0911 223 344', email: 'quanghuy.le@gmail.com', nguonLead: 'Sự kiện', khoi: 'Lớp 5', tvv: 'Trần Bảo Ngọc', tvvAvatar: 'TN', trangThai: 'Mới', diemLead: 45, ngayTao: '17/05/2025 11:05' },
  { id: 'l6', hoTen: 'Hoàng Minh Châu', sdt: '0965 432 109', email: 'minhchau.hm@gmail.com', nguonLead: 'Google Ads', khoi: 'Lớp 2', tvv: 'Nguyễn Linh Chi', tvvAvatar: 'LC', trangThai: 'Đang tư vấn', diemLead: 62, ngayTao: '16/05/2025 20:22' },
  { id: 'l7', hoTen: 'Đỗ Tuấn Khang', sdt: '0977 889 900', email: 'tuankhang.do@gmail.com', nguonLead: 'Website', khoi: 'Lớp 10', tvv: 'Lê Minh Khang', tvvAvatar: 'LK', trangThai: 'Đăng ký test', diemLead: 71, ngayTao: '16/05/2025 15:45' },
  { id: 'l8', hoTen: 'Phan Gia Hân', sdt: '0933 221 133', email: 'giahan.phan@gmail.com', nguonLead: 'Facebook Ads', khoi: 'Lớp 4', tvv: 'Phạm Gia Huy', tvvAvatar: 'PH', trangThai: 'Không tiếp tục', diemLead: 20, ngayTao: '16/05/2025 10:30' },
  { id: 'l9', hoTen: 'Nguyễn Mai Anh', sdt: '0922 334 455', email: 'maianh@gmail.com', nguonLead: 'Zalo OA', khoi: 'Lớp 7', tvv: 'Nguyễn Thu Hà', tvvAvatar: 'NH', trangThai: 'Đang tư vấn', diemLead: 68, ngayTao: '15/05/2025 17:20' },
  { id: 'l10', hoTen: 'Trịnh Quốc Bảo', sdt: '0909 876 543', email: 'quocbao.trinh@gmail.com', nguonLead: 'Giới thiệu', khoi: 'Lớp 8', tvv: 'Đỗ Hoàng Nam', tvvAvatar: 'DN', trangThai: 'Giữ chỗ', diemLead: 88, ngayTao: '15/05/2025 09:18' },
  ...generateMockRemainingLeads(60)
];

const MAU_TRANG_THAI: Record<TrangThai, { bg: string; text: string; dot: string }> = {
  'Mới':            { bg: 'bg-slate-100',   text: 'text-slate-600',  dot: 'bg-slate-400' },
  'Đang tư vấn':   { bg: 'bg-blue-50',     text: 'text-blue-700',   dot: 'bg-blue-500' },
  'Đăng ký test':  { bg: 'bg-amber-50',    text: 'text-amber-700',  dot: 'bg-amber-400' },
  'Nộp hồ sơ':     { bg: 'bg-purple-50',   text: 'text-purple-700', dot: 'bg-purple-500' },
  'Giữ chỗ':       { bg: 'bg-orange-50',   text: 'text-orange-700', dot: 'bg-orange-500' },
  'Nhập học':      { bg: 'bg-green-50',    text: 'text-green-700',  dot: 'bg-green-500' },
  'Không tiếp tục':{ bg: 'bg-red-50',      text: 'text-red-600',    dot: 'bg-red-400' },
};

const DIEM_MAU = (d: number) =>
  d >= 80 ? 'text-green-600 font-black' : d >= 60 ? 'text-amber-600 font-bold' : 'text-red-500 font-bold';

const KPI_MINI = [
  { nhan: 'Tổng hồ sơ', gia_tri: '1.284', delta: '↑ 28%', icon: Users, mau: 'text-blue-600 bg-blue-50' },
  { nhan: 'Đang tư vấn', gia_tri: '534', delta: '↑ 18%', icon: MessageSquare, mau: 'text-purple-600 bg-purple-50' },
  { nhan: 'Đăng ký test', gia_tri: '232', delta: '↑ 16%', icon: ClipboardList, mau: 'text-amber-600 bg-amber-50' },
  { nhan: 'Đã giữ chỗ', gia_tri: '87', delta: '↑ 21%', icon: CalendarCheck, mau: 'text-orange-600 bg-orange-50' },
  { nhan: 'Đã nhập học', gia_tri: '41', delta: '↑ 24%', icon: GraduationCap, mau: 'text-green-600 bg-green-50' },
];

const DS_NGUON = ['Tất cả nguồn', 'Website', 'Facebook Ads', 'Zalo OA', 'Google Ads', 'Giới thiệu', 'Sự kiện', 'TikTok Ads'];
const DS_TVV = ['Tất cả tư vấn viên', 'Lê Minh Khang', 'Phạm Gia Huy', 'Nguyễn Thu Hà', 'Đỗ Hoàng Nam', 'Trần Bảo Ngọc'];
const DS_KHOI = ['Tất cả khối', 'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'];
const DS_TRANG_THAI = ['Tất cả trạng thái', 'Mới', 'Đang tư vấn', 'Đăng ký test', 'Nộp hồ sơ', 'Giữ chỗ', 'Nhập học', 'Không tiếp tục'];
const DS_CHUONG_TRINH = ['Tiểu học - Chương trình Quốc gia', 'THCS - Song ngữ Quốc tế', 'THPT - IB', 'THPT - A-Level', 'Mầm non'];
// ─── Helper field components (defined OUTSIDE modal to prevent remount on every render) ──
function InputField({ label, field, value, onChange, error, placeholder, type = 'text', required = false, icon }: {
  label: string; field: string; value: string; onChange: (v: string) => void;
  error?: string; placeholder?: string; type?: string; required?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={icon ? 'relative' : undefined}>
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`h-9 w-full rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
            icon ? 'pl-9 pr-3' : 'px-3'
          } ${
            error ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 bg-white focus:border-blue-400 focus:ring-blue-100'
          }`}
        />
      </div>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-red-500">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

function SelectField({ label, field, value, onChange, error, options, required = false }: {
  label: string; field: string; value: string; onChange: (v: string) => void;
  error?: string; options: string[]; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`h-9 w-full appearance-none rounded-xl border px-3 pr-8 text-sm transition focus:outline-none focus:ring-2 ${
            error ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 bg-white focus:border-blue-400 focus:ring-blue-100'
          }`}>
          <option value="">-- Chọn --</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      </div>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-red-500">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Modal Thêm/Sửa Lead ────────────────────────────────────────────────────
export function ModalThemLead({ onDong, onLuu, chuongTrinhList = DS_CHUONG_TRINH, leadBanDau }: { onDong: () => void; onLuu: (data: FormThem, isEdit?: boolean) => void; chuongTrinhList?: string[]; leadBanDau?: any }) {
  const [buoc, setBuoc] = useState<1 | 2>(1);
  const [da_luu, setDaLuu] = useState(false);
  const [form, setForm] = useState<FormThem>({
    hoTenHocSinh: leadBanDau?.hoTen || '', ngaySinh: '', gioiTinh: 'Nam', truongHienTai: '',
    khoi: leadBanDau?.khoi || '', chuongTrinh: '', hoTenPhuHuynh: leadBanDau?.hoTenPhuHuynh || '', sdtPhuHuynh: leadBanDau?.sdt || '',
    emailPhuHuynh: leadBanDau?.email || '', diaChiPhuHuynh: '', nguonLead: leadBanDau?.nguonLead || '', chiendich: '',
    tvv: leadBanDau?.tvv !== 'Chưa phân công' ? leadBanDau?.tvv : DS_TVV[1], ghiChu: leadBanDau?.ghiChu || '',
  });
  const [loi, setLoi] = useState<Partial<FormThem>>({});

  const capNhat = (field: keyof FormThem, val: string) => {
    setForm(f => ({ ...f, [field]: val }));
    if (loi[field]) setLoi(l => ({ ...l, [field]: undefined }));
  };

  const kiemTraBuoc1 = () => {
    const newLoi: Partial<FormThem> = {};
    if (!form.hoTenHocSinh.trim()) newLoi.hoTenHocSinh = 'Vui lòng nhập họ tên học sinh';
    if (!form.khoi) newLoi.khoi = 'Vui lòng chọn khối';
    if (!form.hoTenPhuHuynh.trim()) newLoi.hoTenPhuHuynh = 'Vui lòng nhập họ tên phụ huynh';
    if (!form.sdtPhuHuynh.trim()) newLoi.sdtPhuHuynh = 'Vui lòng nhập số điện thoại';
    else if (!/^(0|\+84)\d{8,9}$/.test(form.sdtPhuHuynh.replace(/\s/g, '')))
      newLoi.sdtPhuHuynh = 'Số điện thoại không hợp lệ';
    setLoi(newLoi);
    return Object.keys(newLoi).length === 0;
  };

  const kiemTraBuoc2 = () => {
    const newLoi: Partial<FormThem> = {};
    if (!form.nguonLead) newLoi.nguonLead = 'Vui lòng chọn nguồn lead';
    if (!form.tvv) newLoi.tvv = 'Vui lòng chọn tư vấn viên';
    setLoi(newLoi);
    return Object.keys(newLoi).length === 0;
  };

  const handleTiepTheo = () => { if (kiemTraBuoc1()) setBuoc(2); };
  const handleLuu = () => {
    if (!kiemTraBuoc2()) return;
    setDaLuu(true);
    setTimeout(() => { onLuu(form, !!leadBanDau); onDong(); }, 1200);
  };

  if (da_luu) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-slate-900">{leadBanDau ? 'Cập nhật thành công!' : 'Tạo lead thành công!'}</p>
          <p className="mt-1 text-sm text-slate-500">Lead của <strong>{form.hoTenHocSinh}</strong> đã được {leadBanDau ? 'cập nhật' : 'thêm vào'} hệ thống.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">{leadBanDau ? 'Sửa thông tin lead' : 'Thêm lead mới'}</h2>
          <p className="text-xs font-semibold text-slate-500">Nhập thông tin học sinh và phụ huynh</p>
        </div>
        <button type="button" onClick={onDong}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
          <X className="h-5 w-5" />
        </button>
      </div>


      {/* Thanh tiến trình */}
      <div className="flex items-center gap-0 border-b border-slate-100 px-5">
        {[
          { so: 1, nhan: 'Thông tin học sinh & phụ huynh' },
          { so: 2, nhan: 'Nguồn lead & Phân công' },
        ].map((b, i) => (
          <React.Fragment key={b.so}>
            <button type="button" onClick={() => b.so === 2 && kiemTraBuoc1() && setBuoc(2)}
              className={`flex items-center gap-2 border-b-2 py-3 pr-4 text-xs font-bold transition ${
                buoc === b.so ? 'border-blue-600 text-blue-700' :
                buoc > b.so ? 'border-green-500 text-green-600' :
                'border-transparent text-slate-400'
              }`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                buoc > b.so ? 'bg-green-100 text-green-700' :
                buoc === b.so ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}>{buoc > b.so ? '✓' : b.so}</span>
              {b.nhan}
            </button>
            {i < 1 && <ChevronRight className="h-3.5 w-3.5 text-slate-300 mx-2" />}
          </React.Fragment>
        ))}
      </div>

      {/* Nội dung form */}
      <div className="flex-1 overflow-y-auto p-5">
        {buoc === 1 && (
          <div className="space-y-5">
            {/* Thông tin học sinh */}
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                <GraduationCap className="h-4 w-4 text-blue-500" /> Thông tin học sinh
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <InputField label="Họ và tên học sinh" field="hoTenHocSinh" value={form.hoTenHocSinh} onChange={v => capNhat('hoTenHocSinh', v)} error={loi.hoTenHocSinh} placeholder="Nguyễn Văn An" required />
                <InputField label="Ngày sinh" field="ngaySinh" value={form.ngaySinh} onChange={v => capNhat('ngaySinh', v)} type="date" />
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Giới tính</label>
                  <div className="flex gap-2">
                    {['Nam', 'Nữ'].map(g => (
                      <button key={g} type="button" onClick={() => capNhat('gioiTinh', g)}
                        className={`flex-1 rounded-xl border py-2 text-xs font-bold transition ${
                          form.gioiTinh === g ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}>{g}</button>
                    ))}
                  </div>
                </div>
                <InputField label="Trường hiện tại" field="truongHienTai" value={form.truongHienTai} onChange={v => capNhat('truongHienTai', v)} placeholder="THCS Cầu Giấy" />
                <SelectField label="Khối đăng ký" field="khoi" value={form.khoi} onChange={v => capNhat('khoi', v)} error={loi.khoi} options={DS_KHOI.slice(1)} required />
                <SelectField label="Chương trình quan tâm" field="chuongTrinh" value={form.chuongTrinh} onChange={v => capNhat('chuongTrinh', v)} options={chuongTrinhList} />
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Thông tin phụ huynh */}
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                <Users className="h-4 w-4 text-purple-500" /> Thông tin phụ huynh / người liên hệ
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <InputField label="Họ và tên phụ huynh" field="hoTenPhuHuynh" value={form.hoTenPhuHuynh} onChange={v => capNhat('hoTenPhuHuynh', v)} error={loi.hoTenPhuHuynh} placeholder="Nguyễn Văn Bình" required />
                <InputField label="Số điện thoại" field="sdtPhuHuynh" value={form.sdtPhuHuynh} onChange={v => capNhat('sdtPhuHuynh', v)} error={loi.sdtPhuHuynh} type="tel" placeholder="0901 234 567" required icon={<Phone className="h-3.5 w-3.5 text-slate-400" />} />
                <InputField label="Email" field="emailPhuHuynh" value={form.emailPhuHuynh} onChange={v => capNhat('emailPhuHuynh', v)} type="email" placeholder="email@example.com" icon={<Mail className="h-3.5 w-3.5 text-slate-400" />} />
                <InputField label="Địa chỉ" field="diaChiPhuHuynh" value={form.diaChiPhuHuynh} onChange={v => capNhat('diaChiPhuHuynh', v)} placeholder="Số nhà, đường, quận/huyện..." icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />} />
              </div>
            </div>
          </div>
        )}

        {buoc === 2 && (
          <div className="space-y-5">
            {/* Nguồn lead */}
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                <MessageSquare className="h-4 w-4 text-green-500" /> Nguồn lead & Chiến dịch
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <SelectField label="Nguồn lead" field="nguonLead" value={form.nguonLead} onChange={v => capNhat('nguonLead', v)} error={loi.nguonLead} options={DS_NGUON.slice(1)} required />
                <InputField label="Chiến dịch / Campaign" field="chiendich" value={form.chiendich} onChange={v => capNhat('chiendich', v)} placeholder="Tháng 5 - Ưu đãi học phí" />
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Phân công */}
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                <Users className="h-4 w-4 text-blue-500" /> Phân công tư vấn viên
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <SelectField label="Tư vấn viên phụ trách" field="tvv" value={form.tvv} onChange={v => capNhat('tvv', v)} error={loi.tvv} options={DS_TVV.slice(1)} required />
              </div>

              {/* Preview TVV */}
              {form.tvv && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                    {form.tvv.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{form.tvv}</p>
                    <p className="text-xs text-slate-500">Tư vấn viên · Phòng Tuyển sinh</p>
                  </div>
                  <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-black text-green-700">Đang hoạt động</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100" />

            {/* Ghi chú */}
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                📝 Ghi chú ban đầu
              </p>
              <textarea
                value={form.ghiChu}
                onChange={e => capNhat('ghiChu', e.target.value)}
                placeholder="Nhập ghi chú ban đầu về học sinh / phụ huynh, nguyện vọng, điều kiện đặc biệt..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>

            {/* Tóm tắt thông tin */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">Tóm tắt thông tin lead</p>
              <div className="grid gap-1 text-xs">
                {[
                  ['Học sinh', form.hoTenHocSinh],
                  ['Khối đăng ký', form.khoi],
                  ['Liên hệ chính', form.hoTenPhuHuynh],
                  ['Số điện thoại', form.sdtPhuHuynh],
                  ['Nguồn lead', form.nguonLead],
                  ['Tư vấn viên', form.tvv],
                ].map(([k, v]) => v ? (
                  <div key={k} className="flex gap-2">
                    <span className="w-28 shrink-0 font-semibold text-slate-400">{k}</span>
                    <span className="font-bold text-slate-800">{v}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
        <button type="button" onClick={() => buoc === 1 ? onDong() : setBuoc(1)}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
          {buoc === 1 ? 'Huỷ' : '← Quay lại'}
        </button>
        <div className="flex items-center gap-2">
          {buoc === 1 ? (
            <>
              <button type="button" onClick={handleTiepTheo}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm">
                Tiếp theo →
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => { if (kiemTraBuoc2()) { onLuu(form, !!leadBanDau); onDong(); } }}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                {leadBanDau ? 'Lưu nhanh' : 'Lưu & Thêm mới'}
              </button>
              <button type="button" onClick={handleLuu}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm">
                ✓ {leadBanDau ? 'Lưu thay đổi' : 'Lưu lead'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Component chính ─────────────────────────────────────────────────────────
interface AdmissionsLeadsTableProps {
  initialData?: any;
  users?: { id: string; name: string }[];
  filters?: any;
  chuongTrinhList?: string[];
  onViewDetail?: (leadId: string) => void;
}

export default function AdmissionsLeadsTable({ initialData, users, filters, chuongTrinhList, onViewDetail }: AdmissionsLeadsTableProps) {
  const router = useRouter();
  const leads = initialData?.data || [];
  
  const [timKiem, setTimKiem] = useState(filters?.search || '');
  const [nguon, setNguon] = useState(filters?.source || 'Tất cả nguồn');
  const [tvv, setTvv] = useState('Tất cả tư vấn viên');
  const [khoi, setKhoi] = useState(filters?.grade || 'Tất cả khối');
  const [trangThai, setTrangThai] = useState(filters?.status || 'Tất cả trạng thái');
  const [daChon, setDaChon] = useState<Set<string>>(new Set());
  const [hienModal, setHienModal] = useState(false);
  const [leadDangSua, setLeadDangSua] = useState<any>(null);
  const [toast, setToast] = useState('');

  // New states for Grid/List layout, Advanced filters, and Rows limit
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');
  const [hienBoLocNangCao, setHienBoLocNangCao] = useState(false);
  const [diemLeadNhoNhat, setDiemLeadNhoNhat] = useState(0);
  const [limitPerPage, setLimitPerPage] = useState(10);

  const tongTrang = initialData?.totalPages || 1;
  const trang = initialData?.currentPage || 1;
  const totalItems = initialData?.totalItems || 0;

  // Sync to URL
  const handleSearchAndFilters = (newFilters: {
    search?: string;
    status?: string;
    source?: string;
    grade?: string;
    page?: number;
  }) => {
    const query = new URLSearchParams();
    const s = newFilters.search !== undefined ? newFilters.search : timKiem;
    const st = newFilters.status !== undefined ? newFilters.status : trangThai;
    const src = newFilters.source !== undefined ? newFilters.source : nguon;
    const gr = newFilters.grade !== undefined ? newFilters.grade : khoi;
    const p = newFilters.page !== undefined ? newFilters.page : trang;

    if (s) query.set('search', s);
    if (st && st !== 'Tất cả trạng thái') query.set('status', st);
    if (src && src !== 'Tất cả nguồn') query.set('source', src);
    if (gr && gr !== 'Tất cả khối') query.set('grade', gr);
    if (p && p > 1) query.set('page', String(p));
    // We ignore assignedUserId locally for now as mock filter

    router.push(`?${query.toString()}`);
  };

  const leadsHienThi = leads.map((l: any) => ({
    id: l.id,
    hoTen: l.fullName,
    sdt: l.phone,
    email: l.email || '—',
    nguonLead: l.source,
    khoi: l.grade,
    tvv: users?.find((u: any) => u.id === l.assignedUserId)?.name || 'Chưa phân công',
    tvvId: l.assignedUserId, // Added for edit form
    tvvAvatar: ((users?.find((u: any) => u.id === l.assignedUserId)?.name) || 'C P').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
    trangThai: Object.keys(MAP_STATUS_TO_DB).find(k => MAP_STATUS_TO_DB[k as TrangThai] === l.status) as TrangThai || 'Mới',
    diemLead: 50,
    ngayTao: new Date(l.createdAt).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
    ghiChu: l.notes,
  })).filter((l: any) => l.diemLead >= diemLeadNhoNhat);
  const chonTatCa = () => {
    if (daChon.size === leadsHienThi.length) setDaChon(new Set());
    else setDaChon(new Set(leadsHienThi.map((l: any) => l.id)));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const chonMot = (id: string) => {
    const next = new Set(daChon);
    next.has(id) ? next.delete(id) : next.add(id);
    setDaChon(next);
  };

  const handleLuuLead = async (data: FormThem, isEdit?: boolean) => {
    try {
      const tvvId = users?.find(u => u.name === data.tvv)?.id || data.tvv;
      
      if (isEdit && leadDangSua) {
        const res = await updateLead(leadDangSua.id, {
          fullName: data.hoTenHocSinh,
          parentName: data.hoTenPhuHuynh,
          phone: data.sdtPhuHuynh,
          email: data.emailPhuHuynh,
          source: data.nguonLead,
          grade: data.khoi,
          notes: data.ghiChu,
          assignedUserId: tvvId,
        });
        if (res.success) {
          showToast('Cập nhật lead thành công!');
          router.refresh();
        }
      } else {
        const res = await createLead({
          fullName: data.hoTenHocSinh,
          parentName: data.hoTenPhuHuynh,
          phone: data.sdtPhuHuynh,
          email: data.emailPhuHuynh,
          source: data.nguonLead,
          grade: data.khoi,
          status: 'received',
          notes: data.ghiChu,
          assignedUserId: tvvId,
        });
        if (res.success) {
          showToast('Tạo lead thành công!');
          router.refresh();
        }
      }
    } catch (err) {
      showToast('Có lỗi xảy ra khi lưu lead!');
      console.error(err);
    }
  };

  const [isExporting, setIsExporting] = useState(false);
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const allLeads = await getAllLeadsForExport({
        search: timKiem || undefined,
        status: trangThai !== 'Tất cả trạng thái' ? trangThai : undefined,
        source: nguon !== 'Tất cả nguồn' ? nguon : undefined,
        grade: khoi !== 'Tất cả khối' ? khoi : undefined,
      });
      if (!allLeads.length) {
        showToast('Không có dữ liệu để xuất');
        return;
      }

      const headers = ['Mã Lead', 'Tên Học Sinh', 'Lớp Đăng Ký', 'Nguồn', 'Số Điện Thoại', 'Họ Tên Phụ Huynh', 'Email', 'Trạng Thái', 'Ghi Chú'];
      const rows = allLeads.map((l: any) => [
        l.leadCode,
        l.fullName,
        l.grade,
        l.source,
        l.phone,
        l.parentName || '',
        l.email || '',
        l.status,
        l.notes || '',
      ]);

      let csvContent = '\uFEFF'; // UTF-8 BOM
      csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
      rows.forEach((row: any[]) => {
        csvContent += row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `MIS_CRM_Leads_Tuyensinh_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Đã xuất ${allLeads.length} lead thành công`);
    } catch (err) {
      showToast('Xuất thất bại, vui lòng thử lại');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        alert('Tệp CSV trống hoặc không có dữ liệu!');
        return;
      }

      const parseCsvLine = (line: string) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.replace(/^"|"$/g, '').trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.replace(/^"|"$/g, '').trim());
        return result;
      };

      const headers = lines[0].replace(/^\uFEFF/, '').split(',').map(h => h.replace(/^"|"$/g, '').trim());
      let count = 0;
      let successCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.length < 3) continue;

        const rowData: any = {};
        headers.forEach((header, idx) => {
          rowData[header] = values[idx] || '';
        });

        const fullNameVal = rowData['Tên Học Sinh'] || rowData['fullName'] || '';
        const phoneVal = rowData['Số Điện Thoại Phụ Huynh'] || rowData['phone'] || '';
        const gradeVal = rowData['Lớp Đăng Ký'] || rowData['grade'] || 'Lớp 10';
        const sourceVal = rowData['Nguồn'] || rowData['source'] || 'Website';
        const parentNameVal = rowData['Họ Tên Phụ Huynh'] || rowData['parentName'] || '';
        const emailVal = rowData['Email Phụ Huynh'] || rowData['email'] || '';
        const notesVal = rowData['Ghi Chú'] || rowData['notes'] || '';

        if (!fullNameVal || !phoneVal) continue;

        count++;
        try {
          const res = await createLead({
            fullName: fullNameVal,
            parentName: parentNameVal,
            phone: phoneVal,
            email: emailVal,
            source: sourceVal,
            grade: gradeVal,
            status: 'received',
            notes: notesVal,
          });
          if (res.success) {
            successCount++;
          }
        } catch (err) {
          console.error('Error importing row:', err);
        }
      }

      alert(`Đã xử lý: ${count} dòng. Nhập thành công: ${successCount} Leads tuyển sinh mới!`);
      showToast(`Đã xử lý ${count} dòng, thêm được ${successCount} lead mới`);
      router.refresh();
    };

    reader.readAsText(file, 'utf-8');
  };

  const handleUpdateStatus = async (leadId: string, oldLead: any, newStatus: TrangThai) => {
    try {
      const dbStatus = MAP_STATUS_TO_DB[newStatus];
      if (!dbStatus) return;
      const res = await updateLead(leadId, {
        fullName: oldLead.hoTen,
        phone: oldLead.sdt,
        source: oldLead.nguonLead,
        grade: oldLead.khoi,
        status: dbStatus,
      });
      if (res.success) {
        showToast(`Cập nhật trạng thái thành ${newStatus}`);
        router.refresh();
      }
    } catch (err) {
      showToast('Cập nhật trạng thái thất bại');
      console.error(err);
    }
  };

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <span>✓</span> {toast}
        </div>
      )}
      <div className="space-y-5">
        {/* Tiêu đề */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Leads & Thí sinh</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Quản lý toàn bộ leads và thí sinh trong quy trình tuyển sinh.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer">
              <Upload className="h-3.5 w-3.5" /> Nhập CSV
              <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
            </label>
            <button type="button" disabled={isExporting} onClick={handleExportCSV}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition disabled:opacity-50">
              <Download className="h-3.5 w-3.5" /> {isExporting ? 'Đang xuất...' : 'Xuất CSV'}
            </button>
            <button
              type="button"
              onClick={() => { setLeadDangSua(null); setHienModal(true); }}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all">
              <Plus className="h-3.5 w-3.5" /> Thêm lead mới
            </button>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={timKiem} 
              onChange={e => {
                setTimKiem(e.target.value);
                handleSearchAndFilters({ search: e.target.value, page: 1 });
              }}
              placeholder="Tìm theo tên, SĐT, email, mã lead..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {[
            { nhan: 'Nguồn', val: nguon, set: (v: string) => { setNguon(v); handleSearchAndFilters({ source: v, page: 1 }); }, opts: DS_NGUON },
            { nhan: 'TVV', val: tvv, set: setTvv, opts: DS_TVV },
            { nhan: 'Khối', val: khoi, set: (v: string) => { setKhoi(v); handleSearchAndFilters({ grade: v, page: 1 }); }, opts: DS_KHOI },
            { nhan: 'Trạng thái', val: trangThai, set: (v: string) => { setTrangThai(v); handleSearchAndFilters({ status: MAP_STATUS_TO_DB[v as TrangThai] || 'all', page: 1 }); }, opts: DS_TRANG_THAI },
          ].map((f, i) => (
            <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100">
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-50">
            <CalendarCheck className="h-3.5 w-3.5 text-slate-400" /> 12/05/2025 - 18/05/2025
          </div>
        </div>

        {/* KPI Mini */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {KPI_MINI.map(c => {
            const Icon = c.icon;
            return (
              <div key={c.nhan} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm hover:shadow-md transition">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.mau}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">{c.nhan}</p>
                  <p className="text-lg font-black text-slate-900">{c.gia_tri}</p>
                  <p className="text-[10px] font-bold text-green-600">{c.delta} so với 05/05 - 11/05</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bảng dữ liệu */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          {/* Thanh công cụ */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={daChon.size === leadsHienThi.length && leadsHienThi.length > 0} onChange={chonTatCa}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                <span className="text-xs font-semibold text-slate-500">Chọn tất cả</span>
              </div>
              {daChon.size > 0 && (
                <select className="h-8 rounded-lg border border-slate-200 bg-blue-50 px-2 text-xs font-bold text-blue-700">
                  <option>Hành động hàng loạt ({daChon.size} đã chọn)</option>
                  <option>Phân công tư vấn viên</option>
                  <option>Đổi trạng thái</option>
                  <option>Xuất danh sách</option>
                  <option>Gửi email hàng loạt</option>
                  <option>Xoá</option>
                </select>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setHienBoLocNangCao(true)} className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                <Filter className="h-3.5 w-3.5" /> Bộ lọc nâng cao
              </button>
              <button type="button" onClick={() => setViewType('grid')} className={`flex h-8 w-8 items-center justify-center rounded-lg border text-slate-500 hover:bg-slate-50 ${viewType === 'grid' ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-slate-200'}`} title="Xem lưới">
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => setViewType('list')} className={`flex h-8 w-8 items-center justify-center rounded-lg border text-slate-500 hover:bg-slate-50 ${viewType === 'list' ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-slate-200'}`} title="Xem danh sách">
                <List className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" title="Tuỳ chỉnh cột">
                <Settings2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {viewType === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50/50">
              {leadsHienThi.map((lead: any) => {
                const sc = MAU_TRANG_THAI[lead.trangThai as TrangThai] || MAU_TRANG_THAI['Mới'];
                return (
                  <div key={lead.id} className="relative bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-150 flex flex-col justify-between h-[210px]">
                    <div>
                      {/* Card Header */}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={daChon.has(lead.id)} onChange={() => chonMot(lead.id)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{lead.id}</span>
                        </div>
                        <select
                          value={lead.trangThai}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleUpdateStatus(lead.id, lead, e.target.value as TrangThai)}
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold outline-none cursor-pointer ${sc.bg} ${sc.text}`}
                        >
                          {TRANG_THAI_LIST.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      {/* Lead Name */}
                      <h3 className="font-bold text-slate-900 truncate hover:text-blue-600 hover:underline cursor-pointer" onClick={() => onViewDetail ? onViewDetail(lead.id) : showToast(`Xem chi tiết: ${lead.hoTen}`)}>
                        {lead.hoTen}
                      </h3>

                      {/* Contact Info */}
                      <div className="space-y-0.5 my-1.5 text-xs text-slate-500">
                        <p className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-slate-300" /> {lead.sdt}</p>
                        <p className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-300" /> {lead.email}</p>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">{lead.nguonLead}</span>
                        <span className="inline-flex items-center rounded-lg border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">{lead.khoi}</span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[8px] font-black text-white">
                          {lead.tvvAvatar}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[80px]" title={lead.tvv}>{lead.tvv}</span>
                      </div>

                      {/* Lead Score */}
                      <div className="flex flex-col items-end shrink-0">
                        <span className={`text-xs ${DIEM_MAU(lead.diemLead)}`}>{lead.diemLead} pts</span>
                        <div className="h-1 w-12 rounded-full bg-slate-100 mt-1">
                          <div className={`h-1 rounded-full ${lead.diemLead >= 80 ? 'bg-green-500' : lead.diemLead >= 60 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${lead.diemLead}%` }} />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-0.5">
                        <button type="button" onClick={() => onViewDetail ? onViewDetail(lead.id) : showToast(`Xem chi tiết: ${lead.hoTen}`)} className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                          <button type="button" onClick={() => { setLeadDangSua(lead); setHienModal(true); }} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition" title="Sửa">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {leadsHienThi.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400">Không tìm thấy lead nào</div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase tracking-wide text-slate-400">
                    <th className="py-3 pl-4 pr-2 text-left w-10" />
                    <th className="py-3 px-3 text-left">Họ tên</th>
                    <th className="py-3 px-3 text-left">Số điện thoại</th>
                    <th className="py-3 px-3 text-left">Email</th>
                    <th className="py-3 px-3 text-left">Nguồn lead</th>
                    <th className="py-3 px-3 text-left">Khối</th>
                    <th className="py-3 px-3 text-left">Tư vấn viên</th>
                    <th className="py-3 px-3 text-left">Trạng thái</th>
                    <th className="py-3 px-3 text-center">Điểm lead</th>
                    <th className="py-3 px-3 text-left">Ngày tạo</th>
                    <th className="py-3 px-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leadsHienThi.map((lead: any) => {
                    const sc = MAU_TRANG_THAI[lead.trangThai as TrangThai] || MAU_TRANG_THAI['Mới'];
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/60 cursor-pointer transition-colors">
                        <td className="py-3 pl-4 pr-2">
                          <input type="checkbox" checked={daChon.has(lead.id)} onChange={() => chonMot(lead.id)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer" onClick={() => onViewDetail ? onViewDetail(lead.id) : showToast(`Xem chi tiết: ${lead.hoTen}`)}>{lead.hoTen}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Phone className="h-3 w-3 text-slate-300" /> {lead.sdt}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Mail className="h-3 w-3 text-slate-300" /> {lead.email}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                            {lead.nguonLead}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center rounded-lg border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
                            {lead.khoi}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white">
                              {lead.tvvAvatar}
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{lead.tvv}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={lead.trangThai}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleUpdateStatus(lead.id, lead, e.target.value as TrangThai)}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold w-fit outline-none cursor-pointer ${sc.bg} ${sc.text}`}
                          >
                            {TRANG_THAI_LIST.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`text-sm ${DIEM_MAU(lead.diemLead)}`}>{lead.diemLead}</span>
                            <div className="mt-0.5 h-1 w-8 rounded-full bg-slate-100">
                              <div className={`h-1 rounded-full ${lead.diemLead >= 80 ? 'bg-green-500' : lead.diemLead >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                                style={{ width: `${lead.diemLead}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-500 whitespace-nowrap">{lead.ngayTao}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <button type="button" title="Xem chi tiết" onClick={() => onViewDetail ? onViewDetail(lead.id) : showToast(`Xem chi tiết: ${lead.hoTen}`)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" title="Chỉnh sửa" onClick={() => showToast(`Chỉnh sửa lead: ${lead.hoTen}`)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" title="Thêm thao tác" onClick={() => showToast(`Thao tác: ${lead.hoTen}`)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {leadsHienThi.length === 0 && (
                    <tr>
                      <td colSpan={11} className="text-center py-8 text-slate-400">
                        Không tìm thấy lead nào khớp với bộ lọc
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Phân trang */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 flex-wrap gap-2">
            <p className="text-xs font-semibold text-slate-500">
              Hiển thị {totalItems > 0 ? (trang - 1) * limitPerPage + 1 : 0} - {Math.min(trang * limitPerPage, totalItems)} trong tổng số {totalItems} kết quả
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button 
                type="button" 
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40" 
                disabled={trang === 1} 
                onClick={() => handleSearchAndFilters({ page: 1 })}
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>
              <button 
                type="button" 
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40" 
                disabled={trang === 1} 
                onClick={() => handleSearchAndFilters({ page: trang - 1 })}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              
              {/* Dynamic Page Numbers */}
              {Array.from({ length: tongTrang }).map((_, idx) => {
                const p = idx + 1;
                // Render all pages if total is small, or render near the active page
                if (tongTrang <= 6 || Math.abs(p - trang) <= 1 || p === 1 || p === tongTrang) {
                  return (
                    <button 
                      key={p} 
                      type="button" 
                      onClick={() => handleSearchAndFilters({ page: p })}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${trang === p ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {p}
                    </button>
                  );
                } else if (p === 2 && trang > 3) {
                  return <span key="ellipsis-start" className="px-0.5 text-slate-400">...</span>;
                } else if (p === tongTrang - 1 && trang < tongTrang - 2) {
                  return <span key="ellipsis-end" className="px-0.5 text-slate-400">...</span>;
                }
                return null;
              })}

              <button 
                type="button" 
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40" 
                disabled={trang === tongTrang} 
                onClick={() => handleSearchAndFilters({ page: trang + 1 })}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button 
                type="button" 
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40" 
                disabled={trang === tongTrang} 
                onClick={() => handleSearchAndFilters({ page: tongTrang })}
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </button>
              <select 
                value={`${limitPerPage} / trang`} 
                onChange={(e) => {
                  const val = parseInt(e.target.value.split(' ')[0], 10);
                  setLimitPerPage(val);
                }}
                className="h-8 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-600 bg-white"
              >
                <option value="10 / trang">10 / trang</option>
                <option value="25 / trang">25 / trang</option>
                <option value="50 / trang">50 / trang</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Thêm Lead — dùng Portal mount vào document.body để tránh bị bẫy bởi overflow/transform */}
      {hienModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setHienModal(false)}
          />
          {/* Panel trượt từ bên phải */}
          <div className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl">
            <ModalThemLead
              onDong={() => { setHienModal(false); setLeadDangSua(null); }}
              onLuu={handleLuuLead}
              chuongTrinhList={chuongTrinhList}
              leadBanDau={leadDangSua}
            />
          </div>
        </div>,
        document.body
      )}
      {/* Modal Bộ lọc nâng cao */}
      <Dialog
        open={hienBoLocNangCao}
        onOpenChange={setHienBoLocNangCao}
        title="Bộ lọc nâng cao"
        description="Tinh chỉnh các tiêu chí tìm kiếm và phân tích danh sách lead của bạn."
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Điểm lead tối thiểu</span>
              <span className="text-blue-600">{diemLeadNhoNhat} điểm</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={diemLeadNhoNhat} 
              onChange={(e) => setDiemLeadNhoNhat(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 (Tất cả)</span>
              <span>50 (Trung bình)</span>
              <span>80 (Tiềm năng cao)</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
            <p className="text-xs font-bold text-slate-700">Kết quả lọc hiện tại:</p>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Số lượng lead khớp:</span>
              <span className="font-bold text-slate-900">{totalItems}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => {
                setDiemLeadNhoNhat(0);
                setHienBoLocNangCao(false);
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Xoá bộ lọc
            </button>
            <button 
              type="button" 
              onClick={() => setHienBoLocNangCao(false)}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
