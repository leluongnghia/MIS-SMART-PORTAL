'use client';

import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Users, GraduationCap,
  Download, Calendar, Filter, ChevronDown, RefreshCw,
  ArrowUp, ArrowDown
} from 'lucide-react';

// ─── Dữ liệu phễu ────────────────────────────────────────────────────────────
const PHEU_DATA = [
  { giaiDoan: 'Tiếp nhận mới',  soLuong: 1284, phanTram: 100, mau: '#3B82F6', chuyenDoi: null },
  { giaiDoan: 'Đang tư vấn',    soLuong: 1012, phanTram: 78.8, mau: '#8B5CF6', chuyenDoi: 78.8 },
  { giaiDoan: 'Đặt lịch test',  soLuong: 856,  phanTram: 66.7, mau: '#06B6D4', chuyenDoi: 84.6 },
  { giaiDoan: 'Đã thi test',    soLuong: 734,  phanTram: 57.2, mau: '#F59E0B', chuyenDoi: 85.7 },
  { giaiDoan: 'Nộp hồ sơ',     soLuong: 412,  phanTram: 32.1, mau: '#F97316', chuyenDoi: 56.1 },
  { giaiDoan: 'Giữ chỗ',       soLuong: 186,  phanTram: 14.5, mau: '#EF4444', chuyenDoi: 45.1 },
  { giaiDoan: 'Nhập học',      soLuong: 66,   phanTram: 5.1,  mau: '#10B981', chuyenDoi: 35.5 },
];

const TVV_DATA = [
  { ten: 'Trần Bảo Ngọc', leads: 312, tuVan: 245, giuCho: 48, nhapHoc: 18, tiLe: '7.7%', delta: '+1.2%', up: true },
  { ten: 'Phạm Gia Huy',  leads: 287, tuVan: 198, giuCho: 42, nhapHoc: 15, tiLe: '6.6%', delta: '+0.8%', up: true },
  { ten: 'Nguyễn Thu Hà', leads: 245, tuVan: 180, giuCho: 35, nhapHoc: 12, tiLe: '6.1%', delta: '-0.3%', up: false },
  { ten: 'Đỗ Hoàng Nam',  leads: 198, tuVan: 145, giuCho: 28, nhapHoc: 10, tiLe: '5.9%', delta: '+0.5%', up: true },
  { ten: 'Lê Hoàng Minh', leads: 165, tuVan: 122, giuCho: 22, nhapHoc: 8,  tiLe: '5.6%', delta: '-0.1%', up: false },
];

const NGUON_DATA = [
  { ten: 'Website',      soLuong: 462, phanTram: 36, mau: '#3B82F6' },
  { ten: 'Facebook Ads', soLuong: 359, phanTram: 28, mau: '#8B5CF6' },
  { ten: 'Zalo OA',      soLuong: 205, phanTram: 16, mau: '#06B6D4' },
  { ten: 'Giới thiệu',   soLuong: 141, phanTram: 11, mau: '#10B981' },
  { ten: 'Google Ads',   soLuong: 77,  phanTram: 6,  mau: '#F59E0B' },
  { ten: 'Khác',         soLuong: 40,  phanTram: 3,  mau: '#94A3B8' },
];

// Dữ liệu xu hướng dạng thanh đơn giản
const XU_HUONG_TUAN = [
  { tuan: 'T2', leads: 45, nhapHoc: 4 },
  { tuan: 'T3', leads: 62, nhapHoc: 6 },
  { tuan: 'T4', leads: 58, nhapHoc: 5 },
  { tuan: 'T5', leads: 80, nhapHoc: 8 },
  { tuan: 'T6', leads: 73, nhapHoc: 7 },
  { tuan: 'T7', leads: 42, nhapHoc: 3 },
  { tuan: 'CN', leads: 25, nhapHoc: 2 },
];
const MAX_LEADS = Math.max(...XU_HUONG_TUAN.map(d => d.leads));

