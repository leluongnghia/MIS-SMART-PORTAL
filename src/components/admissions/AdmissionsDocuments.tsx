'use client';

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2, Circle, Upload, Eye, Download, Trash2,
  Plus, AlertTriangle, Clock, FileText, Filter, Search,
  RefreshCw, ChevronDown, X, Image, File, Check, Send
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type TrangThaiHoSo = 'Đã nộp' | 'Chờ xác minh' | 'Thiếu' | 'Không hợp lệ';
type NhomHoSo = 'Bắt buộc' | 'Bổ sung' | 'Ưu tiên';

interface TaiLieu {
  id: string;
  ten: string;
  nhom: NhomHoSo;
  batBuoc: boolean;
  trangThai: TrangThaiHoSo | null;
  file?: string;
  ngayNop?: string;
  ghiChu?: string;
}

interface HoSoHocSinh {
  id: string;
  hoTen: string;
  maLead: string;
  khoi: string;
  tiepNhan: string;
  tiepNhanAvatar: string;
  tienDo: number;
  tongTaiLieu: number;
  daNop: number;
  trangThai: 'Đang xử lý' | 'Thiếu giấy tờ' | 'Hoàn thành' | 'Chờ xác minh';
}

// ─── Dữ liệu mẫu ─────────────────────────────────────────────────────────────
const DANH_SACH_TAI_LIEU: TaiLieu[] = [
  { id: 'd1', ten: 'Phiếu đăng ký tuyển sinh', nhom: 'Bắt buộc', batBuoc: true, trangThai: 'Đã nộp', file: 'phieu-dang-ky.pdf', ngayNop: '11/05/2025', ghiChu: '' },
  { id: 'd2', ten: 'Bản sao giấy khai sinh', nhom: 'Bắt buộc', batBuoc: true, trangThai: 'Đã nộp', file: 'giay-khai-sinh.pdf', ngayNop: '11/05/2025', ghiChu: '' },
  { id: 'd3', ten: 'Ảnh 3x4 (2 ảnh)', nhom: 'Bắt buộc', batBuoc: true, trangThai: 'Đã nộp', file: 'anh-3x4.jpg', ngayNop: '11/05/2025', ghiChu: '' },
  { id: 'd4', ten: 'Học bạ 2 năm gần nhất', nhom: 'Bắt buộc', batBuoc: true, trangThai: 'Thiếu', file: undefined, ngayNop: undefined, ghiChu: 'Phụ huynh chưa cung cấp' },
  { id: 'd5', ten: 'Giấy chứng nhận tiêm chủng', nhom: 'Bắt buộc', batBuoc: true, trangThai: 'Thiếu', file: undefined, ngayNop: undefined, ghiChu: '' },
  { id: 'd6', ten: 'CMND/CCCD của phụ huynh', nhom: 'Bắt buộc', batBuoc: true, trangThai: 'Chờ xác minh', file: 'cmnd-phu-huynh.pdf', ngayNop: '12/05/2025', ghiChu: 'Đang kiểm tra thông tin' },
  { id: 'd7', ten: 'Giấy xác nhận hộ khẩu', nhom: 'Bổ sung', batBuoc: false, trangThai: null, file: undefined, ngayNop: undefined, ghiChu: '' },
  { id: 'd8', ten: 'Giấy tờ ưu tiên (nếu có)', nhom: 'Ưu tiên', batBuoc: false, trangThai: null, file: undefined, ngayNop: undefined, ghiChu: '' },
];

