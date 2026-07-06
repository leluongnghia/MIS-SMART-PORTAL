'use client';

import React, { useState, useMemo } from 'react';
import {
  MapPin, Users, Wrench, CheckCircle2, XCircle, Clock,
  AlertTriangle, Search, Filter, Plus, Eye, Check, X,
  Calendar, ChevronDown, ChevronRight, Shield, Wifi,
  Projector, Monitor, Mic, Volume2, Laptop2, PenLine,
  Wind, ArmchairIcon, GlassWater, Package, Building2,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { cn } from '@/src/lib/utils';
import {
  ROOMS, ROOM_BOOKINGS, Room, RoomBooking, RoomEquipment,
  BookingStatus, RoomStatus, RoomType, ALL_EQUIPMENT,
  BOOKING_STATUS_CONFIG, ROOM_TYPE_CONFIG,
  isRoomConflict, getAvailableRooms,
} from '@/src/mockData/roomBooking';

// ─── Equipment icon map ───────────────────────────────────────
const EQ_ICON: Record<RoomEquipment, React.ReactNode> = {
  'Máy chiếu':        <Projector className="h-3.5 w-3.5" />,
  'Màn hình':         <Monitor className="h-3.5 w-3.5" />,
  'Micro':            <Mic className="h-3.5 w-3.5" />,
  'Loa':              <Volume2 className="h-3.5 w-3.5" />,
  'Laptop':           <Laptop2 className="h-3.5 w-3.5" />,
  'Bảng viết':        <PenLine className="h-3.5 w-3.5" />,
  'Điều hòa':         <Wind className="h-3.5 w-3.5" />,
  'Bàn ghế bổ sung':  <ArmchairIcon className="h-3.5 w-3.5" />,
  'Nước uống':        <GlassWater className="h-3.5 w-3.5" />,
  'Thiết bị khác':    <Package className="h-3.5 w-3.5" />,
};

const ROOM_STATUS_CONFIG: Record<RoomStatus, { color: string; dot: string; label: string }> = {
  'Đang hoạt động': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Hoạt động' },
  'Bảo trì':        { color: 'bg-amber-100 text-amber-700 border-amber-200',       dot: 'bg-amber-500',   label: 'Bảo trì' },
  'Tạm khóa':       { color: 'bg-rose-100 text-rose-700 border-rose-200',          dot: 'bg-rose-500',    label: 'Tạm khóa' },
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Room Card ────────────────────────────────────────────────
function RoomCard({ room, isAvailable, conflictBooking, onBook }: {
  room: Room;
  isAvailable: boolean | null;
  conflictBooking: RoomBooking | null;
  onBook: (room: Room) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sc = ROOM_STATUS_CONFIG[room.status];
  const tc = ROOM_TYPE_CONFIG[room.roomType];

  const availabilityBadge = isAvailable === null ? null :
    isAvailable
      ? <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Còn trống</span>
      : <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />Đã có lịch</span>;

  return (
    <div className={cn(
      'bg-white rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md',
      room.status === 'Bảo trì' && 'opacity-75',
      room.status === 'Tạm khóa' && 'opacity-60',
      isAvailable === false && 'border-rose-200 bg-rose-50/30',
      isAvailable === true && 'border-emerald-200',
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('text-2xl h-11 w-11 rounded-xl flex items-center justify-center shrink-0', tc.color.split(' ').slice(0,1).join(' ') + ' bg-opacity-60')}>
            {tc.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900 text-sm">{room.name}</h3>
              {room.requiresApproval && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                  <Shield className="h-2.5 w-2.5" />Cần duyệt
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mb-2">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{room.location}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />Tối đa {room.capacity} người</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', tc.color)}>
                {tc.icon} {room.roomType}
              </span>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1', sc.color)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', sc.dot)} />{sc.label}
              </span>
              {availabilityBadge}
            </div>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <button onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Conflict warning */}
        {conflictBooking && (
          <div className="mt-3 flex items-start gap-2 bg-rose-50 rounded-lg p-2.5 border border-rose-200 text-xs text-rose-700">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Trùng lịch:</span> {conflictBooking.purpose} ({conflictBooking.startTime}–{conflictBooking.endTime}, đặt bởi {conflictBooking.bookedBy})
            </div>
          </div>
        )}

        {/* Expanded */}
        {expanded && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
            {room.description && (
              <p className="text-xs text-slate-600">{room.description}</p>
            )}
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-1.5">Thiết bị có sẵn</div>
              <div className="flex flex-wrap gap-1.5">
                {room.equipment.map(eq => (
                  <span key={eq} className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg">
                    {EQ_ICON[eq]}{eq}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="mt-3 flex justify-end">
          <Button size="sm"
            disabled={room.status !== 'Đang hoạt động' || isAvailable === false}
            onClick={() => onBook(room)}
            className={cn(
              'text-xs h-8',
              room.status === 'Đang hoạt động' && isAvailable !== false
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            {room.status === 'Bảo trì' ? 'Đang bảo trì' :
             room.status === 'Tạm khóa' ? 'Tạm khóa' :
             isAvailable === false ? 'Đã có lịch' : 'Đặt phòng'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Booking Form ─────────────────────────────────────────────
interface BookingFormProps {
  preRoom?: Room | null;
  preDate?: string;
  preStart?: string;
  preEnd?: string;
  onClose: () => void;
  onSubmit: (b: RoomBooking) => void;
}

function BookingForm({ preRoom, preDate, preStart, preEnd, onClose, onSubmit }: BookingFormProps) {
  const [form, setForm] = useState({
    roomId: preRoom?.id ?? '',
    date: preDate ?? '',
    startTime: preStart ?? '',
    endTime: preEnd ?? '',
    purpose: '',
    expectedAttendees: '',
    requestedEquipment: [] as RoomEquipment[],
    extraSupport: '',
    notes: '',
    bookedBy: 'Người dùng hiện tại',
    bookedByDept: 'P. Hành chính',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedRoom = ROOMS.find(r => r.id === form.roomId);
  const conflict = form.roomId && form.date && form.startTime && form.endTime
    ? isRoomConflict(form.roomId, form.date, form.startTime, form.endTime)
    : null;

  const warnings: string[] = [];
  if (conflict) warnings.push(`Phòng đã có lịch: ${conflict.purpose} (${conflict.startTime}–${conflict.endTime})`);
  if (selectedRoom?.status === 'Bảo trì') warnings.push('Phòng đang trong tình trạng bảo trì');
  if (selectedRoom && form.expectedAttendees && Number(form.expectedAttendees) > selectedRoom.capacity)
    warnings.push(`Số người (${form.expectedAttendees}) vượt sức chứa phòng (${selectedRoom.capacity})`);
  const missingEq = form.requestedEquipment.filter(eq => selectedRoom && !selectedRoom.equipment.includes(eq));
  if (missingEq.length > 0) warnings.push(`Thiết bị không có sẵn trong phòng: ${missingEq.join(', ')}`);
  if (form.startTime && form.startTime < '07:00') warnings.push('Giờ bắt đầu trước 7:00 sáng (ngoài giờ làm việc)');
  if (form.endTime && form.endTime > '20:00') warnings.push('Giờ kết thúc sau 20:00 (ngoài giờ làm việc)');

  const toggleEquipment = (eq: RoomEquipment) => {
    setForm(f => ({
      ...f,
      requestedEquipment: f.requestedEquipment.includes(eq)
        ? f.requestedEquipment.filter(e => e !== eq)
        : [...f.requestedEquipment, eq],
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.roomId) errs.roomId = 'Vui lòng chọn phòng';
    if (!form.date) errs.date = 'Vui lòng chọn ngày';
    if (!form.startTime) errs.startTime = 'Vui lòng chọn giờ bắt đầu';
    if (!form.endTime) errs.endTime = 'Vui lòng chọn giờ kết thúc';
    else if (form.startTime && form.endTime <= form.startTime) errs.endTime = 'Giờ kết thúc phải sau giờ bắt đầu';
    if (!form.purpose.trim()) errs.purpose = 'Vui lòng nhập mục đích sử dụng';
    if (!form.expectedAttendees) errs.expectedAttendees = 'Vui lòng nhập số người';
    if (conflict) errs.conflict = 'Phòng đã bị đặt trong khung giờ này';
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    setTimeout(() => {
      const room = ROOMS.find(r => r.id === form.roomId)!;
      const booking: RoomBooking = {
        id: `B${Date.now()}`,
        roomId: form.roomId,
        roomName: room.name,
        meetingId: null,
        meetingTitle: null,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        expectedAttendees: Number(form.expectedAttendees),
        requestedEquipment: form.requestedEquipment,
        extraSupport: form.extraSupport,
        notes: form.notes,
        bookedBy: form.bookedBy,
        bookedByDept: form.bookedByDept,
        status: room.requiresApproval ? 'Chờ duyệt' : 'Đã duyệt',
        approvedBy: room.requiresApproval ? null : 'Hệ thống',
        approvedAt: room.requiresApproval ? null : new Date().toISOString(),
        rejectReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSubmit(booking);
      setSubmitting(false);
    }, 600);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-4 flex flex-col max-h-[calc(100vh-2rem)]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Đặt phòng họp</div>
                <div className="text-xs text-slate-500">Điền thông tin và chọn thiết bị cần dùng</div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="space-y-1.5">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />{w}
                  </div>
                ))}
              </div>
            )}

            {/* Phòng */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Phòng họp <span className="text-rose-500">*</span></label>
              <Select value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))}
                className={cn(errors.roomId && 'border-rose-400')}>
                <option value="">-- Chọn phòng --</option>
                {ROOMS.map(r => (
                  <option key={r.id} value={r.id} disabled={r.status !== 'Đang hoạt động'}>
                    {r.name} ({r.capacity} người){r.status !== 'Đang hoạt động' ? ` [${r.status}]` : ''}{r.requiresApproval ? ' ⚠ Cần duyệt' : ''}
                  </option>
                ))}
              </Select>
              {errors.roomId && <p className="text-[11px] text-rose-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.roomId}</p>}
              {selectedRoom && (
                <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 border border-slate-200">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedRoom.location}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />Tối đa {selectedRoom.capacity} người</span>
                    {selectedRoom.requiresApproval && <span className="flex items-center gap-1 text-amber-700"><Shield className="h-3 w-3" />Cần BGH/HC duyệt</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Thời gian */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Ngày <span className="text-rose-500">*</span></label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className={cn(errors.date && 'border-rose-400')} />
                {errors.date && <p className="text-[11px] text-rose-600">{errors.date}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Từ <span className="text-rose-500">*</span></label>
                <Input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  className={cn(errors.startTime && 'border-rose-400')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Đến <span className="text-rose-500">*</span></label>
                <Input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                  className={cn(errors.endTime && 'border-rose-400')} />
                {errors.endTime && <p className="text-[11px] text-rose-600">{errors.endTime}</p>}
              </div>
            </div>

            {/* Mục đích & số người */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Mục đích sử dụng <span className="text-rose-500">*</span></label>
              <Input placeholder="VD: Họp chuyên môn khối tiểu học..."
                value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                className={cn(errors.purpose && 'border-rose-400')} />
              {errors.purpose && <p className="text-[11px] text-rose-600">{errors.purpose}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Số người dự kiến <span className="text-rose-500">*</span></label>
              <Input type="number" min={1} placeholder="VD: 15"
                value={form.expectedAttendees} onChange={e => setForm(f => ({ ...f, expectedAttendees: e.target.value }))}
                className={cn('w-40', errors.expectedAttendees && 'border-rose-400')} />
              {errors.expectedAttendees && <p className="text-[11px] text-rose-600">{errors.expectedAttendees}</p>}
            </div>

            {/* Thiết bị */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Yêu cầu thiết bị</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_EQUIPMENT.map(eq => {
                  const checked = form.requestedEquipment.includes(eq);
                  const available = selectedRoom ? selectedRoom.equipment.includes(eq) : true;
                  return (
                    <button key={eq} type="button"
                      onClick={() => toggleEquipment(eq)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all text-left',
                        checked
                          ? available ? 'bg-blue-600 border-blue-600 text-white' : 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300',
                        !available && !checked && 'opacity-50',
                      )}>
                      {EQ_ICON[eq]}
                      <span className="truncate">{eq}</span>
                      {!available && <AlertTriangle className="h-3 w-3 ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {selectedRoom && form.requestedEquipment.some(eq => !selectedRoom.equipment.includes(eq)) && (
                <p className="text-[11px] text-amber-700 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />Thiết bị màu vàng không có sẵn — cần yêu cầu mượn thêm
                </p>
              )}
            </div>

            {/* Hỗ trợ & ghi chú */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Yêu cầu hỗ trợ thêm</label>
              <Input placeholder="VD: In tài liệu 20 bộ, sắp xếp bàn ghế theo sơ đồ..."
                value={form.extraSupport} onChange={e => setForm(f => ({ ...f, extraSupport: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Ghi chú</label>
              <textarea rows={2} placeholder="Ghi chú thêm..."
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none resize-none focus:border-slate-400" />
            </div>

            {selectedRoom?.requiresApproval && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <div>Phòng này cần được <strong>BGH/Hành chính duyệt</strong>. Yêu cầu sẽ ở trạng thái <strong>Chờ duyệt</strong> cho đến khi được xác nhận.</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl shrink-0 flex justify-between items-center gap-3">
            <div className="text-xs text-slate-500">
              {conflict && <span className="text-rose-600 font-semibold flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />Trùng lịch — không thể đặt</span>}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>Hủy</Button>
              <Button size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={submitting || !!conflict}
                onClick={handleSubmit}>
                {submitting
                  ? <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Đang gửi...</span>
                  : <><Check className="h-3.5 w-3.5 mr-1.5" />Gửi yêu cầu đặt phòng</>
                }
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Booking History Row ──────────────────────────────────────
function BookingRow({ booking, onApprove, onReject, onCancel }: {
  booking: RoomBooking;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onCancel: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const sc = BOOKING_STATUS_CONFIG[booking.status];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center min-w-[52px] text-center">
            <div className="text-xs font-bold text-slate-900">{booking.startTime}</div>
            <div className="text-[10px] text-slate-400">–</div>
            <div className="text-xs text-slate-500">{booking.endTime}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{fmtDate(booking.date).split(',')[0]}</div>
            <div className="text-[10px] text-slate-500">{booking.date.slice(8)}/{booking.date.slice(5,7)}</div>
          </div>
          <div className={cn('w-0.5 self-stretch rounded-full', sc.dot)} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1', sc.color)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', sc.dot)} />{booking.status}
              </span>
              {booking.meetingTitle && (
                <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  📅 {booking.meetingTitle}
                </span>
              )}
            </div>
            <div className="font-semibold text-slate-900 text-sm">{booking.roomName}</div>
            <div className="text-xs text-slate-600 mt-0.5">{booking.purpose}</div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400 mt-1">
              <span>Người đặt: {booking.bookedBy}</span>
              <span>{booking.bookedByDept}</span>
              <span>{booking.expectedAttendees} người</span>
              {booking.approvedBy && <span className="text-emerald-600">Duyệt: {booking.approvedBy}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {booking.status === 'Chờ duyệt' && (
              <>
                <button onClick={() => onApprove(booking.id)}
                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" title="Duyệt">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setRejectMode(m => !m)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors" title="Từ chối">
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            {(booking.status === 'Chờ duyệt' || booking.status === 'Đã duyệt') && (
              <button onClick={() => onCancel(booking.id)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors" title="Hủy">
                <XCircle className="h-3.5 w-3.5" />
              </button>
            )}
            <button onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Reject form */}
        {rejectMode && (
          <div className="mt-3 flex items-center gap-2">
            <Input placeholder="Lý do từ chối..." value={rejectReason}
              onChange={e => setRejectReason(e.target.value)} className="flex-1 h-8 text-sm" />
            <Button size="sm" variant="outline" onClick={() => setRejectMode(false)} className="h-8 text-xs">Hủy</Button>
            <Button size="sm" className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white"
              disabled={!rejectReason.trim()}
              onClick={() => { onReject(booking.id, rejectReason); setRejectMode(false); }}>
              Từ chối
            </Button>
          </div>
        )}

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            {booking.requestedEquipment.length > 0 && (
              <div>
                <span className="font-semibold text-slate-700">Thiết bị:</span>{' '}
                {booking.requestedEquipment.join(', ')}
              </div>
            )}
            {booking.extraSupport && (
              <div><span className="font-semibold text-slate-700">Hỗ trợ thêm:</span> {booking.extraSupport}</div>
            )}
            {booking.notes && (
              <div><span className="font-semibold text-slate-700">Ghi chú:</span> {booking.notes}</div>
            )}
            {booking.rejectReason && (
              <div className="text-rose-700"><span className="font-semibold">Lý do từ chối:</span> {booking.rejectReason}</div>
            )}
            {booking.approvedAt && (
              <div className="text-emerald-700"><span className="font-semibold">Thời gian duyệt:</span> {fmtDateTime(booking.approvedAt)}</div>
            )}
            <div className="text-slate-400">Tạo lúc: {fmtDateTime(booking.createdAt)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function RoomBookingManager() {
  const [tab, setTab] = useState<'rooms' | 'history'>('rooms');
  const [bookings, setBookings] = useState<RoomBooking[]>(ROOM_BOOKINGS);
  const [showForm, setShowForm] = useState(false);
  const [preRoom, setPreRoom] = useState<Room | null>(null);

  // Room list filters
  const [searchDate, setSearchDate] = useState('');
  const [searchStart, setSearchStart] = useState('');
  const [searchEnd, setSearchEnd] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [roomSearch, setRoomSearch] = useState('');

  // History filters
  const [histStatus, setHistStatus] = useState('all');
  const [histRoom, setHistRoom] = useState('all');
  const [histSearch, setHistSearch] = useState('');

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const availableRoomIds = useMemo(
    () => searchDate && searchStart && searchEnd
      ? new Set(getAvailableRooms(searchDate, searchStart, searchEnd))
      : null,
    [searchDate, searchStart, searchEnd]
  );

  const filteredRooms = useMemo(() => ROOMS.filter(r => {
    if (typeFilter !== 'all' && r.roomType !== typeFilter) return false;
    if (roomSearch && !r.name.toLowerCase().includes(roomSearch.toLowerCase()) && !r.location.toLowerCase().includes(roomSearch.toLowerCase())) return false;
    return true;
  }), [typeFilter, roomSearch]);

  const filteredBookings = useMemo(() => bookings.filter(b => {
    if (histStatus !== 'all' && b.status !== histStatus) return false;
    if (histRoom !== 'all' && b.roomId !== histRoom) return false;
    if (histSearch && !b.purpose.toLowerCase().includes(histSearch.toLowerCase()) && !b.bookedBy.toLowerCase().includes(histSearch.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [bookings, histStatus, histRoom, histSearch]);

  const handleBook = (room: Room) => { setPreRoom(room); setShowForm(true); };
  const handleNewBooking = (booking: RoomBooking) => {
    setBookings(prev => [booking, ...prev]);
    setShowForm(false);
    showToast(
      booking.status === 'Chờ duyệt'
        ? `Đã gửi yêu cầu đặt ${booking.roomName} — chờ BGH/HC duyệt`
        : `Đã đặt ${booking.roomName} thành công (tự động duyệt)`,
      booking.status === 'Chờ duyệt' ? 'info' : 'success'
    );
  };

  const handleApprove = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id
      ? { ...b, status: 'Đã duyệt', approvedBy: 'Quản trị viên', approvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      : b));
    showToast('Đã duyệt đặt phòng');
  };
  const handleReject = (id: string, reason: string) => {
    setBookings(prev => prev.map(b => b.id === id
      ? { ...b, status: 'Từ chối', rejectReason: reason, updatedAt: new Date().toISOString() }
      : b));
    showToast('Đã từ chối đặt phòng', 'error');
  };
  const handleCancel = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id
      ? { ...b, status: 'Đã hủy', updatedAt: new Date().toISOString() }
      : b));
    showToast('Đã hủy đặt phòng', 'info');
  };

  const kpi = useMemo(() => ({
    pending: bookings.filter(b => b.status === 'Chờ duyệt').length,
    approved: bookings.filter(b => b.status === 'Đã duyệt').length,
    total: bookings.length,
    maintenance: ROOMS.filter(r => r.status === 'Bảo trì').length,
  }), [bookings]);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium',
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        )}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />{toast.msg}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <BookingForm
          preRoom={preRoom}
          preDate={searchDate}
          preStart={searchStart}
          preEnd={searchEnd}
          onClose={() => { setShowForm(false); setPreRoom(null); }}
          onSubmit={handleNewBooking}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Đặt phòng họp</h2>
          <p className="text-sm text-slate-500">Xem phòng trống, kiểm tra lịch và đặt phòng</p>
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => { setPreRoom(null); setShowForm(true); }}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />Đặt phòng mới
        </Button>
      </div>

      {/* KPI mini */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Chờ duyệt', value: kpi.pending, color: 'border-amber-200', dot: 'bg-amber-500' },
          { label: 'Đã duyệt', value: kpi.approved, color: 'border-emerald-200', dot: 'bg-emerald-500' },
          { label: 'Tổng đặt phòng', value: kpi.total, color: 'border-blue-200', dot: 'bg-blue-500' },
          { label: 'Phòng bảo trì', value: kpi.maintenance, color: 'border-amber-200', dot: 'bg-amber-400' },
        ].map(k => (
          <div key={k.label} className={cn('bg-white rounded-xl border shadow-sm p-4 flex items-center gap-3', k.color)}>
            <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', k.dot)} />
            <div>
              <div className="text-xl font-extrabold text-slate-900">{k.value}</div>
              <div className="text-xs text-slate-500">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-1 gap-1">
        {([['rooms', 'Danh sách phòng'], ['history', 'Lịch sử đặt phòng']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('flex-1 py-2 text-sm font-semibold rounded-lg transition-all',
              tab === t ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
            )}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'rooms' && (
        <>
          {/* Time availability checker */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Search className="h-4 w-4 text-blue-500" />
              Kiểm tra phòng trống
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Ngày</label>
                <Input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Từ giờ</label>
                <Input type="time" value={searchStart} onChange={e => setSearchStart(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Đến giờ</label>
                <Input type="time" value={searchEnd} onChange={e => setSearchEnd(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Loại phòng</label>
                <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="all">Tất cả</option>
                  {(['Phòng họp BGH','Phòng hội đồng','Phòng chuyên môn','Hội trường','Phòng chức năng','Phòng tư vấn/phụ huynh'] as RoomType[]).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
            </div>
            {availableRoomIds && (
              <div className="text-xs text-slate-600 font-medium">
                Kết quả: <span className="text-emerald-700 font-bold">{availableRoomIds.size}</span> phòng còn trống trong khung giờ {searchStart}–{searchEnd} ngày {searchDate}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Tìm phòng theo tên hoặc vị trí..."
              value={roomSearch} onChange={e => setRoomSearch(e.target.value)}
              className="pl-9" />
          </div>

          {/* Room cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRooms.map(room => {
              const avail = availableRoomIds
                ? availableRoomIds.has(room.id) && room.status === 'Đang hoạt động'
                : null;
              const conflict = (availableRoomIds && !availableRoomIds.has(room.id) && searchDate && searchStart && searchEnd)
                ? isRoomConflict(room.id, searchDate, searchStart, searchEnd)
                : null;
              return (
                <RoomCard key={room.id} room={room}
                  isAvailable={avail}
                  conflictBooking={conflict}
                  onBook={handleBook} />
              );
            })}
          </div>
        </>
      )}

      {tab === 'history' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Tìm mục đích, người đặt..."
                value={histSearch} onChange={e => setHistSearch(e.target.value)}
                className="pl-9 h-9 text-sm" />
            </div>
            <Select value={histStatus} onChange={e => setHistStatus(e.target.value)} className="h-9 w-[150px] text-sm">
              <option value="all">Tất cả trạng thái</option>
              {(['Chờ duyệt','Đã duyệt','Từ chối','Đã hủy','Đã sử dụng','Không sử dụng'] as BookingStatus[]).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <Select value={histRoom} onChange={e => setHistRoom(e.target.value)} className="h-9 w-[160px] text-sm">
              <option value="all">Tất cả phòng</option>
              {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
          </div>

          {/* Booking list */}
          <div className="space-y-3">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <div className="font-medium">Không có lịch đặt phòng nào</div>
              </div>
            ) : filteredBookings.map(b => (
              <BookingRow key={b.id} booking={b}
                onApprove={handleApprove}
                onReject={handleReject}
                onCancel={handleCancel} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
