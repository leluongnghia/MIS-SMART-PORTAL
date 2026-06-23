'use client';

import React, { useState } from 'react';
import { Dialog } from '@/src/components/ui/dialog';
import {
  Calendar, Filter, Download, Upload, CheckCircle2, AlertTriangle,
  Clock, Eye, MoreHorizontal, Edit2, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Phone, MessageSquare, Send, Plus
} from 'lucide-react';
import { updateAdmissionAppointment } from '@/src/app/[locale]/(admin)/admissions/actions';
import type { LeadStatus } from '@/src/app/[locale]/(admin)/leads/actions';
import type { Lead as AdmissionLead } from './AdmissionsLeadsTable';

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
  testDate?: string | null;
  testTime?: string | null;
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
const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 'a1', student: 'Trần Minh Anh', studentCode: 'STU-2025-00128', avatarInitials: 'TMA', targetGrade: '6A (2025-2026)', time: '14/05/2025 09:00 - 10:30', location: 'Cơ sở Nguyễn Văn Linh', format: 'Test tại trường', advisor: 'Lê Khánh Trang', status: 'Đã xác nhận' },
  { id: 'a2', student: 'Nguyễn Gia Bảo', studentCode: 'STU-2025-00129', avatarInitials: 'NGB', targetGrade: '6A (2025-2026)', time: '14/05/2025 13:30 - 15:00', location: 'Online', format: 'Test trực tuyến', advisor: 'Phạm Gia Huy', status: 'Chờ xác nhận' },
  { id: 'a3', student: 'Lê Bảo Châu', studentCode: 'STU-2025-00130', avatarInitials: 'LBC', targetGrade: '7A (2025-2026)', time: '15/05/2025 09:00 - 10:30', location: 'Cơ sở Nguyễn Văn Linh', format: 'Test tại trường', advisor: 'Trần Bảo Ngọc', status: 'Đã hoàn thành' },
  { id: 'a4', student: 'Phạm Minh Khang', studentCode: 'STU-2025-00131', avatarInitials: 'PMK', targetGrade: '6A (2025-2026)', time: '15/05/2025 15:30 - 17:00', location: 'Online', format: 'Test trực tuyến', advisor: 'Nguyễn Hữu Mỹ', status: 'Đã gửi nhắc' },
  { id: 'a5', student: 'Võ Đức Nam', studentCode: 'STU-2025-00132', avatarInitials: 'VDN', targetGrade: '8A (2025-2026)', time: '16/05/2025 09:00 - 10:30', location: 'Cơ sở Nguyễn Văn Linh', format: 'Test tại trường', advisor: 'Đỗ Hoàng Nam', status: 'Chưa gửi nhắc' },
];

const FIRST_NAMES = ['Nguyễn', 'Trần', 'Phạm', 'Võ', 'Lê', 'Hoàng', 'Đỗ', 'Phan', 'Trịnh', 'Bùi', 'Đặng', 'Lương', 'Ngô'];
const MIDDLE_NAMES = ['Gia', 'Bảo', 'Minh', 'Đức', 'Quang', 'Hồng', 'Thị', 'Văn', 'Tuấn', 'Mai', 'Thanh', 'Quốc', 'Anh'];
const LAST_NAMES = ['Anh', 'Ngọc', 'Hân', 'Châu', 'Minh', 'Khang', 'Nam', 'Chi', 'Huy', 'Bảo', 'Sơn', 'Linh', 'Dương'];
const GRADE_LIST = ['6A (2025-2026)', '7A (2025-2026)', '8A (2025-2026)', '9A (2025-2026)', '10A (2025-2026)'];
const LOC_LIST = ['Cơ sở Nguyễn Văn Linh', 'Online', 'Cơ sở Nguyễn Tri Phương'];
const FORMAT_LIST = ['Test tại trường', 'Test trực tuyến'];
const ADVISOR_LIST = ['Lê Khánh Trang', 'Phạm Gia Huy', 'Trần Bảo Ngọc', 'Nguyễn Hữu Mỹ', 'Đỗ Hoàng Nam'];
const STATUS_LIST: ApptStatus[] = ['Đã xác nhận', 'Chờ xác nhận', 'Đã hoàn thành', 'Đã gửi nhắc', 'Chưa gửi nhắc'];

