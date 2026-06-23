'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CreditCard, Search, Filter, Download, Eye, CheckCircle2,
  Clock, AlertTriangle, RefreshCw, Plus, ChevronDown, Copy,
  QrCode, Receipt, TrendingUp, Calendar, X, Send
} from 'lucide-react';
import { confirmPayment, createPayment } from '@/src/app/[locale]/(admin)/payments/actions';
import type { Lead as AdmissionLead } from './AdmissionsLeadsTable';

// ─── Types ────────────────────────────────────────────────────────────────────
type TrangThaiTT = 'Đã thanh toán' | 'Chờ xác nhận' | 'Quá hạn' | 'Thanh toán 1 phần';
type LoaiTT = 'Học phí' | 'Giữ chỗ' | 'Nhập học' | 'Khác';

interface GiaoDich {
  id: string;
  maGD: string;
  hoTen: string;
  maLead: string;
  loai: LoaiTT;
  soTien: number;
  ngayHanChot: string;
  ngayThanhToan?: string;
  phuongThuc?: 'VietQR' | 'Tiền mặt' | 'Chuyển khoản' | 'Thẻ';
  trangThai: TrangThaiTT;
  ghiChu?: string;
}

const GIAO_DICH_MAU: GiaoDich[] = [
  { id: 'tt1', maGD: 'GD250518-001', hoTen: 'Nguyễn Hoàng Minh', maLead: 'LD250510-01284', loai: 'Giữ chỗ', soTien: 10000000, ngayHanChot: '20/05/2025', ngayThanhToan: '18/05/2025', phuongThuc: 'VietQR', trangThai: 'Đã thanh toán' },
  { id: 'tt2', maGD: 'GD250517-028', hoTen: 'Trần Gia Bảo', maLead: 'LD250511-01420', loai: 'Giữ chỗ', soTien: 15000000, ngayHanChot: '19/05/2025', trangThai: 'Chờ xác nhận' },
  { id: 'tt3', maGD: 'GD250516-033', hoTen: 'Phạm Minh Châu', maLead: 'LD250512-01605', loai: 'Học phí', soTien: 85000000, ngayHanChot: '16/05/2025', trangThai: 'Quá hạn', ghiChu: 'Gia đình xin gia hạn đến 25/05' },
  { id: 'tt4', maGD: 'GD250516-021', hoTen: 'Võ Thị Thanh Trúc', maLead: 'LD250509-00712', loai: 'Giữ chỗ', soTien: 10000000, ngayHanChot: '22/05/2025', ngayThanhToan: '16/05/2025', phuongThuc: 'Tiền mặt', trangThai: 'Đã thanh toán' },
  { id: 'tt5', maGD: 'GD250517-017', hoTen: 'Lê Đăng Khoa', maLead: 'LD250510-01301', loai: 'Giữ chỗ', soTien: 10000000, ngayHanChot: '23/05/2025', trangThai: 'Thanh toán 1 phần', ghiChu: 'Đã cọc 5.000.000đ' },
  { id: 'tt6', maGD: 'GD250515-009', hoTen: 'Đỗ Bảo Ngọc', maLead: 'LD250508-00642', loai: 'Nhập học', soTien: 45000000, ngayHanChot: '30/05/2025', ngayThanhToan: '15/05/2025', phuongThuc: 'VietQR', trangThai: 'Đã thanh toán' },
];

const MAU_TT: Record<TrangThaiTT, { bg: string; text: string; icon: React.ElementType; dot: string }> = {
  'Đã thanh toán':     { bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle2, dot: 'bg-green-500' },
  'Chờ xác nhận':      { bg: 'bg-amber-100',  text: 'text-amber-700',  icon: Clock,        dot: 'bg-amber-400' },
  'Quá hạn':           { bg: 'bg-red-100',    text: 'text-red-600',    icon: AlertTriangle, dot: 'bg-red-500' },
  'Thanh toán 1 phần': { bg: 'bg-blue-100',   text: 'text-blue-700',   icon: TrendingUp,   dot: 'bg-blue-400' },
};

