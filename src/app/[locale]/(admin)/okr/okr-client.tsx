'use client';

import React from 'react';
import { Users, GraduationCap, Target, CheckCircle2, AlertTriangle, GitBranch, TrendingUp, AlertCircle, Plus, ArrowRight, Info, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Dialog } from '@/src/components/ui/dialog';
import { cn } from '@/src/lib/utils';
import { serverStorage } from '@/src/libs/client/server-storage';

type Pillar = { id: string; name: string; desc: string; progress: number; objectives: number; doneObjectives: number; keyResults: number; doneKeyResults: number; owner: string; ownerRole: string; confidence: number; status: string; color: string };
type Alert = { id: string; severity: string; pillarId: string; title: string; detail: string; time: string };
type FollowUp = { id: string; text: string; user: string; date: string; pillarId: string; done: boolean };
type Node = { id: string; pillarId: string; type: 'objective' | 'kr' | 'initiative'; title: string; x: number; y: number };

const sectionDefaults = { stats: true, pillars: true, map: true, alerts: true, followUps: true };
const pillarIcons: Record<string, any> = { admissions: Users, training: GraduationCap, hr: Target, operations: SettingsIcon };
const nodeClass = { objective: 'bg-blue-600 text-white', kr: 'bg-purple-500 text-white rotate-45', initiative: 'bg-emerald-500 text-white' };

