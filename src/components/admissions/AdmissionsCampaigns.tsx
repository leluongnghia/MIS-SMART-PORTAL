'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Megaphone, Send, Mail, MessageSquare, Plus, Eye, Edit2,
  MoreHorizontal, ChevronDown, Calendar, Users, CheckCircle2,
  Clock, X, BarChart3, Filter, Download, AlertTriangle
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type LoaiChienDich = 'Email' | 'Zalo OA' | 'SMS';
type TrangThaiCD = 'Đang chạy' | 'Nháp' | 'Đã kết thúc' | 'Đã lên lịch';

interface ChienDich {
  id: string;
  ten: string;
  loai: LoaiChienDich;
  trangThai: TrangThaiCD;
  mucTieu: string;
  daNhan: number;
  daMo: number;
  daClick: number;
  daTuVan: number;
  ngayTao: string;
  ngayGui?: string;
}

interface MauEmail {
  id: string;
  ten: string;
  loai: string;
  daSuDung: number;
  capNhatCuoi: string;
}

// ─── Dữ liệu mẫu ────────────────────────────────────────────────────────────
const CHIEN_DICH_MAU: ChienDich[] = [
  { id: 'cd1', ten: 'Ưu đãi học phí tháng 5 - Tất cả leads mới', loai: 'Email', trangThai: 'Đang chạy', mucTieu: 'Tất cả leads chưa tư vấn', daNhan: 1284, daMo: 627, daClick: 312, daTuVan: 45, ngayTao: '10/05/2025', ngayGui: '11/05/2025 09:00' },
  { id: 'cd2', ten: 'Nhắc lịch test đầu vào tuần 3', loai: 'Zalo OA', trangThai: 'Đang chạy', mucTieu: 'Leads đã đặt lịch test', daNhan: 168, daMo: 155, daClick: 148, daTuVan: 12, ngayTao: '12/05/2025', ngayGui: '15/05/2025 08:00' },
  { id: 'cd3', ten: 'Kết quả test - Thông báo học sinh đạt', loai: 'Email', trangThai: 'Đã lên lịch', mucTieu: 'Leads đã hoàn thành test', daNhan: 0, daMo: 0, daClick: 0, daTuVan: 0, ngayTao: '14/05/2025', ngayGui: '20/05/2025 10:00' },
  { id: 'cd4', ten: 'Chương trình giới thiệu - Phụ huynh Q2', loai: 'Zalo OA', trangThai: 'Nháp', mucTieu: 'Phụ huynh học sinh hiện tại', daNhan: 0, daMo: 0, daClick: 0, daTuVan: 0, ngayTao: '13/05/2025' },
  { id: 'cd5', ten: 'Thông báo khai giảng năm học 2025-2026', loai: 'Email', trangThai: 'Đã kết thúc', mucTieu: 'Tất cả leads đã giữ chỗ', daNhan: 186, daMo: 172, daClick: 165, daTuVan: 0, ngayTao: '01/05/2025', ngayGui: '05/05/2025 09:00' },
];

const MAU_EMAIL: MauEmail[] = [
  { id: 'me1', ten: 'Chào mừng lead mới', loai: 'Tự động', daSuDung: 1284, capNhatCuoi: '10/05/2025' },
  { id: 'me2', ten: 'Xác nhận lịch test đầu vào', loai: 'Tự động', daSuDung: 856, capNhatCuoi: '08/05/2025' },
  { id: 'me3', ten: 'Thông báo kết quả test', loai: 'Thủ công', daSuDung: 142, capNhatCuoi: '12/05/2025' },
  { id: 'me4', ten: 'Nhắc nộp học phí giữ chỗ', loai: 'Tự động', daSuDung: 44, capNhatCuoi: '05/05/2025' },
  { id: 'me5', ten: 'Chúc mừng nhập học', loai: 'Thủ công', daSuDung: 66, capNhatCuoi: '14/05/2025' },
];

