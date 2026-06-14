'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { type LeadStatus } from '../leads/actions';
import { updateLeadStatusKanban } from './actions';
import {
  Phone,
  User,
  GraduationCap,
  Sparkles,
  Calendar,
  Search,
  Filter,
  Users,
  Eye,
} from 'lucide-react';
import { Card } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/src/lib/utils';

interface DbUser {
  id: string;
  name: string;
}

interface Lead {
  id: string;
  leadCode: string;
  fullName: string;
  parentName: string | null;
  phone: string;
  email: string | null;
  source: string;
  grade: string;
  status: LeadStatus;
  assignedUserId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Activity {
  id: string;
  leadId: string;
  type: string;
  title: string;
  description: string | null;
  activityAt: Date;
}

interface KanbanClientProps {
  locale: string;
  initialLeads: Lead[];
  users: DbUser[];
  activities: Activity[];
}

const statuses: { value: LeadStatus; label: string; color: string; border: string; bg: string; text: string }[] = [
  {
    value: 'new',
    label: 'Mới',
    color: 'bg-blue-500',
    border: 'border-blue-200 dark:border-blue-800',
    bg: 'bg-blue-50/50 dark:bg-blue-950/20',
    text: 'text-blue-700 dark:text-blue-300',
  },
  {
    value: 'contacted',
    label: 'Đã liên hệ',
    color: 'bg-cyan-500',
    border: 'border-cyan-200 dark:border-cyan-800',
    bg: 'bg-cyan-50/50 dark:bg-cyan-950/20',
    text: 'text-cyan-700 dark:text-cyan-300',
  },
  {
    value: 'consultation_scheduled',
    label: 'Hẹn tư vấn',
    color: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-800',
    bg: 'bg-amber-50/50 dark:bg-amber-950/20',
    text: 'text-amber-700 dark:text-amber-300',
  },
  {
    value: 'application_submitted',
    label: 'Nộp đơn học',
    color: 'bg-purple-500',
    border: 'border-purple-200 dark:border-purple-800',
    bg: 'bg-purple-50/50 dark:bg-purple-950/20',
    text: 'text-purple-700 dark:text-purple-300',
  },
  {
    value: 'seat_reserved',
    label: 'Giữ chỗ',
    color: 'bg-orange-500',
    border: 'border-orange-200 dark:border-orange-800',
    bg: 'bg-orange-50/50 dark:bg-orange-950/20',
    text: 'text-orange-700 dark:text-orange-300',
  },
  {
    value: 'payment_confirmed',
    label: 'Đóng phí',
    color: 'bg-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-800',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    value: 'enrolled',
    label: 'Nhập học',
    color: 'bg-green-500',
    border: 'border-green-200 dark:border-green-800',
    bg: 'bg-green-50/50 dark:bg-green-950/20',
    text: 'text-green-700 dark:text-green-300',
  },
  {
    value: 'lost',
    label: 'Từ chối',
    color: 'bg-rose-500',
    border: 'border-rose-200 dark:border-rose-800',
    bg: 'bg-rose-50/50 dark:bg-rose-950/20',
    text: 'text-rose-700 dark:text-rose-300',
  },
];

const leadSources = ['Website', 'Facebook', 'TikTok', 'Google', 'Referral', 'Event', 'Other'];
const gradeLevels = [
  'Mầm non',
  'Lớp 1',
  'Lớp 2',
  'Lớp 3',
  'Lớp 4',
  'Lớp 5',
  'Lớp 6',
  'Lớp 7',
  'Lớp 8',
  'Lớp 9',
  'Lớp 10',
  'Lớp 11',
  'Lớp 12',
];

export default function KanbanClient({
  locale,
  initialLeads,
  users,
  activities,
}: KanbanClientProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);
  const [isPending, startTransition] = useTransition();

  // Create user map
  const userMap = useMemo(() => {
    return new Map(users.map(u => [u.id, u.name]));
  }, [users]);

  // Create last activity map
  const lastActivityMap = useMemo(() => {
    const map = new Map<string, Date>();
    // Since activities are ordered by activityAt desc, the first one seen per lead is the latest
    for (const act of activities) {
      if (!map.has(act.leadId)) {
        map.set(act.leadId, new Date(act.activityAt));
      }
    }
    return map;
  }, [activities]);

