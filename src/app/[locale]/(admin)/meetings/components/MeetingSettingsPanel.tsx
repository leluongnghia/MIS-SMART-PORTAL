'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield, Settings, Eye, EyeOff, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, Clock, AlertTriangle, Save,
  ToggleLeft, ToggleRight, Bell, Building2, Users,
  FileText, Calendar, Wrench, History, Info, Check, X,
  RefreshCw, Filter,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { cn } from '@/src/lib/utils';
import { usePermission } from '@/src/hooks/usePermission';

// ─── Types ────────────────────────────────────────────────────
interface RolePermRow {
  role: string;
  roleCode: string;
  level: number;
  perms: string[];
}

interface AuditLog {
  id: string;
  action: string;
  target: string;
  actor: string;
  at: string;
  detail: string;
  icon: string;
  severity: 'info' | 'warn' | 'danger';
}

interface ModuleConfig {
  enabled: boolean;
  workStart: string;
  workEnd: string;
  minBookingMinutes: number;
  maxBookingHours: number;
  reminderMinutesBefore: number;
  requireApprovalRooms: string[];
  defaultApprover: string;
  allowedMeetingTypes: string[];
}

// ─── Permission matrix data ───────────────────────────────────
const ALL_PERMS = [
  // Meeting
  { code: 'meeting.view',   label: 'Xem lịch họp',        group: 'Cuộc họp' },
  { code: 'meeting.create', label: 'Tạo cuộc họp',         group: 'Cuộc họp' },
  { code: 'meeting.update', label: 'Sửa cuộc họp',         group: 'Cuộc họp' },
  { code: 'meeting.cancel', label: 'Hủy cuộc họp',         group: 'Cuộc họp' },
  { code: 'meeting.invite', label: 'Gửi thư mời',           group: 'Cuộc họp' },
  { code: 'meeting.respond',label: 'Xác nhận tham dự',      group: 'Cuộc họp' },
  // Room
  { code: 'room.view',      label: 'Xem danh sách phòng',  group: 'Phòng họp' },
  { code: 'room.book',      label: 'Đặt phòng',             group: 'Phòng họp' },
  { code: 'room.approve',   label: 'Duyệt đặt phòng',       group: 'Phòng họp' },
  { code: 'room.reject',    label: 'Từ chối đặt phòng',     group: 'Phòng họp' },
  { code: 'room.create',    label: 'Thêm/Sửa phòng',        group: 'Phòng họp' },
  // Participants
  { code: 'participant.manage',     label: 'Quản lý người tham gia', group: 'Người tham gia' },
  { code: 'participant.respond',    label: 'Phản hồi tham dự',       group: 'Người tham gia' },
  { code: 'participant.attendance', label: 'Điểm danh',               group: 'Người tham gia' },
  // Minutes
  { code: 'minutes.view',    label: 'Xem biên bản',   group: 'Biên bản' },
  { code: 'minutes.create',  label: 'Tạo biên bản',   group: 'Biên bản' },
  { code: 'minutes.update',  label: 'Sửa biên bản',   group: 'Biên bản' },
  { code: 'minutes.approve', label: 'Duyệt biên bản', group: 'Biên bản' },
  { code: 'minutes.export',  label: 'Xuất biên bản',  group: 'Biên bản' },
  { code: 'meeting_task.create', label: 'Tạo nhiệm vụ',  group: 'Nhiệm vụ sau họp' },
  { code: 'meeting_task.update', label: 'Cập nhật nhiệm vụ', group: 'Nhiệm vụ sau họp' },
  { code: 'meeting_task.view',   label: 'Xem nhiệm vụ',    group: 'Nhiệm vụ sau họp' },
  // Config
  { code: 'meeting.config', label: 'Cấu hình module', group: 'Cấu hình' },
];