const HO_SO_DANH_SACH: HoSoHocSinh[] = [
  { id: 'h1', hoTen: 'Nguyễn Hoàng Minh', maLead: 'LD250510-01284', khoi: 'Lớp 6', tiepNhan: 'Trần Bảo Ngọc', tiepNhanAvatar: 'TN', tienDo: 43, tongTaiLieu: 7, daNop: 3, trangThai: 'Thiếu giấy tờ' },
  { id: 'h2', hoTen: 'Phạm Minh Anh', maLead: 'LD250509-00892', khoi: 'Lớp 3', tiepNhan: 'Nguyễn Thu Hà', tiepNhanAvatar: 'NH', tienDo: 100, tongTaiLieu: 7, daNop: 7, trangThai: 'Hoàn thành' },
  { id: 'h3', hoTen: 'Trần Gia Bảo', maLead: 'LD250511-01420', khoi: 'Lớp 9', tiepNhan: 'Phạm Gia Huy', tiepNhanAvatar: 'PH', tienDo: 71, tongTaiLieu: 7, daNop: 5, trangThai: 'Chờ xác minh' },
  { id: 'h4', hoTen: 'Lê Đăng Khoa', maLead: 'LD250510-01301', khoi: 'Lớp 7', tiepNhan: 'Đỗ Hoàng Nam', tiepNhanAvatar: 'DN', tienDo: 14, tongTaiLieu: 7, daNop: 1, trangThai: 'Thiếu giấy tờ' },
  { id: 'h5', hoTen: 'Phạm Minh Châu', maLead: 'LD250512-01605', khoi: 'Lớp 4', tiepNhan: 'Trần Bảo Ngọc', tiepNhanAvatar: 'TN', tienDo: 57, tongTaiLieu: 7, daNop: 4, trangThai: 'Đang xử lý' },
];

const MAU_TRANG_THAI_TAILIEU: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  'Đã nộp':       { bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle2 },
  'Chờ xác minh': { bg: 'bg-amber-100',  text: 'text-amber-700',  icon: Clock },
  'Thiếu':        { bg: 'bg-red-100',    text: 'text-red-600',    icon: AlertTriangle },
  'Không hợp lệ': { bg: 'bg-orange-100', text: 'text-orange-700', icon: X },
};

const MAU_TRANG_THAI_HOSO: Record<string, { bg: string; text: string }> = {
  'Hoàn thành':   { bg: 'bg-green-100',  text: 'text-green-700' },
  'Đang xử lý':   { bg: 'bg-blue-100',   text: 'text-blue-700' },
  'Chờ xác minh': { bg: 'bg-amber-100',  text: 'text-amber-700' },
  'Thiếu giấy tờ':{ bg: 'bg-red-100',    text: 'text-red-600' },
};

const KPI_HO_SO = [
  { ten: 'Tổng hồ sơ', gia_tri: '148', mau: 'bg-blue-50 text-blue-700', icon: '📁' },
  { ten: 'Hoàn thành đủ', gia_tri: '42', mau: 'bg-green-50 text-green-700', icon: '✅' },
  { ten: 'Thiếu giấy tờ', mau: 'bg-red-50 text-red-700', gia_tri: '76', icon: '⚠️' },
  { ten: 'Chờ xác minh', mau: 'bg-amber-50 text-amber-700', gia_tri: '30', icon: '🔍' },
];

