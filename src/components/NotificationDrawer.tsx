'use client';

import { useEffect, useMemo, useState } from 'react';
import { Archive, Bell, Check, ChevronLeft, ChevronRight, ExternalLink, Inbox, Loader2, RefreshCcw, Search, ShieldAlert } from 'lucide-react';
import Drawer from './ui/Drawer';
import { Button } from './ui/button';

const MODULES = ['all', 'TASKS', 'APPROVALS', 'ADMISSIONS', 'STUDENTS', 'STORAGE', 'SETTINGS', 'AUDIT_LOGS', 'SYSTEM'];
const SEVERITIES = ['all', 'INFO', 'SUCCESS', 'WARNING', 'ERROR'];
const STATUSES = [
  { value: 'all', label: 'Tất cả' },
  { value: 'unread', label: 'Chưa đọc' },
  { value: 'read', label: 'Đã đọc' },
  { value: 'archived', label: 'Đã lưu trữ' },
];

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  module: string;
  type: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  actor?: { name?: string; title?: string };
  targetUrl?: string;
  createdAt: string;
  readAt?: string | null;
};

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onChanged?: () => void;
  announcements?: any[];
  directives?: any[];
  tasks?: any[];
  summaryItems?: any[];
  onViewTask?: any;
  onViewDirective?: any;
}

export default function NotificationDrawer({ isOpen, onClose, onChanged }: NotificationDrawerProps) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [status, setStatus] = useState('all');
  const [module, setModule] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const pageSize = 8;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const query = useMemo(() => {
    const params = new URLSearchParams({ status, module, severity, q, page: String(page), pageSize: String(pageSize) });
    return params.toString();
  }, [status, module, severity, q, page]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/notifications?${query}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.error || 'Không tải được thông báo');
      setItems(data.items || []);
      setTotal(Number(data.total || 0));
      setUnread(Number(data.unread || 0));
    } catch (err: any) {
      setError(err.message || 'Không tải được thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, query]);

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2500);
  };

  const mutate = async (url: string, method: string, msg: string) => {
    try {
      const res = await fetch(url, { method });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status === 'error') throw new Error(data.error || 'Thao tác thất bại');
      notify(msg);
      await load();
      onChanged?.();
    } catch (err: any) {
      notify(err.message || 'Thao tác thất bại');
    }
  };

  const openTarget = (item: NotificationItem) => {
    if (item.status === 'UNREAD') mutate(`/api/notifications/${encodeURIComponent(item.id)}/read`, 'PATCH', 'Đã đánh dấu đã đọc');
    if (item.targetUrl) window.location.href = item.targetUrl.startsWith('/') ? `/${window.location.pathname.split('/')[1]}${item.targetUrl}` : item.targetUrl;
    onClose();
  };

  const badgeClass = (s: string) => s === 'ERROR' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : s === 'WARNING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' : s === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300';

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Trung tâm Thông báo" description={`${unread} thông báo chưa đọc · đồng bộ toàn hệ thống`} width="lg">
      {toast && <div className="fixed right-5 top-20 z-[9999] rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-2xl">{toast}</div>}
      <div className="sticky top-0 z-10 space-y-3 border-b border-slate-200 bg-white/90 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex flex-wrap items-center gap-2">
          {STATUSES.map(s => <button key={s.value} onClick={() => { setStatus(s.value); setPage(1); }} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${status === s.value ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300'}`}>{s.label}</button>)}
          <Button size="sm" variant="outline" onClick={() => mutate('/api/notifications/read-all', 'PATCH', 'Đã đọc tất cả')} className="ml-auto gap-1"><Check className="h-3.5 w-3.5" />Đọc tất cả</Button>
          <Button size="sm" variant="ghost" onClick={load} className="gap-1"><RefreshCcw className="h-3.5 w-3.5" />Refresh</Button>
        </div>
        <div className="grid gap-2 md:grid-cols-[1fr_150px_150px]">
          <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder="Tìm tiêu đề, nội dung, module..." className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900" /></div>
          <select value={module} onChange={e => { setModule(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">{MODULES.map(m => <option key={m} value={m}>{m === 'all' ? 'Tất cả module' : m}</option>)}</select>
          <select value={severity} onChange={e => { setSeverity(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">{SEVERITIES.map(s => <option key={s} value={s}>{s === 'all' ? 'Tất cả mức độ' : s}</option>)}</select>
        </div>
      </div>

      <div className="p-4">
        {loading && <div className="flex h-48 items-center justify-center text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Đang tải thông báo...</div>}
        {error && !loading && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30"><ShieldAlert className="mb-2 h-5 w-5" />{error}</div>}
        {!loading && !error && items.length === 0 && <div className="flex h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 text-center dark:border-slate-800"><Inbox className="mb-3 h-10 w-10 text-slate-300" /><div className="font-black">Không có thông báo</div><p className="text-sm text-slate-500">Bộ lọc hiện tại chưa có dữ liệu.</p></div>}
        <div className="space-y-3">
          {!loading && !error && items.map(item => (
            <div key={item.id} className={`group rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-xl ${item.status === 'UNREAD' ? 'border-blue-200 bg-blue-50/60 shadow-blue-500/5 dark:border-blue-900 dark:bg-blue-950/20' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'}`}>
              <div className="flex gap-3">
                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${item.status === 'UNREAD' ? 'bg-blue-600' : 'bg-slate-300'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${badgeClass(item.severity)}`}>{item.severity}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600 dark:bg-slate-900 dark:text-slate-300">{item.module}</span>
                    <span className="text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <button onClick={() => openTarget(item)} className="mt-1 text-left text-sm font-black text-slate-900 hover:text-blue-700 dark:text-white">{item.title}</button>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{item.message}</p>
                  {item.actor?.name && <p className="mt-1 text-[11px] text-slate-400">Actor: {item.actor.name}{item.actor.title ? ` · ${item.actor.title}` : ''}</p>}
                </div>
                <div className="flex shrink-0 flex-col gap-1 opacity-80 group-hover:opacity-100">
                  {item.status === 'UNREAD' && <Button size="icon" variant="ghost" title="Đánh dấu đã đọc" onClick={() => mutate(`/api/notifications/${encodeURIComponent(item.id)}/read`, 'PATCH', 'Đã đánh dấu đã đọc')}><Check className="h-4 w-4" /></Button>}
                  <Button size="icon" variant="ghost" title="Mở" onClick={() => openTarget(item)}><ExternalLink className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" title="Lưu trữ" onClick={() => mutate(`/api/notifications/${encodeURIComponent(item.id)}/archive`, 'PATCH', 'Đã lưu trữ thông báo')}><Archive className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800">
          <span>Trang {page}/{totalPages} · {total} thông báo</span>
          <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft className="h-4 w-4" /></Button><Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}><ChevronRight className="h-4 w-4" /></Button></div>
        </div>
      </div>
    </Drawer>
  );
}