const ROLES: RolePermRow[] = [
  {
    role: 'Admin / Super Admin', roleCode: 'SUPER_ADMIN', level: 999,
    perms: ALL_PERMS.map(p => p.code), // all
  },
  {
    role: 'Ban Giám Hiệu', roleCode: 'HIEU_TRUONG', level: 900,
    perms: [
      'meeting.view','meeting.create','meeting.update','meeting.cancel','meeting.invite','meeting.respond',
      'room.view','room.book','room.approve','room.reject',
      'participant.manage','participant.respond','participant.attendance',
      'minutes.view','minutes.create','minutes.update','minutes.approve','minutes.export',
      'meeting_task.create','meeting_task.update','meeting_task.view',
    ],
  },
  {
    role: 'Hành chính', roleCode: 'HANH_CHINH', level: 700,
    perms: [
      'meeting.view','meeting.respond',
      'room.view','room.create','room.book','room.approve','room.reject',
      'participant.respond',
      'minutes.view','meeting_task.view',
    ],
  },
  {
    role: 'Trưởng phòng / Tổ trưởng', roleCode: 'TRUONG_PHONG', level: 500,
    perms: [
      'meeting.view','meeting.create','meeting.update','meeting.cancel','meeting.invite','meeting.respond',
      'room.view','room.book',
      'participant.manage','participant.respond','participant.attendance',
      'minutes.view','minutes.create','minutes.update','minutes.export',
      'meeting_task.create','meeting_task.update','meeting_task.view',
    ],
  },
  {
    role: 'Giáo viên / Nhân viên', roleCode: 'NHAN_VIEN', level: 100,
    perms: [
      'meeting.view','meeting.respond',
      'room.view','room.book',
      'participant.respond',
      'minutes.view',
      'meeting_task.view',
    ],
  },
];

const GROUPS = [...new Set(ALL_PERMS.map(p => p.group))];

// ─── Audit log mock ────────────────────────────────────────────
const AUDIT_LOGS: AuditLog[] = [
  { id: 'AL001', action: 'Tạo cuộc họp', target: 'Họp giao ban tuần 28', actor: 'Nguyễn Văn Minh', at: '2026-07-06T07:00:00', detail: 'Tạo mới cuộc họp với 9 người tham dự', icon: '📅', severity: 'info' },
  { id: 'AL002', action: 'Đặt phòng', target: 'Phòng họp B (P.301)', actor: 'Lê Văn Bình', at: '2026-07-05T14:30:00', detail: 'Đặt phòng 07:00–09:00 ngày 06/07', icon: '🏢', severity: 'info' },
  { id: 'AL003', action: 'Duyệt đặt phòng', target: 'Phòng BGH', actor: 'Trần Thị Hoa', at: '2026-07-04T09:00:00', detail: 'Duyệt yêu cầu đặt phòng của Lê Văn Bình', icon: '✅', severity: 'info' },
  { id: 'AL004', action: 'Tạo biên bản', target: 'Họp BGH – Chiến lược tuyển sinh Q3', actor: 'Lê Văn Bình', at: '2026-07-04T17:15:00', detail: 'Biên bản trạng thái: Đang soạn', icon: '📝', severity: 'info' },
  { id: 'AL005', action: 'Duyệt biên bản', target: 'Họp BGH – Chiến lược tuyển sinh Q3', actor: 'Nguyễn Văn Minh', at: '2026-07-04T18:00:00', detail: 'Biên bản chuyển trạng thái: Đã duyệt', icon: '✅', severity: 'info' },
  { id: 'AL006', action: 'Thêm người tham gia', target: 'Họp giao ban tuần 28', actor: 'Nguyễn Văn Minh', at: '2026-07-04T07:00:00', detail: 'Thêm 9 người, gửi thư mời tự động', icon: '👥', severity: 'info' },
  { id: 'AL007', action: 'Gửi lại thư mời', target: 'Đỗ Minh Tuấn', actor: 'Lê Văn Bình', at: '2026-07-05T09:00:00', detail: 'Gửi lại thư mời lần 2 (chưa phản hồi)', icon: '📨', severity: 'warn' },
  { id: 'AL008', action: 'Tạo nhiệm vụ sau họp', target: '"Cải thiện quy trình tiếp nhận hồ sơ"', actor: 'Nguyễn Văn Minh', at: '2026-07-04T17:30:00', detail: 'Giao cho Lê Văn Bình, hạn 08/07', icon: '🎯', severity: 'info' },
  { id: 'AL009', action: 'Từ chối đặt phòng', target: 'Hội trường chính', actor: 'Trần Thị Hoa', at: '2026-07-03T11:00:00', detail: 'Lý do: Đã có lịch sự kiện khác', icon: '❌', severity: 'danger' },
  { id: 'AL010', action: 'Hủy cuộc họp', target: 'Họp chuyên môn Tiểu học', actor: 'Phạm Thị Lan', at: '2026-07-03T08:00:00', detail: 'Hủy do người chủ trì vắng mặt đột xuất', icon: '🚫', severity: 'danger' },
];

