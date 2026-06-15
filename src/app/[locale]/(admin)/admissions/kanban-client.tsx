'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  addAdmissionCareActivity,
  updateAdmissionDocumentStatus,
  updateAdmissionLeadFields,
  updateLeadStatusKanban,
} from './actions';
import { type LeadStatus } from '../leads/actions';
import {
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  Filter,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  QrCode,
  Search,
  User,
  Users,
} from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
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
  address: string | null;
  testDate: Date | string | null;
  testTime: string | null;
  mathScore: number | null;
  englishScore: number | null;
  scholarshipPercent: number | null;
  periodDiscountPercent: number | null;
}

interface Activity {
  id: string;
  leadId: string;
  type: string;
  title: string;
  description: string | null;
  activityAt: Date | string;
}

interface DocumentItem {
  id: string;
  leadId: string | null;
  type: string;
  name: string;
  status: string;
  uploadedAt: Date | string | null;
}

interface KanbanClientProps {
  locale: string;
  initialLeads: Lead[];
  users: DbUser[];
  activities: Activity[];
  documents: DocumentItem[];
}

const statuses: { value: LeadStatus; label: string; color: string; bg: string; text: string }[] = [
  { value: 'received', label: 'Mới', color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  { value: 'consulting', label: 'Đã liên hệ', color: 'bg-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  { value: 'test_scheduled', label: 'Chờ test', color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  { value: 'test_participated', label: 'Đã test', color: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
  { value: 'seat_reserved', label: 'Giữ chỗ', color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
  { value: 'docs_submitted', label: 'Đủ hồ sơ', color: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  { value: 'enrolled', label: 'Nhập học', color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  { value: 'cancelled', label: 'Hủy', color: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-700' },
];

const requiredDocuments = [
  'Học bạ / bảng điểm',
  'Giấy khai sinh',
  'Ảnh thẻ học sinh',
  'CCCD phụ huynh',
  'Phiếu đăng ký nhập học',
  'Biên lai giữ chỗ',
];

const careChannels = [
  { value: 'phone', label: 'Điện thoại', icon: Phone },
  { value: 'zalo', label: 'Zalo', icon: MessageSquare },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'tour', label: 'School Tour', icon: Calendar },
];

const dateToInput = (value: Date | string | null | undefined) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const formatDateTime = (value: Date | string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusMeta = (status: LeadStatus) => statuses.find(item => item.value === status) || statuses[0];

export default function KanbanClient({
  locale,
  initialLeads,
  users,
  activities: initialActivities,
  documents: initialDocuments,
}: KanbanClientProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [selectedLeadId, setSelectedLeadId] = useState(initialLeads[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'care' | 'assessment' | 'documents' | 'personal'>('care');
  const [careChannel, setCareChannel] = useState('phone');
  const [careNote, setCareNote] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLeads(initialLeads);
    setActivities(initialActivities);
    setDocuments(initialDocuments);
    if (!initialLeads.some(lead => lead.id === selectedLeadId)) {
      setSelectedLeadId(initialLeads[0]?.id || '');
    }
  }, [initialActivities, initialDocuments, initialLeads, selectedLeadId]);

  const userMap = useMemo(() => new Map(users.map(user => [user.id, user.name])), [users]);

  const filteredLeads = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return leads.filter(lead => {
      const matchesSearch =
        !term ||
        lead.fullName.toLowerCase().includes(term) ||
        lead.leadCode.toLowerCase().includes(term) ||
        lead.phone.includes(term) ||
        (lead.parentName || '').toLowerCase().includes(term);
      const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, selectedStatus]);

  const selectedLead = leads.find(lead => lead.id === selectedLeadId) || filteredLeads[0] || leads[0];
  const selectedActivities = useMemo(() => {
    if (!selectedLead) return [];
    return activities
      .filter(activity => activity.leadId === selectedLead.id)
      .sort((a, b) => new Date(b.activityAt).getTime() - new Date(a.activityAt).getTime());
  }, [activities, selectedLead]);

  const selectedDocuments = useMemo(() => {
    if (!selectedLead) return [];
    return documents.filter(doc => doc.leadId === selectedLead.id);
  }, [documents, selectedLead]);

  const compactStats = useMemo(() => {
    return {
      all: leads.length,
      consulting: leads.filter(lead => lead.status === 'consulting').length,
      test: leads.filter(lead => lead.status === 'test_scheduled').length,
      enrolled: leads.filter(lead => lead.status === 'enrolled').length,
    };
  }, [leads]);

  const patchLead = (leadId: string, data: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => (lead.id === leadId ? { ...lead, ...data, updatedAt: new Date() } : lead)));
    startTransition(async () => {
      await updateAdmissionLeadFields(leadId, data as Parameters<typeof updateAdmissionLeadFields>[1]);
    });
  };

  const changeStatus = (leadId: string, status: LeadStatus) => {
    setLeads(prev => prev.map(lead => (lead.id === leadId ? { ...lead, status, updatedAt: new Date() } : lead)));
    startTransition(async () => {
      await updateLeadStatusKanban(leadId, status, 'Cập nhật từ Focused Counselor View');
    });
  };

  const addCareLog = () => {
    if (!selectedLead || !careNote.trim()) return;
    const tempActivity: Activity = {
      id: `temp_${Date.now()}`,
      leadId: selectedLead.id,
      type: careChannel,
      title: `Chăm sóc qua ${careChannels.find(channel => channel.value === careChannel)?.label || careChannel}`,
      description: careNote.trim(),
      activityAt: new Date(),
    };
    setActivities(prev => [tempActivity, ...prev]);
    setCareNote('');
    startTransition(async () => {
      await addAdmissionCareActivity(selectedLead.id, {
        channel: careChannels.find(channel => channel.value === careChannel)?.label || careChannel,
        description: tempActivity.description || '',
      });
    });
  };

  const toggleDocument = (docType: string, checked: boolean) => {
    if (!selectedLead) return;
    setDocuments(prev => {
      const existing = prev.find(doc => doc.leadId === selectedLead.id && doc.type === docType);
      if (existing) {
        return prev.map(doc =>
          doc.id === existing.id
            ? { ...doc, status: checked ? 'submitted' : 'pending', uploadedAt: checked ? new Date() : null }
            : doc
        );
      }
      return [
        {
          id: `temp_doc_${Date.now()}`,
          leadId: selectedLead.id,
          type: docType,
          name: docType,
          status: checked ? 'submitted' : 'pending',
          uploadedAt: checked ? new Date() : null,
        },
        ...prev,
      ];
    });
    startTransition(async () => {
      await updateAdmissionDocumentStatus(selectedLead.id, docType, checked);
    });
  };

  if (!selectedLead) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-slate-500">Chưa có lead tuyển sinh để hiển thị.</p>
      </div>
    );
  }

  const statusMeta = getStatusMeta(selectedLead.status);

  return (
    <div className="flex h-[calc(100vh-88px)] min-h-[680px] flex-col gap-4 overflow-hidden">
      <div className="flex shrink-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500">Tuyển sinh & CRM &gt; Quản lý Lead</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            Màn hình tư vấn tập trung
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            ['Tổng', compactStats.all],
            ['Đang tư vấn', compactStats.consulting],
            ['Chờ test', compactStats.test],
            ['Nhập học', compactStats.enrolled],
          ].map(([label, count]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-right shadow-xs">
              <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
              <p className="text-sm font-black text-slate-800">{count}</p>
            </div>
          ))}
          <Link
            href={`/${locale}/leads`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm lead mới
          </Link>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[35%_1fr]">
        <aside className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="shrink-0 border-b border-slate-100 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-slate-900">Danh sách lead</h2>
                <p className="text-xs text-slate-500">{filteredLeads.length} học sinh phù hợp</p>
              </div>
              {isPending && <span className="text-[10px] font-bold text-blue-600">Đang lưu...</span>}
            </div>

            <div className="mt-3 grid gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  placeholder="Tìm tên, mã, SĐT..."
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 shrink-0 text-slate-400" />
                <select
                  value={selectedStatus}
                  onChange={event => setSelectedStatus(event.target.value as LeadStatus | 'all')}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {filteredLeads.map(lead => {
              const meta = getStatusMeta(lead.status);
              const isActive = selectedLead.id === lead.id;
              return (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={cn(
                    'mb-2 w-full rounded-xl border p-3 text-left transition-all',
                    isActive
                      ? 'border-blue-300 bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">{lead.fullName}</p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">
                        {lead.leadCode} · {lead.grade} · {lead.source}
                      </p>
                    </div>
                    <Badge className={cn('shrink-0 border-none text-[10px]', meta.bg, meta.text)}>
                      {meta.label}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="shrink-0 border-b border-slate-100 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-slate-950">{selectedLead.fullName}</h2>
                  <Badge className={cn('border-none', statusMeta.bg, statusMeta.text)}>{statusMeta.label}</Badge>
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {selectedLead.leadCode} · Phụ trách:{' '}
                  {selectedLead.assignedUserId ? userMap.get(selectedLead.assignedUserId) || 'Chưa rõ' : 'Chưa phân công'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedLead.status}
                  onChange={event => changeStatus(selectedLead.id, event.target.value as LeadStatus)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <Link
                  href={`/${locale}/leads/${selectedLead.id}`}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hồ sơ đầy đủ
                </Link>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-100">
              {[
                ['care', 'Chăm sóc', MessageSquare],
                ['assessment', 'Lịch thi & Điểm', GraduationCap],
                ['documents', 'Hồ sơ gốc', ClipboardCheck],
                ['personal', 'Cá nhân', User],
              ].map(([tab, label, Icon]) => (
                <button
                  key={tab as string}
                  type="button"
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={cn(
                    'inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-black transition-colors',
                    activeTab === tab
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label as string}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {activeTab === 'care' && (
              <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
                <section>
                  <h3 className="text-sm font-black text-slate-900">Lịch sử chăm sóc</h3>
                  <div className="mt-3 space-y-3">
                    {selectedActivities.length === 0 ? (
                      <Card className="border-dashed p-8 text-center text-sm font-semibold text-slate-500">
                        Chưa có nhật ký chăm sóc.
                      </Card>
                    ) : (
                      selectedActivities.map(activity => {
                        const channel = careChannels.find(item => activity.type.toLowerCase().includes(item.value));
                        const Icon = channel?.icon || MessageSquare;
                        return (
                          <div key={activity.id} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-xs">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-black text-slate-900">{activity.title}</p>
                                <span className="text-[11px] font-semibold text-slate-400">
                                  {formatDateTime(activity.activityAt)}
                                </span>
                              </div>
                              {activity.description && (
                                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                                  {activity.description}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-black text-slate-900">Nhập nhật ký chi tiết</h3>
                  <select
                    value={careChannel}
                    onChange={event => setCareChannel(event.target.value)}
                    className="mt-3 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                  >
                    {careChannels.map(channel => (
                      <option key={channel.value} value={channel.value}>
                        {channel.label}
                      </option>
                    ))}
                  </select>
                  <Textarea
                    value={careNote}
                    onChange={event => setCareNote(event.target.value)}
                    rows={7}
                    placeholder="Nhập nội dung trao đổi với phụ huynh..."
                    className="mt-3"
                  />
                  <button
                    type="button"
                    onClick={addCareLog}
                    className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    Lưu nhật ký chăm sóc
                  </button>
                </section>
              </div>
            )}

            {activeTab === 'assessment' && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Ngày thi test" icon={Calendar}>
                  <Input
                    type="date"
                    value={dateToInput(selectedLead.testDate)}
                    onChange={event => patchLead(selectedLead.id, { testDate: event.target.value as any })}
                  />
                </Field>
                <Field label="Giờ thi test" icon={Calendar}>
                  <Input
                    type="time"
                    value={selectedLead.testTime || ''}
                    onChange={event => patchLead(selectedLead.id, { testTime: event.target.value })}
                  />
                </Field>
                <Field label="Điểm Toán" icon={GraduationCap}>
                  <Input
                    type="number"
                    value={selectedLead.mathScore ?? ''}
                    onChange={event => patchLead(selectedLead.id, { mathScore: event.target.value === '' ? null : Number(event.target.value) })}
                  />
                </Field>
                <Field label="Điểm Tiếng Anh" icon={GraduationCap}>
                  <Input
                    type="number"
                    value={selectedLead.englishScore ?? ''}
                    onChange={event => patchLead(selectedLead.id, { englishScore: event.target.value === '' ? null : Number(event.target.value) })}
                  />
                </Field>
                <Field label="Học bổng đề xuất (%)" icon={CreditCard}>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={selectedLead.scholarshipPercent ?? ''}
                    onChange={event => patchLead(selectedLead.id, { scholarshipPercent: event.target.value === '' ? null : Number(event.target.value) })}
                  />
                </Field>
                <Field label="Ưu đãi kỳ nhập học (%)" icon={CreditCard}>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={selectedLead.periodDiscountPercent ?? ''}
                    onChange={event => patchLead(selectedLead.id, { periodDiscountPercent: event.target.value === '' ? null : Number(event.target.value) })}
                  />
                </Field>
                <div className="md:col-span-2 flex flex-wrap gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <Link
                    href={`/${locale}/leads/${selectedLead.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    <QrCode className="h-4 w-4" />
                    Tạo QR giữ chỗ / nhập học
                  </Link>
                  <span className="text-xs font-semibold text-blue-700">
                    QR và đối soát chi tiết được gom trong hồ sơ đầy đủ để màn hình tư vấn luôn gọn.
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="grid gap-3 md:grid-cols-2">
                {requiredDocuments.map(docType => {
                  const doc = selectedDocuments.find(item => item.type === docType || item.name === docType);
                  const checked = doc?.status === 'submitted' || doc?.status === 'approved';
                  return (
                    <label
                      key={docType}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all',
                        checked ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={event => toggleDocument(docType, event.target.checked)}
                        className="h-5 w-5 rounded border-slate-300 text-blue-600"
                      />
                      <div>
                        <p className="text-sm font-black text-slate-900">{docType}</p>
                        <p className="text-xs font-semibold text-slate-500">
                          {checked ? `Đã thu ${doc?.uploadedAt ? formatDateTime(doc.uploadedAt) : ''}` : 'Chưa thu'}
                        </p>
                      </div>
                      {checked && <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />}
                    </label>
                  );
                })}
                <Card className="md:col-span-2 border-dashed p-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Đính kèm file minh chứng sẽ được triển khai ở bước lưu trữ tài liệu; hiện checklist đã đồng bộ vào bảng documents.
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tên phụ huynh" icon={User}>
                  <Input
                    value={selectedLead.parentName || ''}
                    onChange={event => patchLead(selectedLead.id, { parentName: event.target.value })}
                  />
                </Field>
                <Field label="Số điện thoại" icon={Phone}>
                  <Input
                    value={selectedLead.phone}
                    onChange={event => patchLead(selectedLead.id, { phone: event.target.value })}
                  />
                </Field>
                <Field label="Email" icon={Mail}>
                  <Input
                    type="email"
                    value={selectedLead.email || ''}
                    onChange={event => patchLead(selectedLead.id, { email: event.target.value })}
                  />
                </Field>
                <Field label="Địa chỉ thường trú" icon={MapPin}>
                  <Input
                    value={selectedLead.address || ''}
                    onChange={event => patchLead(selectedLead.id, { address: event.target.value })}
                  />
                </Field>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label className="block rounded-xl border border-slate-200 bg-white p-4">
      <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
        <Icon className="h-4 w-4 text-blue-500" />
        {label}
      </span>
      {children}
    </label>
  );
}
