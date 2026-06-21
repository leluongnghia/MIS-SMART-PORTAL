'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, GitBranch, Info, Plus, Settings, Target } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Dialog } from '@/src/components/ui/dialog';
import { cn } from '@/src/lib/utils';

type OkrData = {
  stats: { total: number; done: number; inProgress: number; notStarted: number; risk: number; progress: number; onTrack: number; linkedKpis: number };
  pillars: Array<{ key: string; name: string; desc: string; color: string; total: number; done: number; risk: number; objectives: number; keyResults: number; doneKeyResults: number; progress: number; confidence: number; status: string; ownerName: string; ownerRole: string; workspaceCount: number; workspaces?: string[] }>;
  alerts: Array<{ id: string; title: string; workspaceId: string; deadline?: string; type: string; description?: string; }>;
  followUps: Array<{ id: string; title: string; assignedName?: string; deadline?: string; urgent: boolean; workspaceId?: string; description?: string; }>;
  workspaces: Array<{ id: string; name: string }>;
};

export default function OkrDashboard({ initialData }: { initialData?: OkrData }) {
  const router = useRouter();
  const pathname = usePathname();
  const data = initialData || { stats: { total: 0, done: 0, inProgress: 0, notStarted: 0, risk: 0, progress: 0, onTrack: 0, linkedKpis: 0 }, pillars: [], alerts: [], followUps: [], workspaces: [] };
  const [workspace, setWorkspace] = useState('ALL');
  const [pillarFilter, setPillarFilter] = useState('ALL');
  const [showSettings, setShowSettings] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [showAllFollowUps, setShowAllFollowUps] = useState(false);

  // States cho modal chi tiết
  const [selectedAlert, setSelectedAlert] = useState<OkrData['alerts'][0] | null>(null);
  const [selectedFollowUp, setSelectedFollowUp] = useState<OkrData['followUps'][0] | null>(null);

  const pillars = useMemo(() => {
    let result = data.pillars;
    if (pillarFilter !== 'ALL') {
      result = result.filter(p => p.name === pillarFilter);
    }
    if (workspace !== 'ALL') {
      result = result.filter(p => p.workspaces?.includes(workspace));
    }
    return result;
  }, [data.pillars, pillarFilter, workspace]);

  const alerts = useMemo(() => {
    let result = data.alerts;
    if (workspace !== 'ALL') {
      result = result.filter(a => a.workspaceId === workspace);
    }
    return showAllAlerts ? result : result.slice(0, 3);
  }, [data.alerts, workspace, showAllAlerts]);

  const followUps = useMemo(() => {
    let result = data.followUps;
    if (workspace !== 'ALL') {
      result = result.filter(f => f.workspaceId === workspace);
    }
    return showAllFollowUps ? result : result.slice(0, 5);
  }, [data.followUps, workspace, showAllFollowUps]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Chiến lược & OKRs</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">REAL DATA: tính từ công việc, người phụ trách và bộ phận trong DB.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select className="rounded-md border-0 py-1.5 pl-3 pr-8 text-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"><option>Quý hiện tại</option></select>
          <select value={workspace} onChange={e => setWorkspace(e.target.value)} className="rounded-md border-0 py-1.5 pl-3 pr-8 text-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"><option value="ALL">Cơ sở/Bộ phận: Tất cả</option>{data.workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          <select value={pillarFilter} onChange={e => setPillarFilter(e.target.value)} className="rounded-md border-0 py-1.5 pl-3 pr-8 text-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"><option value="ALL">Trụ cột: Tất cả</option>{[...new Set(data.pillars.map(p => p.name))].map(name => <option key={name} value={name}>{name}</option>)}</select>
          <Button variant="outline" className="gap-2" onClick={() => setShowSettings(v => !v)}><Settings className="h-4 w-4" />Tùy chỉnh</Button>
        </div>
      </div>

      {showSettings && <Card className="border-blue-100 bg-blue-50/50"><CardContent className="p-4 text-sm font-semibold text-blue-700">Bảng tùy chỉnh đang hoạt động: lọc trụ cột/bộ phận, cảnh báo và việc theo dõi đều lấy từ DB.</CardContent></Card>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat title="Tiến độ OKR toàn trường" value={`${data.stats.progress}%`} sub={`Hoàn thành ${data.stats.done}/${data.stats.total}`} icon={Target} color="blue" />
        <Stat title="Mục tiêu đúng tiến độ" value={`${data.stats.onTrack}%`} sub={`${Math.max(0, data.stats.total - data.stats.risk)} / ${data.stats.total} mục tiêu`} icon={CheckCircle2} color="emerald" />
        <Stat title="Mục tiêu có rủi ro" value={`${data.stats.risk}`} sub="Công việc ưu tiên cao chưa xong" icon={AlertTriangle} color="orange" />
        <Stat title="KPI liên kết" value={`${data.stats.linkedKpis}`} sub="KPI/việc/bộ phận đang theo dõi" icon={GitBranch} color="indigo" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <div className="space-y-6 xl:col-span-3">
          <Card>
            <CardHeader className="p-4 pb-2"><CardTitle className="text-base font-bold">Tổng quan OKR theo trụ cột chiến lược</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-y bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50"><tr>{['Trụ cột','Tiến độ','Mục tiêu','Kết quả chính','Chủ sở hữu','Tự tin','Trạng thái'].map(h => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr></thead><tbody className="divide-y">{pillars.map(row => <tr key={row.key} className="hover:bg-slate-50 dark:hover:bg-slate-900/50"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className={cn('flex h-10 w-10 items-center justify-center rounded-lg text-white', row.color)}><Target className="h-5 w-5" /></div><div><p className="font-bold text-blue-600">{row.name}</p><p className="text-[11px] text-slate-500">{row.desc}</p></div></div></td><td className="px-4 py-3"><div className="flex items-center gap-2"><b>{row.progress}%</b><div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${row.progress}%` }} /></div></div></td><td className="px-4 py-3 font-bold">{row.objectives}</td><td className="px-4 py-3 font-bold">{row.doneKeyResults}/{row.keyResults}</td><td className="px-4 py-3"><b className="text-xs">{row.ownerName}</b><p className="text-[10px] text-slate-500">{row.ownerRole}</p></td><td className="px-4 py-3 font-bold text-emerald-600">{row.confidence}/10</td><td className="px-4 py-3"><Badge className={row.status === 'Có rủi ro' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'}>{row.status}</Badge></td></tr>)}</tbody></table></div>
            </CardContent>
          </Card>

          <Card><CardHeader className="p-4"><CardTitle className="text-base font-bold">Bản đồ liên kết OKR</CardTitle></CardHeader><CardContent className="p-4"><div className="grid gap-3 md:grid-cols-4">{pillars.map(row => <div key={row.key} className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-950"><div className={cn('mb-3 h-2 rounded-full', row.color)} /><h4 className="font-black">{row.name}</h4><p className="text-xs text-slate-500">{row.workspaceCount} bộ phận • {row.keyResults} KR</p><div className="mt-3 text-2xl font-black text-blue-600">{row.progress}%</div></div>)}</div></CardContent></Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b p-4">
              <CardTitle className="text-base">Cảnh báo mục tiêu</CardTitle>
              <button onClick={() => setShowAllAlerts(v => !v)} className="text-xs font-bold text-blue-600">{showAllAlerts ? 'Thu gọn' : 'Xem tất cả'}</button>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {alerts.length ? alerts.map(a => (
                <div key={a.id} className="flex gap-3 p-4 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedAlert(a)}>
                  <AlertCircle className="mt-0.5 h-5 w-5 text-orange-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.workspaceId} • hạn {a.deadline || '—'}</p>
                  </div>
                </div>
              )) : <Empty text="Không có cảnh báo" />}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b p-4">
              <CardTitle className="text-base">Việc cần theo dõi tuần này</CardTitle>
              <button onClick={() => setShowAllFollowUps(v => !v)} className="text-xs font-bold text-blue-600">{showAllFollowUps ? 'Thu gọn' : 'Xem tất cả'}</button>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {followUps.map(t => (
                <div key={t.id} className="flex gap-3 p-4 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedFollowUp(t)}>
                  <div className="mt-1 h-4 w-4 rounded border shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.title}</p>
                    <p className="text-xs text-slate-500">{t.assignedName || 'Chưa phân công'}</p>
                  </div>
                  <span className={cn('text-xs shrink-0', t.urgent ? 'text-red-500' : 'text-slate-500')}>{t.deadline}</span>
                </div>
              ))}
              <div className="p-3">
                <Button variant="ghost" className="w-full gap-2 text-blue-600"><Plus className="h-4 w-4" />Thêm việc theo dõi</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Cảnh báo */}
      <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)} title="Chi tiết Cảnh báo">
        {selectedAlert && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-orange-500 shrink-0" />
              <h3 className="font-bold text-lg">{selectedAlert.title}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Bộ phận liên quan</p>
                <p className="font-medium">{selectedAlert.workspaceId}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Thời hạn</p>
                <p className="font-medium text-red-600">{selectedAlert.deadline || 'Không có'}</p>
              </div>
            </div>
            {selectedAlert.description && (
              <div>
                <p className="text-slate-500 mb-1 text-sm">Mô tả chi tiết</p>
                <p className="text-sm bg-slate-50 p-3 rounded-md">{selectedAlert.description}</p>
              </div>
            )}
            <div className="pt-4 flex justify-end gap-2 border-t">
              <Button variant="outline" onClick={() => setSelectedAlert(null)}>Đóng</Button>
              <Button onClick={() => router.push(`${pathname}/${selectedAlert.id}`)}>Xử lý ngay</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Modal Việc cần theo dõi */}
      <Dialog open={!!selectedFollowUp} onOpenChange={(open) => !open && setSelectedFollowUp(null)} title="Chi tiết Công việc">
        {selectedFollowUp && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-500 shrink-0" />
              <h3 className="font-bold text-lg leading-tight">{selectedFollowUp.title}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Người phụ trách</p>
                <p className="font-medium">{selectedFollowUp.assignedName || 'Chưa phân công'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Hạn chót</p>
                <p className={cn("font-medium", selectedFollowUp.urgent && "text-red-600")}>{selectedFollowUp.deadline || 'Không có'}</p>
              </div>
            </div>
            {selectedFollowUp.description && (
              <div>
                <p className="text-slate-500 mb-1 text-sm">Nội dung công việc</p>
                <p className="text-sm bg-slate-50 p-3 rounded-md">{selectedFollowUp.description}</p>
              </div>
            )}
            <div className="pt-4 flex justify-end gap-2 border-t">
              <Button variant="outline" onClick={() => setSelectedFollowUp(null)}>Đóng</Button>
              <Button onClick={() => router.push(`${pathname}/${selectedFollowUp.id}`)}>Cập nhật tiến độ</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function Stat({ title, value, sub, icon: Icon, color }: any) {
  const colors: any = { blue: 'bg-blue-600', emerald: 'bg-emerald-600', orange: 'bg-orange-500', indigo: 'bg-indigo-600' };
  return <Card><CardContent className="flex items-center gap-4 p-4"><div className={cn('flex h-12 w-12 items-center justify-center rounded-xl text-white', colors[color])}><Icon className="h-6 w-6" /></div><div><p className="text-sm font-bold text-slate-600 dark:text-slate-300">{title}</p><h3 className="text-2xl font-black">{value}</h3><p className="text-xs text-slate-500">{sub}</p></div></CardContent></Card>;
}
function Empty({ text }: { text: string }) { return <div className="p-4 text-sm text-slate-500"><Info className="mb-2 h-5 w-5" />{text}</div>; }