const PHUONG_THUC_MAU: Record<string, string> = {
  'VietQR': 'bg-emerald-100 text-emerald-700',
  'Tiền mặt': 'bg-slate-100 text-slate-700',
  'Chuyển khoản': 'bg-blue-100 text-blue-700',
  'Thẻ': 'bg-purple-100 text-purple-700',
};

function fSoTien(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

const KPI_TT = [
  { ten: 'Tổng đã thu', gia_tri: '3.2 tỷ', phanTram: '+12%', mau: 'text-green-600 bg-green-50', icon: '💰' },
  { ten: 'Đã thanh toán', gia_tri: '186', phanTram: '+8%', mau: 'text-blue-600 bg-blue-50', icon: '✅' },
  { ten: 'Chờ xác nhận', gia_tri: '44', phanTram: '', mau: 'text-amber-600 bg-amber-50', icon: '⏳' },
  { ten: 'Quá hạn', gia_tri: '12', phanTram: '−3%', mau: 'text-red-600 bg-red-50', icon: '🚨' },
];

const UI_TO_PAYMENT_TYPE: Record<LoaiTT, 'seat_reservation' | 'tuition' | 'admission_fee'> = {
  'Giữ chỗ': 'seat_reservation',
  'Học phí': 'tuition',
  'Nhập học': 'tuition',
  'Khác': 'admission_fee',
};

const PAYMENT_TYPE_TO_UI: Record<string, LoaiTT> = {
  seat_reservation: 'Giữ chỗ',
  tuition: 'Học phí',
  admission_fee: 'Nhập học',
};

function mapDbPaymentToGiaoDich(row: any): GiaoDich {
  const payment = row.payment || row;
  const lead = row.lead || {};
  const paidAt = payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('vi-VN') : undefined;
  return {
    id: payment.id,
    maGD: payment.transferContent || payment.id,
    hoTen: lead.fullName || payment.payload?.fullName || 'Chưa rõ học sinh',
    maLead: lead.leadCode || payment.leadId,
    loai: PAYMENT_TYPE_TO_UI[payment.type] || 'Khác',
    soTien: Number(payment.amount || 0),
    ngayHanChot: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
    ngayThanhToan: paidAt,
    phuongThuc: payment.status === 'paid' ? 'Chuyển khoản' : undefined,
    trangThai: payment.status === 'paid' ? 'Đã thanh toán' : 'Chờ xác nhận',
  };
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const csv = '\uFEFF' + [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// ─── Modal VietQR ─────────────────────────────────────────────────────────────
function ModalVietQR({ giaoDich, onClose }: { giaoDich: GiaoDich; onClose: () => void }) {
  const [sao, setSao] = useState(false);
  const noiDung = `GD ${giaoDich.maGD} - ${giaoDich.hoTen}`;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="font-black text-slate-900">Tạo QR thanh toán</h3>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* QR placeholder */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-slate-200 bg-slate-50">
              <div className="text-center">
                <QrCode className="h-24 w-24 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400 mt-1">VietQR</p>
              </div>
            </div>
            <div className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs space-y-1.5">
              {[
                ['Ngân hàng', 'BIDV - 1234567890'],
                ['Số tiền', fSoTien(giaoDich.soTien)],
                ['Nội dung', noiDung],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-bold text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSao(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
              <Copy className="h-3.5 w-3.5" /> {sao ? 'Đã sao chép!' : 'Sao chép nội dung'}
            </button>
            <button type="button" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition">
              <Download className="h-3.5 w-3.5" /> Tải QR
            </button>
          </div>
        </div>
      </div>
    </div>,
    // @ts-ignore
    document.body
  );
}

function ModalBienLai({ giaoDich, onClose }: { giaoDich: GiaoDich; onClose: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="font-black text-slate-900">Biên lai thanh toán</h3>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3 p-5 text-sm">
          {[
            ['Mã giao dịch', giaoDich.maGD],
            ['Học sinh', giaoDich.hoTen],
            ['Mã lead', giaoDich.maLead],
            ['Loại thu', giaoDich.loai],
            ['Số tiền', fSoTien(giaoDich.soTien)],
            ['Trạng thái', giaoDich.trangThai],
            ['Ngày thanh toán', giaoDich.ngayThanhToan || 'Chưa thanh toán'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 border-b border-slate-50 pb-2">
              <span className="text-slate-500">{label}</span>
              <span className="font-bold text-slate-900">{value}</span>
            </div>
          ))}
          <button type="button" onClick={() => window.print()} className="mt-2 w-full rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white hover:bg-slate-800">
            In biên lai
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ModalTaoPhieuThu({
  leads,
  onClose,
  onCreate,
}: {
  leads: AdmissionLead[];
  onClose: () => void;
  onCreate: (lead: AdmissionLead, loai: LoaiTT, amount: number) => Promise<void>;
}) {
  const [leadId, setLeadId] = useState(leads[0]?.id || '');
  const [loai, setLoai] = useState<LoaiTT>('Giữ chỗ');
  const [amount, setAmount] = useState(10000000);
  const [saving, setSaving] = useState(false);
  const selectedLead = leads.find(lead => lead.id === leadId) || leads[0];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="font-black text-slate-900">Tạo phiếu thu</h3>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 p-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-700">Lead / học sinh</span>
            <select value={leadId} onChange={e => setLeadId(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm">
              {leads.map(lead => <option key={lead.id} value={lead.id}>{lead.hoTen} · {lead.khoi}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-700">Loại thu</span>
            <select value={loai} onChange={e => setLoai(e.target.value as LoaiTT)} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm">
              {Object.keys(UI_TO_PAYMENT_TYPE).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-700">Số tiền</span>
            <input type="number" min={1000} value={amount} onChange={e => setAmount(Number(e.target.value))} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
          <button
            type="button"
            disabled={!selectedLead || saving || amount <= 0}
            onClick={async () => {
              if (!selectedLead) return;
              setSaving(true);
              await onCreate(selectedLead, loai, amount);
              setSaving(false);
            }}
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            {saving ? 'Đang tạo...' : 'Tạo phiếu thu'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Component chính ─────────────────────────────────────────────────────────
export default function AdmissionsPayments({ leads = [], initialPayments = [] }: { leads?: AdmissionLead[]; initialPayments?: any[] }) {
  const [locTrangThai, setLocTrangThai] = useState('Tất cả');
  const [timKiem, setTimKiem] = useState('');
  const [qrGD, setQrGD] = useState<GiaoDich | null>(null);
  const [receiptGD, setReceiptGD] = useState<GiaoDich | null>(null);
  const [hienTaoPhieu, setHienTaoPhieu] = useState(false);
  const [giaoDichList, setGiaoDichList] = useState<GiaoDich[]>(() => (
    initialPayments.length ? initialPayments.map(mapDbPaymentToGiaoDich) : GIAO_DICH_MAU
  ));
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  React.useEffect(() => {
    if (initialPayments.length) {
      setGiaoDichList(initialPayments.map(mapDbPaymentToGiaoDich));
    }
  }, [initialPayments]);

  const xacNhanGD = async (id: string) => {
    try {
      if (!id.startsWith('tt')) {
        await confirmPayment(id);
      }
      setGiaoDichList(prev => prev.map(g => g.id === id ? { ...g, trangThai: 'Đã thanh toán' as const, ngayThanhToan: new Date().toLocaleDateString('vi-VN'), phuongThuc: 'Chuyển khoản' as const } : g));
      showToast('✓ Xác nhận thanh toán thành công!');
    } catch {
      showToast('Xác nhận thanh toán thất bại');
    }
  };

  const taoPhieuThu = async (lead: AdmissionLead, loai: LoaiTT, amount: number) => {
    try {
      const result = await createPayment({ leadId: lead.id, type: UI_TO_PAYMENT_TYPE[loai], amount });
      const newPayment: GiaoDich = {
        id: result.paymentId || `pay_${Date.now()}`,
        maGD: `${loai === 'Giữ chỗ' ? 'SEAT' : loai === 'Học phí' ? 'ENROLL' : 'ADMISSION'}-${lead.id}`,
        hoTen: lead.hoTen,
        maLead: lead.id,
        loai,
        soTien: amount,
        ngayHanChot: new Date().toLocaleDateString('vi-VN'),
        trangThai: 'Chờ xác nhận',
      };
      setGiaoDichList(prev => [newPayment, ...prev]);
      setHienTaoPhieu(false);
      setQrGD(newPayment);
      showToast('✓ Đã tạo phiếu thu và VietQR');
    } catch {
      showToast('Tạo phiếu thu thất bại');
    }
  };

  const handleExportStatement = () => {
    downloadCsv(
      `MIS_Sao_Ke_Tuyen_Sinh_${new Date().toISOString().slice(0, 10)}.csv`,
      ['Mã giao dịch', 'Học sinh', 'Mã lead', 'Loại', 'Số tiền', 'Hạn thanh toán', 'Ngày thanh toán', 'Phương thức', 'Trạng thái'],
      dsLoc.map(gd => [gd.maGD, gd.hoTen, gd.maLead, gd.loai, gd.soTien, gd.ngayHanChot, gd.ngayThanhToan || '', gd.phuongThuc || '', gd.trangThai])
    );
    showToast(`Đã xuất ${dsLoc.length} giao dịch`);
  };

  const dsLoc = giaoDichList.filter(gd =>
    (locTrangThai === 'Tất cả' || gd.trangThai === locTrangThai) &&
    (!timKiem || gd.hoTen.toLowerCase().includes(timKiem.toLowerCase()) || gd.maGD.includes(timKiem))
  );

  const tongDaThu = giaoDichList.filter(g => g.trangThai === 'Đã thanh toán').reduce((s, g) => s + g.soTien, 0);
  const tongCho = giaoDichList.filter(g => g.trangThai === 'Chờ xác nhận').reduce((s, g) => s + g.soTien, 0);

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
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Thanh toán & Học phí</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Theo dõi thanh toán giữ chỗ, học phí và đối soát giao dịch</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleExportStatement} className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Xuất sao kê
            </button>
            <button type="button" onClick={() => setHienTaoPhieu(true)} disabled={!leads.length} className="flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40">
              <Plus className="h-3.5 w-3.5" /> Tạo phiếu thu
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {KPI_TT.map(k => (
            <div key={k.ten} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${k.mau}`}>{k.icon}</div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">{k.ten}</p>
                <p className="text-2xl font-black text-slate-900">{k.gia_tri}</p>
                {k.phanTram && <p className={`text-[10px] font-bold ${k.phanTram.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{k.phanTram} tháng trước</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Tóm tắt nhanh */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400 mb-3">Tổng đã thu tháng này</p>
            <p className="text-3xl font-black text-green-600">{fSoTien(tongDaThu)}</p>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-green-500" style={{ width: '68%' }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">68% mục tiêu tháng (4.7 tỷ)</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400 mb-3">Chờ xác nhận thanh toán</p>
            <p className="text-3xl font-black text-amber-600">{fSoTien(tongCho)}</p>
            <div className="mt-2 flex items-center gap-2">
              <button type="button" onClick={() => showToast('Đối soát ngày – Không có sai lệch!')} className="flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 transition">
                <RefreshCw className="h-3 w-3" /> Đối soát ngay
              </button>
              <button type="button" onClick={() => showToast(`Gửi nhắc thanh toán đến ${giaoDichList.filter(g=>g.trangThai==='Chờ xác nhận').length} khách hàng`)} className="flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition">
                <Send className="h-3 w-3" /> Nhắc thanh toán
              </button>
            </div>
          </div>
        </div>

        {/* Bảng giao dịch */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Tìm theo tên, mã GD..." value={timKiem} onChange={e => setTimKiem(e.target.value)}
                  className="h-8 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs focus:outline-none focus:border-blue-400 w-52" />
              </div>
              <div className="flex gap-1">
                {['Tất cả', 'Đã thanh toán', 'Chờ xác nhận', 'Quá hạn'].map(s => (
                  <button key={s} type="button" onClick={() => setLocTrangThai(s)}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${locTrangThai === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-slate-500">
                <Calendar className="inline h-3 w-3 mr-1" /> 05/2025
              </div>
              <button type="button" onClick={() => { setLocTrangThai('Tất cả'); setTimKiem(''); showToast('Đã đặt lại bộ lọc thanh toán'); }} className="flex h-8 items-center gap-1 rounded-xl border border-slate-200 px-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                <Filter className="h-3.5 w-3.5" /> Bộ lọc
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase tracking-wide text-slate-400">
                  <th className="py-3 pl-4 pr-3 text-left">Mã giao dịch</th>
                  <th className="py-3 px-3 text-left">Học sinh</th>
                  <th className="py-3 px-3 text-left">Loại</th>
                  <th className="py-3 px-3 text-right">Số tiền</th>
                  <th className="py-3 px-3 text-left">Hạn thanh toán</th>
                  <th className="py-3 px-3 text-left">Ngày thanh toán</th>
                  <th className="py-3 px-3 text-left">Phương thức</th>
                  <th className="py-3 px-3 text-left">Trạng thái</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dsLoc.map(gd => {
                  const sc = MAU_TT[gd.trangThai];
                  const Icon = sc.icon;
                  return (
                    <tr key={gd.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 pl-4 pr-3">
                        <p className="font-mono text-xs font-bold text-blue-600">{gd.maGD}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{gd.hoTen}</p>
                        <p className="text-[10px] text-slate-400">{gd.maLead}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                          {gd.loai}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <p className="font-black text-slate-900">{fSoTien(gd.soTien)}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className={`text-xs font-bold ${gd.trangThai === 'Quá hạn' ? 'text-red-600' : 'text-slate-700'}`}>{gd.ngayHanChot}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-xs text-slate-500">{gd.ngayThanhToan || '—'}</p>
                      </td>
                      <td className="py-3 px-3">
                        {gd.phuongThuc ? (
                          <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${PHUONG_THUC_MAU[gd.phuongThuc]}`}>
                            {gd.phuongThuc === 'VietQR' && <QrCode className="h-3 w-3" />}
                            {gd.phuongThuc}
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold w-fit ${sc.bg} ${sc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {gd.trangThai}
                        </span>
                        {gd.ghiChu && <p className="mt-0.5 text-[10px] text-slate-400">{gd.ghiChu}</p>}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          {gd.trangThai !== 'Đã thanh toán' && (
                            <button type="button" onClick={() => setQrGD(gd)}
                              className="flex h-7 items-center gap-1 rounded-lg bg-emerald-50 px-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition">
                              <QrCode className="h-3 w-3" /> VietQR
                            </button>
                          )}
                          {gd.trangThai === 'Chờ xác nhận' && (
                            <button type="button" onClick={() => xacNhanGD(gd.id)}
                              className="flex h-7 items-center gap-1 rounded-lg bg-blue-50 px-2 text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition">
                              <CheckCircle2 className="h-3 w-3" /> Xác nhận
                            </button>
                          )}
                          <button type="button" onClick={() => setReceiptGD(gd)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
                            <Receipt className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500">Hiển thị {dsLoc.length} trong tổng số 230 giao dịch</p>
          </div>
        </div>
      </div>

      {qrGD && <ModalVietQR giaoDich={qrGD} onClose={() => setQrGD(null)} />}
      {receiptGD && <ModalBienLai giaoDich={receiptGD} onClose={() => setReceiptGD(null)} />}
      {hienTaoPhieu && <ModalTaoPhieuThu leads={leads} onClose={() => setHienTaoPhieu(false)} onCreate={taoPhieuThu} />}
    </>
  );
}
