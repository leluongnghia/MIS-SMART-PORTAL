'use client';

import React, { useState } from 'react';
import {
  Users, MessageSquare, FileText, CalendarCheck, GraduationCap, TrendingUp,
  RefreshCw, Filter, ChevronRight, Phone, MoreHorizontal, AlertTriangle,
  CreditCard, BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';

// ─── Types ──────────────────────────────────────────────────────────────────
interface KpiCard {
  label: string;
  value: string;
  delta: string;
  deltaUp: boolean;
  compareLabel: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const kpis: KpiCard[] = [
  { label: 'Học sinh đang tuyển', value: '150', delta: 'Hiện tại', deltaUp: true, compareLabel: 'năm học tới', icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'Đang tư vấn', value: '30', delta: '20%', deltaUp: true, compareLabel: 'trong pipeline 150', icon: MessageSquare, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  { label: 'Đã hẹn kiểm tra', value: '25', delta: '16.7%', deltaUp: true, compareLabel: 'trong pipeline 150', icon: FileText, iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
  { label: 'Đã dự kiểm tra', value: '20', delta: '13.3%', deltaUp: true, compareLabel: 'trong pipeline 150', icon: CalendarCheck, iconBg: 'bg-pink-50', iconColor: 'text-pink-600' },
  { label: 'Đã giữ chỗ', value: '20', delta: '13.3%', deltaUp: true, compareLabel: 'trong pipeline 150', icon: GraduationCap, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
  { label: 'Đã nộp hồ sơ', value: '10', delta: '6.7%', deltaUp: true, compareLabel: 'trong pipeline 150', icon: TrendingUp, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
];

const funnelData = [
  { label: 'TIẾP NHẬN', value: 45, percent: '30.0%', color: '#3B82F6', width: '100%' },
  { label: 'ĐANG TƯ VẤN', value: 30, percent: '20.0%', color: '#8B5CF6', width: '67%' },
  { label: 'ĐÃ HẸN KIỂM TRA', value: 25, percent: '16.7%', color: '#06B6D4', width: '56%' },
  { label: 'ĐÃ DỰ KIỂM TRA', value: 20, percent: '13.3%', color: '#F59E0B', width: '44%' },
  { label: 'ĐÃ GIỮ CHỖ', value: 20, percent: '13.3%', color: '#F97316', width: '44%' },
  { label: 'ĐÃ NỘP HỒ SƠ', value: 10, percent: '6.7%', color: '#10B981', width: '22%' },
];

const revenueData = [
  { date: '12/05', giucho: 420, hocphi: 680 },
  { date: '13/05', giucho: 490, hocphi: 750 },
  { date: '14/05', giucho: 560, hocphi: 820 },
  { date: '15/05', giucho: 620, hocphi: 900 },
  { date: '16/05', giucho: 800, hocphi: 1120 },
  { date: '17/05', giucho: 760, hocphi: 1080 },
  { date: '18/05', giucho: 700, hocphi: 1000 },
];

const hotLeads = [
  { name: 'Lê Minh Khang', source: 'Website', time: '10:18', status: 'NEW_LEAD', statusColor: 'bg-blue-100 text-blue-700' },
  { name: 'Trần Bảo Ngọc', source: 'Facebook Ads', time: '10:05', status: 'CONSULTING', statusColor: 'bg-purple-100 text-purple-700' },
  { name: 'Phạm Gia Huy', source: 'Zalo OA', time: '09:52', status: 'NEW_LEAD', statusColor: 'bg-blue-100 text-blue-700' },
  { name: 'Nguyễn Hà My', source: 'Giới thiệu', time: '09:41', status: 'CONSULTING', statusColor: 'bg-purple-100 text-purple-700' },
  { name: 'Đỗ Hoàng Nam', source: 'Google Ads', time: '09:30', status: 'NEW_LEAD', statusColor: 'bg-blue-100 text-blue-700' },
];

const callbackLeads = [
  { name: 'Nguyễn Quốc Bảo', reason: 'Phụ huynh bận', time: 'Hôm nay 11:00' },
  { name: 'Trần Minh Châu', reason: 'Cần tư vấn thêm', time: 'Hôm nay 13:30' },
  { name: 'Phạm Tuấn Kiệt', reason: 'Quan tâm học phí', time: 'Hôm nay 15:00' },
  { name: 'Lê Khánh An', reason: 'Tìm hiểu chương trình', time: 'Hôm nay 16:00' },
  { name: 'Võ Gia Hân', reason: 'Muốn tham quan CSVC', time: 'Hôm nay 17:00' },
];

const upcomingTests = [
  { name: 'Phạm Đức Anh', grade: '1', time: '19/05 08:30', location: 'Cơ sở Q7' },
  { name: 'Trần Ngọc Bảo', grade: '6', time: '19/05 09:30', location: 'Cơ sở Q7' },
  { name: 'Lê Hoàng Minh', grade: '3', time: '19/05 10:30', location: 'Cơ sở Q7' },
  { name: 'Nguyễn Phương Linh', grade: '2', time: '19/05 13:30', location: 'Cơ sở NVL' },
  { name: 'Đỗ Minh Khoa', grade: '7', time: '19/05 14:30', location: 'Cơ sở NVL' },
];

const missingDocs = [
  { name: 'Nguyễn Anh Thư', doc: 'Giấy khai sinh', date: '17/05/2025', urgent: true },
  { name: 'Trần Gia Bảo', doc: 'Hộ khẩu', date: '17/05/2025', urgent: true },
  { name: 'Lê Đăng Khoa', doc: 'Học bạ HK2', date: '16/05/2025', urgent: false },
  { name: 'Phạm Minh Châu', doc: 'Ảnh 3x4', date: '16/05/2025', urgent: false },
  { name: 'Võ Thanh Trúc', doc: 'Giấy khai sinh', date: '15/05/2025', urgent: false },
];

const pendingPayments = [
  { txn: 'GD250518-001', name: 'Nguyễn Anh Thư', amount: '10.000.000 đ', time: '18/05 10:15' },
  { txn: 'GD250517-028', name: 'Trần Gia Bảo', amount: '15.000.000 đ', time: '17/05 16:40' },
  { txn: 'GD250517-017', name: 'Lê Đăng Khoa', amount: '10.000.000 đ', time: '17/05 11:22' },
  { txn: 'GD250516-033', name: 'Phạm Minh Châu', amount: '20.000.000 đ', time: '16/05 15:09' },
  { txn: 'GD250516-021', name: 'Võ Thanh Trúc', amount: '10.000.000 đ', time: '16/05 09:48' },
];

const sourcePieData = [
  { name: 'Website', value: 462, percent: 36, color: '#3B82F6' },
  { name: 'Facebook Ads', value: 359, percent: 28, color: '#8B5CF6' },
  { name: 'Zalo OA', value: 205, percent: 16, color: '#06B6D4' },
  { name: 'Giới thiệu', value: 141, percent: 11, color: '#F59E0B' },
  { name: 'Google Ads', value: 77, percent: 6, color: '#F97316' },
  { name: 'Khác', value: 40, percent: 3, color: '#94A3B8' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtVnd = (n: number) => `${n.toLocaleString('vi-VN')}M`;

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionCard({ title, action, onAction, children }: {
  title: React.ReactNode;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">{title}</div>
        {action && (
          <button type="button" onClick={onAction}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
            {action} <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdmissionsDashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [revenueTab, setRevenueTab] = useState<'week' | 'month' | 'quarter'>('week');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Tổng quan tuyển sinh</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <RefreshCw className="h-3 w-3" />
            Pipeline hiện tại: 150 học sinh đang tuyển cho năm học tới
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs">
            <CalendarCheck className="h-3.5 w-3.5 text-slate-400" />
            Năm học tới 2026-2027
          </div>
          <button type="button" className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50">
            <Filter className="h-3.5 w-3.5" /> Bộ lọc
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-slate-500">{kpi.label}</p>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${kpi.iconBg}`}>
                  <Icon className={`h-4 w-4 ${kpi.iconColor}`} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{kpi.value}</p>
              <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold">
                {kpi.deltaUp
                  ? <><ArrowUpRight className="h-3 w-3 text-green-600" /><span className="text-green-600">↑ {kpi.delta}</span></>
                  : <><ArrowDownRight className="h-3 w-3 text-red-500" /><span className="text-red-500">↓ {kpi.delta}</span></>
                }
                <span className="text-slate-400">{kpi.compareLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Funnel + Revenue Chart + Hot Leads */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr_280px]">

        {/* Phễu tuyển sinh */}
        <SectionCard title="Phễu tuyển sinh">
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_56px_56px] text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
              <span>Giai đoạn</span><span className="text-right">Số lượng</span><span className="text-right">Tỷ lệ</span>
            </div>
            {funnelData.map((item) => (
              <div key={item.label} className="grid grid-cols-[1fr_56px_56px] items-center gap-2">
                <div className="relative h-7 overflow-hidden rounded-md">
                  <div className="absolute inset-0 rounded-md opacity-10" style={{ background: item.color }} />
                  <div className="h-full rounded-md transition-all" style={{ width: item.width, background: item.color }} />
                  <span className="absolute inset-0 flex items-center px-2 text-[10px] font-black text-white mix-blend-luminosity"
                    style={{ color: item.color }}>{item.label}</span>
                </div>
                <span className="text-right text-xs font-black text-slate-800">{item.value.toLocaleString()}</span>
                <span className="text-right text-xs font-semibold text-slate-500">{item.percent}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Doanh thu chart */}
        <SectionCard
          title={<><BarChart3 className="h-4 w-4 text-blue-500" />Doanh thu giữ chỗ / học phí</>}
        >
          <div className="flex items-center gap-1 mb-3">
            {(['week','month','quarter'] as const).map(tab => (
              <button key={tab} type="button"
                onClick={() => setRevenueTab(tab)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  revenueTab === tab ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                {tab === 'week' ? 'Tuần' : tab === 'month' ? 'Tháng' : 'Quý'}
              </button>
            ))}
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={fmtVnd} />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v.toLocaleString('vi-VN')}M đ`, name === 'giucho' ? 'Doanh thu giữ chỗ' : 'Học phí dự kiến']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,.06)', fontSize: 11 }}
                />
                <Line name="giucho" type="monotone" dataKey="giucho" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3, fill: '#3B82F6' }} />
                <Line name="hocphi" type="monotone" dataKey="hocphi" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3, fill: '#8B5CF6' }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-4 text-[11px] font-semibold text-slate-500">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-5 rounded-full bg-blue-500" /> Doanh thu giữ chỗ</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-5 rounded-full bg-purple-500 opacity-60" /> Học phí dự kiến</span>
          </div>
        </SectionCard>

        {/* Lead nóng cần xử lý */}
        <SectionCard title={<><span className="text-orange-500">🔥</span> Lead nóng cần xử lý</>} action="Xem tất cả" onAction={() => onNavigate?.('leads')}>
          <div className="space-y-0">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_80px] text-[10px] font-black uppercase tracking-wide text-slate-400 mb-2">
              <span>Lead</span><span>Nguồn</span><span className="text-right">Trạng thái</span>
            </div>
            {hotLeads.map((lead) => (
              <div key={lead.name}
                className="grid grid-cols-[1fr_auto_80px] items-center gap-2 rounded-xl py-2 hover:bg-slate-50 px-1 -mx-1 cursor-pointer">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800">{lead.name}</p>
                    <p className="text-[10px] text-slate-400">{lead.time}</p>
                  </div>
                </div>
                <p className="text-[10px] font-semibold text-slate-500">{lead.source}</p>
                <span className={`rounded-lg px-1.5 py-0.5 text-[10px] font-black text-right ${lead.statusColor}`}>
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Bottom Row: 5 widgets */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">

        {/* Lead cần gọi lại */}
        <SectionCard title={<><Phone className="h-4 w-4 text-green-500" /> Lead cần gọi lại</>} action="Xem tất cả" onAction={() => onNavigate?.('leads')}>
          <div className="space-y-2">
            {callbackLeads.map((item) => (
              <div key={item.name}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 p-2 text-xs hover:bg-slate-50 cursor-pointer">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800">{item.name}</p>
                  <p className="text-[10px] text-slate-500">{item.reason}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <p className="text-[10px] font-semibold text-slate-500">{item.time}</p>
                  <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-200">
                    <Phone className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Lịch test sắp tới */}
        <SectionCard title={<><CalendarCheck className="h-4 w-4 text-blue-500" /> Lịch test sắp tới</>} action="Xem tất cả" onAction={() => onNavigate?.('appointments')}>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_40px_auto] text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
              <span>Học sinh</span><span>Lớp</span><span>Thời gian</span>
            </div>
            {upcomingTests.map((item) => (
              <div key={item.name} className="grid grid-cols-[1fr_40px_auto] items-center gap-2 text-xs hover:bg-slate-50 rounded-xl px-1 -mx-1 py-1 cursor-pointer">
                <p className="font-bold text-slate-800 truncate">{item.name}</p>
                <p className="text-center font-semibold text-slate-500">{item.grade}</p>
                <div className="text-right">
                  <p className="font-semibold text-slate-600 text-[10px]">{item.time}</p>
                  <p className="text-[10px] text-slate-400">{item.location}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Hồ sơ thiếu giấy tờ */}
        <SectionCard title={<><AlertTriangle className="h-4 w-4 text-amber-500" /> Hồ sơ thiếu giấy tờ</>} action="Xem tất cả" onAction={() => onNavigate?.('documents')}>
          <div className="space-y-2">
            {missingDocs.map((item) => (
              <div key={item.name} className="flex items-center gap-2 rounded-xl border border-slate-100 p-2 text-xs hover:bg-slate-50 cursor-pointer">
                <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.urgent ? 'bg-red-500' : 'bg-amber-400'}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-500">{item.doc}</p>
                </div>
                <p className="shrink-0 text-[10px] font-semibold text-slate-400">{item.date}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Thanh toán chờ xác nhận */}
        <SectionCard title={<><CreditCard className="h-4 w-4 text-indigo-500" /> Thanh toán chờ xác nhận</>} action="Xem tất cả" onAction={() => onNavigate?.('payments')}>
          <div className="space-y-2">
            {pendingPayments.map((item) => (
              <div key={item.txn} className="rounded-xl border border-slate-100 p-2 text-xs hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <p className="font-black text-slate-500 text-[10px]">{item.txn}</p>
                  <p className="font-semibold text-slate-400 text-[10px]">{item.time}</p>
                </div>
                <p className="mt-0.5 font-bold text-slate-800">{item.name}</p>
                <p className="mt-0.5 font-black text-blue-600">{item.amount}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Top nguồn lead - Pie chart */}
        <SectionCard title={<><BarChart3 className="h-4 w-4 text-purple-500" /> Top nguồn lead</>} action="Xem báo cáo" onAction={() => onNavigate?.('reports')}>
          <div className="flex flex-col items-center">
            <div className="h-32 w-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourcePieData} dataKey="value" innerRadius={36} outerRadius={58} paddingAngle={2}>
                    {sourcePieData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v, '']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 w-full space-y-1">
              {sourcePieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-black text-slate-800">{item.percent}% ({item.value})</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">Dữ liệu theo NEW_LEAD trong 7 ngày qua</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