const KPI_BC = [
  { ten: 'Tổng leads tháng', gia_tri: '1.284', delta: '↑ 18%', up: true, icon: '👥', bg: 'bg-blue-50', text: 'text-blue-700' },
  { ten: 'Tỷ lệ chuyển đổi', gia_tri: '5.1%', delta: '↑ 0.3%', up: true, icon: '🎯', bg: 'bg-green-50', text: 'text-green-700' },
  { ten: 'Doanh thu giữ chỗ', gia_tri: '1.86 tỷ', delta: '↑ 21%', up: true, icon: '💰', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  { ten: 'Chi phí / Lead', gia_tri: '245k', delta: '↓ 8%', up: false, icon: '📊', bg: 'bg-purple-50', text: 'text-purple-700' },
];

export default function AdmissionsReports() {
  const [kyBaoCao, setKyBaoCao] = useState('Tháng 5/2025');
  const [tabChinh, setTabChinh] = useState<'pheu' | 'tvv' | 'nguon' | 'khoi'>('pheu');

  const TABS = [
    { id: 'pheu' as const, nhan: '📊 Phễu tuyển sinh' },
    { id: 'tvv' as const, nhan: '👤 Hiệu suất TVV' },
    { id: 'nguon' as const, nhan: '🌐 Nguồn lead' },
    { id: 'khoi' as const, nhan: '🏫 Theo khối lớp' },
  ];

  return (
    <div className="space-y-5">
      {/* Tiêu đề */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Báo cáo & Phân tích</h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Phân tích hiệu quả tuyển sinh, chuyển đổi và doanh thu</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select value={kyBaoCao} onChange={e => setKyBaoCao(e.target.value)}
              className="h-9 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-bold text-slate-700 focus:outline-none">
              {['Tháng 5/2025', 'Tháng 4/2025', 'Quý 2/2025', 'Năm 2025'].map(k => <option key={k}>{k}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
          <button type="button" className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <RefreshCw className="h-3.5 w-3.5" /> Làm mới
          </button>
          <button type="button" className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700">
            <Download className="h-3.5 w-3.5" /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* KPI tổng hợp */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {KPI_BC.map(k => (
          <div key={k.ten} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl ${k.bg}`}>{k.icon}</div>
            <p className="text-[11px] font-semibold text-slate-500">{k.ten}</p>
            <p className="text-2xl font-black text-slate-900">{k.gia_tri}</p>
            <p className={`text-[10px] font-bold flex items-center gap-0.5 ${k.up ? 'text-green-600' : 'text-red-500'}`}>
              {k.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {k.delta} so với tháng trước
            </p>
          </div>
        ))}
      </div>

      {/* Xu hướng tuần - mini bar chart */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-black text-slate-900">Xu hướng leads theo ngày</p>
            <p className="text-xs font-semibold text-slate-500">Tuần 12/05 - 18/05/2025</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded bg-blue-500" /> Leads mới</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded bg-green-500" /> Nhập học</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-32">
          {XU_HUONG_TUAN.map(d => (
            <div key={d.tuan} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[9px] font-black text-slate-500">{d.leads}</span>
              <div className="flex w-full gap-0.5">
                <div className="flex-1 rounded-t-sm bg-blue-400 transition-all" style={{ height: `${(d.leads / MAX_LEADS) * 80}px` }} />
                <div className="flex-1 rounded-t-sm bg-green-400 transition-all" style={{ height: `${(d.nhapHoc / MAX_LEADS) * 80}px` }} />
              </div>
              <span className="text-[9px] font-bold text-slate-400">{d.tuan}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs báo cáo chi tiết */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex gap-0 border-b border-slate-100 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setTabChinh(tab.id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-xs font-bold transition ${tabChinh === tab.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              {tab.nhan}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Phễu tuyển sinh */}
          {tabChinh === 'pheu' && (
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400 mb-3">Phễu chuyển đổi tháng 5/2025</p>
              {PHEU_DATA.map((item, i) => (
                <div key={item.giaiDoan} className="flex items-center gap-3">
                  <div className="w-28 shrink-0 text-right text-xs font-bold text-slate-700">{item.giaiDoan}</div>
                  <div className="flex-1 relative">
                    <div className="h-9 rounded-xl overflow-hidden bg-slate-100">
                      <div className="h-full rounded-xl flex items-center justify-between px-3 text-white text-xs font-black transition-all"
                        style={{ width: `${item.phanTram}%`, backgroundColor: item.mau }}>
                        <span>{item.soLuong.toLocaleString()}</span>
                        <span>{item.phanTram}%</span>
                      </div>
                    </div>
                  </div>
                  {item.chuyenDoi && (
                    <div className="w-24 shrink-0 text-xs font-bold text-green-600">
                      ↓ {item.chuyenDoi}% tiếp tục
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Hiệu suất TVV */}
          {tabChinh === 'tvv' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-black uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="pb-3 pr-3 text-left">Tư vấn viên</th>
                    <th className="pb-3 px-3 text-center">Leads</th>
                    <th className="pb-3 px-3 text-center">Đang tư vấn</th>
                    <th className="pb-3 px-3 text-center">Giữ chỗ</th>
                    <th className="pb-3 px-3 text-center">Nhập học</th>
                    <th className="pb-3 px-3 text-center">Tỷ lệ NHK</th>
                    <th className="pb-3 pl-3 text-center">So tháng trước</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {TVV_DATA.map((tvv, i) => (
                    <tr key={tvv.ten} className="hover:bg-slate-50">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                            {tvv.ten.split(' ').slice(-2).map(w => w[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{tvv.ten}</p>
                            <p className="text-[10px] text-slate-400">Xếp hạng #{i + 1}</p>
                          </div>
                        </div>
                      </td>
                      {[tvv.leads, tvv.tuVan, tvv.giuCho, tvv.nhapHoc].map((v, j) => (
                        <td key={j} className="py-3 px-3 text-center font-black text-slate-800">{v}</td>
                      ))}
                      <td className="py-3 px-3 text-center">
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-black text-green-700">{tvv.tiLe}</span>
                      </td>
                      <td className="py-3 pl-3 text-center">
                        <span className={`flex items-center justify-center gap-0.5 text-xs font-bold ${tvv.up ? 'text-green-600' : 'text-red-500'}`}>
                          {tvv.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {tvv.delta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Nguồn lead */}
          {tabChinh === 'nguon' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400 mb-3">Phân bổ theo nguồn</p>
                <div className="space-y-3">
                  {NGUON_DATA.map(n => (
                    <div key={n.ten}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">{n.ten}</span>
                        <span className="font-black text-slate-900">{n.soLuong} <span className="font-semibold text-slate-400">({n.phanTram}%)</span></span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100">
                        <div className="h-2.5 rounded-full transition-all" style={{ width: `${n.phanTram}%`, backgroundColor: n.mau }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400 mb-3">Chi phí & ROI theo nguồn</p>
                <div className="space-y-2">
                  {[
                    { nguon: 'Facebook Ads', chiPhi: '12.5M', chiPhiLead: '35k', roi: '420%' },
                    { nguon: 'Google Ads',   chiPhi: '8.2M',  chiPhiLead: '106k', roi: '215%' },
                    { nguon: 'Zalo OA',      chiPhi: '3.1M',  chiPhiLead: '15k', roi: '890%' },
                    { nguon: 'Website',      chiPhi: '5.0M',  chiPhiLead: '11k', roi: '1200%' },
                  ].map(r => (
                    <div key={r.nguon} className="flex items-center gap-2 rounded-xl border border-slate-100 p-3 text-xs">
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{r.nguon}</p>
                        <p className="text-slate-500">Chi phí: {r.chiPhi} · {r.chiPhiLead}/lead</p>
                      </div>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 font-black text-green-700">ROI {r.roi}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Theo khối */}
          {tabChinh === 'khoi' && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[
                { khoi: 'Lớp 1', soLuong: 284, nhapHoc: 18, tiLe: '6.3%' },
                { khoi: 'Lớp 2', soLuong: 198, nhapHoc: 12, tiLe: '6.1%' },
                { khoi: 'Lớp 3', soLuong: 175, nhapHoc: 10, tiLe: '5.7%' },
                { khoi: 'Lớp 6', soLuong: 312, nhapHoc: 14, tiLe: '4.5%' },
                { khoi: 'Lớp 7', soLuong: 145, nhapHoc: 6,  tiLe: '4.1%' },
                { khoi: 'Lớp 10',soLuong: 170, nhapHoc: 6,  tiLe: '3.5%' },
              ].map(k => (
                <div key={k.khoi} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="font-black text-slate-900">{k.khoi}</p>
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-black text-green-700">{k.tiLe}</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tổng leads</span>
                      <span className="font-bold text-slate-800">{k.soLuong}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nhập học</span>
                      <span className="font-bold text-green-600">{k.nhapHoc}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 mt-2">
                      <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${(k.soLuong / 312) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
