'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Settings, Plus, Edit2, Trash2, GripVertical, ChevronDown, X,
  Save, Eye, EyeOff, Copy, CheckCircle2, AlertTriangle, Zap,
  Mail, MessageSquare, Clock, ToggleLeft, ToggleRight, Bell
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface GiaiDoanPipeline {
  id: string;
  stt: number;
  ten: string;
  tenHienThi: string;
  mauSac: string;
  sla: number;
  soLuong: number;
  dangSuDung: boolean;
  moTa: string;
}

export interface ChuongTrinhHoc {
  id: string;
  ten: string;
  cap: string;
  hoatDong: boolean;
  moTa: string;
}

// ─── Dữ liệu mẫu ─────────────────────────────────────────────────────────────
const GIAI_DOAN_MAU: GiaiDoanPipeline[] = [
  { id: 'gd1',  stt: 1,  ten: 'NEW_LEAD',             tenHienThi: 'Tiếp nhận mới',  mauSac: '#3B82F6', sla: 1,  soLuong: 1284, dangSuDung: true,  moTa: 'Lead mới được tạo từ các kênh tiếp thị' },
  { id: 'gd2',  stt: 2,  ten: 'CONSULTING',            tenHienThi: 'Đang tư vấn',    mauSac: '#8B5CF6', sla: 3,  soLuong: 1012, dangSuDung: true,  moTa: 'Đang trong quá trình tư vấn với phụ huynh' },
  { id: 'gd3',  stt: 3,  ten: 'TEST_SCHEDULED',        tenHienThi: 'Đặt lịch test',  mauSac: '#06B6D4', sla: 2,  soLuong: 856,  dangSuDung: true,  moTa: 'Lead đã được tư vấn và đặt lịch kiểm tra đầu vào' },
  { id: 'gd4',  stt: 4,  ten: 'TEST_COMPLETED',        tenHienThi: 'Đã thi test',    mauSac: '#F59E0B', sla: 2,  soLuong: 734,  dangSuDung: true,  moTa: 'Học sinh đã hoàn thành bài kiểm tra đầu vào' },
  { id: 'gd5',  stt: 5,  ten: 'DOCUMENTS_PENDING',     tenHienThi: 'Nộp hồ sơ',     mauSac: '#F97316', sla: 7,  soLuong: 412,  dangSuDung: true,  moTa: 'Đang chờ phụ huynh nộp đủ hồ sơ' },
  { id: 'gd6',  stt: 6,  ten: 'SEAT_RESERVED',         tenHienThi: 'Giữ chỗ',       mauSac: '#EF4444', sla: 7,  soLuong: 186,  dangSuDung: true,  moTa: 'Đã đặt cọc giữ chỗ, chờ hoàn thiện thủ tục' },
  { id: 'gd7',  stt: 7,  ten: 'ENROLLED',              tenHienThi: 'Nhập học',      mauSac: '#10B981', sla: 0,  soLuong: 321,  dangSuDung: true,  moTa: 'Học sinh đã hoàn tất thủ tục nhập học' },
  { id: 'gd8',  stt: 8,  ten: 'LOST',                  tenHienThi: 'Không tiếp tục', mauSac: '#94A3B8', sla: 0,  soLuong: 210,  dangSuDung: true,  moTa: 'Lead không tiếp tục quy trình tuyển sinh' },
];

const NGUON_LEAD = [
  { id: 'n1', ten: 'Website', hoatDong: true, soLuong: 462 },
  { id: 'n2', ten: 'Facebook Ads', hoatDong: true, soLuong: 359 },
  { id: 'n3', ten: 'Zalo OA', hoatDong: true, soLuong: 205 },
  { id: 'n4', ten: 'Google Ads', hoatDong: true, soLuong: 77 },
  { id: 'n5', ten: 'Giới thiệu', hoatDong: true, soLuong: 141 },
  { id: 'n6', ten: 'SMS Campaign', hoatDong: false, soLuong: 0 },
];

const QUY_TAC_TU_DONG = [
  { id: 'r1', ten: 'Gửi email chào mừng khi tạo lead', loai: 'Email', giaiDoanKichHoat: 'Tiếp nhận mới', hoatDong: true },
  { id: 'r2', ten: 'Nhắc lịch test trước 24 giờ', loai: 'Zalo', giaiDoanKichHoat: 'Đặt lịch test', hoatDong: true },
  { id: 'r3', ten: 'Gửi thông báo kết quả test', loai: 'Email', giaiDoanKichHoat: 'Đã thi test', hoatDong: true },
  { id: 'r4', ten: 'Nhắc nộp học phí giữ chỗ', loai: 'Zalo', giaiDoanKichHoat: 'Giữ chỗ', hoatDong: false },
  { id: 'r5', ten: 'Cảnh báo SLA sắp quá hạn', loai: 'Hệ thống', giaiDoanKichHoat: 'Tất cả giai đoạn', hoatDong: true },
];