function generateMockAppointments(count: number): Appointment[] {
  const result = [...INITIAL_APPOINTMENTS];
  for (let i = 6; i <= count; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const mn = MIDDLE_NAMES[(i * 3) % MIDDLE_NAMES.length];
    const ln = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const student = `${fn} ${mn} ${ln}`;
    const initials = (mn[0] + ln[0]).toUpperCase();
    const studentCode = `STU-2025-${String(128 + i).padStart(5, '0')}`;
    const targetGrade = GRADE_LIST[i % GRADE_LIST.length];
    const location = LOC_LIST[i % LOC_LIST.length];
    const format = FORMAT_LIST[i % FORMAT_LIST.length];
    const advisor = ADVISOR_LIST[i % ADVISOR_LIST.length];
    const status = STATUS_LIST[i % STATUS_LIST.length];
    const time = `${14 + (i % 5)}/05/2025 ${String(9 + (i % 4)).padStart(2, '0')}:00 - ${String(10 + (i % 4)).padStart(2, '0')}:30`;
    result.push({
      id: `a${i}`,
      student,
      studentCode,
      avatarInitials: initials,
      targetGrade,
      time,
      location,
      format,
      advisor,
      status
    });
  }
  return result;
}

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

const APPT_STATUS_BY_LEAD_STATUS: Partial<Record<AdmissionLead['trangThai'], ApptStatus>> = {
  'Mới': 'Chưa gửi nhắc',
  'Đang tư vấn': 'Chờ xác nhận',
  'Đăng ký test': 'Đã xác nhận',
  'Nộp hồ sơ': 'Đã hoàn thành',
  'Giữ chỗ': 'Đã hoàn thành',
  'Nhập học': 'Đã hoàn thành',
};

const APPT_STATUS_TO_LEAD_STATUS: Partial<Record<ApptStatus, LeadStatus>> = {
  'Chưa gửi nhắc': 'consulting',
  'Đã gửi nhắc': 'test_scheduled',
  'Chờ xác nhận': 'test_scheduled',
  'Đã xác nhận': 'test_scheduled',
  'Đã hoàn thành': 'test_participated',
};

function formatAppointmentTime(dateISO?: string | null, time?: string | null, index = 0) {
  const fallbackDay = 14 + (index % 10);
  const fallbackHour = 9 + (index % 6);
  if (!dateISO) return `${String(fallbackDay).padStart(2, '0')}/05/2025 ${String(fallbackHour).padStart(2, '0')}:00 - ${String(fallbackHour + 1).padStart(2, '0')}:30`;
  const date = new Date(dateISO);
  const dateText = Number.isNaN(date.getTime())
    ? `${String(fallbackDay).padStart(2, '0')}/05/2025`
    : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const start = time || `${String(fallbackHour).padStart(2, '0')}:00`;
  const endHour = Math.min(23, Number(start.slice(0, 2) || fallbackHour) + 1);
  return `${dateText} ${start} - ${String(endHour).padStart(2, '0')}:${start.slice(3, 5) || '00'}`;
}

