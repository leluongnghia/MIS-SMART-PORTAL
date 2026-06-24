'use client';

import { useState, useTransition, useEffect } from 'react';
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
  Send,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
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
  sendLeadEmail,
} from './actions';
import { type LeadStatus } from '../actions';

const leadProfileSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên học sinh là bắt buộc'),
  parentName: z.string().optional().nullable(),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  email: z.string().optional().nullable(),
  source: z.string().min(1, 'Nguồn là bắt buộc'),
  grade: z.string().min(1, 'Khối là bắt buộc'),
  notes: z.string().optional().nullable(),
  
  // Student Details
  dateOfBirth: z.string().optional().nullable(),
  currentClass: z.string().optional().nullable(),
  currentSchool: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  enrollmentSystem: z.string().optional().nullable(),

  // Test Details
  testDate: z.string().optional().nullable(),
  testTime: z.string().optional().nullable(),
  mathScore: z.coerce.number().optional().nullable(),
  englishScore: z.coerce.number().optional().nullable(),
  vietnameseScore: z.coerce.number().optional().nullable(),

  // Financial & Discount Details
  scholarshipPercent: z.coerce.number().optional().nullable(),
  periodDiscountPercent: z.coerce.number().optional().nullable(),
  siblingDiscountPercent: z.coerce.number().optional().nullable(),
  staffDiscountPercent: z.coerce.number().optional().nullable(),
  otherDiscountPercent: z.coerce.number().optional().nullable(),
  finalTuition: z.coerce.number().optional().nullable(),
  seatReservationFee: z.coerce.number().optional().nullable(),
  additionalFee: z.coerce.number().optional().nullable(),
  seatReservationDate: z.string().optional().nullable(),

  // Post-Enrollment Details
  nationalStudentId: z.string().optional().nullable(),
  insuranceId: z.string().optional().nullable(),
  moetStudentId: z.string().optional().nullable(),
  siblingsInfo: z.any().optional().nullable(),
});

type LeadProfileValues = z.infer<typeof leadProfileSchema>;

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
  
  dateOfBirth: Date | null;
  currentClass: string | null;
  currentSchool: string | null;
  address: string | null;
  enrollmentSystem: string | null;

  testDate: Date | null;
  testTime: string | null;
  mathScore: number | null;
  englishScore: number | null;
  vietnameseScore: number | null;

  scholarshipPercent: number | null;
  periodDiscountPercent: number | null;
  siblingDiscountPercent: number | null;
  staffDiscountPercent: number | null;
  otherDiscountPercent: number | null;
  finalTuition: number | null;
  seatReservationFee: number | null;
  additionalFee: number | null;
  seatReservationDate: Date | null;

  nationalStudentId: string | null;
  insuranceId: string | null;
  moetStudentId: string | null;
  siblingsInfo: any | null;
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
  received: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  consulting: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
  test_scheduled: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800',
  test_participated: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  seat_reserved: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
  docs_submitted: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  enrolled: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
};