// ─── Modal thêm/sửa giai đoạn ─────────────────────────────────────────────────
function ModalGiaiDoan({ gd, onClose }: { gd?: GiaiDoanPipeline; onClose: () => void }) {
  const [ten, setTen] = useState(gd?.tenHienThi ?? '');
  const [sla, setSla] = useState(gd?.sla ?? 2);
  const [moTa, setMoTa] = useState(gd?.moTa ?? '');
  const [mau, setMau] = useState(gd?.mauSac ?? '#3B82F6');

  const MAU_GIA_TRI = ['#3B82F6','#8B5CF6','#06B6D4','#F59E0B','#F97316','#EF4444','#10B981','#94A3B8'];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="font-black text-slate-900">{gd ? 'Sửa giai đoạn' : 'Thêm giai đoạn mới'}</h3>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Tên hiển thị <span className="text-red-500">*</span></label>
              <input type="text" value={ten} onChange={e => setTen(e.target.value)} placeholder="VD: Đang tư vấn"
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">SLA (ngày tối đa)</label>
              <input type="number" value={sla} onChange={e => setSla(Number(e.target.value))} min={0} max={30}
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-400 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">Màu sắc giai đoạn</label>
            <div className="flex gap-2">
              {MAU_GIA_TRI.map(c => (
                <button key={c} type="button" onClick={() => setMau(c)}
                  className={`h-8 w-8 rounded-xl transition-all ${mau === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Mô tả</label>
            <textarea rows={2} value={moTa} onChange={e => setMoTa(e.target.value)} maxLength={255}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none resize-none" />
            <p className="mt-0.5 text-right text-[10px] text-slate-400">{moTa.length}/255</p>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Huỷ</button>
            <button type="button" onClick={onClose} disabled={!ten}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-40">
              <Save className="h-3.5 w-3.5" /> Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>,
    // @ts-ignore
    document.body
  );
}

function ModalChuongTrinh({ ct, onClose, onSave }: { ct?: ChuongTrinhHoc; onClose: () => void; onSave: (data: Omit<ChuongTrinhHoc, 'id'>) => void }) {
  const [ten, setTen] = useState(ct?.ten ?? '');
  const [cap, setCap] = useState(ct?.cap ?? 'Tiểu học');
  const [moTa, setMoTa] = useState(ct?.moTa ?? '');
  const [hoatDong, setHoatDong] = useState(ct?.hoatDong ?? true);

  const CAP_HOC = ['Mầm non', 'Tiểu học', 'THCS', 'THPT', 'Khác'];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="font-black text-slate-900">{ct ? 'Sửa chương trình học' : 'Thêm chương trình học mới'}</h3>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Tên chương trình học <span className="text-red-500">*</span></label>
            <input type="text" value={ten} onChange={e => setTen(e.target.value)} placeholder="VD: THPT - A-Level"
              className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Cấp học</label>
            <select value={cap} onChange={e => setCap(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-400 focus:outline-none bg-white">
              {CAP_HOC.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Mô tả</label>
            <textarea rows={3} value={moTa} onChange={e => setMoTa(e.target.value)} placeholder="Nhập mô tả chi tiết về chương trình học..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none resize-none" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-700 font-sans">Trạng thái hoạt động</p>
              <p className="text-[10px] text-slate-400">Cho phép lựa chọn chương trình này khi thêm lead mới</p>
            </div>
            <button
              type="button"
              onClick={() => setHoatDong(!hoatDong)}
              className={`relative h-5 w-9 rounded-full transition-colors ${hoatDong ? 'bg-blue-500' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${hoatDong ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Huỷ</button>
            <button type="button" onClick={() => onSave({ ten, cap, moTa, hoatDong })} disabled={!ten}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-40">
              <Save className="h-3.5 w-3.5" /> Lưu thông tin
            </button>
          </div>
        </div>
      </div>
    </div>,
    // @ts-ignore
    document.body
  );
}

const TABS_CAIDAT = [
  { id: 'pipeline', nhan: '🔄 Pipeline' },
  { id: 'nguon',    nhan: '🌐 Nguồn lead' },
  { id: 'chuong_trinh', nhan: '📚 Chương trình học' },
  { id: 'quy_tac',  nhan: '⚡ Quy tắc tự động' },
  { id: 'tich_hop', nhan: '🔗 Tích hợp' },
];

function ModalSMTP({
  config,
  onClose,
  onSave
}: {
  config: {
    dungSmtpChung: boolean;
    smtpChung: { host: string; port: number; user: string; pass: string; email: string };
    smtpRieng: Record<string, { host: string; port: number; user: string; pass: string; email: string }>;
  };
  onClose: () => void;
  onSave: (data: typeof config) => void;
}) {
  const [dungSmtpChung, setDungSmtpChung] = useState(config.dungSmtpChung);
  const [smtpChung, setSmtpChung] = useState({ ...config.smtpChung });
  const [smtpRieng, setSmtpRieng] = useState({ ...config.smtpRieng });
  const [userDangSua, setUserDangSua] = useState<string | null>(null);

  const [userSmtpHost, setUserSmtpHost] = useState('');
  const [userSmtpPort, setUserSmtpPort] = useState(587);
  const [userSmtpUser, setUserSmtpUser] = useState('');
  const [userSmtpPass, setUserSmtpPass] = useState('');
  const [userSmtpEmail, setUserSmtpEmail] = useState('');

  const batDauSuaUser = (userName: string) => {
    setUserDangSua(userName);
    const uConfig = smtpRieng[userName] || { host: '', port: 587, user: '', pass: '', email: '' };
    setUserSmtpHost(uConfig.host);
    setUserSmtpPort(uConfig.port);
    setUserSmtpUser(uConfig.user);
    setUserSmtpPass(uConfig.pass);
    setUserSmtpEmail(uConfig.email);
  };

  const luuSuaUser = (userName: string) => {
    setSmtpRieng(prev => ({
      ...prev,
      [userName]: {
        host: userSmtpHost,
        port: userSmtpPort,
        user: userSmtpUser,
        pass: userSmtpPass,
        email: userSmtpEmail
      }
    }));
    setUserDangSua(null);
  };

  const handleLuuChinh = () => {
    onSave({
      dungSmtpChung,
      smtpChung,
      smtpRieng
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0">
          <div>
            <h3 className="font-black text-slate-900 text-sm">Cấu hình Email SMTP gửi chiến dịch</h3>
            <p className="text-xs text-slate-500">Thiết lập máy chủ gửi email tự động hoặc thủ công cho phòng Tuyển sinh</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Toggle Smtp Chung vs Rieng */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800">Sử dụng cấu hình SMTP chung của trường</p>
              <p className="text-[10px] text-slate-400">Tất cả email từ mọi tư vấn viên sẽ gửi qua hòm thư chung của trường</p>
            </div>
            <button
              type="button"
              onClick={() => setDungSmtpChung(!dungSmtpChung)}
              className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${dungSmtpChung ? 'bg-blue-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${dungSmtpChung ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {dungSmtpChung ? (
            /* Cấu hình SMTP chung */
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Thông tin máy chủ SMTP chung</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">SMTP Host</label>
                  <input
                    type="text"
                    value={smtpChung.host}
                    onChange={e => setSmtpChung({ ...smtpChung, host: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">SMTP Port</label>
                  <input
                    type="number"
                    value={smtpChung.port}
                    onChange={e => setSmtpChung({ ...smtpChung, port: Number(e.target.value) })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">Tài khoản (Username)</label>
                  <input
                    type="text"
                    value={smtpChung.user}
                    onChange={e => setSmtpChung({ ...smtpChung, user: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">Mật khẩu (Password)</label>
                  <input
                    type="password"
                    value={smtpChung.pass}
                    onChange={e => setSmtpChung({ ...smtpChung, pass: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">Email người gửi</label>
                <input
                  type="email"
                  value={smtpChung.email}
                  onChange={e => setSmtpChung({ ...smtpChung, email: e.target.value })}
                  className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            /* Cấu hình SMTP riêng cho từng user */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Danh sách SMTP riêng của tư vấn viên</p>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">Tắt SMTP chung</span>
              </div>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
                {Object.keys(smtpRieng).map(userName => {
                  const uConfig = smtpRieng[userName];
                  const isEditing = userDangSua === userName;
                  return (
                    <div key={userName} className="p-3 bg-white hover:bg-slate-50/30 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[10px] font-black text-blue-700">
                            {userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{userName}</p>
                            <p className="text-[10px] text-slate-400">
                              {uConfig.host ? `${uConfig.host} · ${uConfig.email}` : 'Chưa cấu hình SMTP riêng'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => isEditing ? luuSuaUser(userName) : batDauSuaUser(userName)}
                          className={`flex h-7 items-center gap-1 rounded-lg px-2 text-[10px] font-bold transition ${
                            isEditing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isEditing ? 'Lưu lại' : 'Cấu hình'}
                        </button>
                      </div>

                      {isEditing && (
                        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3.5 animate-fadeIn">
                          <p className="text-[10px] font-black uppercase text-slate-500">Cấu hình SMTP cho {userName}</p>
                          <div className="grid grid-cols-3 gap-2.5">
                            <div className="col-span-2">
                              <label className="mb-0.5 block text-[9px] font-bold text-slate-600">SMTP Host</label>
                              <input
                                type="text"
                                value={userSmtpHost}
                                onChange={e => setUserSmtpHost(e.target.value)}
                                className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs focus:border-blue-400 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="mb-0.5 block text-[9px] font-bold text-slate-600">Port</label>
                              <input
                                type="number"
                                value={userSmtpPort}
                                onChange={e => setUserSmtpPort(Number(e.target.value))}
                                className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs focus:border-blue-400 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="mb-0.5 block text-[9px] font-bold text-slate-600">Tài khoản</label>
                              <input
                                type="text"
                                value={userSmtpUser}
                                onChange={e => setUserSmtpUser(e.target.value)}
                                className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs focus:border-blue-400 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="mb-0.5 block text-[9px] font-bold text-slate-600">Mật khẩu</label>
                              <input
                                type="password"
                                value={userSmtpPass}
                                onChange={e => setUserSmtpPass(e.target.value)}
                                className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs focus:border-blue-400 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="mb-0.5 block text-[9px] font-bold text-slate-600">Email người gửi đại diện</label>
                            <input
                              type="email"
                              value={userSmtpEmail}
                              onChange={e => setUserSmtpEmail(e.target.value)}
                              className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs focus:border-blue-400 focus:outline-none"
                            />
                          </div>
                          <div className="flex justify-end gap-1.5 pt-0.5">
                            <button
                              type="button"
                              onClick={() => setUserDangSua(null)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                            >
                              Huỷ bỏ
                            </button>
                            <button
                              type="button"
                              onClick={() => luuSuaUser(userName)}
                              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700"
                            >
                              Hoàn tất
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-100 p-4 shrink-0 bg-slate-50">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Huỷ bỏ</button>
          <button type="button" onClick={handleLuuChinh} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700">Lưu cấu hình</button>
        </div>
      </div>
    </div>,
    // @ts-ignore
    document.body
  );
}

// ─── Component chính ─────────────────────────────────────────────────────────
interface AdmissionsSettingsProps {
  chuongTrinhList: ChuongTrinhHoc[];
  setChuongTrinhList: React.Dispatch<React.SetStateAction<ChuongTrinhHoc[]>>;
}

export default function AdmissionsSettings({ chuongTrinhList, setChuongTrinhList }: AdmissionsSettingsProps) {
  const [tab, setTab] = useState<'pipeline' | 'nguon' | 'chuong_trinh' | 'quy_tac' | 'tich_hop'>('pipeline');
  const [gdChon, setGdChon] = useState<GiaiDoanPipeline | null>(GIAI_DOAN_MAU[2]);
  const [modalGD, setModalGD] = useState<{ open: boolean; gd?: GiaiDoanPipeline }>({ open: false });
  const [modalCT, setModalCT] = useState<{ open: boolean; ct?: ChuongTrinhHoc }>({ open: false });

  const [smtpConfig, setSmtpConfig] = useState<{
    dungSmtpChung: boolean;
    smtpChung: { host: string; port: number; user: string; pass: string; email: string };
    smtpRieng: Record<string, { host: string; port: number; user: string; pass: string; email: string }>;
  }>({
    dungSmtpChung: true,
    smtpChung: {
      host: 'smtp.school.edu.vn',
      port: 587,
      user: 'tuyensinh@school.edu.vn',
      pass: '••••••••••••••••',
      email: 'tuyensinh@school.edu.vn'
    },
    smtpRieng: {
      'Nguyễn Thị Mai': { host: 'smtp.gmail.com', port: 587, user: 'mai.nt@school.edu.vn', pass: '••••••••••••••••', email: 'mai.nt@school.edu.vn' },
      'Trần Minh Trí': { host: 'smtp.gmail.com', port: 587, user: 'tri.tm@school.edu.vn', pass: '••••••••••••••••', email: 'tri.tm@school.edu.vn' },
      'Phạm Hải Yến': { host: 'smtp.gmail.com', port: 587, user: 'yen.ph@school.edu.vn', pass: '••••••••••••••••', email: 'yen.ph@school.edu.vn' },
      'Lê Quỳnh Anh': { host: 'smtp.gmail.com', port: 587, user: 'anh.lq@school.edu.vn', pass: '••••••••••••••••', email: 'anh.lq@school.edu.vn' }
    }
  });
  const [toast, setToast] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [nguonList, setNguonList] = useState(NGUON_LEAD);
  const [quyTacList, setQuyTacList] = useState(QUY_TAC_TU_DONG);
  const [hienModal, setHienModal] = useState(false);
  const [hienModalSmtp, setHienModalSmtp] = useState(false);

  // Hành động tự động cho tab pipeline (per stage)
  const [hanhDongList, setHanhDongList] = useState([
    { icon: 'Mail', ten: 'Gửi email xác nhận lịch hẹn kiểm tra cho phụ huynh', bat: true, thoiGian: 'Ngay lập tức' },
    { icon: 'Bell', ten: 'Tạo lịch hẹn kiểm tra trên hệ thống', bat: true, thoiGian: 'Ngay lập tức' },
    { icon: 'MessageSquare', ten: 'Thông báo cho tư vấn viên phụ trách', bat: true, thoiGian: 'Ngay lập tức' },
  ]);
  const [themHanhDong, setThemHanhDong] = useState(false);
  const [tenHanhDongMoi, setTenHanhDongMoi] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const moTaSmtp = smtpConfig.dungSmtpChung
    ? `SMTP Chung: ${smtpConfig.smtpChung.host} · ${smtpConfig.smtpChung.email}`
    : `SMTP Riêng: ${Object.values(smtpConfig.smtpRieng).filter(u => u.host).length} TVV`;

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}
      <div className="space-y-5">
        {/* Tiêu đề */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Cài đặt CRM tuyển sinh</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Quản lý pipeline, nguồn lead, email template và các quy tắc tự động</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setShowPreview(v => !v)}
              className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold shadow-xs transition ${showPreview ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
              <Eye className="h-3.5 w-3.5" /> {showPreview ? 'Ẩn xem trước' : 'Xem trước pipeline'}
            </button>
            <button type="button" onClick={() => showToast('✓ Đã lưu cấu hình CRM tuyển sinh!')} className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700">
              <Save className="h-3.5 w-3.5" /> Lưu thay đổi
            </button>
          </div>
        </div>

        {/* Preview Pipeline */}
        {showPreview && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <p className="mb-3 text-[10px] font-black uppercase tracking-wide text-blue-700">Xem trước pipeline</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {GIAI_DOAN_MAU.map((gd, i) => (
                <div key={gd.id} className="flex shrink-0 items-center gap-1.5">
                  <div className="flex min-w-[120px] flex-col items-center rounded-xl border bg-white px-3 py-2 text-center shadow-xs">
                    <div className="h-1.5 w-full rounded-full mb-1.5" style={{ background: gd.mauSac }} />
                    <p className="text-[10px] font-black text-slate-700 leading-tight">{gd.tenHienThi}</p>
                    <p className="text-lg font-black text-slate-900">{gd.soLuong.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400">SLA: {gd.sla > 0 ? `${gd.sla} ngày` : '∞'}</p>
                  </div>
                  {i < GIAI_DOAN_MAU.length - 1 && <div className="text-slate-300 text-lg shrink-0">→</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {TABS_CAIDAT.map(t => (
              <button key={t.id} type="button" onClick={() => setTab(t.id as any)}
                className={`shrink-0 border-b-2 px-5 py-3 text-xs font-bold transition ${tab === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                {t.nhan}
              </button>
            ))}
          </div>

          {/* Tab Pipeline */}
          {tab === 'pipeline' && (
            <div className="grid h-[520px] md:grid-cols-[340px,1fr]">
              {/* Danh sách giai đoạn */}
              <div className="border-r border-slate-100 overflow-y-auto">
                <div className="flex items-center justify-between p-3 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-700">Pipeline tuyển sinh</p>
                  <button type="button" onClick={() => setModalGD({ open: true })}
                    className="flex h-7 items-center gap-1 rounded-xl bg-blue-50 px-2 text-[10px] font-bold text-blue-700 hover:bg-blue-100">
                    <Plus className="h-3 w-3" /> Thêm giai đoạn
                  </button>
                </div>
                <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400">Kéo thả để sắp xếp thứ tự các giai đoạn</p>
                <div className="divide-y divide-slate-50">
                  {GIAI_DOAN_MAU.map(gd => (
                    <button key={gd.id} type="button" onClick={() => setGdChon(gd)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${gdChon?.id === gd.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                      <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-slate-300" />
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ backgroundColor: gd.mauSac }}>
                        {gd.stt}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">{gd.tenHienThi}</p>
                        <p className="text-[10px] text-slate-400">SLA {gd.sla} ngày · {gd.soLuong.toLocaleString()} leads</p>
                      </div>
                      <div className={`h-1.5 w-1.5 rounded-full ${gd.dangSuDung ? 'bg-green-400' : 'bg-slate-300'}`} />
                    </button>
                  ))}
                  <p className="p-3 text-[10px] font-semibold text-slate-400">
                    Tổng lead trong pipeline: {GIAI_DOAN_MAU.reduce((s, g) => s + g.soLuong, 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Chi tiết giai đoạn */}
              {gdChon ? (
                <div className="p-5 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: gdChon.mauSac }} />
                      <p className="font-black text-slate-900">{gdChon.tenHienThi}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">Giai đoạn {gdChon.stt}</span>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setModalGD({ open: true, gd: gdChon })}
                        className="flex h-7 items-center gap-1 rounded-lg bg-blue-50 px-2 text-[10px] font-bold text-blue-700 hover:bg-blue-100">
                        <Copy className="h-3 w-3" /> Nhân bản
                      </button>
                      <button type="button" className="flex h-7 items-center gap-1 rounded-lg bg-red-50 px-2 text-[10px] font-bold text-red-600 hover:bg-red-100">
                        <Trash2 className="h-3 w-3" /> Xoá giai đoạn
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Form cấu hình */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tên giai đoạn</label>
                        <input defaultValue={gdChon.tenHienThi} className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wide">SLA (số ngày tối đa)</label>
                        <div className="flex items-center gap-2">
                          <input type="number" defaultValue={gdChon.sla} min={0} max={30}
                            className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-400 focus:outline-none" />
                          <span className="shrink-0 text-xs text-slate-500">ngày</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Mô tả</label>
                      <textarea rows={2} defaultValue={gdChon.moTa} maxLength={255}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none resize-none" />
                    </div>

                    {/* Hành động tự động */}
                    <div>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">Hành động tự động khi chuyển vào giai đoạn này</p>
                      <div className="space-y-2">
                        {hanhDongList.map((hd, i) => {
                          const Icon = hd.icon === 'Mail' ? Mail : hd.icon === 'Bell' ? Bell : MessageSquare;
                          return (
                            <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
                                <Icon className="h-4 w-4 text-blue-600" />
                              </div>
                              <p className="flex-1 text-xs font-semibold text-slate-700">{hd.ten}</p>
                              <div className="flex items-center gap-2">
                                <select value={hd.thoiGian}
                                  onChange={e => setHanhDongList(prev => prev.map((h, j) => j === i ? { ...h, thoiGian: e.target.value } : h))}
                                  className="h-7 rounded-lg border border-slate-200 px-2 text-[10px] focus:outline-none">
                                  <option>Ngay lập tức</option>
                                  <option>Sau 1 giờ</option>
                                  <option>Sau 24 giờ</option>
                                </select>
                                <button type="button"
                                  onClick={() => setHanhDongList(prev => prev.map((h, j) => j === i ? { ...h, bat: !h.bat } : h))}
                                  className={`relative h-5 w-9 rounded-full transition-colors ${hd.bat ? 'bg-blue-500' : 'bg-slate-200'}`}>
                                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${hd.bat ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {themHanhDong && (
                          <div className="flex items-center gap-2 rounded-xl border-2 border-blue-200 bg-white p-2">
                            <input autoFocus type="text" value={tenHanhDongMoi} onChange={e => setTenHanhDongMoi(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && tenHanhDongMoi.trim()) {
                                  setHanhDongList(prev => [...prev, { icon: 'Zap', ten: tenHanhDongMoi.trim(), bat: true, thoiGian: 'Ngay lập tức' }]);
                                  setTenHanhDongMoi(''); setThemHanhDong(false);
                                  showToast('✓ Đã thêm hành động tự động!');
                                }
                                if (e.key === 'Escape') { setThemHanhDong(false); setTenHanhDongMoi(''); }
                              }}
                              placeholder="Tên hành động... (Enter để lưu)" className="flex-1 h-7 rounded-lg border border-slate-200 px-2 text-xs focus:border-blue-400 focus:outline-none" />
                            <button type="button" onClick={() => { setThemHanhDong(false); setTenHanhDongMoi(''); }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        <button type="button" onClick={() => setThemHanhDong(true)}
                          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                          <Plus className="h-3.5 w-3.5" /> Thêm hành động
                        </button>
                      </div>
                    </div>

                    {/* Checklist bắt buộc */}
                    <div>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">Checklist bắt buộc</p>
                      <div className="space-y-1.5">
                        {['Đã xác nhận thông tin học sinh', 'Đã tư vấn định hướng chương trình', 'Đã đề xuất lịch kiểm tra'].map((ck, i) => (
                          <label key={i} className="flex items-center gap-2 cursor-pointer">
                            <div className="flex h-4 w-4 items-center justify-center rounded border border-blue-400 bg-blue-400">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{ck}</span>
                            <span className="ml-auto text-[10px] font-bold text-red-500">*</span>
                          </label>
                        ))}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div className="h-4 w-4 rounded border border-slate-300" />
                          <span className="text-xs font-semibold text-slate-500">Phụ huynh xác nhận lịch</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-700">Trạng thái</p>
                        <p className="text-[10px] text-slate-400">Tắt để ẩn giai đoạn này khỏi pipeline (không xóa dữ liệu)</p>
                      </div>
                      <button type="button" onClick={() => showToast('Đã cập nhật trạng thái giai đoạn!')}
                        className="relative h-5 w-9 rounded-full bg-blue-500 transition-colors">
                        <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-400">Chọn một giai đoạn để cấu hình</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Nguồn lead */}
          {tab === 'nguon' && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Các nguồn lead đang kích hoạt</p>
                <button type="button" className="flex h-7 items-center gap-1 rounded-xl bg-blue-50 px-2 text-[10px] font-bold text-blue-700 hover:bg-blue-100">
                  <Plus className="h-3 w-3" /> Thêm nguồn
                </button>
              </div>
              <div className="space-y-2">
                {nguonList.map(n => (
                  <div key={n.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${n.hoatDong ? 'bg-green-50' : 'bg-slate-50'}`}>
                      <span className="text-base">🌐</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{n.ten}</p>
                      <p className="text-[10px] text-slate-400">{n.soLuong} leads từ nguồn này</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => showToast(`Sửa nguồn: ${n.ten}`)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button type="button"
                        onClick={() => { setNguonList(prev => prev.map(x => x.id === n.id ? { ...x, hoatDong: !x.hoatDong } : x)); showToast(`${n.hoatDong ? 'Tắt' : 'Bật'} nguồn: ${n.ten}`); }}
                        className={`relative h-5 w-9 rounded-full transition-colors ${n.hoatDong ? 'bg-blue-500' : 'bg-slate-200'}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${n.hoatDong ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Quy tắc tự động */}
          {tab === 'quy_tac' && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Quy tắc tự động ({quyTacList.length})</p>
                <button type="button" onClick={() => showToast('Mở form tạo quy tắc mới')} className="flex h-7 items-center gap-1 rounded-xl bg-blue-50 px-2 text-[10px] font-bold text-blue-700 hover:bg-blue-100">
                  <Plus className="h-3 w-3" /> Tạo quy tắc
                </button>
              </div>
              <div className="space-y-2">
                {quyTacList.map(r => {
                  const LoaiIcon = r.loai === 'Email' ? Mail : r.loai === 'Zalo' ? MessageSquare : Zap;
                  const mauLoai = r.loai === 'Email' ? 'bg-blue-50 text-blue-600' : r.loai === 'Zalo' ? 'bg-cyan-50 text-cyan-600' : 'bg-purple-50 text-purple-600';
                  return (
                    <div key={r.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${mauLoai}`}>
                        <LoaiIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800">{r.ten}</p>
                        <p className="text-[10px] text-slate-400">Kích hoạt khi: <span className="font-semibold">{r.giaiDoanKichHoat}</span></p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.hoatDong ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {r.hoatDong ? 'Đang bật' : 'Đã tắt'}
                        </span>
                        <button type="button" onClick={() => showToast(`Sửa quy tắc: ${r.ten}`)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button type="button"
                          onClick={() => { setQuyTacList(prev => prev.map(x => x.id === r.id ? { ...x, hoatDong: !x.hoatDong } : x)); showToast(`${r.hoatDong ? 'Tắt' : 'Bật'} quy tắc: ${r.ten}`); }}
                          className={`relative h-5 w-9 rounded-full transition-colors ${r.hoatDong ? 'bg-blue-500' : 'bg-slate-200'}`}>
                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${r.hoatDong ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Chương trình học */}
          {tab === 'chuong_trinh' && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">Các chương trình đào tạo quan tâm</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Cấu hình các chương trình học để phân loại và tư vấn cho học sinh/phụ huynh</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalCT({ open: true })}
                  className="flex h-8 items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Thêm chương trình
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {chuongTrinhList.map(ct => (
                  <div key={ct.id} className="flex flex-col justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50/50 hover:shadow-xs transition">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base shrink-0">📚</span>
                          <p className="text-sm font-bold text-slate-800 leading-tight">{ct.ten}</p>
                        </div>
                        <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase ${
                          ct.cap === 'Mầm non' ? 'bg-pink-50 text-pink-700 border border-pink-200' :
                          ct.cap === 'Tiểu học' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          ct.cap === 'THCS' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          ct.cap === 'THPT' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'bg-slate-50 text-slate-700 border border-slate-200'
                        }`}>
                          {ct.cap}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{ct.moTa || 'Không có mô tả cho chương trình học này.'}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-2.5 mt-auto">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ct.hoatDong ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {ct.hoatDong ? 'Đang kích hoạt' : 'Tạm ẩn'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setModalCT({ open: true, ct })}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                          title="Sửa chương trình"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa chương trình "${ct.ten}"?`)) {
                              setChuongTrinhList(prev => prev.filter(item => item.id !== ct.id));
                            }
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Xóa chương trình"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setChuongTrinhList(prev => prev.map(item => item.id === ct.id ? { ...item, hoatDong: !item.hoatDong } : item));
                          }}
                          className={`relative h-5 w-9 rounded-full transition-colors ${ct.hoatDong ? 'bg-blue-500' : 'bg-slate-200'}`}
                        >
                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${ct.hoatDong ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Tích hợp */}
          {tab === 'tich_hop' && (
            <div className="p-5 space-y-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Kết nối hệ thống</p>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { ten: 'Zalo Official Account', icon: '💬', trangThai: 'Đã kết nối', mau: 'bg-green-100 text-green-700', moTa: 'OA: @MISSmartPortal · Zalo Mini App' },
                  { ten: 'Facebook Page', icon: '📘', trangThai: 'Đã kết nối', mau: 'bg-green-100 text-green-700', moTa: 'Page: MIS Smart · Meta API v18' },
                  { ten: 'Google Ads', icon: '🔍', trangThai: 'Chưa kết nối', mau: 'bg-slate-100 text-slate-600', moTa: 'Kết nối để đồng bộ leads từ Google' },
                  { ten: 'BIDV VietQR', icon: '🏦', trangThai: 'Đã kết nối', mau: 'bg-green-100 text-green-700', moTa: 'TK: 1234567890 · Branch: HCM' },
                  { ten: 'Email SMTP', icon: '✉️', trangThai: 'Đã kết nối', mau: 'bg-green-100 text-green-700', moTa: moTaSmtp, handle: () => setHienModalSmtp(true) },
                  { ten: 'SMS Gateway', icon: '📱', trangThai: 'Chưa cấu hình', mau: 'bg-amber-100 text-amber-700', moTa: 'Cần cấu hình nhà cung cấp SMS' },
                ].map(t => (
                  <div key={t.ten} className="rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{t.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{t.ten}</p>
                        <p className="text-[10px] text-slate-400">{t.moTa}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${t.mau}`}>{t.trangThai}</span>
                    </div>
                    <button
                      type="button"
                      onClick={t.handle ? t.handle : undefined}
                      className={`flex h-7 w-full items-center justify-center rounded-lg text-[10px] font-bold transition ${t.trangThai === 'Đã kết nối' ? 'border border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      {t.trangThai === 'Đã kết nối' ? 'Cấu hình lại' : 'Kết nối ngay'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {modalGD.open && (
        <ModalGiaiDoan gd={modalGD.gd} onClose={() => setModalGD({ open: false })} />
      )}

      {modalCT.open && (
        <ModalChuongTrinh
          ct={modalCT.ct}
          onClose={() => setModalCT({ open: false })}
          onSave={(data) => {
            if (modalCT.ct) {
              setChuongTrinhList(prev => prev.map(item => item.id === modalCT.ct!.id ? { ...item, ...data } : item));
            } else {
              const newCt = {
                id: `ct_${Date.now()}`,
                ...data
              };
              setChuongTrinhList(prev => [...prev, newCt]);
            }
            setModalCT({ open: false });
          }}
        />
      )}

      {hienModalSmtp && (
        <ModalSMTP
          config={smtpConfig}
          onClose={() => setHienModalSmtp(false)}
          onSave={(data) => {
            setSmtpConfig(data);
            setHienModalSmtp(false);
          }}
        />
      )}
    </>
  );
}
