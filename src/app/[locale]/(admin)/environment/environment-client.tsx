'use client';

import React, { useState, FormEvent } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { 
  Sparkles, MapPin, Calendar, MessageSquareWarning, Search, 
  Plus, CheckCircle2, XCircle, Clock, AlertTriangle, 
  ClipboardCheck, Image as ImageIcon, Download, Trash2, Camera
} from 'lucide-react';

const alertToneStyles: Record<string, { bg: string; text: string; border: string; iconColor: string }> = {
  OVERDUE: { bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-900', iconColor: 'text-red-600' },
  DUE_SOON: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900', iconColor: 'text-amber-600' },
  NEW: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-900', iconColor: 'text-blue-600' },
};

function fmtDate(d: string) {
  if (!d) return '—';
  try { return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d)); }
  catch { return d; }
}

function EnvBadge({ value, label }: { value: string, label: string }) {
  let color = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  
  if (['ACTIVE', 'COMPLETED', 'RESOLVED'].includes(value)) color = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  else if (['IN_PROGRESS'].includes(value)) color = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  else if (['PENDING', 'NEW'].includes(value)) color = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  else if (['FAILED', 'URGENT', 'HIGH'].includes(value)) color = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  else if (['REWORKED', 'MEDIUM'].includes(value)) color = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';

  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${color}`}>{label}</span>;
}

function StatCard({ title, value, desc, icon: Icon, tone, trend }: any) {
  const tones: any = {
    SUCCESS: 'text-emerald-600',
    WARNING: 'text-amber-600',
    DANGER: 'text-rose-600',
    NEUTRAL: 'text-slate-600 dark:text-slate-400',
    INFO: 'text-blue-600'
  };
  const cTone = tones[tone] || tones.NEUTRAL;
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-muted/50 ${cTone}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl font-bold ${cTone}`}>{value}</h3>
            {trend && <span className="text-xs font-medium text-muted-foreground">{trend}</span>}
          </div>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function EnvironmentClient({ initialAreas, initialSchedules, initialReports, initialChecklists, initialStats }: any) {
  const [activeTab, setActiveTab] = useState('overview');
  const [areas, setAreas] = useState<any[]>(initialAreas || []);
  const [schedules, setSchedules] = useState<any[]>(initialSchedules || []);
  const [reports, setReports] = useState<any[]>(initialReports || []);
  const stats = initialStats || {};

  const tabs = [
    ['overview', 'Tổng quan', Sparkles, 0],
    ['areas', 'Khu vực', MapPin, areas.length],
    ['schedule', 'Lịch vệ sinh', Calendar, schedules.filter(s => s.status === 'PENDING' || s.status === 'IN_PROGRESS').length],
    ['reports', 'Phản ánh', MessageSquareWarning, reports.filter(r => r.status === 'NEW').length],
    ['inspections', 'Kiểm tra & Đánh giá', ClipboardCheck, schedules.filter(s => s.status === 'FAILED' || s.status === 'REWORKED').length],
    ['analytics', 'Báo cáo', Download, 0],
  ] as const;

  const handleExportCSV = () => alert("Tính năng xuất báo cáo đang được cập nhật.");

  return <div className="space-y-4">
    <div className="flex flex-col gap-3 rounded-2xl border bg-card/80 p-3 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setActiveTab('schedule')}><Plus className="mr-2 h-4 w-4" />Phân lịch mới</Button>
        <Button onClick={() => setActiveTab('areas')} variant="secondary"><Plus className="mr-2 h-4 w-4" />Khai báo khu vực</Button>
        <Button onClick={() => setActiveTab('reports')} variant="outline"><MessageSquareWarning className="mr-2 h-4 w-4" />Ghi nhận phản ánh</Button>
      </div>
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Tìm khu vực, người phụ trách..." />
      </div>
    </div>

    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl border bg-muted/35 p-1 shadow-sm">
        {tabs.map(([key, label, Icon, count]) => (
          <TabsTrigger key={key} value={key} className="relative shrink-0 gap-2 rounded-xl px-3 py-2 data-[state=active]:shadow-sm">
            <Icon className="h-4 w-4" />
            {label}
            {count > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">{count}</span>}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="m-0 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Tổng khu vực" value={stats.totalAreas} desc="Khu vực vệ sinh" tone="INFO" icon={MapPin} trend="" />
          <StatCard title="Đã hoàn thành" value={stats.completedToday} desc="Trong ngày hôm nay" tone="SUCCESS" icon={CheckCircle2} trend="↑ 2" />
          <StatCard title="Chưa hoàn thành" value={stats.pendingToday} desc="Ca làm việc hôm nay" tone="WARNING" icon={Clock} trend="" />
          <StatCard title="Không đạt" value={stats.failedToday} desc="Cần kiểm tra/làm lại" tone="DANGER" icon={XCircle} trend="↓ 1" />
          <StatCard title="Phản ánh mới" value={stats.newReports} desc="Chưa phân công xử lý" tone="WARNING" icon={MessageSquareWarning} trend="Hôm nay" />
          <StatCard title="Công việc quá hạn" value={stats.overdueTasks} desc="Từ các ca trước" tone="DANGER" icon={AlertTriangle} trend="" />
          <StatCard title="Điểm trung bình" value={`${stats.averageScore}/100`} desc="Đánh giá chất lượng" tone="SUCCESS" icon={Sparkles} trend="↑ 1.5" />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Phản ánh môi trường mới nhất</CardTitle>
                <CardDescription>Các sự cố cần xử lý gấp</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('reports')}>Xem tất cả</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {reports.slice(0, 5).map(r => {
                const borderAccent = r.severity === 'URGENT' || r.severity === 'HIGH' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-amber-500';
                return (
                  <div key={r.id} className={`grid gap-2 rounded-xl border p-3 md:grid-cols-[1.5fr_1fr_auto] bg-card/50 ${borderAccent}`}>
                    <div>
                      <p className="font-semibold text-foreground">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.areaName} • {r.reporterName} ({r.reporterType})</p>
                    </div>
                    <div className="text-sm text-muted-foreground flex flex-col justify-center">
                      <span>{fmtDate(r.reportedAt)}</span>
                      <span>Mức độ: {r.severity === 'URGENT' ? 'Khẩn cấp' : r.severity === 'HIGH' ? 'Cao' : r.severity === 'MEDIUM' ? 'Trung bình' : 'Thấp'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <EnvBadge value={r.status} label={r.status === 'NEW' ? 'Mới' : r.status === 'IN_PROGRESS' ? 'Đang xử lý' : 'Đã xử lý'} />
                    </div>
                  </div>
                );
              })}
              {reports.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Không có phản ánh nào.</p>}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lịch vệ sinh hôm nay</CardTitle>
                <CardDescription>Tiến độ công việc theo ca</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('schedule')}>Xem lịch</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[500px] text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="p-3 text-left">Khu vực</th>
                      <th className="p-3 text-left">Ca / Thời gian</th>
                      <th className="p-3 text-left">Người phụ trách</th>
                      <th className="p-3 text-left">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.filter(s => s.date === '2026-07-06').slice(0, 5).map(s => (
                      <tr key={s.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-semibold">{s.areaName}</td>
                        <td className="p-3">{s.shift} ({s.timeWindow})</td>
                        <td className="p-3">{s.assigneeName}</td>
                        <td className="p-3">
                          <EnvBadge 
                            value={s.status} 
                            label={s.status === 'COMPLETED' ? 'Hoàn thành' : s.status === 'IN_PROGRESS' ? 'Đang làm' : s.status === 'FAILED' ? 'Không đạt' : s.status === 'REWORKED' ? 'Làm lại' : 'Chờ làm'} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="areas" className="m-0 space-y-4">
        <DataTable 
          title="Khu vực vệ sinh" 
          desc="Quản lý danh sách các khu vực cần dọn dẹp, tần suất và tiêu chuẩn"
          columns={['code', 'name', 'type', 'building', 'floor', 'frequency', 'responsibleTeam', 'status']}
          labels={['Mã KV', 'Tên khu vực', 'Loại', 'Tòa nhà', 'Tầng', 'Tần suất', 'Tổ phụ trách', 'Trạng thái']}
          rows={areas}
          statusMap={{'ACTIVE': 'Hoạt động', 'INACTIVE': 'Tạm dừng'}}
        />
      </TabsContent>

      <TabsContent value="schedule" className="m-0 space-y-4">
        <ScheduleTab schedules={schedules} checklists={initialChecklists} />
      </TabsContent>

      <TabsContent value="reports" className="m-0 space-y-4">
        <DataTable 
          title="Phản ánh môi trường" 
          desc="Theo dõi và xử lý các sự cố vệ sinh do người dùng báo cáo"
          columns={['title', 'areaName', 'reporterName', 'severity', 'category', 'status', 'reportedAt']}
          labels={['Sự cố', 'Khu vực', 'Người báo', 'Mức độ', 'Danh mục', 'Trạng thái', 'Thời gian báo']}
          rows={reports}
          statusMap={{'NEW': 'Mới', 'IN_PROGRESS': 'Đang xử lý', 'RESOLVED': 'Đã xử lý', 'URGENT': 'Khẩn cấp', 'HIGH': 'Cao', 'MEDIUM': 'Trung bình', 'LOW': 'Thấp'}}
        />
      </TabsContent>
      
      <TabsContent value="inspections" className="m-0 space-y-4">
        <InspectionTab schedules={schedules} />
      </TabsContent>

      <TabsContent value="analytics" className="m-0 space-y-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Báo cáo chất lượng vệ sinh</CardTitle>
            <CardDescription>Tính năng biểu đồ thống kê điểm số và sự cố theo khu vực đang được cập nhật.</CardDescription>
          </CardHeader>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Sparkles className="mx-auto h-12 w-12 opacity-20 mb-4" />
            <p>Dữ liệu báo cáo sẽ được tổng hợp vào cuối tháng.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>;
}

// Simple DataTable component
function DataTable({ title, desc, rows, columns, labels, statusMap }: any) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                {labels.map((l: string) => <th key={l} className="p-3 text-left font-medium">{l}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, idx: number) => (
                <tr key={row.id || idx} className="border-t hover:bg-muted/30">
                  {columns.map((c: string) => {
                    const v = row[c];
                    const isBadge = ['status', 'severity'].includes(c);
                    const isDate = c.toLowerCase().includes('at') || c.toLowerCase().includes('date');
                    return (
                      <td key={c} className="p-3">
                        {isBadge ? (
                          <EnvBadge value={v} label={statusMap?.[v] || v || '—'} />
                        ) : isDate ? (
                          fmtDate(v)
                        ) : (
                          v || '—'
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={columns.length} className="p-4 text-center text-muted-foreground">Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ScheduleTab({ schedules, checklists }: any) {
  const [selectedSch, setSelectedSch] = useState<any>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_350px]">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Lịch vệ sinh & Tiến độ</CardTitle>
          <CardDescription>Danh sách công việc theo ca và người phụ trách</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-3 text-left">Khu vực</th>
                  <th className="p-3 text-left">Ca làm việc</th>
                  <th className="p-3 text-left">Phụ trách</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s: any) => (
                  <tr key={s.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedSch(s)}>
                    <td className="p-3 font-semibold">{s.areaName}</td>
                    <td className="p-3">{s.shift} <span className="text-xs text-muted-foreground block">{s.date} {s.timeWindow}</span></td>
                    <td className="p-3">{s.assigneeName}</td>
                    <td className="p-3">
                      <EnvBadge 
                        value={s.status} 
                        label={s.status === 'COMPLETED' ? 'Hoàn thành' : s.status === 'IN_PROGRESS' ? 'Đang làm' : s.status === 'FAILED' ? 'Không đạt' : s.status === 'REWORKED' ? 'Làm lại' : 'Chờ làm'} 
                      />
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm">Cập nhật</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Panel */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Checklist Công việc</CardTitle>
          <CardDescription>
            {selectedSch ? `Khu vực: ${selectedSch.areaName}` : 'Chọn một ca làm việc để xem'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedSch ? (
            <div className="space-y-4">
              <div className="text-sm bg-muted/50 p-3 rounded-xl border">
                <p><strong>Phụ trách:</strong> {selectedSch.assigneeName}</p>
                <p><strong>Thời gian:</strong> {selectedSch.timeWindow}</p>
              </div>
              
              <div className="space-y-2">
                <p className="font-semibold text-sm">Các bước thực hiện:</p>
                {/* Fallback to 'Nhà vệ sinh' checklist if area type isn't perfectly mapped for demo */}
                {(checklists['Nhà vệ sinh']).map((c: any) => (
                  <div key={c.id} className="flex items-center gap-2 text-sm p-2 border rounded hover:bg-muted/30">
                    <input type="checkbox" className="rounded" defaultChecked={selectedSch.status === 'COMPLETED'} />
                    <span className={selectedSch.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}>
                      {c.task} {c.isRequired && <span className="text-red-500">*</span>}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t flex flex-col gap-2">
                <Button className="w-full" variant="outline"><Camera className="w-4 h-4 mr-2" /> Tải ảnh nghiệm thu</Button>
                <Button className="w-full" disabled={selectedSch.status === 'COMPLETED'}>
                  {selectedSch.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Xác nhận hoàn thành'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <ClipboardCheck className="mx-auto h-12 w-12 opacity-20 mb-2" />
              <p className="text-sm">Chưa chọn ca làm việc</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InspectionTab({ schedules }: any) {
  const needsInspection = schedules.filter((s: any) => s.status === 'COMPLETED' || s.status === 'FAILED' || s.status === 'REWORKED');

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Kiểm tra & Nghiệm thu</CardTitle>
        <CardDescription>Đánh giá chất lượng vệ sinh sau khi nhân viên báo cáo hoàn thành</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {needsInspection.map((s: any) => (
            <div key={s.id} className="rounded-xl border p-4 bg-card/50 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{s.areaName}</h4>
                  <p className="text-xs text-muted-foreground">{s.shift} • {s.date}</p>
                </div>
                <EnvBadge 
                  value={s.status} 
                  label={s.status === 'COMPLETED' ? 'Hoàn thành' : s.status === 'FAILED' ? 'Không đạt' : 'Đã làm lại'} 
                />
              </div>
              
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Nhân viên:</span> {s.assigneeName}</p>
                {s.checkedByName && <p><span className="text-muted-foreground">Giám sát:</span> {s.checkedByName}</p>}
                {s.score !== null && <p><span className="text-muted-foreground">Điểm đánh giá:</span> <strong className={s.score >= 80 ? 'text-emerald-600' : 'text-red-600'}>{s.score}/100</strong></p>}
                {s.note && <p className="text-red-600 bg-red-50 p-1.5 rounded text-xs mt-2 border border-red-100">Ghi chú lỗi: {s.note}</p>}
              </div>

              <div className="flex gap-2 pt-2 border-t mt-2">
                <Button size="sm" variant="outline" className="flex-1"><ImageIcon className="w-4 h-4 mr-1" /> Ảnh</Button>
                <Button size="sm" variant="secondary" className="flex-1">Chấm điểm</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