const statusLabels: Record<LeadStatus, string> = {
  received: 'Tiếp nhận Data',
  consulting: 'Đang tư vấn',
  test_scheduled: 'Đăng ký Test',
  test_participated: 'Đã tham gia Test',
  seat_reserved: 'Đã giữ chỗ',
  docs_submitted: 'Đã nộp hồ sơ',
  enrolled: 'Đã nhập học',
  cancelled: 'Hủy/Rút hồ sơ',
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

const ENROLLMENT_SYSTEMS = ['Hệ Chất lượng cao', 'Hệ Song ngữ', 'Hệ Quốc tế'];
const BASE_TUITION_FEE = 60000000; // 60 Triệu VND

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

  // Email modal / editor state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadProfileValues>({
    resolver: zodResolver(leadProfileSchema) as any,
    defaultValues: {
      fullName: lead.fullName,
      parentName: lead.parentName || '',
      phone: lead.phone,
      email: lead.email || '',
      source: lead.source,
      grade: lead.grade,
      notes: lead.notes || '',
      
      dateOfBirth: lead.dateOfBirth ? new Date(lead.dateOfBirth).toISOString().split('T')[0] : '',
      currentClass: lead.currentClass || '',
      currentSchool: lead.currentSchool || '',
      address: lead.address || '',
      enrollmentSystem: lead.enrollmentSystem || ENROLLMENT_SYSTEMS[0],

      testDate: lead.testDate ? new Date(lead.testDate).toISOString().split('T')[0] : '',
      testTime: lead.testTime || '',
      mathScore: lead.mathScore ?? null,
      englishScore: lead.englishScore ?? null,
      vietnameseScore: lead.vietnameseScore ?? null,

      scholarshipPercent: lead.scholarshipPercent ?? 0,
      periodDiscountPercent: lead.periodDiscountPercent ?? 0,
      siblingDiscountPercent: lead.siblingDiscountPercent ?? 0,
      staffDiscountPercent: lead.staffDiscountPercent ?? 0,
      otherDiscountPercent: lead.otherDiscountPercent ?? 0,
      finalTuition: lead.finalTuition ?? BASE_TUITION_FEE,
      seatReservationFee: lead.seatReservationFee ?? 5000000,
      additionalFee: lead.additionalFee ?? 0,
      seatReservationDate: lead.seatReservationDate ? new Date(lead.seatReservationDate).toISOString().split('T')[0] : '',

      nationalStudentId: lead.nationalStudentId || '',
      insuranceId: lead.insuranceId || '',
      moetStudentId: lead.moetStudentId || '',
      siblingsInfo: lead.siblingsInfo || { hasSiblings: false, siblingName: '', siblingClass: '' },
    },
  });

  // Watch fields for tuition fee calculation
  const scholarshipPercent = watch('scholarshipPercent') || 0;
  const periodDiscountPercent = watch('periodDiscountPercent') || 0;
  const siblingDiscountPercent = watch('siblingDiscountPercent') || 0;
  const staffDiscountPercent = watch('staffDiscountPercent') || 0;
  const otherDiscountPercent = watch('otherDiscountPercent') || 0;
  const additionalFee = watch('additionalFee') || 0;
  const parentEmail = watch('email') || '';
  const fullName = watch('fullName') || '';
  const parentName = watch('parentName') || '';

  // Calculate final tuition dynamically on changes
  useEffect(() => {
    const totalDiscountPercent =
      Number(scholarshipPercent) +
      Number(periodDiscountPercent) +
      Number(siblingDiscountPercent) +
      Number(staffDiscountPercent) +
      Number(otherDiscountPercent);
    
    const discountedTuition = BASE_TUITION_FEE * (1 - Math.min(totalDiscountPercent, 100) / 100);
    const finalCalculated = discountedTuition + Number(additionalFee);
    
    setValue('finalTuition', finalCalculated);
  }, [
    scholarshipPercent,
    periodDiscountPercent,
    siblingDiscountPercent,
    staffDiscountPercent,
    otherDiscountPercent,
    additionalFee,
    setValue
  ]);

  const handleUpdateProfile = async (values: LeadProfileValues) => {
    const formattedValues = {
      ...values,
      dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : null,
      testDate: values.testDate ? new Date(values.testDate) : null,
      seatReservationDate: values.seatReservationDate ? new Date(values.seatReservationDate) : null,
    };

    const res = await updateLeadProfile(lead.id, formattedValues as any);
    if (res.success) {
      setSuccessMsg('🎉 Cập nhật hồ sơ thành công!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

    if (window.confirm(`Xác nhận chuyển trạng thái tuyển sinh sang: ${statusLabels[nextStatus]}?`)) {
      const res = await updateLeadPipelineStatus(lead.id, nextStatus, statusNote);
      if (res.success) {
        setStatusNote('');
        setSuccessMsg('🎉 Đã cập nhật trạng thái phễu tuyển sinh!');
        setTimeout(() => setSuccessMsg(''), 5000);
        router.refresh();
      }
    }
  };

  // Generate Email Templates based on pipeline steps
  const openEmailTemplate = (templateType: 'test_notice' | 'test_result' | 'reservation' | 'enrolled') => {
    if (!parentEmail) {
      alert('Vui lòng nhập Email phụ huynh trước khi gửi thông báo!');
      return;
    }

    const todayStr = new Date().toLocaleDateString('vi-VN');
    let subject = '';
    let body = '';

    if (templateType === 'test_notice') {
      const testDate = watch('testDate') || '...';
      const testTime = watch('testTime') || '...';
      subject = `Thông báo lịch thi test đánh giá năng lực đầu vào - Học sinh ${fullName}`;
      body = `<p>Kính gửi quý phụ huynh <b>${parentName || 'Phụ huynh'}</b>,</p>
<p>Ban tuyển sinh Trường Phổ thông Liên cấp Đa Trí Tuệ (MIS) xin thông báo lịch đánh giá năng lực đầu vào của con <b>${fullName}</b> như sau:</p>
<ul>
  <li><b>Ngày thi:</b> ${testDate}</li>
  <li><b>Giờ tập trung:</b> ${testTime}</li>
  <li><b>Địa điểm:</b> Văn phòng Tuyển sinh, Tòa nhà Tiểu học MIS, Cầu Giấy, Hà Nội.</li>
</ul>
<p>Quý phụ huynh vui lòng cho con đến đúng giờ để làm thủ tục thi test. Mọi thắc mắc vui lòng liên hệ hotline: 024.6027.8666.</p>
<br/>
<p>Trân trọng,<br/><b>Ban Tuyển sinh Trường Đa Trí Tuệ MIS</b></p>`;
    } else if (templateType === 'test_result') {
      const math = watch('mathScore') ?? 'Chưa có';
      const eng = watch('englishScore') ?? 'Chưa có';
      const viet = watch('vietnameseScore') ?? 'Chưa có';
      const scholarship = watch('scholarshipPercent') || 0;
      subject = `Thông báo kết quả thi test đánh giá đầu vào - Học sinh ${fullName}`;
      body = `<p>Kính gửi quý phụ huynh <b>${parentName || 'Phụ huynh'}</b>,</p>
<p>Trường Đa Trí Tuệ (MIS) xin chúc mừng học sinh <b>${fullName}</b> đã hoàn thành kỳ kiểm tra năng lực đầu vào. Kết quả kiểm tra của con cụ thể:</p>
<ul>
  <li><b>Môn Toán/Tư duy:</b> ${math} điểm</li>
  <li><b>Môn Tiếng Anh:</b> ${eng} điểm</li>
  <li><b>Môn Tiếng Việt:</b> ${viet} điểm</li>
  ${scholarship > 0 ? `<li><b>Mức học bổng ưu tiên đạt được:</b> <span style="color: #16a34a; font-weight: bold;">${scholarship}%</span></li>` : ''}
</ul>
<p>Dựa trên kết quả này, con đã đủ điều kiện nhập học. Kính mời quý phụ huynh hoàn thành đóng phí giữ chỗ <b>5.000.000 VND</b> để chính thức giữ chỗ cho con vào khối lớp học đăng ký.</p>
<br/>
<p>Trân trọng,<br/><b>Ban Tuyển sinh Trường Đa Trí Tuệ MIS</b></p>`;
    } else if (templateType === 'reservation') {
      const fee = Number(watch('seatReservationFee') || 5000000).toLocaleString('vi-VN');
      const discount = Number(scholarshipPercent) + Number(periodDiscountPercent) + Number(siblingDiscountPercent);
      subject = `Thư xác nhận giữ chỗ và đóng phí thành công - Học sinh ${fullName}`;
      body = `<p>Kính gửi quý phụ huynh <b>${parentName || 'Phụ huynh'}</b>,</p>
<p>Nhà trường xác nhận đã nhận thành công khoản phí giữ chỗ nhập học trị giá <b>${fee} VND</b> của học sinh <b>${fullName}</b>.</p>
<p>Hồ sơ của con đã được đưa vào diện ưu tiên xếp lớp với mức ưu đãi học phí áp dụng là <b>${discount}%</b>.</p>
<p>Văn phòng sẽ liên hệ thông báo lịch nộp hồ sơ nhập học bản cứng và đồng phục khi đến thời gian quy định.</p>
<br/>
<p>Trân trọng,<br/><b>Văn phòng Tuyển sinh Trường Đa Trí Tuệ MIS</b></p>`;
    } else if (templateType === 'enrolled') {
      const code = lead.leadCode;
      subject = `Xác nhận nộp hồ sơ & Chào mừng học sinh nhập học - Học sinh ${fullName}`;
      body = `<p>Kính gửi quý phụ huynh <b>${parentName || 'Phụ huynh'}</b>,</p>
<p>Nhà trường xác nhận đã tiếp nhận đầy đủ hồ sơ nhập học bản cứng của con <b>${fullName}</b>.</p>
<p>Mã định danh hồ sơ học sinh trên hệ thống của con là: <b>${code}</b>.</p>
<p>Chào mừng con chính thức gia nhập ngôi nhà chung Trường Phổ thông Liên cấp Đa Trí Tuệ MIS!</p>
<br/>
<p>Trân trọng,<br/><b>Văn phòng Tuyển sinh & Ban Giám Hiệu MIS</b></p>`;
    }

    setEmailSubject(subject);
    setEmailBody(body);
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await sendLeadEmail(lead.id, {
        subject: emailSubject,
        body: emailBody,
        toEmail: parentEmail,
      });
      if (res.success) {
        setShowEmailModal(false);
        setSuccessMsg(res.sentReal ? '📧 Đã gửi email thông báo thành công!' : '📧 Đã lưu và giả lập gửi email thành công (Chưa cấu hình SMTP)!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setSuccessMsg(''), 5000);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      alert('Gửi email thất bại.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Logic to determine showing/hiding sections based on status
  const currentStatus = lead.status;
  const showTestSection = ['test_scheduled', 'test_participated', 'seat_reserved', 'docs_submitted', 'enrolled', 'cancelled'].includes(currentStatus);
  const showFinanceSection = ['seat_reserved', 'docs_submitted', 'enrolled', 'cancelled'].includes(currentStatus);
  const showEnrollmentLockedSection = ['docs_submitted', 'enrolled', 'cancelled'].includes(currentStatus);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/leads`}>
            <Button onClick={() => alert('Tính năng đang được phát triển')} type="button"  variant="outline" size="icon">
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
            placeholder="Ghi chú chuyển bước..."
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
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
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
            Hành trình phễu ({pipeline.length})
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'documents'} onClick={() => setActiveTab('documents')}>
            Hồ sơ bàn giao ({documents.length})
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>
            Học phí & Giữ chỗ ({payments.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile & Details */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmit(handleUpdateProfile as any)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Card A: Core profile fields */}
              <Card>
                <CardHeader>
                  <CardTitle>Hồ sơ học sinh & Phụ huynh</CardTitle>
                  <CardDescription>Các thông tin liên hệ và thông tin học tập cơ bản.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 font-sans text-slate-900 dark:text-slate-50">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Họ và tên học sinh *</label>
                      <Input placeholder="Nguyễn Văn A" {...register('fullName')} />
                      {errors.fullName && (
                        <p className="text-xs text-rose-600 font-bold">{errors.fullName.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Ngày sinh học sinh</label>
                      <Input type="date" {...register('dateOfBirth')} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Học hệ nào / Hệ đăng ký *</label>
                      <Select {...register('enrollmentSystem')}>
                        {ENROLLMENT_SYSTEMS.map(sys => (
                          <option key={sys} value={sys}>
                            {sys}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Khối lớp quan tâm *</label>
                      <Select {...register('grade')}>
                        {gradeLevels.map(g => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Trường đang học cũ</label>
                      <Input placeholder="Tiểu học Nghĩa Tân" {...register('currentSchool')} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Lớp đang học cũ</label>
                      <Input placeholder="Lớp 5A" {...register('currentClass')} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Địa chỉ cư trú hiện tại</label>
                    <Input placeholder="Số 10 Ngõ 102 Cầu Giấy, Hà Nội" {...register('address')} />
                  </div>

                  <hr className="border-slate-100 dark:border-slate-900 my-4" />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Họ và tên phụ huynh *</label>
                      <Input placeholder="Nguyễn Văn B" {...register('parentName')} />
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

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Số điện thoại phụ huynh *</label>
                      <Input placeholder="0912345678" {...register('phone')} />
                      {errors.phone && (
                        <p className="text-xs text-rose-600 font-bold">{errors.phone.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email liên hệ phụ huynh</label>
                      <Input placeholder="parent@example.com" {...register('email')} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Ghi chú chi tiết</label>
                    <Textarea placeholder="Các yêu cầu chăm sóc đặc biệt..." {...register('notes')} />
                  </div>
                </CardContent>
              </Card>

              {/* Card B: Đăng ký & Điểm thi Test (Hiển thị khi ở trạng thái test) */}
              {showTestSection ? (
                <Card className="border-amber-100 dark:border-amber-950/40">
                  <CardHeader className="bg-amber-50/20 dark:bg-amber-950/10">
                    <CardTitle className="text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Đăng ký & Kết quả Test Đầu Vào
                    </CardTitle>
                    <CardDescription>Nhập lịch hẹn test năng lực và kết quả điểm số thi 3 môn.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4 text-slate-900 dark:text-slate-50">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Ngày thi hẹn test</label>
                        <Input type="date" {...register('testDate')} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Giờ thi hẹn test</label>
                        <Input placeholder="08:30" {...register('testTime')} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEmailTemplate('test_notice')}
                        className="text-xs font-bold flex items-center gap-1 border-amber-200 text-amber-800 hover:bg-amber-50"
                      >
                        <Send className="h-3 w-3" />
                        Gửi Email thông báo Lịch Test
                      </Button>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-900 my-4" />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Điểm Toán / Tư duy</label>
                        <Input type="number" step="0.5" placeholder="8.5" {...register('mathScore')} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Điểm Tiếng Anh</label>
                        <Input type="number" step="0.5" placeholder="9.0" {...register('englishScore')} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Điểm Tiếng Việt</label>
                        <Input type="number" step="0.5" placeholder="7.5" {...register('vietnameseScore')} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEmailTemplate('test_result')}
                        className="text-xs font-bold flex items-center gap-1 border-purple-200 text-purple-800 hover:bg-purple-50"
                      >
                        <Send className="h-3 w-3" />
                        Gửi Email kết quả & HD đóng phí
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* Card C: Tài chính & Ưu đãi học phí (Hiển thị từ bước đóng phí giữ chỗ) */}
              {showFinanceSection ? (
                <Card className="border-emerald-100 dark:border-emerald-950/40">
                  <CardHeader className="bg-emerald-50/20 dark:bg-emerald-950/10">
                    <CardTitle className="text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Chi tiết Ưu đãi & Học phí Áp dụng
                    </CardTitle>
                    <CardDescription>Nhập tỷ lệ ưu đãi % giảm trừ học phí và chi phí giữ chỗ nhập học.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4 text-slate-900 dark:text-slate-50">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-600">Học bổng (%)</label>
                        <Input type="number" placeholder="20" {...register('scholarshipPercent')} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-600">Đợt đóng (%)</label>
                        <Input type="number" placeholder="5" {...register('periodDiscountPercent')} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-600">Anh/chị/em (%)</label>
                        <Input type="number" placeholder="0" {...register('siblingDiscountPercent')} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-600">Con CBNV (%)</label>
                        <Input type="number" placeholder="0" {...register('staffDiscountPercent')} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-600">Khác (%)</label>
                        <Input type="number" placeholder="0" {...register('otherDiscountPercent')} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Phí bổ trợ / Phí phát sinh (VND)</label>
                        <Input type="number" placeholder="0" {...register('additionalFee')} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Phí giữ chỗ (VND)</label>
                        <Input type="number" placeholder="5000000" {...register('seatReservationFee')} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Ngày đóng phí giữ chỗ</label>
                        <Input type="date" {...register('seatReservationDate')} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tổng học phí áp dụng thực tế</label>
                        <div className="h-10 px-3 flex items-center font-black text-base text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-250">
                          {Number(watch('finalTuition') || BASE_TUITION_FEE).toLocaleString('vi-VN')} VND
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEmailTemplate('reservation')}
                        className="text-xs font-bold flex items-center gap-1 border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                      >
                        <Send className="h-3 w-3" />
                        Gửi Email Xác nhận Giữ chỗ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* Card D: Mở khóa Hồ sơ Nhập học (Chỉ cho phép ở Bước nộp hồ sơ trở đi) */}
              {showEnrollmentLockedSection ? (
                <Card className="border-indigo-150 dark:border-indigo-950/40">
                  <CardHeader className="bg-indigo-50/20 dark:bg-indigo-950/10">
                    <CardTitle className="text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Mở khóa: Hồ sơ Bàn giao Nhập học
                    </CardTitle>
                    <CardDescription>
                      Chỉ mở khóa ở giai đoạn Đã nộp hồ sơ trở đi. Nhập mã số học sinh, định danh và anh/chị/em.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4 text-slate-900 dark:text-slate-50">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Mã định danh cá nhân HS</label>
                        <Input placeholder="001209012345" {...register('nationalStudentId')} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Mã học sinh BGD cấp</label>
                        <Input placeholder="HS-2026-BGD-11" {...register('moetStudentId')} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Mã bảo hiểm y tế BHYT</label>
                        <Input placeholder="GD4012345678" {...register('insuranceId')} />
                      </div>
                    </div>

                    <div className="border border-slate-100 dark:border-slate-800 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="hasSiblings"
                          checked={watch('siblingsInfo.hasSiblings') || false}
                          onChange={(e) => setValue('siblingsInfo.hasSiblings', e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <label htmlFor="hasSiblings" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Có anh/chị/em ruột đang học tại hệ thống trường MIS
                        </label>
                      </div>

                      {watch('siblingsInfo.hasSiblings') && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500">Họ và tên anh/chị/em ruột</label>
                            <Input
                              placeholder="Nguyễn Văn C"
                              value={watch('siblingsInfo.siblingName') || ''}
                              onChange={(e) => setValue('siblingsInfo.siblingName', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500">Khối lớp đang học</label>
                            <Input
                              placeholder="Lớp 9A2"
                              value={watch('siblingsInfo.siblingClass') || ''}
                              onChange={(e) => setValue('siblingsInfo.siblingClass', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEmailTemplate('enrolled')}
                        className="text-xs font-bold flex items-center gap-1 border-indigo-200 text-indigo-800 hover:bg-indigo-50"
                      >
                        <Send className="h-3 w-3" />
                        Gửi Email Xác nhận Nộp hồ sơ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            {/* Right sidebar: Overview & Submission */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tổng quan Tuyển sinh</CardTitle>
                  <CardDescription>Trạng thái phễu hiện tại của lead.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Học sinh</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">{fullName}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Điện thoại</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">{watch('phone')}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Email liên hệ</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">{parentEmail || '-'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Khối tuyển sinh</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">{watch('grade')}</div>
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

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold mt-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang lưu...' : 'Cập nhật toàn bộ hồ sơ'}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick warning card if email is missing */}
              {!parentEmail && (
                <Card className="border-rose-100 dark:border-rose-950 bg-rose-50/20 dark:bg-rose-950/10">
                  <CardContent className="pt-4 flex gap-2">
                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-rose-700 dark:text-rose-300">Không có Email liên lạc!</p>
                      <p className="text-slate-550 dark:text-slate-400 mt-1 leading-normal">
                        Vui lòng cập nhật Email phụ huynh ở thẻ Hồ sơ để gửi được thông báo lịch thi test, kết quả hoặc giữ chỗ.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </form>
        )}

        {/* Tab 2: Activities logs */}
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
                          <pre className="text-xs font-sans font-medium text-slate-600 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 whitespace-pre-wrap leading-relaxed">
                            {act.description}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-slate-400 text-center py-6">
                    Chưa có nhật ký chăm sóc nào cho học sinh này.
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
              <CardTitle>Lịch sử chuyển đổi bước phễu tuyển sinh</CardTitle>
              <CardDescription>Theo dõi hành trình đổi trạng thái của học sinh.</CardDescription>
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
                  Chưa có lịch sử trạng thái phễu.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Documents list */}
        {activeTab === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle>Danh mục hồ sơ học sinh bàn giao</CardTitle>
              <CardDescription>Bàn giao học bạ, khai sinh, ảnh thẻ phục vụ nhập học.</CardDescription>
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
                    Quy trình thu thập tài liệu đang chờ. Khi phụ huynh nộp học bạ gốc, khai sinh hoặc ảnh 3x4, các tài liệu sẽ tự động hiển thị tại đây.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 5: Payments list */}
        {activeTab === 'payments' && (
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử giao dịch đóng phí</CardTitle>
              <CardDescription>Danh sách hóa đơn phí giữ chỗ, học phí của học sinh.</CardDescription>
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
                           {pay.status === 'paid' ? 'Đã đóng' : pay.status}
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
                    Chưa có bất kỳ hóa đơn nào được phát hành cho học sinh này.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </Tabs>

      {/* Email Editor Modal Popup */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">Soạn thảo & Chỉnh sửa Thư mẫu</h3>
                <p className="text-xs text-slate-500 mt-0.5">Người nhận: {parentEmail}</p>
              </div>
              <Badge className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px]">Tập tin đính kèm: Không</Badge>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tiêu đề Thư (Subject) *</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="font-bold border-slate-250"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nội dung Thư (HTML body) *</label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={12}
                  className="font-mono text-xs leading-relaxed border-slate-250 p-4 min-h-[300px]"
                  required
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmailModal(false)}
                className="font-bold border-slate-300 dark:border-slate-800"
              >
                Hủy bỏ
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {sendingEmail ? 'Đang gửi...' : 'Gửi Email thông báo'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
