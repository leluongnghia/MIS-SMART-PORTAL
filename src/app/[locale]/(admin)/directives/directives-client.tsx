'use client';

import { useMemo, useState, useTransition } from 'react';
import { AlertTriangle, CheckCircle2, Clock, FileText, Filter, MessageSquare, Paperclip, Search, Send, TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { cn } from '@/src/lib/utils';
import { serverStorage } from '@/src/libs/client/server-storage';
import { MOCK_USERS, WORKSPACES } from '@/src/mockData';
import { addDirectiveResponse } from './actions';

type DirectiveRow = {
  id: string;
  title: string;
  category: string | null;
  urgency: string | null;
  senderId: string | null;
  payload: {
    description?: string;
    deadline?: string;
    status?: string;
    assignee?: string;
    comments?: Array<{ id?: string; user: string; dept: string; text: string; date: string }>;
    checklist?: Array<{ text: string; done: boolean }>;
    attachments?: Array<{ name: string; size: string }>;
  } | Record<string, any>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type AuditRow = {
  id: string;
  entityId: string;
  action: string;
  actorId: string | null;
  metadata: Record<string, unknown> | unknown;
  createdAt: string | Date;
};

const urgencyClass: Record<string, string> = {
  'Khẩn cấp': 'bg-red-50 text-red-700 border-red-200',
  'Quan trọng': 'bg-orange-50 text-orange-700 border-orange-200',
  'Trung bình': 'bg-blue-50 text-blue-700 border-blue-200',
  'Thấp': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const statusDot: Record<string, string> = {
  'Chờ phản hồi': 'bg-orange-500 text-orange-700',
  'Đã phản hồi': 'bg-blue-500 text-blue-700',
  'Đã hoàn thành': 'bg-emerald-500 text-emerald-700',
  'Quá hạn': 'bg-red-500 text-red-700',
};

export default function DirectivesDashboard({ initialData }: { initialData?: { data?: DirectiveRow[]; audits?: AuditRow[] } }) {
  const directives = initialData?.data || [];
  const audits = initialData?.audits || [];
  const [activeId, setActiveId] = useState(directives[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [notice, setNotice] = useState('');
  const [isPending, startTransition] = useTransition();

  const currentUser = useMemo(() => {
    const userId = serverStorage.getItem('mis_edutask_logged_in_user_id');
    return MOCK_USERS.find(user => user.id === userId) || MOCK_USERS[0];
  }, []);

  const workspaceName = WORKSPACES.find(workspace => workspace.id === currentUser.workspaceId)?.name || currentUser.workspaceId;
  const active = directives.find(item => item.id === activeId) || directives[0];
  const activePayload = active?.payload || {};
  const activeComments = activePayload.comments || [];
  const activeAudits = audits.filter(audit => audit.entityId === active?.id).slice(-8).reverse();
  const todayCount = directives.filter(item => new Date(item.createdAt || Date.now()).toDateString() === new Date().toDateString()).length;
  const waitingCount = directives.filter(item => (item.payload?.status || '') === 'Chờ phản hồi').length;
  const overdueCount = directives.filter(item => item.payload?.deadline && new Date(item.payload.deadline) < new Date() && item.payload.status !== 'Đã hoàn thành').length;
  const doneCount = directives.filter(item => item.payload?.status === 'Đã hoàn thành').length;
  const completionRate = directives.length ? Math.round((doneCount / directives.length) * 1000) / 10 : 0;
  const checklist = activePayload.checklist || [];
  const doneChecklist = checklist.filter(item => item.done).length;

  const submitReply = () => {
    if (!active || !replyText.trim()) return;
    startTransition(async () => {
      const result = await addDirectiveResponse({
        directiveId: active.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userDept: workspaceName,
        text: replyText,
      });
      if (result.success) {
        setReplyText('');
        setNotice('Đã gửi phản hồi và ghi audit log. Trang sẽ cập nhật lại dữ liệu.');
        window.setTimeout(() => window.location.reload(), 650);
      } else {
        setNotice(result.error || 'Gửi phản hồi thất bại.');
      }
    });
  };

  if (!active) {
    return <Card><CardContent className="p-6 text-sm text-slate-500">Chưa có chỉ đạo. Dữ liệu sẽ được seed khi tải lại.</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Chỉ đạo BGH & Phản hồi</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Dữ liệu thật từ DB: phản hồi, trạng thái, audit log theo từng chỉ đạo.</p>
        </div>
        <Badge className="w-fit bg-emerald-100 text-emerald-700 hover:bg-emerald-100">REAL DB MODE • Audit enabled</Badge>
      </div>

      {notice && <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">{notice}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: 'Chỉ thị mới hôm nay', value: todayCount, icon: FileText, color: 'blue' },
          { label: 'Đang chờ phản hồi', value: waitingCount, icon: Clock, color: 'orange' },
          { label: 'Quá hạn cần xử lý', value: overdueCount, icon: AlertTriangle, color: 'red' },
          { label: 'Tỷ lệ hoàn thành', value: `${completionRate}%`, icon: TrendingUp, color: 'indigo' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl text-white', stat.color === 'orange' ? 'bg-orange-500' : stat.color === 'red' ? 'bg-red-500' : stat.color === 'indigo' ? 'bg-indigo-600' : 'bg-blue-600')}><Icon className="h-6 w-6" /></div>
                <div><p className="text-sm font-semibold text-slate-500">{stat.label}</p><div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Card className="h-[780px] flex flex-col">
            <CardHeader className="border-b p-4">
              <div className="flex items-center justify-between"><CardTitle className="text-base">Danh sách chỉ đạo</CardTitle><Filter className="h-4 w-4 text-slate-400" /></div>
              <div className="relative mt-3"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm dark:border-slate-800 dark:bg-slate-950" placeholder="Tìm kiếm..." /></div>
            </CardHeader>
            <CardContent className="flex-1 divide-y overflow-y-auto p-0 custom-scrollbar">
              {directives.map(item => {
                const status = item.payload?.status || 'Chờ phản hồi';
                return (
                  <button key={item.id} onClick={() => setActiveId(item.id)} className={cn('block w-full p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900', active.id === item.id && 'bg-blue-50/70 dark:bg-blue-950/20')}>
                    <Badge className={cn('mb-2 border text-[10px]', urgencyClass[item.urgency || ''] || 'bg-slate-50 text-slate-600')}>{item.urgency || 'Trung bình'}</Badge>
                    <h4 className="line-clamp-2 text-sm font-black text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="mt-1 text-xs text-slate-500">{item.category || item.payload?.assignee}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px]"><span>Hạn: {item.payload?.deadline || '—'}</span><span className={cn('font-bold', (statusDot[status] || 'bg-slate-400 text-slate-600').split(' ')[1])}>{status}</span></div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-6">
          <Card className="h-[780px] overflow-hidden flex flex-col">
            <CardHeader className="border-b bg-slate-50/70 p-6 dark:bg-slate-900/30">
              <div className="mb-3 flex items-center gap-2"><Badge className={cn('border', urgencyClass[active.urgency || ''] || 'bg-slate-50')}>{active.urgency}</Badge><span className="text-xs font-semibold text-slate-400">Mã: {active.id}</span></div>
              <CardTitle className="text-xl font-black">{active.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
              <section><h4 className="mb-2 text-sm font-black">Nội dung chỉ đạo</h4><p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{activePayload.description}</p></section>
              <section className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/40"><div><p className="text-xs text-slate-500">Đơn vị thực hiện</p><p className="font-black">{activePayload.assignee || active.category}</p></div><div><p className="text-xs text-slate-500">Trạng thái</p><p className="font-black">{activePayload.status}</p></div></section>
              <section><h4 className="mb-3 text-sm font-black">Checklist ({doneChecklist}/{checklist.length})</h4><div className="space-y-2">{checklist.map((item, index) => <div key={index} className="flex gap-2 text-sm">{item.done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Clock className="h-5 w-5 text-slate-300" />}<span className={cn(item.done && 'line-through text-slate-400')}>{item.text}</span></div>)}</div></section>
              <section><h4 className="mb-3 flex items-center gap-2 text-sm font-black">Trao đổi & Phản hồi <Badge>{activeComments.length}</Badge></h4><div className="space-y-4">{activeComments.map((comment, index) => <div key={comment.id || index} className="flex gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700"><MessageSquare className="h-4 w-4" /></div><div><div className="flex flex-wrap items-center gap-2"><b className="text-sm">{comment.user}</b><span className="text-xs text-slate-500">({comment.dept})</span><span className="text-[10px] text-slate-400">{comment.date}</span></div><p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{comment.text}</p></div></div>)}</div></section>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <Card><CardHeader className="border-b p-4"><CardTitle className="text-base">Phản hồi nhanh</CardTitle></CardHeader><CardContent className="space-y-4 p-4"><div className="rounded-lg border bg-slate-50 p-3 text-sm dark:bg-slate-900"><b>{currentUser.name}</b><div className="text-xs text-slate-500">{workspaceName}</div></div><textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="min-h-[130px] w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800 dark:bg-slate-950" placeholder="Nhập phản hồi thật..." /><div className="flex items-center gap-2 text-xs text-slate-400"><Paperclip className="h-4 w-4" /> Tệp đính kèm sẽ được lưu ở bước sau</div><Button onClick={submitReply} disabled={isPending || !replyText.trim()} className="w-full gap-2 bg-blue-600 hover:bg-blue-700"><Send className="h-4 w-4" /> {isPending ? 'Đang gửi...' : 'Gửi phản hồi'}</Button></CardContent></Card>
          <Card><CardHeader className="border-b p-4"><CardTitle className="text-base">Audit log thật</CardTitle></CardHeader><CardContent className="max-h-[330px] space-y-4 overflow-y-auto p-4 custom-scrollbar">{activeAudits.length ? activeAudits.map(log => <div key={log.id} className="border-l-2 border-blue-200 pl-3"><div className="text-xs font-black text-slate-800 dark:text-slate-100">{log.action}</div><div className="text-[11px] text-slate-500">Actor: {log.actorId || 'system'}</div><div className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString('vi-VN')}</div></div>) : <div className="text-sm text-slate-500">Chưa có audit.</div>}</CardContent></Card>
        </div>
      </div>
    </div>
  );
}