export default function OkrDashboard({ initialData }: { initialData?: any }) {
  const data = initialData || {};
  const [quarter, setQuarter] = React.useState(data.quarters?.[0] || 'Quý 2/2025 (01/04 - 30/06/2025)');
  const [campus, setCampus] = React.useState(data.campuses?.[0] || 'Cơ sở: Tất cả');
  const [scope, setScope] = React.useState(data.scopes?.[0] || 'Khối phụ trách: Tất cả');
  const [activePillar, setActivePillar] = React.useState('all');
  const [sections, setSections] = React.useState<Record<string, boolean>>(sectionDefaults);
  const [customizeOpen, setCustomizeOpen] = React.useState(false);
  const [mapOpen, setMapOpen] = React.useState(false);
  const [alertsOpen, setAlertsOpen] = React.useState(false);
  const [followOpen, setFollowOpen] = React.useState(false);
  const [detail, setDetail] = React.useState<any>(null);
  const [followUps, setFollowUps] = React.useState<FollowUp[]>(data.followUps || []);
  const [newFollow, setNewFollow] = React.useState('');

  React.useEffect(() => {
    const saved = serverStorage.getItem('mis_okr_sections');
    if (saved) try { setSections({ ...sectionDefaults, ...JSON.parse(saved) }); } catch {}
  }, []);

  const pillars: Pillar[] = data.pillars || [];
  const alerts: Alert[] = data.alerts || [];
  const nodes: Node[] = data.alignmentNodes || [];
  const selectedPillarId = activePillar === 'all' ? undefined : activePillar;
  const visiblePillars = selectedPillarId ? pillars.filter(p => p.id === selectedPillarId) : pillars;
  const visibleAlerts = selectedPillarId ? alerts.filter(a => a.pillarId === selectedPillarId) : alerts;
  const visibleFollowUps = selectedPillarId ? followUps.filter(f => f.pillarId === selectedPillarId) : followUps;
  const visibleNodes = selectedPillarId ? nodes.filter(n => n.pillarId === selectedPillarId) : nodes;

  const saveSection = (key: string, checked: boolean) => setSections(s => {
    const next = { ...s, [key]: checked };
    serverStorage.setItem('mis_okr_sections', JSON.stringify(next));
    return next;
  });

  const addFollowUp = () => {
    if (!newFollow.trim()) return;
    setFollowUps(items => [{ id: `local-${Date.now()}`, text: newFollow.trim(), user: 'Người dùng hiện tại', date: new Date().toLocaleDateString('vi-VN'), pillarId: selectedPillarId || 'operations', done: false }, ...items]);
    setNewFollow('');
    setFollowOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Chiến lược & OKRs</h2><p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi tiến độ thực hiện chiến lược và các mục tiêu trọng yếu (OKRs)</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={quarter} onChange={e => setQuarter(e.target.value)} className="block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">{(data.quarters || []).map((q: string) => <option key={q}>{q}</option>)}</select>
          <select value={campus} onChange={e => setCampus(e.target.value)} className="hidden md:block w-32 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">{(data.campuses || []).map((q: string) => <option key={q}>{q}</option>)}</select>
          <select value={scope} onChange={e => { setScope(e.target.value); const p = pillars.find(x => e.target.value.includes(x.name)); setActivePillar(p?.id || 'all'); }} className="hidden lg:block w-40 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">{(data.scopes || []).map((q: string) => <option key={q}>{q}</option>)}</select>
          <Button variant="outline" className="gap-2" onClick={() => setCustomizeOpen(true)}><SettingsIcon className="h-4 w-4" />Tùy chỉnh</Button>
        </div>
      </div>

      {sections.stats && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tiến độ OKR toàn trường" value={`${data.summary?.progress ?? 0}%`} icon={Target} tone="blue" footer="↑ 8% so với Quý 1/2025" />
        <StatCard title="Mục tiêu đúng tiến độ" value={`${data.summary?.onTrack ?? 0}%`} sub="26 / 38 mục tiêu" icon={CheckCircle2} tone="emerald" footer="↑ 10% so với Quý 1/2025" />
        <StatCard title="Mục tiêu có rủi ro" value={`${data.summary?.risk ?? 0}%`} sub="7 / 38 mục tiêu" icon={AlertTriangle} tone="orange" footer="↓ -3% so với Quý 1/2025" />
        <StatCard title="KPI liên kết" value={`${data.summary?.linkedKpis ?? 0}`} sub="KPI đang theo dõi" icon={GitBranch} tone="indigo" footer="↑ 12 KPI so với Quý 1/2025" />
      </div>}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          {sections.pillars && <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-base font-bold">Tổng quan OKR theo 4 trụ cột chiến lược</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-xs text-slate-500 bg-slate-50 uppercase border-y"><tr><th className="px-4 py-3">Trụ cột</th><th className="px-4 py-3 text-center">Tiến độ</th><th className="px-4 py-3 text-center">Mục tiêu</th><th className="px-4 py-3 text-center">Kết quả chính</th><th className="px-4 py-3">Chủ sở hữu</th><th className="px-4 py-3 text-center">Tự tin</th><th className="px-4 py-3">Trạng thái</th></tr></thead><tbody className="divide-y">{visiblePillars.map(row => { const Icon = pillarIcons[row.id] || Target; return <tr key={row.id} onClick={() => { setActivePillar(row.id); setDetail(row); }} className="hover:bg-slate-50 cursor-pointer"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className={cn('w-10 h-10 rounded-lg text-white flex items-center justify-center', row.color)}><Icon className="h-5 w-5" /></div><div><p className="font-bold text-blue-600">{row.name}</p><p className="text-[11px] text-slate-500">{row.desc}</p></div></div></td><td className="px-4 py-3"><div className="flex items-center gap-2 justify-center"><b>{row.progress}%</b><div className="w-16 h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${row.progress}%` }} /></div></div></td><td className="px-4 py-3 text-center"><b>{row.doneObjectives} / {row.objectives}</b><p className="text-[10px] text-slate-400 uppercase">mục tiêu</p></td><td className="px-4 py-3 text-center"><b>{row.doneKeyResults} / {row.keyResults}</b><p className="text-[10px] text-slate-400 uppercase">KQ chính</p></td><td className="px-4 py-3"><p className="text-xs font-bold">{row.owner}</p><p className="text-[10px] text-slate-500">{row.ownerRole}</p></td><td className="px-4 py-3 text-center"><b className={row.confidence >= 7 ? 'text-emerald-600' : 'text-orange-600'}>{row.confidence}</b><span className="text-xs text-slate-400">/10</span></td><td className="px-4 py-3"><Badge className={row.status.includes('rủi ro') ? 'text-orange-600 border-orange-200 bg-orange-50' : 'text-emerald-600 border-emerald-200 bg-emerald-50'}>{row.status}</Badge></td></tr>})}</tbody></table></div><div className="p-3 text-center border-t bg-slate-50/50"><Button variant="ghost" onClick={() => setDetail(visiblePillars[0] || pillars[0])} className="text-sm font-bold text-blue-600">Xem chi tiết OKR theo trụ cột <ArrowRight className="h-4 w-4 ml-1" /></Button></div></CardContent></Card>}

          {sections.map && <Card><CardHeader className="p-4 pb-0 flex flex-row items-center justify-between"><CardTitle className="text-base font-bold">Bản đồ liên kết OKR (Alignment Map)</CardTitle><div className="flex items-center gap-4 text-xs"><span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-full bg-blue-600" />Mục tiêu</span><span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-sm bg-purple-500 rotate-45" />Kết quả chính</span><span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />Sáng kiến / Dự án</span></div></CardHeader><CardContent className="p-4"><PillarTabs pillars={pillars} active={activePillar} setActive={setActivePillar} /><AlignmentMap nodes={visibleNodes} /><div className="mt-3 text-center"><Button variant="outline" onClick={() => setMapOpen(true)} className="text-blue-600 border-blue-200 bg-blue-50">Xem bản đồ đầy đủ <ArrowRight className="h-4 w-4 ml-1" /></Button></div></CardContent></Card>}
        </div>

        <div className="xl:col-span-1 space-y-6">
          {sections.alerts && <Card><CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between"><CardTitle className="text-base font-bold">Cảnh báo mục tiêu</CardTitle><button onClick={() => setAlertsOpen(true)} className="text-xs font-medium text-blue-600">Xem tất cả</button></CardHeader><CardContent className="p-0"><div className="divide-y">{visibleAlerts.map(a => <button key={a.id} onClick={() => setDetail(a)} className="w-full p-4 flex gap-3 text-left hover:bg-slate-50"><AlertIcon severity={a.severity} /><div><div className="flex justify-between gap-2 mb-1"><p className="text-sm font-bold leading-tight">{a.title}</p><span className="text-[10px] text-slate-400 shrink-0">{a.time}</span></div><p className="text-xs text-slate-500 leading-relaxed">{a.detail}</p></div></button>)}</div><div className="p-3 text-center border-t"><Button variant="ghost" onClick={() => setAlertsOpen(true)} className="w-full text-sm text-blue-600">Xem tất cả cảnh báo <ArrowRight className="h-4 w-4 ml-1" /></Button></div></CardContent></Card>}

          {sections.followUps && <Card><CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between"><CardTitle className="text-base font-bold">Việc cần theo dõi tuần này</CardTitle><button onClick={() => setFollowOpen(true)} className="text-xs font-medium text-blue-600">Xem tất cả</button></CardHeader><CardContent className="p-0"><div className="divide-y">{visibleFollowUps.map(task => <div key={task.id} className="p-4 flex gap-3 hover:bg-slate-50"><input type="checkbox" checked={task.done} onChange={() => setFollowUps(items => items.map(x => x.id === task.id ? { ...x, done: !x.done } : x))} className="mt-1 h-4 w-4" /><button onClick={() => setDetail(task)} className="flex-1 min-w-0 text-left"><p className={cn('text-sm font-medium truncate', task.done && 'line-through text-slate-400')}>{task.text}</p><p className="text-xs text-slate-500">{task.user}</p></button><span className="text-xs font-medium text-red-500 shrink-0">{task.date}</span></div>)}</div><div className="p-3 text-center border-t"><Button variant="ghost" onClick={() => setFollowOpen(true)} className="w-full text-sm text-blue-600 gap-2"><Plus className="h-4 w-4" /> Thêm việc theo dõi</Button></div></CardContent></Card>}
        </div>
      </div>

      <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen} title="Tùy chỉnh OKR" description="Bật/tắt các khối thông tin trên màn OKR."><div className="grid gap-3 sm:grid-cols-2">{Object.keys(sectionDefaults).map(k => <label key={k} className="flex gap-3 rounded-xl border p-3"><input type="checkbox" checked={sections[k]} onChange={e => saveSection(k, e.target.checked)} /><span className="font-bold">{({ stats: 'Chỉ số tổng quan', pillars: 'Bảng trụ cột', map: 'Alignment Map', alerts: 'Cảnh báo', followUps: 'Việc theo dõi' } as any)[k]}</span></label>)}</div><div className="mt-4 text-right"><Button onClick={() => { setSections(sectionDefaults); serverStorage.setItem('mis_okr_sections', JSON.stringify(sectionDefaults)); }}>Khôi phục mặc định</Button></div></Dialog>
      <Dialog open={mapOpen} onOpenChange={setMapOpen} title="Bản đồ OKR đầy đủ" className="max-w-5xl"><PillarTabs pillars={pillars} active={activePillar} setActive={setActivePillar} /><AlignmentMap nodes={visibleNodes} large /></Dialog>
      <Dialog open={alertsOpen} onOpenChange={setAlertsOpen} title="Tất cả cảnh báo mục tiêu"><div className="space-y-3">{visibleAlerts.map(a => <button key={a.id} onClick={() => setDetail(a)} className="w-full rounded-xl border p-3 text-left hover:bg-slate-50"><b>{a.title}</b><p className="text-sm text-slate-500">{a.detail}</p></button>)}</div></Dialog>
      <Dialog open={followOpen} onOpenChange={setFollowOpen} title="Việc cần theo dõi"><div className="flex gap-2 mb-4"><input value={newFollow} onChange={e => setNewFollow(e.target.value)} placeholder="Nhập việc cần theo dõi..." className="flex-1 rounded-lg border px-3 py-2 text-sm" /><Button onClick={addFollowUp}>Thêm</Button></div><div className="space-y-2">{visibleFollowUps.map(f => <div key={f.id} className="rounded-lg border p-3 text-sm">{f.text}</div>)}</div></Dialog>
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)} title="Chi tiết"><pre className="max-h-[420px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100 whitespace-pre-wrap">{JSON.stringify(detail, null, 2)}</pre></Dialog>
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, tone, footer }: any) { return <Card><CardContent className="p-4"><p className="text-sm font-bold mb-2">{title}</p><div className="flex items-center gap-3"><div className={cn('w-12 h-12 rounded-full flex items-center justify-center', `bg-${tone}-100 text-${tone}-600`)}><Icon className="h-6 w-6" /></div><div><h3 className={cn('text-2xl font-black', `text-${tone}-600`)}>{value}</h3>{sub && <p className="text-xs text-slate-500">{sub}</p>}</div></div></CardContent><div className="px-4 py-2 bg-slate-50 border-t text-xs text-emerald-600 font-medium flex items-center gap-1"><TrendingUp className="h-3 w-3" />{footer}</div></Card> }
function PillarTabs({ pillars, active, setActive }: any) { return <div className="flex flex-wrap gap-2 mb-4"><Button size="sm" onClick={() => setActive('all')} variant={active === 'all' ? 'default' : 'outline'}>Tất cả trụ cột</Button>{pillars.map((p: Pillar) => <Button key={p.id} size="sm" onClick={() => setActive(p.id)} variant={active === p.id ? 'default' : 'outline'}>{p.name}</Button>)}</div> }
function AlignmentMap({ nodes, large }: { nodes: Node[]; large?: boolean }) { return <div className={cn('relative overflow-hidden rounded-xl border bg-slate-50', large ? 'h-[520px]' : 'h-[230px]')}><svg className="absolute inset-0 h-full w-full opacity-30">{nodes.filter(n => n.type === 'objective').map(n => <React.Fragment key={n.id}><line x1={`${n.x + 8}%`} y1={`${n.y}%`} x2={`${n.x + 34}%`} y2={`${n.y}%`} stroke="currentColor" strokeWidth="2"/><line x1={`${n.x + 42}%`} y1={`${n.y}%`} x2={`${n.x + 66}%`} y2={`${n.y}%`} stroke="currentColor" strokeWidth="2"/></React.Fragment>)}</svg>{nodes.map(n => <button key={n.id} title={n.title} className={cn('absolute max-w-[160px] rounded-xl px-3 py-2 text-xs font-bold shadow-sm transition hover:scale-105', nodeClass[n.type])} style={{ left: `${n.x}%`, top: `${n.y}%`, transform: n.type === 'kr' ? 'rotate(45deg)' : undefined }}><span className={n.type === 'kr' ? 'block -rotate-45' : ''}>{n.title}</span></button>)}</div> }
function AlertIcon({ severity }: { severity: string }) { if (severity === 'critical') return <AlertCircle className="h-5 w-5 text-red-500" />; if (severity === 'warning') return <AlertTriangle className="h-5 w-5 text-orange-500" />; return <Info className="h-5 w-5 text-blue-500" /> }
function SettingsIcon(props: React.SVGProps<SVGSVGElement>) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg> }