function mapLeadToAppointment(lead: AdmissionLead, index: number): Appointment {
  const parts = lead.hoTen.split(' ').filter(Boolean);
  return {
    id: lead.id,
    student: lead.hoTen,
    studentCode: lead.id,
    avatarInitials: parts.slice(-2).map(part => part[0]).join('').toUpperCase() || 'HS',
    targetGrade: lead.khoi,
    time: formatAppointmentTime(lead.testDate, lead.testTime, index),
    location: index % 3 === 1 ? 'Online' : 'Cơ sở Nguyễn Văn Linh',
    format: index % 3 === 1 ? 'Test trực tuyến' : 'Test tại trường',
    advisor: lead.tvv || 'Chưa phân công',
    status: APPT_STATUS_BY_LEAD_STATUS[lead.trangThai] || 'Chờ xác nhận',
    testDate: lead.testDate || null,
    testTime: lead.testTime || null,
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

export default function AdmissionsAppointments({ leads = [] }: { leads?: AdmissionLead[] }) {
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>(() => (
    leads.length ? leads.map(mapLeadToAppointment) : generateMockAppointments(30)
  ));
  const [activeTab, setActiveTab] = useState<ApptTab>('appointments');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState('');

  // Filtering states
  const [hienBoLoc, setHienBoLoc] = useState(false);
  const [locGrade, setLocGrade] = useState('ALL');
  const [locFormat, setLocFormat] = useState('ALL');
  const [locStatus, setLocStatus] = useState('ALL');

  // Detail & Edit Dialog states
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);
  const [tempAdvisor, setTempAdvisor] = useState('');
  const [tempStatus, setTempStatus] = useState<ApptStatus>('Đã xác nhận');
  const [tempDate, setTempDate] = useState('');
  const [tempTime, setTempTime] = useState('');

  // Rows limit config
  const limitPerPage = 5;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  const isDbLeadAppointment = (id: string) => leads.some(lead => lead.id === id);

  React.useEffect(() => {
    if (leads.length) {
      setAppointmentsList(leads.map(mapLeadToAppointment));
    }
  }, [leads]);

  // Filtered appointments list
  const apptsDaLoc = React.useMemo(() => {
    return appointmentsList.filter(appt => {
      const matchesGrade = locGrade === 'ALL' || appt.targetGrade.includes(locGrade);
      const matchesFormat = locFormat === 'ALL' || appt.format === locFormat;
      const matchesStatus = locStatus === 'ALL' || appt.status === locStatus;
      return matchesGrade && matchesFormat && matchesStatus;
    });
  }, [appointmentsList, locGrade, locFormat, locStatus]);

  const tongTrang = Math.ceil(apptsDaLoc.length / limitPerPage) || 1;

  const apptsHienThi = React.useMemo(() => {
    const start = (page - 1) * limitPerPage;
    return apptsDaLoc.slice(start, start + limitPerPage);
  }, [apptsDaLoc, page, limitPerPage]);

  React.useEffect(() => {
    setPage(1);
  }, [locGrade, locFormat, locStatus]);

  const handleExportCSV = () => {
    downloadCsv(
      `MIS_Lich_Test_${new Date().toISOString().slice(0, 10)}.csv`,
      ['Học sinh', 'Mã lead', 'Lớp mục tiêu', 'Thời gian', 'Địa điểm', 'Hình thức', 'Tư vấn viên', 'Trạng thái'],
      apptsDaLoc.map(appt => [appt.student, appt.studentCode, appt.targetGrade, appt.time, appt.location, appt.format, appt.advisor, appt.status])
    );
    showToast(`Đã xuất ${apptsDaLoc.length} lịch hẹn`);
  };

  const handleQuickAction = (label: string) => {
    if (label === 'Đặt lịch test mới') {
      const sourceLead = leads.find(lead => !appointmentsList.some(appt => appt.id === lead.id)) || leads[0];
      const draft = sourceLead ? mapLeadToAppointment(sourceLead, appointmentsList.length + 1) : generateMockAppointments(1)[0];
      if (!draft) return;
      const newDraft = { ...draft, id: `appt_${Date.now()}`, status: 'Chờ xác nhận' as const };
      setAppointmentsList(prev => [newDraft, ...prev]);
      setEditAppt(newDraft);
      setTempAdvisor(newDraft.advisor);
      setTempStatus(newDraft.status);
      setTempDate(newDraft.testDate || new Date().toISOString().slice(0, 10));
      setTempTime(newDraft.testTime || '09:00');
      if (sourceLead) {
        updateAdmissionAppointment(sourceLead.id, {
          testDate: newDraft.testDate || new Date().toISOString().slice(0, 10),
          testTime: newDraft.testTime || '09:00',
          status: 'test_scheduled',
          note: `Tạo lịch test nháp cho ${sourceLead.hoTen}`,
        }).catch(() => showToast('Lưu lịch test thất bại'));
      }
      showToast(`Đã tạo lịch nháp cho ${newDraft.student}`);
      return;
    }

    if (label === 'Xác nhận tham dự') {
      const target = appointmentsList.find(appt => appt.status === 'Chờ xác nhận') || appointmentsList[0];
      if (!target) return;
      setAppointmentsList(prev => prev.map(appt => appt.id === target.id ? { ...appt, status: 'Đã xác nhận' } : appt));
      if (isDbLeadAppointment(target.id)) updateAdmissionAppointment(target.id, {
        testDate: target.testDate || new Date().toISOString().slice(0, 10),
        testTime: target.testTime || '09:00',
        status: 'test_scheduled',
        note: `Xác nhận tham dự test: ${target.student}`,
      }).catch(() => showToast('Lưu xác nhận tham dự thất bại'));
      showToast(`Đã xác nhận tham dự: ${target.student}`);
      return;
    }

    if (label === 'Gửi nhắc lịch') {
      const targets = appointmentsList.filter(appt => appt.status === 'Chưa gửi nhắc' || appt.status === 'Chờ xác nhận');
      setAppointmentsList(prev => prev.map(appt => targets.some(target => target.id === appt.id) ? { ...appt, status: 'Đã gửi nhắc' } : appt));
      Promise.all(targets.filter(target => isDbLeadAppointment(target.id)).map(target => updateAdmissionAppointment(target.id, {
        testDate: target.testDate || new Date().toISOString().slice(0, 10),
        testTime: target.testTime || '09:00',
        status: 'test_scheduled',
        note: `Gửi nhắc lịch test: ${target.student}`,
      }))).catch(() => showToast('Lưu trạng thái nhắc lịch thất bại'));
      showToast(`Đã gửi nhắc lịch cho ${targets.length} học sinh`);
      return;
    }

    setActiveTab('results');
    showToast('Mở tab kết quả test');
  };

  const TABS: { id: ApptTab; label: string }[] = [
    { id: 'appointments', label: 'Lịch hẹn' },
    { id: 'interviews', label: 'Phỏng vấn' },
    { id: 'results', label: 'Kết quả test' },
  ];

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          <span>✓</span> {toast}
        </div>
      )}
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
          <button type="button" onClick={() => setHienBoLoc(true)} className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50">
            <Filter className="h-3.5 w-3.5" /> Bộ lọc
          </button>
          <button type="button" onClick={handleExportCSV} className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {quickActions.map(a => {
          const Icon = a.icon;
          return (
            <button key={a.label} type="button" onClick={() => handleQuickAction(a.label)}
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
                {apptsHienThi.map(appt => {
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
                          <button type="button" onClick={() => setSelectedAppt(appt)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"><Eye className="h-3.5 w-3.5" /></button>
                          <button type="button" onClick={() => { setEditAppt(appt); setTempAdvisor(appt.advisor); setTempStatus(appt.status); setTempDate(appt.testDate || new Date().toISOString().slice(0, 10)); setTempTime(appt.testTime || '09:00'); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600"><Edit2 className="h-3.5 w-3.5" /></button>
                          <button type="button" onClick={() => showToast(`Thao tác nâng cao: ${appt.student}`)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 flex-wrap gap-2">
              <p className="text-xs font-semibold text-slate-500">
                Hiển thị {apptsDaLoc.length > 0 ? (page - 1) * limitPerPage + 1 : 0} - {Math.min(page * limitPerPage, apptsDaLoc.length)} / {apptsDaLoc.length} kết quả
              </p>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => setPage(1)} disabled={page === 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"><ChevronsLeft className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /></button>
                
                {Array.from({ length: tongTrang }).map((_, idx) => {
                  const p = idx + 1;
                  return (
                    <button 
                      key={p} 
                      type="button" 
                      onClick={() => setPage(p)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${page === p ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button type="button" onClick={() => setPage(p => Math.min(tongTrang, p + 1))} disabled={page === tongTrang} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"><ChevronRight className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => setPage(tongTrang)} disabled={page === tongTrang} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"><ChevronsRight className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>

          {/* Summary + Recent Results */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* KPI Summary */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-black text-slate-900">Tổng quan kết quả test</p>
                <button type="button" onClick={() => setActiveTab('results')} className="text-xs font-bold text-blue-600 hover:text-blue-700">Xem chi tiết</button>
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
                <button type="button" onClick={() => setActiveTab('results')} className="text-xs font-bold text-blue-600 hover:text-blue-700">Xem tất cả</button>
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

      {activeTab === 'interviews' && (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900">Danh sách phỏng vấn</h3>
            <span className="text-xs text-slate-500">{apptsDaLoc.length} phỏng vấn</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apptsDaLoc.map(appt => (
              <div key={appt.id} className="border border-slate-100 rounded-xl p-4 space-y-3 shadow-xs bg-slate-50/50 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900">{appt.student}</h4>
                    <p className="text-[10px] text-slate-400">{appt.studentCode} · {appt.targetGrade}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${STATUS_CONFIG[appt.status].bg} ${STATUS_CONFIG[appt.status].text}`}>
                    {appt.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>🗓️ <strong>Thời gian:</strong> {appt.time}</p>
                  <p>🏫 <strong>Địa điểm:</strong> {appt.location}</p>
                  <p>👤 <strong>Giám khảo:</strong> {appt.advisor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900">Kết quả đánh giá đầu vào</h3>
            <span className="text-xs text-slate-500">3 học sinh đã thi</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase tracking-wide text-slate-400">
                  <th className="py-3 pl-4 pr-3 text-left">Học sinh</th>
                  <th className="py-3 px-3 text-center">Toán</th>
                  <th className="py-3 px-3 text-center">Tiếng Việt</th>
                  <th className="py-3 px-3 text-center">Tiếng Anh</th>
                  <th className="py-3 px-3 text-center">Phỏng vấn</th>
                  <th className="py-3 px-3 text-center">Tổng điểm</th>
                  <th className="py-3 px-3 text-center">Đề xuất BGH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {TEST_RESULTS.map(r => (
                  <tr key={r.student} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pl-4 pr-3">
                      <p className="font-bold text-slate-900">{r.student}</p>
                      <p className="text-[10px] text-slate-400">{r.studentCode}</p>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">{r.math ?? '—'}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">{r.vietnamese ?? '—'}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">{r.english ?? '—'}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">{r.interview ?? '—'}</td>
                    <td className="py-3 px-3 text-center font-black text-blue-600">{r.total ?? '—'}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`rounded-xl px-2.5 py-1 text-xs font-bold ${
                        r.recommendation.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
                        r.recommendation.startsWith('⚠️') ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>{r.recommendation}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Bộ lọc */}
      <Dialog
        open={hienBoLoc}
        onOpenChange={setHienBoLoc}
        title="Bộ lọc lịch hẹn & test"
        description="Lọc danh sách các cuộc hẹn kiểm tra đầu vào của thí sinh."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Hình thức kiểm tra</label>
            <select 
              value={locFormat} 
              onChange={(e) => setLocFormat(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs bg-white focus:outline-none"
            >
              <option value="ALL">Tất cả hình thức</option>
              <option value="Test tại trường">Test tại trường</option>
              <option value="Test trực tuyến">Test trực tuyến</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Trạng thái cuộc hẹn</label>
            <select 
              value={locStatus} 
              onChange={(e) => setLocStatus(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs bg-white focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.keys(STATUS_CONFIG).map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => {
                setLocFormat('ALL');
                setLocStatus('ALL');
                setHienBoLoc(false);
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Xoá bộ lọc
            </button>
            <button 
              type="button" 
              onClick={() => setHienBoLoc(false)}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </Dialog>

      {/* Appointment Detail Dialog */}
      <Dialog
        open={!!selectedAppt}
        onOpenChange={(open) => !open && setSelectedAppt(null)}
        title="Chi tiết lịch hẹn kiểm tra"
      >
        {selectedAppt && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                {selectedAppt.avatarInitials}
              </div>
              <div>
                <p className="font-bold text-slate-900">{selectedAppt.student}</p>
                <p className="text-xs text-slate-400">{selectedAppt.studentCode}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs border border-slate-100 rounded-xl p-4 bg-white">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Lớp mục tiêu</span>
                <span className="font-bold text-slate-900">{selectedAppt.targetGrade}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Thời gian kiểm tra</span>
                <span className="font-bold text-slate-900">{selectedAppt.time}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Địa điểm</span>
                <span className="font-bold text-slate-900">{selectedAppt.location}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Hình thức</span>
                <span className="font-bold text-slate-900">{selectedAppt.format}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Tư vấn viên phụ trách</span>
                <span className="font-bold text-slate-900">{selectedAppt.advisor}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Trạng thái hiện tại</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_CONFIG[selectedAppt.status].bg} ${STATUS_CONFIG[selectedAppt.status].text}`}>
                  {selectedAppt.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setSelectedAppt(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Appointment Edit Dialog */}
      <Dialog
        open={!!editAppt}
        onOpenChange={(open) => !open && setEditAppt(null)}
        title="Chỉnh sửa lịch kiểm tra"
      >
        {editAppt && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Tư vấn viên phụ trách</label>
              <input 
                type="text" 
                value={tempAdvisor}
                onChange={(e) => setTempAdvisor(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Ngày test</label>
                <input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Giờ test</label>
                <input
                  type="time"
                  value={tempTime}
                  onChange={(e) => setTempTime(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Trạng thái lịch hẹn</label>
              <select 
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value as ApptStatus)}
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs bg-white focus:outline-none"
              >
                {Object.keys(STATUS_CONFIG).map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setEditAppt(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Hủy
              </button>
              <button 
                type="button" 
                onClick={async () => {
                  const nextTime = formatAppointmentTime(tempDate, tempTime);
                  const nextStatus = APPT_STATUS_TO_LEAD_STATUS[tempStatus] || 'test_scheduled';
                  setAppointmentsList(prev => prev.map(a => a.id === editAppt.id ? { ...a, advisor: tempAdvisor, status: tempStatus, testDate: tempDate, testTime: tempTime, time: nextTime } : a));
                  try {
                    if (isDbLeadAppointment(editAppt.id)) {
                      await updateAdmissionAppointment(editAppt.id, {
                        testDate: tempDate,
                        testTime: tempTime,
                        status: nextStatus,
                        note: `Cập nhật lịch test ${editAppt.student}: ${nextTime} · ${tempStatus}`,
                      });
                    }
                    showToast(`✓ Cập nhật lịch hẹn học sinh ${editAppt.student} thành công!`);
                  } catch {
                    showToast('Lưu lịch hẹn thất bại');
                  }
                  setEditAppt(null);
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
