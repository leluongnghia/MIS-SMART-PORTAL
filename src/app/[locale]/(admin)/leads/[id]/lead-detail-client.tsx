'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/src/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  MessageSquare,
  History,
  Activity,
  Plus,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Textarea } from '@/src/components/ui/textarea';
import {
  updateLeadProfile,
  addConsultationActivity,
  updateLeadPipelineStatus,
} from './actions';
import { type LeadStatus } from '../actions';

const leadProfileSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên học sinh là bắt buộc'),
  parentName: z.string().optional(),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  source: z.string().min(1, 'Nguồn là bắt buộc'),
  grade: z.string().min(1, 'Khối là bắt buộc'),
  notes: z.string().optional(),
});

type LeadProfileValues = z.infer<typeof leadProfileSchema>;

interface User {
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
}

interface LeadActivity {
  id: string;
  type: string;
  title: string;
  description: string | null;
  activityAt: Date;
}

interface LeadPipeline {
  id: string;
  fromStatus: LeadStatus | null;
  toStatus: LeadStatus;
  note: string | null;
  changedAt: Date;
}

interface Payment {
  id: string;
  type: string;
  status: string;
  amount: number;
  transferContent: string;
  createdAt: Date;
}

interface Document {
  id: string;
  type: string;
  name: string;
  status: string;
  uploadedAt: Date | null;
}

interface LeadDetailClientProps {
  locale: string;
  lead: Lead;
  activities: LeadActivity[];
  pipeline: LeadPipeline[];
  payments: Payment[];
  documents: Document[];
}

const statusBadgeStyles: Record<LeadStatus, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  contacted: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
  consultation_scheduled: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800',
  application_submitted: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  seat_reserved: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
  payment_confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  enrolled: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',
  lost: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
};

const statusLabels: Record<LeadStatus, string> = {
  new: 'Mới (New)',
  contacted: 'Đã liên hệ (Contacted)',
  consultation_scheduled: 'Lên lịch tư vấn (Consultation)',
  application_submitted: 'Nộp đơn học (Applied)',
  seat_reserved: 'Giữ chỗ (Reserved)',
  payment_confirmed: 'Đóng phí (Paid)',
  enrolled: 'Nhập học (Enrolled)',
  lost: 'Từ chối (Lost)',
};

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

