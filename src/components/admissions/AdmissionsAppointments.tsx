'use client';

import React, { useState } from 'react';
import {
  Calendar, Filter, Download, Upload, CheckCircle2, AlertTriangle,
  Clock, Eye, MoreHorizontal, Edit2, ChevronLeft, ChevronRight,
  Phone, MessageSquare, Send, Plus
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type ApptStatus = 'Đã xác nhận' | 'Chờ xác nhận' | 'Đã hoàn thành' | 'Đã gửi nhắc' | 'Chưa gửi nhắc';
type ApptTab = 'appointments' | 'interviews' | 'results';

interface Appointment {
  id: string;
  student: string;
  studentCode: string;
  avatarUrl?: string;
  avatarInitials: string;
  targetGrade: string;
  time: string;
  location: string;
  format: string;
  advisor: string;
  status: ApptStatus;
}

interface TestResult {
  student: string;
  studentCode: string;
  math?: number;
  vietnamese?: number;
  english?: number;
  interview?: number;
  total?: string;
  recommendation: '✅ Đạt' | '⚠️ Cần bổ sung' | '⏳ Chờ xét';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const APPOINTMENTS: Appointment[] = [
  { id: 'a1', student: 'Trần Minh Anh', studentCode: 'STU-2025-00128', avatarInitials: 'TMA', targetGrade: '6A (2025-2026)', time: '14/05/2025 09:00 - 10:30', location: 'Cơ sở Nguyễn Văn Linh', format: 'Test tại trường', advisor: 'Lê Khánh Trang', status: 'Đã xác nhận' },
  { id: 'a2', student: 'Nguyễn Gia Bảo', studentCode: 'STU-2025-00129', avatarInitials: 'NGB', targetGrade: '6A (2025-2026)', time: '14/05/2025 13:30 - 15:00', location: 'Online', format: 'Test trực tuyến', advisor: 'Phạm Gia Huy', status: 'Chờ xác nhận' },
  { id: 'a3', student: 'Lê Bảo Châu', studentCode: 'STU-2025-00130', avatarInitials: 'LBC', targetGrade: '7A (2025-2026)', time: '15/05/2025 09:00 - 10:30', location: 'Cơ sở Nguyễn Văn Linh', format: 'Test tại trường', advisor: 'Trần Bảo Ngọc', status: 'Đã hoàn thành' },
  { id: 'a4', student: 'Phạm Minh Khang', studentCode: 'STU-2025-00131', avatarInitials: 'PMK', targetGrade: '6A (2025-2026)', time: '15/05/2025 15:30 - 17:00', location: 'Online', format: 'Test trực tuyến', advisor: 'Nguyễn Hữu Mỹ', status: 'Đã gửi nhắc' },
  { id: 'a5', student: 'Võ Đức Nam', studentCode: 'STU-2025-00132', avatarInitials: 'VDN', targetGrade: '8A (2025-2026)', time: '16/05/2025 09:00 - 10:30', location: 'Cơ sở Nguyễn Văn Linh', format: 'Test tại trường', advisor: 'Đỗ Hoàng Nam', status: 'Chưa gửi nhắc' },
];

const TEST_RESULTS: TestResult[] = [
  { student: 'Lê Bảo Châu', studentCode: 'STU-2025-00130', math: 8.5, vietnamese: 8.0, english: 7.5, interview: 8.0, total: '80/100', recommendation: '✅ Đạt' },
  { student: 'Nguyễn Gia Bảo', studentCode: 'STU-2025-00129', math: 6.5, vietnamese: 7.0, english: 6.0, interview: 7.5, total: '67/100', recommendation: '⚠️ Cần bổ sung' },
  { student: 'Trần Minh Anh', studentCode: 'STU-2025-00128', math: undefined, vietnamese: undefined, english: undefined, interview: undefined, total: undefined, recommendation: '⏳ Chờ xét' },
];

const STATUS_CONFIG: Record<ApptStatus, { bg: string; text: string; dot: string }> = {
  'Đã xác nhận':  { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  'Chờ xác nhận': { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400' },
  'Đã hoàn thành':{ bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  'Đã gửi nhắc':  { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  'Chưa gửi nhắc':{ bg: 'bg-slate-100',  text: 'text-slate-600',  dot: 'bg-slate-400' },
};

const kpiCards = [
  { label: 'Tổng số test', value: '128', delta: '↑ 18%', deltaColor: 'text-green-600', sub: 'so với tuần trước', icon: '📅', bg: 'bg-blue-50' },
  { label: 'Đã hoàn thành', value: '68', delta: '↑ 16%', deltaColor: 'text-green-600', sub: 'so với tuần trước', icon: '✅', bg: 'bg-green-50' },
  { label: 'Đang chờ kết quả', value: '32', delta: '↓ 6%', deltaColor: 'text-red-500', sub: 'so với tuần trước', icon: '⏳', bg: 'bg-amber-50' },
  { label: 'Chưa tham dự', value: '28', delta: '↓ 8%', deltaColor: 'text-red-500', sub: 'so với tuần trước', icon: '❌', bg: 'bg-red-50' },
];

const quickActions = [
  { icon: Calendar, label: 'Đặt lịch test mới', sub: 'Tạo lịch hẹn cho học sinh', color: 'border-blue-200 bg-blue-50 hover:bg-blue-100' },
  { icon: CheckCircle2, label: 'Xác nhận tham dự', sub: 'Xác nhận học sinh tham dự', color: 'border-green-200 bg-green-50 hover:bg-green-100' },
  { icon: Send, label: 'Gửi nhắc lịch', sub: 'Gửi email/SMS nhắc lịch', color: 'border-purple-200 bg-purple-50 hover:bg-purple-100' },
  { icon: Upload, label: 'Tải kết quả', sub: 'Upload kết quả test', color: 'border-orange-200 bg-orange-50 hover:bg-orange-100' },
];

export default function AdmissionsAppointments() {
  const [activeTab, setActiveTab] = useState<ApptTab>('appointments');

  const TABS: { id: ApptTab; label: string }[] = [
    { id: 'appointments', label: 'Lịch hẹn' },
    { id: 'interviews', label: 'Phỏng vấn' },
    { id: 'results', label: 'Kết quả test' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Lịch hẹn & Test</h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Quản lý lịch hẹn, phỏng vấn và kết quả test của học sinh</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400" /> 12/05/2025 - 18/05/2025
          </div>
          <button type="button" className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50">
            <Filter className="h-3.5 w-3.5" /> Bộ lọc
          </button>
          <button type="button" className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {quickActions.map(a => {
          const Icon = a.icon;
          return (
            <button key={a.label} type="button"
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${a.color}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Icon className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">{a.label}</p>
                <p className="text-[10px] font-semibold text-slate-500">{a.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-slate-100">
        {TABS.map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 px-4 py-2.5 text-sm font-bold transition ${
              activeTab === tab.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'appointments' && (
        <>
          {/* Table */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase tracking-wide text-slate-400">
                  <th className="py-3 pl-4 pr-3 text-left">Học sinh</th>
                  <th className="py-3 px-3 text-left">Lớp mục tiêu</th>
                  <th className="py-3 px-3 text-left">Thời gian</th>
                  <th className="py-3 px-3 text-left">Hình thức</th>
                  <th className="py-3 px-3 text-left">Tư vấn viên</th>
                  <th className="py-3 px-3 text-left">Trạng thái</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {APPOINTMENTS.map(appt => {
                  const sc = STATUS_CONFIG[appt.status];
                  return (
                    <tr key={appt.id} className="hover:bg-slate-50/50 cursor-pointer transition-colors">
                      <td className="py-3 pl-4 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-[10px] font-black text-white">
                            {appt.avatarInitials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{appt.student}</p>
                            <p className="text-[10px] text-slate-400">{appt.studentCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-semibold text-xs">{appt.targetGrade}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700">{appt.time}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5">
                          {appt.format.includes('trực tuyến') ? '💻' : '🏫'} {appt.format}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs font-semibold text-slate-600">{appt.advisor}</td>
                      <td className="py-3 px-3">
                        <span className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold w-fit ${sc.bg} ${sc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><Eye className="h-3.5 w-3.5" /></button>
                          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><Edit2 className="h-3.5 w-3.5" /></button>
                          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Hiển thị 1 - 5 / 5 kết quả</p>
              <div className="flex items-center gap-1">
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400"><ChevronLeft className="h-4 w-4" /></button>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">1</button>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          {/* Summary + Recent Results */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* KPI Summary */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-black text-slate-900">Tổng quan kết quả test</p>
                <button type="button" className="text-xs font-bold text-blue-600">Xem chi tiết</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {kpiCards.map(c => (
                  <div key={c.label} className={`rounded-xl p-3 ${c.bg}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{c.icon}</span>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-500">{c.label}</p>
                        <p className="text-xl font-black text-slate-900">{c.value}</p>
                        <p className={`text-[10px] font-bold ${c.deltaColor}`}>{c.delta} {c.sub}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kết quả test gần nhất */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-black text-slate-900">Kết quả test gần nhất</p>
                <button type="button" className="text-xs font-bold text-blue-600">Xem tất cả</button>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wide text-slate-400">
                    <th className="pb-2 text-left">Học sinh</th>
                    <th className="pb-2 text-center">Toán</th>
                    <th className="pb-2 text-center">Tiếng Việt</th>
                    <th className="pb-2 text-center">Anh</th>
                    <th className="pb-2 text-center">Phỏng vấn</th>
                    <th className="pb-2 text-center">Tổng</th>
                    <th className="pb-2 text-center">Đề xuất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {TEST_RESULTS.map(r => (
                    <tr key={r.student} className="hover:bg-slate-50">
                      <td className="py-2">
                        <p className="font-bold text-slate-800">{r.student}</p>
                        <p className="text-[9px] text-slate-400">{r.studentCode}</p>
                      </td>
                      {[r.math, r.vietnamese, r.english, r.interview].map((v, i) => (
                        <td key={i} className="py-2 text-center font-semibold text-slate-700">{v ?? '-'}</td>
                      ))}
                      <td className="py-2 text-center font-black text-slate-900">{r.total ?? '-'}</td>
                      <td className="py-2 text-center">
                        <span className={`rounded-lg px-1.5 py-0.5 text-[10px] font-bold ${
                          r.recommendation.startsWith('✅') ? 'bg-green-100 text-green-700' :
                          r.recommendation.startsWith('⚠️') ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>{r.recommendation}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab !== 'appointments' && (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <div className="text-center">
            <p className="text-sm font-bold text-slate-400">Tab {activeTab === 'interviews' ? 'Phỏng vấn' : 'Kết quả test'}</p>
            <p className="text-xs text-slate-300 mt-1">Đang phát triển...</p>
          </div>
        </div>
      )}
    </div>
  );
}