// ─── Module config defaults ────────────────────────────────────
const DEFAULT_CONFIG: ModuleConfig = {
  enabled: true,
  workStart: '07:00',
  workEnd: '18:00',
  minBookingMinutes: 30,
  maxBookingHours: 8,
  reminderMinutesBefore: 30,
  requireApprovalRooms: ['Phòng BGH', 'Hội trường chính'],
  defaultApprover: 'Trần Thị Hoa',
  allowedMeetingTypes: ['Họp cá nhân', 'Họp phòng ban', 'Họp toàn trường', 'Họp BGH', 'Họp chuyên môn', 'Họp phụ huynh', 'Họp vận hành'],
};

// ─── Permission Matrix Tab ─────────────────────────────────────
function PermissionMatrixTab() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(GROUPS));
  const toggleGroup = (g: string) => setExpandedGroups(prev => {
    const s = new Set(prev);
    s.has(g) ? s.delete(g) : s.add(g);
    return s;
  });

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <div>Ma trận này hiển thị quyền mặc định theo vai trò. Để chỉnh sửa từng người dùng cụ thể, truy cập <strong>Cài đặt hệ thống → Phân quyền</strong>.</div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-xs font-bold text-slate-700 px-4 py-3 min-w-[180px]">Nhóm quyền / Quyền</th>
              {ROLES.map(r => (
                <th key={r.roleCode} className="text-center text-xs font-bold text-slate-700 px-3 py-3 min-w-[110px]">
                  <div>{r.role}</div>
                  <div className="text-[10px] text-slate-400 font-normal">Cấp {r.level}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {GROUPS.map(group => {
              const groupPerms = ALL_PERMS.filter(p => p.group === group);
              const isOpen = expandedGroups.has(group);
              return (
                <React.Fragment key={group}>
                  {/* Group header row */}
                  <tr className="bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => toggleGroup(group)}>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        {group}
                        <span className="text-slate-400 font-normal">({groupPerms.length})</span>
                      </div>
                    </td>
                    {ROLES.map(r => {
                      const granted = groupPerms.filter(p => r.perms.includes(p.code)).length;
                      return (
                        <td key={r.roleCode} className="text-center px-3 py-2">
                          <span className="text-[10px] text-slate-500">{granted}/{groupPerms.length}</span>
                        </td>
                      );
                    })}
                  </tr>
                  {/* Permission rows */}
                  {isOpen && groupPerms.map(p => (
                    <tr key={p.code} className="hover:bg-blue-50/30 transition-colors">
                      <td className="pl-9 pr-4 py-2 text-xs text-slate-600">{p.label}</td>
                      {ROLES.map(r => {
                        const has = r.perms.includes(p.code);
                        return (
                          <td key={r.roleCode} className="text-center px-3 py-2">
                            {has
                              ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                              : <XCircle className="h-4 w-4 text-slate-200 mx-auto" />}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Config Tab ────────────────────────────────────────────────
function ConfigTab() {
  const [config, setConfig] = useState<ModuleConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Module toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-900">Module Lịch họp & Đặt phòng</div>
            <div className="text-sm text-slate-500 mt-0.5">Bật/tắt toàn bộ chức năng của module này</div>
          </div>
          <button onClick={() => setConfig(c => ({ ...c, enabled: !c.enabled }))}
            className={cn('relative h-7 w-12 rounded-full transition-colors duration-200',
              config.enabled ? 'bg-emerald-500' : 'bg-slate-300')}>
            <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-200',
              config.enabled ? 'left-6' : 'left-1')} />
          </button>
        </div>
      </div>

      {/* Thời gian làm việc */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />Thời gian làm việc & Đặt phòng
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Giờ bắt đầu</label>
            <Input type="time" value={config.workStart}
              onChange={e => setConfig(c => ({ ...c, workStart: e.target.value }))} className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Giờ kết thúc</label>
            <Input type="time" value={config.workEnd}
              onChange={e => setConfig(c => ({ ...c, workEnd: e.target.value }))} className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Đặt phòng tối thiểu (phút)</label>
            <Input type="number" min={15} step={15} value={config.minBookingMinutes}
              onChange={e => setConfig(c => ({ ...c, minBookingMinutes: +e.target.value }))} className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Đặt phòng tối đa (giờ)</label>
            <Input type="number" min={1} max={24} value={config.maxBookingHours}
              onChange={e => setConfig(c => ({ ...c, maxBookingHours: +e.target.value }))} className="text-sm" />
          </div>
        </div>
      </div>

      {/* Nhắc nhở */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="font-semibold text-slate-900 flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-500" />Nhắc lịch họp
        </div>
        <div className="flex items-center gap-4">
          <label className="text-xs font-semibold text-slate-700 shrink-0">Nhắc trước (phút)</label>
          <Select value={String(config.reminderMinutesBefore)}
            onChange={e => setConfig(c => ({ ...c, reminderMinutesBefore: +e.target.value }))}
            className="w-[150px] text-sm">
            {[10, 15, 30, 60, 120].map(v => <option key={v} value={v}>{v} phút</option>)}
          </Select>
        </div>
      </div>

      {/* Phòng cần duyệt */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="font-semibold text-slate-900 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-indigo-500" />Phòng cần duyệt đặt chỗ
        </div>
        <div className="flex flex-wrap gap-2">
          {['Phòng BGH', 'Hội trường chính', 'Phòng hội đồng A', 'Phòng hội đồng B', 'Phòng STEM'].map(room => {
            const selected = config.requireApprovalRooms.includes(room);
            return (
              <button key={room} onClick={() => setConfig(c => ({
                ...c,
                requireApprovalRooms: selected
                  ? c.requireApprovalRooms.filter(r => r !== room)
                  : [...c.requireApprovalRooms, room],
              }))}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all',
                  selected ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200')}>
                {selected ? <Check className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                {room}
              </button>
            );
          })}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Người duyệt mặc định</label>
          <Input value={config.defaultApprover}
            onChange={e => setConfig(c => ({ ...c, defaultApprover: e.target.value }))}
            className="text-sm max-w-xs" />
        </div>
      </div>

      {/* Loại cuộc họp */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />Loại cuộc họp được phép
        </div>
        <div className="flex flex-wrap gap-2">
          {['Họp cá nhân', 'Họp phòng ban', 'Họp toàn trường', 'Họp BGH', 'Họp chuyên môn', 'Họp phụ huynh', 'Họp vận hành'].map(type => {
            const selected = config.allowedMeetingTypes.includes(type);
            return (
              <button key={type} onClick={() => setConfig(c => ({
                ...c,
                allowedMeetingTypes: selected
                  ? c.allowedMeetingTypes.filter(t => t !== type)
                  : [...c.allowedMeetingTypes, type],
              }))}
                className={cn('px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all',
                  selected ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200')}>
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button className={cn('gap-2', saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700', 'text-white')}
          onClick={handleSave}>
          {saved ? <><CheckCircle2 className="h-4 w-4" />Đã lưu</> : <><Save className="h-4 w-4" />Lưu cấu hình</>}
        </Button>
      </div>
    </div>
  );
}

// ─── Audit Log Tab ─────────────────────────────────────────────
function AuditLogTab() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const SEVERITY_CONFIG = {
    info:   { bg: 'bg-blue-50 border-blue-200 text-blue-800',   dot: 'bg-blue-500' },
    warn:   { bg: 'bg-amber-50 border-amber-200 text-amber-800', dot: 'bg-amber-500' },
    danger: { bg: 'bg-rose-50 border-rose-200 text-rose-800',    dot: 'bg-rose-500' },
  };

  const filtered = AUDIT_LOGS.filter(l => {
    if (filter !== 'all' && l.severity !== filter) return false;
    if (search && !l.action.toLowerCase().includes(search.toLowerCase()) &&
        !l.actor.toLowerCase().includes(search.toLowerCase()) &&
        !l.target.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter row */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm kiếm hành động, người thực hiện..." value={search}
            onChange={e => setSearch(e.target.value)} className="pl-9 text-sm" />
        </div>
        <Select value={filter} onChange={e => setFilter(e.target.value)} className="w-[150px] text-sm">
          <option value="all">Tất cả</option>
          <option value="info">Thông thường</option>
          <option value="warn">Cảnh báo</option>
          <option value="danger">Quan trọng</option>
        </Select>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Thao tác hôm nay', value: filtered.filter(l => l.at.startsWith('2026-07-06')).length, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Cảnh báo', value: filtered.filter(l => l.severity === 'warn').length, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Hủy / Từ chối', value: filtered.filter(l => l.severity === 'danger').length, color: 'text-rose-700', bg: 'bg-rose-50' },
        ].map(k => (
          <div key={k.label} className={cn('rounded-xl border border-slate-200 p-3 text-center', k.bg)}>
            <div className={cn('text-xl font-black', k.color)}>{k.value}</div>
            <div className="text-[10px] text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Log list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <History className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <div>Không có nhật ký nào</div>
          </div>
        ) : filtered.map(log => {
          const cfg = SEVERITY_CONFIG[log.severity];
          return (
            <div key={log.id} className={cn('flex items-start gap-3 p-4 rounded-xl border', cfg.bg)}>
              <div className="text-lg shrink-0 mt-0.5">{log.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm">{log.action}</span>
                  <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
                  <span className="text-xs opacity-75">{log.target}</span>
                </div>
                <div className="text-xs opacity-80 mt-0.5">👤 {log.actor} · {new Date(log.at).toLocaleString('vi-VN')}</div>
                <div className="text-xs opacity-70 mt-0.5 italic">{log.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── My Permissions Tab ─────────────────────────────────────────
function MyPermissionsTab() {
  const { hasPermission, isSuperAdmin, isLoading, permissions } = usePermission();

  if (isLoading) return (
    <div className="flex items-center justify-center py-16 text-slate-400">
      <RefreshCw className="h-5 w-5 animate-spin mr-2" />Đang tải quyền...
    </div>
  );

  return (
    <div className="space-y-4">
      {isSuperAdmin && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800">
          <Shield className="h-5 w-5 shrink-0" />
          <div>
            <div className="font-bold">Super Admin</div>
            <div className="text-sm">Bạn có toàn quyền trên tất cả chức năng của module này.</div>
          </div>
        </div>
      )}

      {!isSuperAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          Hiển thị quyền thực tế của tài khoản bạn đang đăng nhập trong module Lịch họp & Đặt phòng.
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {GROUPS.map(group => {
          const groupPerms = ALL_PERMS.filter(p => p.group === group);
          return (
            <div key={group}>
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">{group}</span>
              </div>
              <div className="divide-y divide-slate-50">
                {groupPerms.map(p => {
                  const has = isSuperAdmin || hasPermission(p.code);
                  return (
                    <div key={p.code} className="flex items-center justify-between px-4 py-2.5">
                      <div>
                        <div className="text-sm text-slate-700">{p.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.code}</div>
                      </div>
                      {has
                        ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        : <XCircle className="h-5 w-5 text-slate-200 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Access Denied Banner (dùng trong các tab khác) ────────────
export function MeetingAccessDenied({ permission }: { permission: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-rose-50 rounded-2xl border border-rose-200">
      <Shield className="h-12 w-12 text-rose-300 mb-4" />
      <div className="font-bold text-rose-800 mb-1">Không có quyền truy cập</div>
      <div className="text-sm text-rose-600">Bạn cần quyền <code className="bg-rose-100 px-1.5 py-0.5 rounded font-mono text-xs">{permission}</code></div>
      <div className="text-xs text-rose-500 mt-1">Liên hệ Admin để được cấp quyền</div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────
const SUB_TABS = [
  { id: 'matrix',     label: 'Ma trận quyền', icon: Shield   },
  { id: 'config',     label: 'Cấu hình',       icon: Settings },
  { id: 'audit',      label: 'Nhật ký',         icon: History  },
  { id: 'my-perms',   label: 'Quyền của tôi',   icon: Eye      },
] as const;
type SubTabId = (typeof SUB_TABS)[number]['id'];

export default function MeetingSettingsPanel() {
  const [activeTab, setActiveTab] = useState<SubTabId>('matrix');
  const { hasPermission, isSuperAdmin, isLoading } = usePermission();
  const canConfig = isSuperAdmin || hasPermission('meeting.config');

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Phân quyền & Cấu hình</h2>
          <p className="text-sm text-slate-500">Kiểm soát truy cập, cấu hình module và nhật ký thao tác</p>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-100 rounded-xl p-1">
        {SUB_TABS.map(t => {
          const Icon = t.icon;
          const disabled = (t.id === 'config') && !canConfig;
          return (
            <button key={t.id}
              onClick={() => !disabled && setActiveTab(t.id)}
              disabled={disabled}
              title={disabled ? 'Bạn không có quyền cấu hình module' : undefined}
              className={cn(
                'flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all',
                activeTab === t.id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700',
                disabled && 'opacity-40 cursor-not-allowed',
              )}>
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'matrix'   && <PermissionMatrixTab />}
      {activeTab === 'config'   && (canConfig ? <ConfigTab /> : <MeetingAccessDenied permission="meeting.config" />)}
      {activeTab === 'audit'    && <AuditLogTab />}
      {activeTab === 'my-perms' && <MyPermissionsTab />}
    </div>
  );
}