export default function LeadDetailClient({
  locale,
  lead,
  activities,
  pipeline,
  payments,
  documents,
}: LeadDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'profile' | 'activities' | 'pipeline' | 'documents' | 'payments'>('profile');

  // Mutation states
  const [statusNote, setStatusNote] = useState('');
  const [activityTitle, setActivityTitle] = useState('Gọi điện thoại tư vấn');
  const [activityDesc, setActivityDesc] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadProfileValues>({
    resolver: zodResolver(leadProfileSchema),
    defaultValues: {
      fullName: lead.fullName,
      parentName: lead.parentName || '',
      phone: lead.phone,
      email: lead.email || '',
      source: lead.source,
      grade: lead.grade,
      notes: lead.notes || '',
    },
  });

  const handleUpdateProfile = async (values: LeadProfileValues) => {
    const res = await updateLeadProfile(lead.id, values);
    if (res.success) {
      setSuccessMsg('🎉 Cập nhật hồ sơ thành công!');
      setTimeout(() => setSuccessMsg(''), 5000);
      router.refresh();
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle) return;
    const res = await addConsultationActivity(lead.id, {
      title: activityTitle,
      description: activityDesc,
    });
    if (res.success) {
      setActivityDesc('');
      setSuccessMsg('🎉 Đã lưu hoạt động tư vấn!');
      setTimeout(() => setSuccessMsg(''), 5000);
      router.refresh();
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as LeadStatus;
    if (nextStatus === lead.status) return;

    if (window.confirm(`Xác nhận chuyển trạng thái lead sang: ${statusLabels[nextStatus]}?`)) {
      const res = await updateLeadPipelineStatus(lead.id, nextStatus, statusNote);
      if (res.success) {
        setStatusNote('');
        setSuccessMsg('🎉 Đã cập nhật trạng thái phễu!');
        setTimeout(() => setSuccessMsg(''), 5000);
        router.refresh();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/leads`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">{lead.leadCode}</span>
              <Badge className={statusBadgeStyles[lead.status]}>{statusLabels[lead.status]}</Badge>
            </div>
            <h2 className="text-xl font-black text-slate-950 dark:text-white mt-1">{lead.fullName}</h2>
          </div>
        </div>

        {/* Status quick select */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Lý do/ghi chú chuyển bước..."
            className="h-9 w-full sm:w-56 text-xs"
            value={statusNote}
            onChange={e => setStatusNote(e.target.value)}
          />
          <Select
            className="h-9 w-full sm:w-56 text-xs font-bold"
            value={lead.status}
            onChange={handleStatusChange}
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
          {successMsg}
        </div>
      )}

      {/* Tabs navigation */}
      <Tabs>
        <TabsList>
          <TabsTrigger active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
            Hồ sơ & Liên hệ
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'activities'} onClick={() => setActiveTab('activities')}>
            Lịch sử chăm sóc ({activities.length})
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'pipeline'} onClick={() => setActiveTab('pipeline')}>
            Lịch sử bước phễu ({pipeline.length})
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'documents'} onClick={() => setActiveTab('documents')}>
            Hồ sơ bàn giao ({documents.length})
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>
            Học phí & Giữ chỗ ({payments.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile & Contact information */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Chỉnh sửa Hồ sơ Lead</CardTitle>
                <CardDescription>Cập nhật thông tin học sinh và thông tin liên hệ phụ huynh.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-4 font-sans text-slate-900 dark:text-slate-50">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Họ và tên học sinh *</label>
                      <Input placeholder="Nguyễn Văn A" {...register('fullName')} />
                      {errors.fullName && (
                        <p className="text-xs text-rose-600 font-bold">{errors.fullName.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Họ và tên phụ huynh</label>
                      <Input placeholder="Nguyễn Văn B" {...register('parentName')} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Số điện thoại liên hệ *</label>
                      <Input placeholder="0912345678" {...register('phone')} />
                      {errors.phone && (
                        <p className="text-xs text-rose-600 font-bold">{errors.phone.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email phụ huynh</label>
                      <Input placeholder="parent@example.com" {...register('email')} />
                      {errors.email && (
                        <p className="text-xs text-rose-600 font-bold">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Khối lớp đăng ký *</label>
                      <Select {...register('grade')}>
                        {gradeLevels.map(g => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nguồn thông tin *</label>
                      <Select {...register('source')}>
                        {leadSources.map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Ghi chú chi tiết</label>
                    <Textarea placeholder="Nhu cầu tư vấn, học bổng mong muốn..." {...register('notes')} />
                  </div>

                  <div className="flex justify-end pt-3">
                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      disabled={isSubmitting}
                    >
                      Cập nhật hồ sơ
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin Tuyển sinh</CardTitle>
                <CardDescription>Tổng quan trạng thái tuyển sinh hiện tại của học sinh.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Học sinh</div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">{lead.fullName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Điện thoại</div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">{lead.phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Email phụ huynh</div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">{lead.email || '-'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Khối tuyển sinh</div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">{lead.grade}</div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-400">Ngày tạo lead</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(lead.createdAt).toLocaleDateString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2: Activities & Logs */}
        {activeTab === 'activities' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Nhật ký trao đổi tư vấn</CardTitle>
                <CardDescription>Ghi nhận tiến trình liên hệ, hướng dẫn tuyển sinh.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {activities.length ? (
                  <div className="relative border-l border-slate-200 dark:border-slate-800 pl-5 space-y-6">
                    {activities.map(act => (
                      <div key={act.id} className="relative">
                        <div className="absolute -left-[27px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-200 text-slate-600 border-4 border-white dark:bg-slate-800 dark:text-slate-400 dark:border-slate-950">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-600 dark:bg-slate-450" />
                        </div>
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-black text-sm text-slate-900 dark:text-white">{act.title}</span>
                          <span className="text-[10px] font-semibold text-slate-450 flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {new Date(act.activityAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        {act.description && (
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850">
                            {act.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-slate-400 text-center py-6">
                    Chưa có nhật ký trao đổi nào được ghi nhận cho lead này.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thêm Hoạt động Mới</CardTitle>
                <CardDescription>Lưu nhanh biên bản trao đổi chăm sóc phụ huynh.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddActivity} className="space-y-4 font-sans text-slate-900 dark:text-slate-50">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Hình thức trao đổi</label>
                    <Select value={activityTitle} onChange={e => setActivityTitle(e.target.value)}>
                      <option value="Gọi điện thoại tư vấn">📞 Gọi điện thoại tư vấn</option>
                      <option value="Gửi email thông tin">📧 Gửi email thông tin</option>
                      <option value="Gặp mặt trực tiếp tại trường">🏫 Gặp mặt trực tiếp</option>
                      <option value="Nhắn tin qua Zalo/Viber">💬 Nhắn tin Zalo/Viber</option>
                      <option value="Tham quan trường (School Tour)">🏛️ Tham quan trường</option>
                      <option value="Lên lịch thi test năng lực">📝 Lên lịch thi test</option>
                      <option value="Trao đổi kết quả học tập">📊 Trao đổi kết quả</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nội dung chi tiết</label>
                    <Textarea
                      placeholder="Chi tiết câu hỏi của phụ huynh và các hướng dẫn đã cung cấp..."
                      rows={4}
                      value={activityDesc}
                      onChange={e => setActivityDesc(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                    Lưu hoạt động
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 3: Pipeline History */}
        {activeTab === 'pipeline' && (
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử thay đổi bước phễu tuyển sinh</CardTitle>
              <CardDescription>Theo dõi hành trình của lead qua các giai đoạn trong quy trình tuyển sinh.</CardDescription>
            </CardHeader>
            <CardContent>
              {pipeline.length ? (
                <div className="space-y-4">
                  {pipeline.map(pipe => (
                    <div
                      key={pipe.id}
                      className="flex items-start gap-4 rounded-xl border border-slate-100 p-4 dark:border-slate-900 hover:bg-slate-50/20 transition-all"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                        <History className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {pipe.fromStatus ? (
                              <>
                                <Badge className={cn('text-[9px] border uppercase font-bold', statusBadgeStyles[pipe.fromStatus])}>
                                  {statusLabels[pipe.fromStatus]}
                                </Badge>
                                <span className="text-xs text-slate-400 font-bold">→</span>
                              </>
                            ) : null}
                            <Badge className={cn('text-[9px] border uppercase font-bold', statusBadgeStyles[pipe.toStatus])}>
                              {statusLabels[pipe.toStatus]}
                            </Badge>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-450 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(pipe.changedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        {pipe.note && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                            {pipe.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-400 text-center py-6">
                  Chưa ghi nhận lịch sử chuyển trạng thái.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Documents list placeholder */}
        {activeTab === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle>Danh mục hồ sơ học sinh bàn giao</CardTitle>
              <CardDescription>Bàn giao học bạ, khai sinh, ảnh thẻ từ CRM phục vụ nhập học.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {documents.length ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {documents.map(docItem => (
                    <div key={docItem.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4.5 w-4.5 text-slate-400" />
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{docItem.name}</span>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{docItem.type}</div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-bold text-[9px] tracking-wide">
                        {docItem.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-450 dark:bg-slate-900">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="mt-3 text-sm font-black text-slate-900 dark:text-white">Chưa có hồ sơ học sinh bàn giao</h4>
                  <p className="mt-1 text-xs text-slate-550 max-w-sm mx-auto">
                    Quy trình thu thập tài liệu đang chờ. Khi phụ huynh nộp học bạ gốc, khai sinh hoặc ảnh 3x4, các tài liệu sẽ tự động đồng bộ tại đây.
                  </p>
                  <Button variant="outline" className="mt-4 font-bold border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-200">
                    Thêm hồ sơ minh chứng
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 5: Payments list placeholder */}
        {activeTab === 'payments' && (
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử giao dịch đóng phí</CardTitle>
              <CardDescription>Danh sách hóa đơn phí giữ chỗ, học phí tuyển sinh của học sinh.</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length ? (
                <div className="space-y-4">
                  {payments.map(pay => (
                    <div
                      key={pay.id}
                      className="flex items-center justify-between border border-slate-100 p-4 rounded-xl dark:border-slate-900 hover:bg-slate-50/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                          <CreditCard className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {pay.type === 'seat_reservation' ? 'Phí giữ chỗ nhập học' : 'Học phí nhập học'}
                          </div>
                          <div className="text-[10px] font-mono font-bold text-slate-450">{pay.transferContent}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-950 dark:text-white">
                          {pay.amount.toLocaleString('vi-VN')} VND
                        </div>
                        <Badge className="mt-1 bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-bold text-[9px] tracking-wide">
                          {pay.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-450 dark:bg-slate-900">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h4 className="mt-3 text-sm font-black text-slate-900 dark:text-white">Chưa ghi nhận giao dịch đóng học phí</h4>
                  <p className="mt-1 text-xs text-slate-550 max-w-sm mx-auto">
                    Chưa có bất kỳ hóa đơn nào được phát hành cho học sinh này qua phân hệ kế toán tài chính.
                  </p>
                  <Link href={`/${locale}/payments`}>
                    <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                      Phát hành hóa đơn học phí
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  );
}