const MAU_TRANG_THAI_CD: Record<TrangThaiCD, { bg: string; text: string; dot: string }> = {
  'Đang chạy':    { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  'Nháp':         { bg: 'bg-slate-100',  text: 'text-slate-600',  dot: 'bg-slate-400' },
  'Đã kết thúc':  { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  'Đã lên lịch':  { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400' },
};

const MAU_LOAI_CD: Record<LoaiChienDich, { bg: string; text: string; icon: React.ElementType }> = {
  'Email':   { bg: 'bg-blue-50',  text: 'text-blue-700',  icon: Mail },
  'Zalo OA': { bg: 'bg-cyan-50',  text: 'text-cyan-700',  icon: MessageSquare },
  'SMS':     { bg: 'bg-green-50', text: 'text-green-700', icon: Send },
};

const KPI_CD = [
  { ten: 'Chiến dịch đang chạy', gia_tri: '3', mau: 'bg-green-50', mauChu: 'text-green-700', icon: '🚀' },
  { ten: 'Tổng đã gửi', gia_tri: '1.638', mau: 'bg-blue-50', mauChu: 'text-blue-700', icon: '📤' },
  { ten: 'Tỷ lệ mở trung bình', gia_tri: '61.4%', mau: 'bg-purple-50', mauChu: 'text-purple-700', icon: '👁' },
  { ten: 'Tỷ lệ click trung bình', gia_tri: '28.4%', mau: 'bg-amber-50', mauChu: 'text-amber-700', icon: '🖱' },
];

// ─── Modal tạo chiến dịch ─────────────────────────────────────────────────────
function ModalTaoChienDich({ onClose }: { onClose: () => void }) {
  const [buoc, setBuoc] = useState<1 | 2>(1);
  const [loai, setLoai] = useState<LoaiChienDich>('Email');
  const [ten, setTen] = useState('');
  const [mucTieu, setMucTieu] = useState('');

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-black text-slate-900">Tạo chiến dịch mới</h3>
            <p className="text-xs text-slate-500">Bước {buoc}/2</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {buoc === 1 && (
            <>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Loại kênh <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  {(['Email', 'Zalo OA', 'SMS'] as LoaiChienDich[]).map(k => {
                    const cfg = MAU_LOAI_CD[k];
                    const Icon = cfg.icon;
                    return (
                      <button key={k} type="button" onClick={() => setLoai(k)}
                        className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-xs font-bold transition ${loai === k ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <Icon className="h-5 w-5" />
                        {k}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Tên chiến dịch <span className="text-red-500">*</span></label>
                <input type="text" value={ten} onChange={e => setTen(e.target.value)} placeholder="VD: Ưu đãi học phí tháng 6"
                  className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-400 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Đối tượng mục tiêu</label>
                <div className="relative">
                  <select value={mucTieu} onChange={e => setMucTieu(e.target.value)}
                    className="h-9 w-full appearance-none rounded-xl border border-slate-200 pl-3 pr-8 text-sm focus:border-blue-400 focus:outline-none">
                    <option value="">-- Chọn đối tượng --</option>
                    <option>Tất cả leads mới (chưa tư vấn)</option>
                    <option>Leads đang tư vấn</option>
                    <option>Leads đã đặt lịch test</option>
                    <option>Leads đã hoàn thành test</option>
                    <option>Leads đã giữ chỗ</option>
                    <option>Tùy chỉnh theo điều kiện</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </>
          )}
          {buoc === 2 && (
            <>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Mẫu nội dung</label>
                <div className="space-y-2">
                  {MAU_EMAIL.slice(0, 3).map(m => (
                    <button key={m.id} type="button"
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-blue-300 hover:bg-blue-50 transition">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{m.ten}</p>
                        <p className="text-[10px] text-slate-500">Đã dùng {m.daSuDung} lần · Cập nhật {m.capNhatCuoi}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Thời gian gửi</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-0.5 block text-[10px] text-slate-500">Ngày gửi</label>
                    <input type="date" className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] text-slate-500">Giờ gửi</label>
                    <input type="time" defaultValue="09:00" className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-400 focus:outline-none" />
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => buoc === 1 ? onClose() : setBuoc(1)}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
              {buoc === 1 ? 'Huỷ' : '← Quay lại'}
            </button>
            {buoc === 1 ? (
              <button type="button" onClick={() => setBuoc(2)} disabled={!ten}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-40">
                Tiếp theo →
              </button>
            ) : (
              <button type="button" onClick={onClose}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700">
                ✓ Tạo chiến dịch
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    typeof document !== 'undefined' ? document.body : document.createElement('div')
  );
}

// ─── Component chính ─────────────────────────────────────────────────────────
export default function AdmissionsCampaigns() {
  const [tab, setTab] = useState<'chien_dich' | 'mau_email'>('chien_dich');
  const [hienModal, setHienModal] = useState(false);
  const [locTrangThai, setLocTrangThai] = useState('Tất cả');

  const TABS = [
    { id: 'chien_dich' as const, nhan: '🚀 Chiến dịch' },
    { id: 'mau_email' as const, nhan: '✉️ Mẫu email / Zalo' },
  ];

  const dsLoc = CHIEN_DICH_MAU.filter(cd => locTrangThai === 'Tất cả' || cd.trangThai === locTrangThai);

  return (
    <>
      <div className="space-y-5">
        {/* Tiêu đề */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Chiến dịch Marketing</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Quản lý chiến dịch Email, Zalo OA và theo dõi hiệu quả</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Xuất báo cáo
            </button>
            <button type="button" onClick={() => setHienModal(true)}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5" /> Tạo chiến dịch
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {KPI_CD.map(k => (
            <div key={k.ten} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${k.mau}`}>{k.icon}</div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">{k.ten}</p>
                <p className={`text-2xl font-black ${k.mauChu}`}>{k.gia_tri}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4">
            <div className="flex gap-0">
              {TABS.map(t => (
                <button key={t.id} type="button" onClick={() => setTab(t.id)}
                  className={`border-b-2 px-4 py-3 text-xs font-bold transition ${tab === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                  {t.nhan}
                </button>
              ))}
            </div>
            {tab === 'chien_dich' && (
              <div className="flex gap-1">
                {['Tất cả', 'Đang chạy', 'Đã lên lịch', 'Nháp', 'Đã kết thúc'].map(s => (
                  <button key={s} type="button" onClick={() => setLocTrangThai(s)}
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition ${locTrangThai === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {tab === 'chien_dich' && (
            <div className="divide-y divide-slate-50">
              {dsLoc.map(cd => {
                const sc = MAU_TRANG_THAI_CD[cd.trangThai];
                const loaiCfg = MAU_LOAI_CD[cd.loai];
                const LoaiIcon = loaiCfg.icon;
                const tiLeMo = cd.daNhan > 0 ? ((cd.daMo / cd.daNhan) * 100).toFixed(1) : '—';
                const tiLeClick = cd.daMo > 0 ? ((cd.daClick / cd.daMo) * 100).toFixed(1) : '—';

                return (
                  <div key={cd.id} className="flex items-start gap-4 p-4 hover:bg-slate-50/50 transition">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${loaiCfg.bg}`}>
                      <LoaiIcon className={`h-5 w-5 ${loaiCfg.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-slate-900">{cd.ten}</p>
                        <span className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-black ${sc.bg} ${sc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />{cd.trangThai}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        🎯 {cd.mucTieu}
                        {cd.ngayGui && <> · <Calendar className="inline h-3 w-3 mx-0.5" />{cd.ngayGui}</>}
                      </p>
                      {cd.daNhan > 0 && (
                        <div className="mt-2 flex flex-wrap gap-4 text-xs">
                          {[
                            { nhan: '📤 Đã gửi', val: cd.daNhan.toLocaleString() },
                            { nhan: '👁 Tỷ lệ mở', val: `${tiLeMo}%` },
                            { nhan: '🖱 Tỷ lệ click', val: `${tiLeClick}%` },
                            { nhan: '💬 Đã tư vấn', val: cd.daTuVan.toString() },
                          ].map(m => (
                            <div key={m.nhan}>
                              <p className="text-slate-400">{m.nhan}</p>
                              <p className="font-black text-slate-800">{m.val}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><Eye className="h-3.5 w-3.5" /></button>
                      <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'mau_email' && (
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Mẫu nội dung đã tạo ({MAU_EMAIL.length})</p>
                <button type="button" className="flex h-8 items-center gap-1.5 rounded-xl bg-blue-50 px-3 text-xs font-bold text-blue-700 hover:bg-blue-100">
                  <Plus className="h-3.5 w-3.5" /> Tạo mẫu mới
                </button>
              </div>
              <div className="space-y-2">
                {MAU_EMAIL.map(m => (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{m.ten}</p>
                      <p className="text-[10px] text-slate-500">{m.loai} · Đã dùng {m.daSuDung} lần · Cập nhật {m.capNhatCuoi}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><Eye className="h-3.5 w-3.5" /></button>
                      <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button type="button" className="flex h-7 items-center gap-1 rounded-lg bg-blue-50 px-2 text-[10px] font-bold text-blue-700 hover:bg-blue-100">
                        <Send className="h-3 w-3" /> Dùng mẫu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {hienModal && <ModalTaoChienDich onClose={() => setHienModal(false)} />}
    </>
  );
}