  // Sync leads if prop changes
  useMemo(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch =
        lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.leadCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSource = selectedSource === 'all' || lead.source === selectedSource;
      const matchesGrade = selectedGrade === 'all' || lead.grade === selectedGrade;

      return matchesSearch && matchesSource && matchesGrade;
    });
  }, [leads, searchTerm, selectedSource, selectedGrade]);

  // Group leads by status
  const groupedLeads = useMemo(() => {
    const groups: Record<LeadStatus, Lead[]> = {
      new: [],
      contacted: [],
      consultation_scheduled: [],
      application_submitted: [],
      seat_reserved: [],
      payment_confirmed: [],
      enrolled: [],
      lost: [],
    };

    for (const lead of filteredLeads) {
      if (groups[lead.status]) {
        groups[lead.status].push(lead);
      }
    }

    return groups;
  }, [filteredLeads]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, toStatus: LeadStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const id = e.dataTransfer.getData('text/plain') || draggingId;
    setDraggingId(null);
    if (!id) return;

    const lead = leads.find(l => l.id === id);
    if (!lead || lead.status === toStatus) return;

    // Save previous leads in case we need to roll back
    const previousLeads = leads;

    // Optimistically update status
    setLeads(prev =>
      prev.map(l => (l.id === id ? { ...l, status: toStatus, updatedAt: new Date() } : l))
    );

    startTransition(async () => {
      try {
        const res = await updateLeadStatusKanban(id, toStatus);
        if (!res.success) {
          setLeads(previousLeads);
        }
      } catch (error) {
        console.error('Failed to update status:', error);
        setLeads(previousLeads);
      }
    });
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            Admissions Pipeline
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý phễu tuyển sinh dưới dạng bảng Kanban linh hoạt. Kéo thả để cập nhật trạng thái.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
          <Users className="h-4 w-4 text-blue-500" />
          <span>Tổng số: {leads.length} học sinh</span>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="grid gap-3 md:grid-cols-3 shrink-0 bg-white/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-900">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <Input
            placeholder="Tìm theo tên, SĐT, mã tuyển sinh..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={selectedSource}
            onChange={e => setSelectedSource(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả nguồn tuyển sinh</option>
            {leadSources.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả khối học</option>
            {gradeLevels.map(g => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 -mx-1 select-none">
        <div className="flex gap-4 h-full min-w-max px-1">
          {statuses.map(statusCol => {
            const list = groupedLeads[statusCol.value] || [];
            const isOver = dragOverColumn === statusCol.value;

            return (
              <div
                key={statusCol.value}
                onDragOver={e => handleDragOver(e, statusCol.value)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, statusCol.value)}
                className={cn(
                  'flex flex-col w-72 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 transition-all overflow-hidden h-full',
                  isOver && 'ring-2 ring-blue-500/50 bg-blue-50/10 dark:bg-blue-950/10'
                )}
              >
                {/* Column Header */}
                <div className="p-3 shrink-0 flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 bg-white dark:bg-slate-950">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2.5 w-2.5 rounded-full', statusCol.color)} />
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      {statusCol.label}
                    </span>
                    <Badge className="px-1.5 py-0.5 text-[10px] font-bold">
                      {list.length}
                    </Badge>
                  </div>
                </div>

                {/* Cards List Container */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin">
                  {list.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                      <p className="text-xs text-slate-400 font-medium">Kéo học sinh vào đây</p>
                    </div>
                  ) : (
                    list.map(lead => {
                      const assignedName = lead.assignedUserId
                        ? userMap.get(lead.assignedUserId) || 'Chưa rõ'
                        : 'Chưa phân công';
                      const lastAct = lastActivityMap.get(lead.id);

                      return (
                        <Card
                          key={lead.id}
                          draggable
                          onDragStart={e => handleDragStart(e, lead.id)}
                          className={cn(
                            'p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-l-3 border-l-transparent relative bg-white dark:bg-slate-950 hover:border-l-blue-500 dark:hover:border-l-blue-400 group',
                            draggingId === lead.id && 'opacity-40 scale-[0.98]'
                          )}
                        >
                          <div className="space-y-2">
                            {/* Card Top: Code and Detail button */}
                            <div className="flex items-center justify-between gap-1.5">
                              <Badge className="text-[9px] font-mono font-bold tracking-tight bg-slate-100 hover:bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 border-none px-1.5 py-0.5">
                                {lead.leadCode}
                              </Badge>

                              <Link
                                href={`/${locale}/leads/${lead.id}`}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition-all"
                                title="Xem chi tiết"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Link>
                            </div>

                            {/* Full Name */}
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-tight leading-tight line-clamp-1">
                              {lead.fullName}
                            </h4>

                            {/* Phone */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="font-medium">{lead.phone}</span>
                            </div>

                            {/* Badges: Grade & Source */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <Badge className="text-[10px] px-1 py-0 bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                                {lead.grade}
                              </Badge>
                              <Badge className="text-[10px] px-1 py-0 bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                                {lead.source}
                              </Badge>
                            </div>

                            {/* Footer: User & Activity */}
                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-900 pt-2 mt-1.5 text-[10px] text-slate-500">
                              <div className="flex items-center gap-1 shrink-0 font-medium max-w-[120px]">
                                <User className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="truncate" title={assignedName}>
                                  {assignedName}
                                </span>
                              </div>

                              {lastAct && (
                                <div className="flex items-center gap-1 shrink-0 text-slate-400">
                                  <Calendar className="h-3 w-3 shrink-0" />
                                  <span>
                                    {lastAct.toLocaleDateString('vi-VN', {
                                      month: 'numeric',
                                      day: 'numeric',
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
