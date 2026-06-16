'use client';

import React, { useState } from 'react';
import {
  ArrowLeft, Edit3, Phone, Mail, Calendar, MessageSquare, MoreHorizontal,
  CheckCircle2, Circle, ChevronRight, Upload, Eye, Clock,
  Zap, FileText, GraduationCap, CreditCard, Activity, History
} from 'lucide-react';

type Tab = 'overview' | 'contact' | 'study' | 'test' | 'tuition' | 'documents' | 'activity' | 'history';

interface PipelineStep {
  id: string;
  label: string;
  date?: string;
  by?: string;
  note?: string;
  done: boolean;
  active: boolean;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { id: 'new', label: 'NEW_LEAD', date: '10/05/2025 09:15', by: 'Hệ thống', note: 'Lead được tạo từ form đăng ký trên Website', done: true, active: false },
  { id: 'consulting', label: 'TƯ VẤN', date: '11/05/2025 09:30', by: 'Trần Bảo Ngọc', note: 'Đã tư vấn chương trình và gửi tài liệu', done: true, active: false },
  { id: 'test', label: 'TEST_SCHEDULED', date: '12/05/2025 10:00', by: 'Trần Bảo Ngọc', note: 'Đặt lịch kiểm tra đầu vào ngày 16/05/2025', done: true, active: true },
  { id: 'test_done', label: 'TEST_COMPLETED', done: false, active: false },
  { id: 'doc_check', label: 'DOC_CHECK', done: false, active: false },
  { id: 'seat', label: 'SEAT_RESERVED', done: false, active: false },
  { id: 'enrolled', label: 'ENROLLED', done: false, active: false },
];

const CHECKLIST_DOCS = [
  { label: 'Phiếu đăng ký tuyển sinh', done: true },
  { label: 'Bản sao giấy khai sinh', done: true },
  { label: 'Ảnh 3x4', done: true },
  { label: 'Học bạ 2 năm gần nhất', done: false },
  { label: 'Giấy chứng nhận tiêm chủng', done: false },
  { label: 'CMND/CCCD của phụ huynh', done: false },
  { label: 'Giấy tờ ưu tiên (nếu có)', done: false },
];

const ACTIVITY_LOG = [
  { icon: Phone, color: 'text-green-600 bg-green-50', time: '12/05/2025 10:30', by: 'Trần Bảo Ngọc', title: 'Gọi điện cho phụ huynh', desc: 'Trao đổi về chương trình học và lịch test đầu vào. Phụ huynh quan tâm học bổng.' },
  { icon: Mail, color: 'text-blue-600 bg-blue-50', time: '11/05/2025 14:20', by: 'Trần Bảo Ngọc', title: 'Gửi email giới thiệu chương trình', desc: 'Gửi brochure chương trình Song ngữ và thông tin học bổng.' },
  { icon: MessageSquare, color: 'text-cyan-600 bg-cyan-50', time: '11/05/2025 09:35', by: 'Trần Bảo Ngọc', title: 'Nhắn tin Zalo', desc: 'Gửi tài liệu giới thiệu và link đăng ký test đầu vào.' },
  { icon: FileText, color: 'text-purple-600 bg-purple-50', time: '10/05/2025 09:20', by: 'Trần Bảo Ngọc', title: 'Thêm ghi chú', desc: 'Phụ huynh quan tâm chương trình song ngữ, mong con học môi trường quốc tế.' },
];

const UPCOMING_APPOINTMENTS = [
  { date: '16/05/2025 - 09:00', title: 'Test đầu vào Grade 6', location: 'Cơ sở Nguyễn Văn Linh', status: 'Đã xác nhận', statusColor: 'bg-green-100 text-green-700' },
];

const RELATED_TASKS = [
  { title: 'Gọi nhắc lịch test cho phụ huynh', date: '13/05/2025', by: 'Trần Bảo Ngọc', status: 'Chưa bắt đầu' },
];

