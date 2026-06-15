'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Plus, Download, Upload, Filter, Eye, Edit2, MoreHorizontal,
  Users, MessageSquare, ClipboardList, CalendarCheck, GraduationCap,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LayoutGrid, List, Settings2,
  X, Phone, Mail, MapPin, ChevronDown, AlertCircle, CheckCircle2
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type TrangThai = 'Mới' | 'Đang tư vấn' | 'Đăng ký test' | 'Nộp hồ sơ' | 'Giữ chỗ' | 'Nhập học' | 'Không tiếp tục';

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

// ─── Dữ liệu mẫu ─────────────────────────────────────────────────────────────
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

// ─── Modal Thêm Lead ────────────────────────────────────────────────────
export function ModalThemLead({ onDong, onLuu, chuongTrinhList = DS_CHUONG_TRINH }: { onDong: () => void; onLuu: (data: FormThem) => void; chuongTrinhList?: string[] }) {
  const [buoc, setBuoc] = useState<1 | 2>(1);
  const [da_luu, setDaLuu] = useState(false);
  const [form, setForm] = useState<FormThem>({
    hoTenHocSinh: '', ngaySinh: '', gioiTinh: 'Nam', truongHienTai: '',
    khoi: '', chuongTrinh: '', hoTenPhuHuynh: '', sdtPhuHuynh: '',
    emailPhuHuynh: '', diaChiPhuHuynh: '', nguonLead: '', chiendich: '',
    tvv: DS_TVV[1], ghiChu: '',
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
    setTimeout(() => { onLuu(form); onDong(); }, 1200);
  };

  if (da_luu) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-slate-900">Tạo lead thành công!</p>
          <p className="mt-1 text-sm text-slate-500">Lead của <strong>{form.hoTenHocSinh}</strong> đã được thêm vào hệ thống.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Thêm lead mới</h2>
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
              <button type="button" onClick={() => { if (kiemTraBuoc2()) { onLuu(form); onDong(); } }}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                Lưu & Thêm mới
              </button>
              <button type="button" onClick={handleLuu}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm">
                ✓ Lưu lead
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
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  chuongTrinhList?: string[];
}

export default function AdmissionsLeadsTable({ leads, setLeads, chuongTrinhList }: AdmissionsLeadsTableProps) {
  const [timKiem, setTimKiem] = useState('');
  const [nguon, setNguon] = useState(DS_NGUON[0]);
  const [tvv, setTvv] = useState(DS_TVV[0]);
  const [khoi, setKhoi] = useState(DS_KHOI[0]);
  const [trangThai, setTrangThai] = useState(DS_TRANG_THAI[0]);
  const [daChon, setDaChon] = useState<Set<string>>(new Set());
  const [trang, setTrang] = useState(1);
  const [hienModal, setHienModal] = useState(false);
  const tongTrang = 129;

  const chonTatCa = () => {
    if (daChon.size === leads.length) setDaChon(new Set());
    else setDaChon(new Set(leads.map(l => l.id)));
  };

  const chonMot = (id: string) => {
    const next = new Set(daChon);
    next.has(id) ? next.delete(id) : next.add(id);
    setDaChon(next);
  };

  const handleLuuLead = (data: FormThem) => {
    const leadMoi: Lead = {
      id: `l${Date.now()}`,
      hoTen: data.hoTenHocSinh,
      sdt: data.sdtPhuHuynh,
      email: data.emailPhuHuynh || '—',
      nguonLead: data.nguonLead,
      khoi: data.khoi,
      tvv: data.tvv,
      tvvAvatar: data.tvv.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      trangThai: 'Mới',
      diemLead: 50,
      ngayTao: new Date().toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
    };
    setLeads(prev => [leadMoi, ...prev]);
  };

  return (
    <>
      <div className="space-y-5">
        {/* Tiêu đề */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Leads & Thí sinh</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Quản lý toàn bộ leads và thí sinh trong quy trình tuyển sinh.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button"
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition">
              <Upload className="h-3.5 w-3.5" /> Nhập CSV
            </button>
            <button type="button"
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition">
              <Download className="h-3.5 w-3.5" /> Xuất CSV
            </button>
            <button
              type="button"
              onClick={() => setHienModal(true)}
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
              type="text" value={timKiem} onChange={e => setTimKiem(e.target.value)}
              placeholder="Tìm theo tên, SĐT, email, mã lead..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {[
            { nhan: 'Nguồn', val: nguon, set: setNguon, opts: DS_NGUON },
            { nhan: 'TVV', val: tvv, set: setTvv, opts: DS_TVV },
            { nhan: 'Khối', val: khoi, set: setKhoi, opts: DS_KHOI },
            { nhan: 'Trạng thái', val: trangThai, set: setTrangThai, opts: DS_TRANG_THAI },
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
                <input type="checkbox" checked={daChon.size === leads.length && leads.length > 0} onChange={chonTatCa}
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
              <button type="button" className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                <Filter className="h-3.5 w-3.5" /> Bộ lọc nâng cao
              </button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" title="Xem lưới">
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600" title="Xem danh sách">
                <List className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" title="Tuỳ chỉnh cột">
                <Settings2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

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
                {leads.map((lead) => {
                  const sc = MAU_TRANG_THAI[lead.trangThai];
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/60 cursor-pointer transition-colors">
                      <td className="py-3 pl-4 pr-2">
                        <input type="checkbox" checked={daChon.has(lead.id)} onChange={() => chonMot(lead.id)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-blue-600 hover:text-blue-700 hover:underline">{lead.hoTen}</p>
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
                        <span className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold w-fit ${sc.bg} ${sc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {lead.trangThai}
                        </span>
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
                          <button type="button" title="Xem chi tiết" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" title="Chỉnh sửa" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" title="Thêm thao tác" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500">Hiển thị {leads.length} trong tổng số 1.284 kết quả</p>
            <div className="flex items-center gap-1.5">
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40" disabled={trang === 1} onClick={() => setTrang(1)}>
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40" disabled={trang === 1} onClick={() => setTrang(p => p - 1)}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {[1, 2, 3, 4, 5].map(p => (
                <button key={p} type="button" onClick={() => setTrang(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${trang === p ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {p}
                </button>
              ))}
              <span className="px-1 text-slate-400">...</span>
              <button type="button" onClick={() => setTrang(tongTrang)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                {tongTrang}
              </button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40" disabled={trang === tongTrang} onClick={() => setTrang(p => p + 1)}>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40" disabled={trang === tongTrang} onClick={() => setTrang(tongTrang)}>
                <ChevronsRight className="h-3.5 w-3.5" />
              </button>
              <select className="h-8 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-600">
                <option>10 / trang</option>
                <option>25 / trang</option>
                <option>50 / trang</option>
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
              onDong={() => setHienModal(false)}
              onLuu={handleLuuLead}
              chuongTrinhList={chuongTrinhList}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
