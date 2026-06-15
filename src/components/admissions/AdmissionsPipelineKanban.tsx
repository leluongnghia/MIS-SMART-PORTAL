'use client';

import React, { useState } from 'react';
import {
  X, Phone, Mail, Clock, ArrowRight, ChevronDown, Filter, Settings,
  Plus, RefreshCw, Calendar, MessageSquare, Send, Zap
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type GiaiDoan =
  | 'Tiếp nhận mới'
  | 'Đang tư vấn'
  | 'Đặt lịch test'
  | 'Đã thi test'
  | 'Nộp hồ sơ'
  | 'Giữ chỗ'
  | 'Nhập học'
  | 'Không tiếp tục';

type DoUuTien = 'Cao' | 'Trung bình' | 'Thấp';

interface TheKanban {
  id: string;
  hoTen: string;
  khoi: string;
  nguon: string;
  tvv: string;
  tvvKyHieu: string;
  diemLead: number;
  doUuTien: DoUuTien;
  giaiDoan: GiaiDoan;
  hoatDongCuoi: string;
  buocTiep: string;
  hanChot?: string;
  tienDoHoSo?: string; // vd: "2/4"
}

// ─── Cấu hình giai đoạn ─────────────────────────────────────────────────────
const CAU_HINH_GIAI_DOAN: Record<GiaiDoan, {
  mauNen: string; mauChu: string; mauTieuDe: string;
  mauVien: string; soLuong: number;
}> = {
  'Tiếp nhận mới':    { mauNen: '#3B82F6', mauChu: 'text-blue-700',   mauTieuDe: 'bg-blue-50 border-blue-200',     mauVien: '#3B82F640', soLuong: 312 },
  'Đang tư vấn':      { mauNen: '#8B5CF6', mauChu: 'text-purple-700', mauTieuDe: 'bg-purple-50 border-purple-200', mauVien: '#8B5CF640', soLuong: 232 },
  'Đặt lịch test':    { mauNen: '#06B6D4', mauChu: 'text-cyan-700',   mauTieuDe: 'bg-cyan-50 border-cyan-200',     mauVien: '#06B6D440', soLuong: 168 },
  'Đã thi test':      { mauNen: '#F59E0B', mauChu: 'text-amber-700',  mauTieuDe: 'bg-amber-50 border-amber-200',   mauVien: '#F59E0B40', soLuong: 142 },
  'Nộp hồ sơ':        { mauNen: '#F97316', mauChu: 'text-orange-700', mauTieuDe: 'bg-orange-50 border-orange-200', mauVien: '#F9731640', soLuong: 96  },
  'Giữ chỗ':          { mauNen: '#EF4444', mauChu: 'text-red-600',    mauTieuDe: 'bg-red-50 border-red-200',       mauVien: '#EF444440', soLuong: 44  },
  'Nhập học':         { mauNen: '#10B981', mauChu: 'text-green-700',  mauTieuDe: 'bg-green-50 border-green-200',   mauVien: '#10B98140', soLuong: 66  },
  'Không tiếp tục':   { mauNen: '#94A3B8', mauChu: 'text-slate-600',  mauTieuDe: 'bg-slate-50 border-slate-200',   mauVien: '#94A3B840', soLuong: 24  },
};

const MAU_UU_TIEN: Record<DoUuTien, string> = {
  'Cao': 'bg-red-100 text-red-700',
  'Trung bình': 'bg-amber-100 text-amber-700',
  'Thấp': 'bg-slate-100 text-slate-600',
};

// ─── Dữ liệu mẫu ─────────────────────────────────────────────────────────────
const THE_MAU: TheKanban[] = [
  { id: 'k1', hoTen: 'Lê Minh Khang', khoi: 'Lớp 6', nguon: 'Website', tvv: 'Trần Bảo Ngọc', tvvKyHieu: 'TN', diemLead: 68, doUuTien: 'Cao', giaiDoan: 'Tiếp nhận mới', hoatDongCuoi: '18/05 09:12', buocTiep: 'Gọi điện tư vấn' },
  { id: 'k2', hoTen: 'Nguyễn Gia Bảo', khoi: 'Lớp 3', nguon: 'Zalo OA', tvv: 'Trần Bảo Ngọc', tvvKyHieu: 'TN', diemLead: 72, doUuTien: 'Cao', giaiDoan: 'Tiếp nhận mới', hoatDongCuoi: '18/05 10:15', buocTiep: 'Gửi tài liệu' },
  { id: 'k3', hoTen: 'Võ Thị Hoa', khoi: 'Lớp 2', nguon: 'Facebook', tvv: 'Trần Bảo Ngọc', tvvKyHieu: 'TN', diemLead: 45, doUuTien: 'Thấp', giaiDoan: 'Tiếp nhận mới', hoatDongCuoi: '17/05 16:05', buocTiep: 'Gửi Zalo' },
  { id: 'k4', hoTen: 'Trần Bảo Ngọc', khoi: 'Lớp 7', nguon: 'Website', tvv: 'Phạm Gia Huy', tvvKyHieu: 'PH', diemLead: 75, doUuTien: 'Cao', giaiDoan: 'Đang tư vấn', hoatDongCuoi: '18/05 10:15', buocTiep: 'Tư vấn chuyên sâu' },
  { id: 'k5', hoTen: 'Phạm Minh Châu', khoi: 'Lớp 4', nguon: 'Facebook', tvv: 'Nguyễn Phương Linh', tvvKyHieu: 'NL', diemLead: 60, doUuTien: 'Trung bình', giaiDoan: 'Đang tư vấn', hoatDongCuoi: '18/05 09:45', buocTiep: 'Tư vấn học phí' },
  { id: 'k6', hoTen: 'Nguyễn Minh Anh', khoi: 'Lớp 6', nguon: 'Website', tvv: 'Phạm Gia Huy', tvvKyHieu: 'PH', diemLead: 80, doUuTien: 'Cao', giaiDoan: 'Đặt lịch test', hoatDongCuoi: '18/05 10:02', buocTiep: 'Nhắc lịch test', hanChot: '20/05 14:00' },
  { id: 'k7', hoTen: 'Lê Gia Bảo', khoi: 'Lớp 5', nguon: 'Zalo OA', tvv: 'Nguyễn Phương Linh', tvvKyHieu: 'NL', diemLead: 65, doUuTien: 'Trung bình', giaiDoan: 'Đặt lịch test', hoatDongCuoi: '18/05 09:20', buocTiep: 'Nhắc lịch test', hanChot: '19/05 09:00' },
  { id: 'k8', hoTen: 'Hoàn An Nhiên', khoi: 'Lớp 9', nguon: 'Giới thiệu', tvv: 'Phạm Gia Huy', tvvKyHieu: 'PH', diemLead: 85, doUuTien: 'Cao', giaiDoan: 'Đã thi test', hoatDongCuoi: '18/05 11:20', buocTiep: 'Phân tích kết quả' },
  { id: 'k9', hoTen: 'Phan Gia Huy', khoi: 'Lớp 6', nguon: 'Website', tvv: 'Lê Hoàng Minh', tvvKyHieu: 'LM', diemLead: 88, doUuTien: 'Cao', giaiDoan: 'Nộp hồ sơ', hoatDongCuoi: '18/05 11:05', buocTiep: 'Nhận nộp hồ sơ', tienDoHoSo: '2/4' },
  { id: 'k10', hoTen: 'Đỗ Bảo Ngọc', khoi: 'Lớp 5', nguon: 'Facebook Ads', tvv: 'Trần Bảo Ngọc', tvvKyHieu: 'TN', diemLead: 90, doUuTien: 'Cao', giaiDoan: 'Giữ chỗ', hoatDongCuoi: '18/05 11:30', buocTiep: 'Ký hợp đồng', hanChot: '18/05' },
  { id: 'k11', hoTen: 'Phạm Gia Hân', khoi: 'Lớp 3', nguon: 'Website', tvv: 'Phạm Gia Huy', tvvKyHieu: 'PH', diemLead: 92, doUuTien: 'Cao', giaiDoan: 'Nhập học', hoatDongCuoi: '18/05 09:00', buocTiep: 'Nhập học thành công' },
  { id: 'k12', hoTen: 'Lê Anh Khoa', khoi: 'Lớp 4', nguon: 'Facebook Ads', tvv: 'Lê Hoàng Minh', tvvKyHieu: 'LM', diemLead: 30, doUuTien: 'Thấp', giaiDoan: 'Không tiếp tục', hoatDongCuoi: '15/05 15:00', buocTiep: 'Ghi nhận lý do' },
];

const THU_TU_GIAI_DOAN: GiaiDoan[] = [
  'Tiếp nhận mới', 'Đang tư vấn', 'Đặt lịch test', 'Đã thi test',
  'Nộp hồ sơ', 'Giữ chỗ', 'Nhập học', 'Không tiếp tục'
];

// ─── Thẻ Kanban ───────────────────────────────────────────────────────────────
function TheKanbanItem({ the, onClick }: { the: TheKanban; onClick: () => void }) {
  const mauUuTien = MAU_UU_TIEN[the.doUuTien];
  const mauDiem = the.diemLead >= 80 ? 'text-green-600' : the.diemLead >= 60 ? 'text-amber-600' : 'text-red-500';

  return (
    <div onClick={onClick}
      className="cursor-pointer rounded-xl border border-slate-100 bg-white p-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-black text-slate-900 leading-tight">{the.hoTen}</p>
        <span className={`shrink-0 rounded-lg px-1.5 py-0.5 text-[10px] font-black ${mauUuTien}`}>{the.doUuTien}</span>
      </div>
      <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
        {the.khoi} · {the.nguon}
      </p>

      <div className="mt-2.5 flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[8px] font-black text-white">
          {the.tvvKyHieu}
        </div>
        <span className="flex-1 text-[10px] font-semibold text-slate-500 truncate">{the.tvv}</span>
        <span className={`text-xs font-black ${mauDiem}`}>{the.diemLead}</span>
      </div>

      {the.hanChot && (
        <div className="mt-2 flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
          <Calendar className="h-3 w-3" /> Hạn: {the.hanChot}
        </div>
      )}
      {the.tienDoHoSo && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-orange-700 mb-0.5">
            <span>Hồ sơ</span><span>{the.tienDoHoSo} tài liệu</span>
          </div>
          <div className="h-1 rounded-full bg-orange-100">
            <div className="h-1 rounded-full bg-orange-500" style={{ width: `${(parseInt(the.tienDoHoSo.split('/')[0]) / parseInt(the.tienDoHoSo.split('/')[1])) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
          <Clock className="h-2.5 w-2.5" /> {the.hoatDongCuoi}
        </span>
        <span className="text-[10px] font-bold text-blue-600">→ {the.buocTiep}</span>
      </div>
    </div>
  );
}

// ─── Panel chi tiết (slide-over) ─────────────────────────────────────────────
function PanelChiTiet({ the, onDong }: { the: TheKanban; onDong: () => void }) {
  const cfg = CAU_HINH_GIAI_DOAN[the.giaiDoan];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">{the.giaiDoan}</span>
          <h2 className="text-lg font-black text-slate-900">{the.hoTen}</h2>
        </div>
        <button type="button" onClick={onDong} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`rounded-xl px-3 py-1 text-xs font-bold ${MAU_UU_TIEN[the.doUuTien]}`}>⚡ {the.doUuTien}</span>
          <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{the.khoi}</span>
          <span className={`rounded-xl px-3 py-1 text-xs font-bold`} style={{ background: cfg.mauNen + '20', color: cfg.mauNen }}>
            {the.giaiDoan}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          {[
            ['Nguồn lead', the.nguon],
            ['Tư vấn viên', the.tvv],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-slate-500">{k}</span>
              <span className="font-bold text-slate-800">{v}</span>
            </div>
          ))}
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Điểm lead</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 rounded-full bg-slate-100">
                <div className={`h-1.5 rounded-full ${the.diemLead >= 80 ? 'bg-green-500' : the.diemLead >= 60 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${the.diemLead}%` }} />
              </div>
              <span className={`text-sm font-black ${the.diemLead >= 80 ? 'text-green-600' : the.diemLead >= 60 ? 'text-amber-600' : 'text-red-500'}`}>{the.diemLead}/100</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Thông tin liên hệ</p>
          {[
            { icon: Phone, label: '0901 234 567' },
            { icon: Mail, label: 'phuHuynh@email.com' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-100 p-2 text-xs">
                <Icon className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-700">{item.label}</span>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Hoạt động gần nhất</p>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 text-xs">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-600">{the.hoatDongCuoi}</span>
          </div>
        </div>

        {/* Bước tiến */}
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Lịch sử giai đoạn</p>
          <div className="flex flex-wrap gap-1">
            {THU_TU_GIAI_DOAN.slice(0, THU_TU_GIAI_DOAN.indexOf(the.giaiDoan) + 1).map((gd, i) => (
              <React.Fragment key={gd}>
                <div className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                  gd === the.giaiDoan ? 'text-white' : 'bg-slate-100 text-slate-500'
                }`} style={gd === the.giaiDoan ? { background: CAU_HINH_GIAI_DOAN[gd].mauNen } : {}}>
                  {gd}
                </div>
                {i < THU_TU_GIAI_DOAN.indexOf(the.giaiDoan) && <ArrowRight className="h-3 w-3 text-slate-300 self-center shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
          <p className="text-xs font-black text-blue-800">Bước tiếp theo</p>
          <p className="mt-1 text-sm font-bold text-blue-700">{the.buocTiep}</p>
          {the.hanChot && <p className="mt-0.5 text-xs text-blue-500">⏰ Hạn chót: {the.hanChot}</p>}
        </div>
      </div>

      <div className="border-t border-slate-100 p-4 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Phone, label: 'Gọi điện' },
            { icon: MessageSquare, label: 'Zalo' },
            { icon: Send, label: 'Gửi Email' },
          ].map(a => {
            const Icon = a.icon;
            return (
              <button key={a.label} type="button"
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                <Icon className="h-4 w-4" />
                {a.label}
              </button>
            );
          })}
        </div>
        <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition">
          <Zap className="h-4 w-4" /> Chuyển giai đoạn <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Component chính ──────────────────────────────────────────────────────────
export default function AdmissionsPipelineKanban() {
  const [theChon, setTheChon] = useState<TheKanban | null>(null);
  const [locTvv, setLocTvv] = useState('Tất cả tư vấn viên');
  const [locNguon, setLocNguon] = useState('Tất cả nguồn');

  const layTheoGiaiDoan = (gd: GiaiDoan) => THE_MAU.filter(c => c.giaiDoan === gd);
  const tongLead = Object.values(CAU_HINH_GIAI_DOAN).reduce((s, c) => s + c.soLuong, 0);

  return (
    <div className="flex h-[calc(100vh-88px)] flex-col gap-4 overflow-hidden">
      {/* Tiêu đề */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Pipeline tuyển sinh</h1>
          <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <RefreshCw className="h-3 w-3" /> Cập nhật lúc 10:30 ngày 18/05/2025
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { val: locTvv, set: setLocTvv, opts: ['Tất cả tư vấn viên', 'Trần Bảo Ngọc', 'Phạm Gia Huy', 'Lê Hoàng Minh', 'Nguyễn Phương Linh'] },
            { val: locNguon, set: setLocNguon, opts: ['Tất cả nguồn', 'Website', 'Facebook Ads', 'Zalo OA', 'Giới thiệu'] },
          ].map((f, i) => (
            <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none">
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
          <div className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600">
            <Calendar className="h-3.5 w-3.5 text-slate-400" /> 12/05/2025 - 18/05/2025
          </div>
          <button type="button" className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <Filter className="h-3.5 w-3.5" /> Bộ lọc
          </button>
          <button type="button" className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <Settings className="h-3.5 w-3.5" /> Tuỳ chỉnh
          </button>
        </div>
      </div>

      {/* Thống kê tổng */}
      <div className="shrink-0 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500">Tổng lead</p>
              <p className="text-xl font-black text-slate-900">{tongLead.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-green-600">↑ 18% so với tuần trước</p>
            </div>
          </div>
          {THU_TU_GIAI_DOAN.filter(gd => gd !== 'Không tiếp tục').map((giaiDoan) => {
            const cfg = CAU_HINH_GIAI_DOAN[giaiDoan];
            const phanTram = ((cfg.soLuong / tongLead) * 100).toFixed(1);
            return (
              <div key={giaiDoan} className="flex min-w-[100px] flex-col items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-center shadow-xs">
                <div className="h-1 w-full rounded-full mb-1.5" style={{ background: cfg.mauNen }} />
                <p className="text-[10px] font-black text-slate-500 leading-tight">{giaiDoan}</p>
                <p className="text-xl font-black text-slate-900">{cfg.soLuong}</p>
                <p className="text-[10px] font-semibold text-slate-400">{phanTram}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bảng Kanban */}
      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2">
        {THU_TU_GIAI_DOAN.map((giaiDoan) => {
          const cfg = CAU_HINH_GIAI_DOAN[giaiDoan];
          const danhSach = layTheoGiaiDoan(giaiDoan);
          const soConLai = cfg.soLuong - danhSach.length;

          return (
            <div key={giaiDoan}
              className="flex shrink-0 w-[248px] flex-col rounded-2xl border bg-slate-50/60 overflow-hidden"
              style={{ borderColor: cfg.mauNen + '33' }}>
              {/* Tiêu đề cột */}
              <div className={`shrink-0 border-b px-3 py-2.5 ${cfg.mauTieuDe}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ background: cfg.mauNen }} />
                    <p className="text-[11px] font-black" style={{ color: cfg.mauNen }}>{giaiDoan}</p>
                  </div>
                  <span className="rounded-full px-1.5 py-0.5 text-[10px] font-black"
                    style={{ background: cfg.mauNen + '22', color: cfg.mauNen }}>{cfg.soLuong}</span>
                </div>
                <button type="button"
                  className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-lg border py-1 text-[10px] font-bold transition hover:opacity-80"
                  style={{ borderColor: cfg.mauNen + '44', color: cfg.mauNen, background: cfg.mauNen + '11' }}>
                  <Plus className="h-3 w-3" /> Thêm lead
                </button>
              </div>

              {/* Danh sách thẻ */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {danhSach.map(the => (
                  <TheKanbanItem key={the.id} the={the} onClick={() => setTheChon(the)} />
                ))}
                {soConLai > 0 && (
                  <button type="button"
                    className="w-full rounded-xl border border-dashed border-slate-200 py-2 text-xs font-bold text-slate-400 hover:border-slate-300 hover:text-slate-600 transition">
                    + {soConLai} lead khác...
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel chi tiết slide-over */}
      {theChon && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setTheChon(null)} />
          <div className="relative z-10 h-full w-[360px] border-l border-slate-200 bg-white shadow-2xl">
            <PanelChiTiet the={theChon} onDong={() => setTheChon(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