export default function AdmissionsLeadDetail({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Tổng quan', icon: Activity },
    { id: 'contact', label: 'Liên hệ', icon: Phone },
    { id: 'study', label: 'Học tập', icon: GraduationCap },
    { id: 'test', label: 'Test & Phỏng vấn', icon: FileText },
    { id: 'tuition', label: 'Học phí & Thanh toán', icon: CreditCard },
    { id: 'documents', label: 'Hồ sơ', icon: FileText },
    { id: 'activity', label: 'Hoạt động', icon: Activity },
    { id: 'history', label: 'Lịch sử', icon: History },
  ];

  const docsCompleted = CHECKLIST_DOCS.filter(d => d.done).length;
  const docsTotal = CHECKLIST_DOCS.length;

  return (
    <div className="flex h-[calc(100vh-88px)] flex-col gap-0 overflow-hidden">
      {/* Breadcrumb + Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button type="button" onClick={onBack} className="flex items-center gap-1 font-semibold hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" /> Leads
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="font-bold text-slate-900">Chi tiết Lead</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Quay lại
          </button>
          <button type="button" className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700">
            <Edit3 className="h-3.5 w-3.5" /> Chỉnh sửa
          </button>
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: Detail */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Lead header card */}
          <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-4">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-xl font-black text-white shadow">
                NHM
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900">Nguyễn Hoàng Minh</h1>
                  <span className="rounded-xl bg-blue-100 px-2.5 py-1 text-xs font-black text-blue-700">NEW_LEAD</span>
                  <button type="button" className="text-slate-400 hover:text-slate-600"><Edit3 className="h-4 w-4" /></button>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                  <span>Lead Code: <strong className="text-slate-700">LD250510-01284</strong></span>
                  <span>·</span>
                  <span>Ngày tạo: <strong className="text-slate-700">10/05/2025 09:15</strong></span>
                  <span>·</span>
                  <span>Nguồn: <strong className="text-blue-600">Website</strong></span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                  <span>Tư vấn viên: <strong className="text-slate-700">Trần Bảo Ngọc</strong></span>
                  <span>·</span>
                  <span>Chi nhánh: <strong className="text-slate-700">Cơ sở Nguyễn Văn Linh</strong></span>
                  <span>·</span>
                  <span>Ngày cập nhật: <strong className="text-slate-700">12/05/2025 10:30</strong></span>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex shrink-0 flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  {[
                    { icon: Phone, label: 'Gọi điện', color: 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' },
                    { icon: Mail, label: 'Email', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100' },
                    { icon: MessageSquare, label: 'Zalo', color: 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100' },
                  ].map(a => (
                    <button key={a.label} type="button"
                      className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-2 text-[10px] font-bold transition ${a.color}`}>
                      <a.icon className="h-4 w-4" />
                      {a.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  {[
                    { icon: FileText, label: 'Thêm ghi chú' },
                    { icon: Zap, label: 'Tạo công việc' },
                    { icon: MoreHorizontal, label: '...' },
                  ].map(a => (
                    <button key={a.label} type="button"
                      className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition">
                      <a.icon className="h-4 w-4" />
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pipeline progress */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Giai đoạn hiện tại</p>
              <p className="text-[10px] font-semibold text-slate-500">
                Chuyển giai đoạn gần nhất: 11/05/2025 bởi Trần Bảo Ngọc
              </p>
            </div>
            <div className="mt-1.5 flex items-center gap-0">
              {PIPELINE_STEPS.map((step, i) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition ${
                      step.done ? 'border-blue-600 bg-blue-600 text-white' :
                      step.active ? 'border-blue-600 bg-white text-blue-600' :
                      'border-slate-200 bg-white text-slate-300'
                    }`}>
                      {step.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                    </div>
                    <p className={`mt-1 text-[9px] font-black ${step.active ? 'text-blue-600' : step.done ? 'text-slate-600' : 'text-slate-300'}`}>
                      {step.label}
                    </p>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className={`mx-0.5 h-0.5 flex-1 ${step.done ? 'bg-blue-600' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="shrink-0 flex items-center gap-0 overflow-x-auto border-b border-slate-100 bg-white px-4">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-bold transition ${
                    activeTab === tab.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}>
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/40 p-5">
            {activeTab === 'overview' && (
              <div className="grid gap-5 md:grid-cols-2">
                {/* Thông tin nguyện vọng */}
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">Thông tin nguyện vọng</p>
                  <div className="space-y-2 text-sm">
                    {[
                      ['Khối/Grade mong muốn', 'Grade 6'],
                      ['Niên khóa dự kiến', '2025 - 2026'],
                      ['Chương trình quan tâm', 'Song ngữ Quốc tế (Bilingual)'],
                      ['Học bổng quan tâm', 'Học bổng thành tích học tập'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-bold text-slate-800 text-right">{v}</span>
                      </div>
                    ))}
                    <div>
                      <p className="text-slate-500">Ghi chú nguyện vọng</p>
                      <p className="mt-1 rounded-xl bg-slate-50 p-2 text-xs leading-relaxed text-slate-700">
                        Phụ huynh mong muốn con phát triển kỹ năng tiếng Anh và tư duy phản biện.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Thông tin nguồn & phân loại */}
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">Nguồn & Phân loại</p>
                  <div className="space-y-2 text-sm">
                    {[
                      ['Nguồn Lead', 'Website'],
                      ['Chiến dịch', 'Tháng 5 - Ưu đãi học phí'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-bold text-slate-800">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Phân loại Lead</span>
                      <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-700">Tiềm năng cao</span>
                    </div>
                    <div className="flex justify-between gap-2 items-center">
                      <span className="text-slate-500">Điểm Lead</span>
                      <div className="flex items-center gap-1">
                        {'★★★★☆'.split('').map((s, i) => (
                          <span key={i} className={i < 4 ? 'text-amber-400' : 'text-slate-200'}>★</span>
                        ))}
                        <span className="text-xs font-black text-slate-700">85/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checklist hồ sơ mini */}
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">Checklist hồ sơ</p>
                    <span className="text-xs font-bold text-slate-500">{docsCompleted}/{docsTotal} đã hoàn thành</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 mb-3">
                    <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${(docsCompleted/docsTotal)*100}%` }} />
                  </div>
                  <div className="space-y-1.5">
                    {CHECKLIST_DOCS.map(doc => (
                      <div key={doc.label} className="flex items-center gap-2 text-xs">
                        {doc.done
                          ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                          : <Circle className="h-4 w-4 text-slate-300 shrink-0" />}
                        <span className={doc.done ? 'text-slate-600' : 'text-slate-400'}>{doc.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lịch hẹn sắp tới */}
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">Lịch hẹn sắp tới</p>
                    <button type="button" className="text-xs font-bold text-blue-600">Xem tất cả</button>
                  </div>
                  {UPCOMING_APPOINTMENTS.map(apt => (
                    <div key={apt.title} className="rounded-xl border border-slate-100 p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-800">{apt.date}</p>
                          <p className="text-xs font-bold text-slate-700">{apt.title}</p>
                          <p className="text-[10px] text-slate-500">{apt.location}</p>
                        </div>
                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black ${apt.statusColor}`}>{apt.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-3">
                {ACTIVITY_LOG.map((log, i) => {
                  const Icon = log.icon;
                  return (
                    <div key={i} className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${log.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-black text-slate-900">{log.title}</p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="h-3 w-3" />
                            {log.time}
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">bởi {log.by}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{log.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab !== 'overview' && activeTab !== 'activity' && (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
                <p className="text-sm font-semibold text-slate-400">Nội dung tab này đang phát triển...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="shrink-0 w-[280px] overflow-y-auto border-l border-slate-100 bg-white p-4 space-y-4">
          {/* Contact info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Thông tin liên hệ chính</p>
              <button type="button"><Edit3 className="h-3.5 w-3.5 text-slate-400" /></button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[9px] font-black text-blue-700">NH</div>
                <div>
                  <p className="font-black text-slate-800">Nguyễn Thị Hạnh</p>
                  <p className="text-slate-500">Mẹ (Liên hệ chính)</p>
                </div>
              </div>
              {[
                [Phone, '0908 123 456'],
                [Mail, 'hanh.nguyen@example.com'],
                [MessageSquare, '0908 123 456'],
              ].map(([Icon, val], i) => {
                const Ic = Icon as React.ElementType;
                return (
                  <div key={i} className="flex items-center gap-2 text-slate-600">
                    <Ic className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-semibold">{val as string}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ghi chú gần đây */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Ghi chú gần đây</p>
              <button type="button" onClick={() => setActiveTab('activity')} className="text-xs font-bold text-blue-600 hover:text-blue-700">Xem tất cả</button>
            </div>
            <div className="space-y-2">
              {[
                { by: 'Trần Bảo Ngọc', date: '12/05/2025 10:30', note: 'Phụ huynh đồng ý cho bé tham gia test vào thứ 6. Sẽ xem xét học bổng nếu đạt kết quả tốt.' },
                { by: 'Trần Bảo Ngọc', date: '11/05/2025 09:30', note: 'Phụ huynh rất quan tâm chương trình tiếng Anh và hoạt động ngoại khóa.' },
              ].map((note, i) => (
                <div key={i} className="rounded-xl bg-slate-50 p-2.5">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                    <span>{note.date} · {note.by}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700">{note.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Công việc liên quan */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Công việc liên quan</p>
              <button type="button" onClick={() => setActiveTab('activity')} className="text-xs font-bold text-blue-600 hover:text-blue-700">Xem tất cả</button>
            </div>
            {RELATED_TASKS.map(task => (
              <div key={task.title} className="rounded-xl border border-slate-100 p-2.5">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">{task.title}</p>
                    <p className="text-[10px] text-slate-500">{task.date} · {task.by}</p>
                  </div>
                  <button type="button" className="rounded-lg bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 hover:bg-blue-100">
                    {task.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