// ─── Component upload tài liệu ────────────────────────────────────────────────
function UploaderTaiLieu({ taiLieu, onClose }: { taiLieu: TaiLieu; onClose: () => void }) {
  const [keoVao, setKeoVao] = useState(false);
  const [daTai, setDaTai] = useState(false);
  const [tenFile, setTenFile] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setTenFile(f.name); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-black text-slate-900">Tải lên tài liệu</h3>
            <p className="text-xs font-semibold text-slate-500">{taiLieu.ten}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div
            onDragOver={e => { e.preventDefault(); setKeoVao(true); }}
            onDragLeave={() => setKeoVao(false)}
            onDrop={e => { e.preventDefault(); setKeoVao(false); const f = e.dataTransfer.files?.[0]; if (f) setTenFile(f.name); }}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition ${keoVao ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={handleFile} />
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Upload className="h-6 w-6 text-blue-500" />
            </div>
            {tenFile ? (
              <div className="text-center">
                <p className="font-bold text-slate-900">{tenFile}</p>
                <p className="text-xs text-slate-500">Nhấn để đổi file</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700">Kéo thả hoặc nhấn để tải lên</p>
                <p className="text-xs text-slate-400">PDF, JPG, PNG, DOC (tối đa 10MB)</p>
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Ghi chú (tuỳ chọn)</label>
            <textarea rows={2} placeholder="Ghi chú về tài liệu này..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Huỷ</button>
            <button type="button" onClick={() => { setDaTai(true); setTimeout(onClose, 800); }}
              disabled={!tenFile}
              className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-40">
              {daTai ? '✓ Đã tải lên' : 'Tải lên'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    // @ts-ignore
    document.body
  );
}

// ─── Component chính ─────────────────────────────────────────────────────────
export default function AdmissionsDocuments() {
  const [tab, setTab] = useState<'danh_sach' | 'chi_tiet'>('danh_sach');
  const [hoSoChon, setHoSoChon] = useState<HoSoHocSinh | null>(HO_SO_DANH_SACH[0]);
  const [uploadTaiLieu, setUploadTaiLieu] = useState<TaiLieu | null>(null);
  const [timKiem, setTimKiem] = useState('');
  const [locTrangThai, setLocTrangThai] = useState('Tất cả');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const NHOM: NhomHoSo[] = ['Bắt buộc', 'Bổ sung', 'Ưu tiên'];
  const daNop = DANH_SACH_TAI_LIEU.filter(d => d.trangThai === 'Đã nộp').length;
  const tongTaiLieu = DANH_SACH_TAI_LIEU.filter(d => d.batBuoc).length;

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          <span>✓</span> {toast}
        </div>
      )}
      <div className="space-y-5">
        {/* Tiêu đề */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Hồ sơ & Tài liệu</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Quản lý và xác minh hồ sơ tuyển sinh của học sinh</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => showToast('Xuất danh sách hồ sơ thành công!')} className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Xuất danh sách
            </button>
            <button type="button" onClick={() => showToast(`Gửi nhắc nộp hồ sơ đến ${HO_SO_DANH_SACH.filter(h=>h.trangThai==='Thiếu giấy tờ').length} học sinh`)} className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50">
              <Send className="h-3.5 w-3.5" /> Gửi nhắc nộp HS
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {KPI_HO_SO.map(k => (
            <div key={k.ten} className={`flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm`}>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${k.mau}`}>{k.icon}</div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">{k.ten}</p>
                <p className="text-2xl font-black text-slate-900">{k.gia_tri}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Layout 2 cột */}
        <div className="grid gap-5 md:grid-cols-[360px,1fr]">
          {/* Danh sách hồ sơ */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Tìm học sinh..." value={timKiem} onChange={e => setTimKiem(e.target.value)}
                  className="h-8 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs focus:outline-none focus:border-blue-400" />
              </div>
              <div className="mt-2 flex gap-1 flex-wrap">
                {['Tất cả', 'Thiếu giấy tờ', 'Hoàn thành', 'Chờ xác minh', 'Đang xử lý'].map(s => (
                  <button key={s} type="button" onClick={() => setLocTrangThai(s)}
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition ${locTrangThai === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-slate-50 overflow-y-auto max-h-[500px]">
              {HO_SO_DANH_SACH.filter(h =>
                (locTrangThai === 'Tất cả' || h.trangThai === locTrangThai) &&
                (!timKiem || h.hoTen.toLowerCase().includes(timKiem.toLowerCase()))
              ).map(hs => {
                const sc = MAU_TRANG_THAI_HOSO[hs.trangThai];
                const isActive = hoSoChon?.id === hs.id;
                return (
                  <button key={hs.id} type="button" onClick={() => setHoSoChon(hs)}
                    className={`w-full p-3 text-left transition ${isActive ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-[10px] font-black text-white">
                        {hs.hoTen.split(' ').slice(-2).map(w => w[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-sm font-black text-slate-900 truncate">{hs.hoTen}</p>
                          <span className={`shrink-0 rounded-lg px-1.5 py-0.5 text-[9px] font-black ${sc.bg} ${sc.text}`}>{hs.trangThai}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">{hs.maLead} · {hs.khoi}</p>
                        <div className="mt-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold mb-0.5">
                            <span className="text-slate-500">Hồ sơ</span>
                            <span className={hs.tienDo === 100 ? 'text-green-600' : 'text-slate-600'}>{hs.daNop}/{hs.tongTaiLieu}</span>
                          </div>
                          <div className="h-1 rounded-full bg-slate-100">
                            <div className={`h-1 rounded-full transition-all ${hs.tienDo === 100 ? 'bg-green-500' : hs.tienDo >= 60 ? 'bg-blue-500' : hs.tienDo >= 30 ? 'bg-amber-400' : 'bg-red-400'}`}
                              style={{ width: `${hs.tienDo}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chi tiết hồ sơ */}
          {hoSoChon ? (
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="border-b border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-black text-white">
                      {hoSoChon.hoTen.split(' ').slice(-2).map(w => w[0]).join('')}
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">{hoSoChon.hoTen}</h2>
                      <p className="text-xs text-slate-500">{hoSoChon.maLead} · {hoSoChon.khoi} · TVV: {hoSoChon.tiepNhan}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500">Tiến độ hồ sơ</p>
                      <p className="text-2xl font-black text-slate-900">{hoSoChon.tienDo}%</p>
                    </div>
                    <div className="h-12 w-12">
                      <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15" fill="none"
                          stroke={hoSoChon.tienDo === 100 ? '#10b981' : hoSoChon.tienDo >= 60 ? '#3b82f6' : '#f59e0b'}
                          strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${(hoSoChon.tienDo / 100) * 94.2} 94.2`} />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => showToast(`Gửi nhắc nộp hồ sơ đến ${hoSoChon?.hoTen}`)} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700">
                    <Send className="h-3.5 w-3.5" /> Nhắc nộp hồ sơ
                  </button>
                  <button type="button" onClick={() => showToast(`Tải tất cả tài liệu của ${hoSoChon?.hoTen}...`)} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <Download className="h-3.5 w-3.5" /> Tải tất cả
                  </button>
                  <button type="button" onClick={() => showToast('Cập nhật hồ sơ thành công!')} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <RefreshCw className="h-3.5 w-3.5" /> Cập nhật
                  </button>
                </div>
              </div>

              {/* Danh sách tài liệu theo nhóm */}
              <div className="p-4 space-y-4 overflow-y-auto max-h-[480px]">
                {NHOM.map(nhom => {
                  const dsNhom = DANH_SACH_TAI_LIEU.filter(d => d.nhom === nhom);
                  return (
                    <div key={nhom}>
                      <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-slate-400">
                        <span className={`inline-block h-2 w-2 rounded-full ${nhom === 'Bắt buộc' ? 'bg-red-500' : nhom === 'Bổ sung' ? 'bg-blue-400' : 'bg-amber-400'}`} />
                        {nhom}
                        <span className="font-semibold text-slate-300">({dsNhom.length} tài liệu)</span>
                      </p>
                      <div className="space-y-2">
                        {dsNhom.map(tl => {
                          const cfg = tl.trangThai ? MAU_TRANG_THAI_TAILIEU[tl.trangThai] : null;
                          const Icon = cfg?.icon || Circle;
                          return (
                            <div key={tl.id} className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                              tl.trangThai === 'Đã nộp' ? 'border-green-100 bg-green-50/40' :
                              tl.trangThai === 'Thiếu' ? 'border-red-100 bg-red-50/40' :
                              tl.trangThai === 'Chờ xác minh' ? 'border-amber-100 bg-amber-50/40' :
                              'border-slate-100 bg-white'
                            }`}>
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${cfg ? `${cfg.bg}` : 'bg-slate-100'}`}>
                                <Icon className={`h-4 w-4 ${cfg ? cfg.text : 'text-slate-400'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-slate-800 truncate">{tl.ten}</p>
                                  {tl.batBuoc && <span className="shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-black text-red-600">Bắt buộc</span>}
                                </div>
                                {tl.trangThai && (
                                  <p className={`text-[10px] font-bold ${cfg?.text}`}>
                                    {tl.trangThai}{tl.ngayNop ? ` · ${tl.ngayNop}` : ''}
                                    {tl.ghiChu ? ` — ${tl.ghiChu}` : ''}
                                  </p>
                                )}
                                {!tl.trangThai && <p className="text-[10px] text-slate-400">Chưa cung cấp</p>}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {tl.file && (
                                  <button type="button" onClick={() => showToast(`Xem file: ${tl.file}`)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Xem file">
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {tl.file && (
                                  <button type="button" onClick={() => showToast(`Tải về: ${tl.file}`)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-green-50 hover:text-green-600" title="Tải về">
                                    <Download className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                <button type="button" onClick={() => setUploadTaiLieu(tl)}
                                  className={`flex h-7 items-center gap-1 rounded-lg px-2 text-[10px] font-bold transition ${
                                    tl.trangThai === 'Đã nộp' ? 'text-slate-400 hover:bg-slate-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                  }`}>
                                  <Upload className="h-3 w-3" />
                                  {tl.trangThai === 'Đã nộp' ? 'Cập nhật' : 'Tải lên'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
              <p className="text-sm font-semibold text-slate-400">Chọn một hồ sơ để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal upload */}
      {uploadTaiLieu && <UploaderTaiLieu taiLieu={uploadTaiLieu} onClose={() => setUploadTaiLieu(null)} />}
    </>
  );
}
