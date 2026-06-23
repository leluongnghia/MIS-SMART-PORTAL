import React, { useState, useEffect } from 'react';
import { CrisisIncident } from '../types';
import { 
  X, Save, Send, ShieldAlert, AlertTriangle, MessageSquareWarning, Link as LinkIcon, Shield, Megaphone, UserSquare, Clock
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tên vụ việc'),
  detectedAt: z.string().min(1, 'Vui lòng nhập thời điểm phát hiện'),
  summary: z.string().min(20, 'Tóm tắt tình huống cần ít nhất 20 ký tự'),
  details: z.string().optional(),
  
  source: z.string().min(1, 'Vui lòng chọn nguồn phát sinh'),
  sourceDetail: z.string().optional(),
  impactScope: z.array(z.string()).min(1, 'Vui lòng chọn phạm vi ảnh hưởng'),
  publicVisibility: z.string().min(1, 'Vui lòng chọn mức độ lan truyền'),
  affectedStudentIds: z.array(z.string()).optional(),
  affectedClassIds: z.array(z.string()).optional(),
  
  severity: z.enum(['Theo dõi', 'Cần xử lý', 'Nghiêm trọng', 'Khẩn cấp']),
  riskArea: z.array(z.string()).min(1, 'Vui lòng chọn nhóm rủi ro'),
  urgencyReason: z.string().optional(),
  potentialImpact: z.string().optional(),
  
  ownerId: z.string().min(1, 'Vui lòng chọn người phụ trách chính'),
  spokespersonId: z.string().optional(),
  relatedDepartments: z.array(z.string()).min(1, 'Vui lòng chọn phòng ban liên quan'),
  responseTeam: z.array(z.string()).optional(),
  watchers: z.array(z.string()).optional(),
  
  firstAction: z.string().min(1, 'Vui lòng nhập hành động đầu tiên'),
  firstActionDeadline: z.string().optional(),
  verificationPlan: z.string().optional(),
  containmentPlan: z.string().optional(),
  parentContactPlan: z.string().optional(),
  authorityContactNeeded: z.boolean().optional(),
  
  keyMessage: z.string().optional(),
  communicationChannels: z.array(z.string()).optional(),
  approvalRequired: z.boolean().optional(),
  approverId: z.string().optional(),
  doNotPublishExternally: z.boolean().optional(),
  publicResponseStatus: z.string().optional(),
  
  relatedTicketId: z.string().optional(),
  relatedEventId: z.string().optional(),
  createRiskRecord: z.boolean().optional(),
  relatedRiskId: z.string().optional(),
  createBoardDirective: z.boolean().optional(),
  createTask: z.boolean().optional(),
  internalNote: z.string().optional()
}).superRefine((data, ctx) => {
  // Severity based validation
  if (data.severity === 'Nghiêm trọng' || data.severity === 'Khẩn cấp') {
    if (!data.urgencyReason || data.urgencyReason.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Vui lòng nhập lý do cần xử lý khẩn', path: ['urgencyReason'] });
    }
    if (!data.spokespersonId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Bắt buộc chọn Người phát ngôn chính thức', path: ['spokespersonId'] });
    }
    if (!data.responseTeam || data.responseTeam.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Bắt buộc chọn Nhóm xử lý', path: ['responseTeam'] });
    }
    if (!data.verificationPlan || data.verificationPlan.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Bắt buộc nhập kế hoạch xác minh', path: ['verificationPlan'] });
    }
    if (!data.approvalRequired) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Khủng hoảng Nghiêm trọng/Khẩn cấp bắt buộc phải có BGH duyệt', path: ['approvalRequired'] });
    }
    if (data.approvalRequired && !data.approverId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Vui lòng chọn người duyệt thông điệp', path: ['approverId'] });
    }
  }

  // Khẩn cấp specific rules
  if (data.severity === 'Khẩn cấp') {
    const hasBGH = (data.relatedDepartments && data.relatedDepartments.includes('BGH'));
    if (!hasBGH) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Mức Khẩn cấp: Bắt buộc chọn BGH trong phòng ban liên quan', path: ['relatedDepartments'] });
    }
    if (!data.createBoardDirective) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Mức Khẩn cấp: Bắt buộc tạo chỉ đạo BGH', path: ['createBoardDirective'] });
    }
  }

  // Verification & containment
  if (data.publicVisibility !== 'Nội bộ') {
    if (!data.containmentPlan || data.containmentPlan.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cần có biện pháp ngăn lan rộng khi sự việc đã lọt ra ngoài nội bộ', path: ['containmentPlan'] });
    }
  }
});

type FormData = z.infer<typeof formSchema>;

interface CreateCrisisFormProps {
  onClose: () => void;
  onSubmit: (data: Partial<CrisisIncident>) => void;
}

export default function CreateCrisisForm({ onClose, onSubmit }: CreateCrisisFormProps) {
  const [crisisCode] = useState(`KH-2026-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`);

  // Format YYYY-MM-DDThh:mm for datetime-local
  const formatDatetime = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };
  
  const now = new Date();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      detectedAt: formatDatetime(now),
      summary: '',
      source: '',
      impactScope: [],
      publicVisibility: 'Nội bộ',
      severity: 'Theo dõi',
      riskArea: [],
      ownerId: 'Current User',
      relatedDepartments: [],
      doNotPublishExternally: true,
      publicResponseStatus: 'Chưa chuẩn bị',
      createRiskRecord: false,
      createBoardDirective: false,
      createTask: false,
      approvalRequired: true,
      authorityContactNeeded: false,
    }
  });

  const severity = watch('severity');
  const publicVisibility = watch('publicVisibility');
  const detectedAtStr = watch('detectedAt');

  // Auto calculate deadline & defaults based on severity
  useEffect(() => {
    if (detectedAtStr) {
      const detectedDate = new Date(detectedAtStr);
      let hoursToAdd = 24;
      if (severity === 'Cần xử lý') hoursToAdd = 12;
      else if (severity === 'Nghiêm trọng') hoursToAdd = 4;
      else if (severity === 'Khẩn cấp') hoursToAdd = 1;
      
      const deadlineDate = new Date(detectedDate.getTime() + hoursToAdd * 60 * 60 * 1000);
      setValue('firstActionDeadline', formatDatetime(deadlineDate));
    }
    
    if (severity === 'Nghiêm trọng' || severity === 'Khẩn cấp') {
      setValue('createRiskRecord', true);
      setValue('approvalRequired', true);
    }
    
    if (severity === 'Khẩn cấp') {
      setValue('createBoardDirective', true);
      // Auto add BGH if not present
      const currentDepts = watch('relatedDepartments') || [];
      if (!currentDepts.includes('BGH')) {
        setValue('relatedDepartments', [...currentDepts, 'BGH'], { shouldValidate: true });
      }
    }

    if (severity !== 'Theo dõi') {
      setValue('createTask', true);
    }
  }, [severity, detectedAtStr, setValue, watch]);

  // Auto set defaults based on visibility
  useEffect(() => {
    if (publicVisibility === 'Báo chí/cơ quan quản lý') {
      setValue('authorityContactNeeded', true);
    }
  }, [publicVisibility, setValue]);

  const handleActionSubmit = (data: FormData, status: 'DRAFT' | 'DETECTED' | 'VERIFYING') => {
    onSubmit({ ...data, crisisCode, status });
  };

  const ErrorMsg = ({ name }: { name: string }) => {
    const errorPaths = name.split('.');
    let errorObj: any = errors;
    for (const path of errorPaths) {
      if (!errorObj) break;
      errorObj = errorObj[path];
    }
    if (!errorObj?.message) return null;
    return <p className="text-red-500 text-[11px] font-medium mt-1">{errorObj.message}</p>;
  };

  const MultiSelectCheckbox = ({ options, name, currentValues }: { options: string[], name: any, currentValues: string[] }) => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map(opt => {
          const isSelected = currentValues.includes(opt);
          return (
            <label key={opt} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border ${isSelected ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <input
                type="checkbox"
                className="hidden"
                checked={isSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    setValue(name, [...currentValues, opt], { shouldValidate: true });
                  } else {
                    setValue(name, currentValues.filter(v => v !== opt), { shouldValidate: true });
                  }
                }}
              />
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>}
              {opt}
            </label>
          );
        })}
      </div>
    );
  };

  const isHighSeverity = severity === 'Nghiêm trọng' || severity === 'Khẩn cấp';

  return (
    <form className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className={`border-b px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm ${isHighSeverity ? 'bg-red-600 border-red-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            Tạo Vụ Việc Khủng Hoảng
            {isHighSeverity && <AlertTriangle className="w-5 h-5 text-red-200 animate-pulse" />}
          </h2>
          <p className={`text-xs font-medium mt-1 font-mono ${isHighSeverity ? 'text-red-200' : 'text-slate-500'}`}>
            {crisisCode} • Nghiệp vụ nhạy cảm
          </p>
        </div>
        <button type="button" onClick={onClose} className={`p-2 rounded-full transition-colors ${isHighSeverity ? 'hover:bg-red-700 text-red-100' : 'hover:bg-slate-100 text-slate-500'}`}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          
          {/* Nhóm 1: Thông tin vụ việc */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <MessageSquareWarning className="w-4 h-4 text-red-500" /> 1. Thông tin vụ việc
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Tên vụ việc <span className="text-red-500">*</span></label>
                <input type="text" {...register('title')} placeholder="Ví dụ: Phụ huynh phản ánh sự cố an toàn trên mạng xã hội" className="w-full text-sm border-slate-200 rounded-xl focus:ring-red-500 font-bold" />
                <ErrorMsg name="title" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Thời điểm phát hiện <span className="text-red-500">*</span></label>
                <input type="datetime-local" {...register('detectedAt')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-red-500" />
                <ErrorMsg name="detectedAt" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Tóm tắt tình huống <span className="text-red-500">*</span></label>
                <textarea {...register('summary')} rows={3} placeholder="Mô tả tóm tắt sự việc (ít nhất 20 ký tự)..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-red-500"></textarea>
                <ErrorMsg name="summary" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Diễn biến chi tiết</label>
                <textarea {...register('details')} rows={4} placeholder="Ghi nhận các mốc thời gian và chi tiết vụ việc..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-red-500"></textarea>
              </div>
            </div>
          </section>

          {/* Nhóm 2: Nguồn phát sinh & phạm vi */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-orange-500" /> 2. Nguồn phát sinh & phạm vi ảnh hưởng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Nguồn phát sinh <span className="text-red-500">*</span></label>
                <select {...register('source')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-red-500">
                  <option value="">-- Chọn --</option>
                  <option value="Phụ huynh phản ánh">Phụ huynh phản ánh</option>
                  <option value="Học sinh">Học sinh</option>
                  <option value="Giáo viên/Nhân viên">Giáo viên/Nhân viên</option>
                  <option value="Mạng xã hội">Mạng xã hội</option>
                  <option value="Báo chí/truyền thông">Báo chí/truyền thông</option>
                  <option value="Sự kiện trường học">Sự kiện trường học</option>
                  <option value="Cơ quan quản lý">Cơ quan quản lý</option>
                  <option value="Nội bộ phát hiện">Nội bộ phát hiện</option>
                  <option value="Khác">Khác</option>
                </select>
                <ErrorMsg name="source" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Chi tiết nguồn phát sinh</label>
                <input type="text" {...register('sourceDetail')} placeholder="Tên nhóm Zalo, link bài đăng..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-red-500" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Mức độ lan truyền <span className="text-red-500">*</span></label>
                <select {...register('publicVisibility')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-red-500 font-medium">
                  <option value="Nội bộ">Nội bộ</option>
                  <option value="Nhóm phụ huynh/lớp">Nhóm phụ huynh/lớp</option>
                  <option value="Mạng xã hội hạn chế">Mạng xã hội hạn chế</option>
                  <option value="Mạng xã hội rộng">Mạng xã hội rộng</option>
                  <option value="Báo chí/cơ quan quản lý">Báo chí/cơ quan quản lý</option>
                </select>
                <ErrorMsg name="publicVisibility" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Phạm vi ảnh hưởng <span className="text-red-500">*</span></label>
                <MultiSelectCheckbox 
                  name="impactScope" 
                  currentValues={watch('impactScope') || []}
                  options={['Một học sinh', 'Một lớp', 'Một khối', 'Toàn trường', 'Phụ huynh', 'Giáo viên/Nhân viên', 'Mạng xã hội', 'Báo chí', 'Cơ quan quản lý', 'Đối tác/khách mời']} 
                />
                <ErrorMsg name="impactScope" />
              </div>
            </div>
          </section>

          {/* Nhóm 3: Phân loại mức độ */}
          <section className={`bg-white rounded-2xl border p-6 shadow-sm ${isHighSeverity ? 'border-red-400 bg-red-50/30' : 'border-slate-200'}`}>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <AlertTriangle className={`w-4 h-4 ${isHighSeverity ? 'text-red-600' : 'text-amber-500'}`} /> 3. Phân loại mức độ
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Mức độ khủng hoảng <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-4 mt-1">
                  {['Theo dõi', 'Cần xử lý', 'Nghiêm trọng', 'Khẩn cấp'].map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                      <input type="radio" value={level} {...register('severity')} className="text-red-600 focus:ring-red-500 border-slate-300 w-4 h-4" />
                      <span className={`text-sm font-black uppercase ${
                        level === 'Theo dõi' ? 'text-slate-500' : 
                        level === 'Cần xử lý' ? 'text-amber-600' : 
                        level === 'Nghiêm trọng' ? 'text-red-600' : 'text-red-700 animate-pulse'
                      }`}>
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Nhóm rủi ro <span className="text-red-500">*</span></label>
                <MultiSelectCheckbox 
                  name="riskArea" 
                  currentValues={watch('riskArea') || []}
                  options={['An toàn học sinh', 'Truyền thông', 'Nhân sự', 'Học vụ', 'Dịch vụ học đường', 'Cơ sở vật chất', 'Pháp lý/tuân thủ', 'Dữ liệu/hệ thống', 'Khác']} 
                />
                <ErrorMsg name="riskArea" />
              </div>

              {isHighSeverity && (
                <div className="space-y-1.5 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <label className="text-xs font-bold text-red-800">Lý do cần xử lý khẩn <span className="text-red-500">*</span></label>
                  <textarea {...register('urgencyReason')} rows={2} className="w-full text-sm border-red-300 rounded-xl focus:ring-red-500 bg-white"></textarea>
                  <ErrorMsg name="urgencyReason" />
                </div>
              )}
            </div>
          </section>

          {/* Nhóm 4: Người phụ trách & nhóm xử lý */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <UserSquare className="w-4 h-4 text-emerald-500" /> 4. Phụ trách & Nhóm xử lý
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Người phụ trách chính <span className="text-red-500">*</span></label>
                <input type="text" {...register('ownerId')} readOnly className="w-full text-sm border-slate-200 rounded-xl bg-slate-50 text-slate-500 focus:ring-0" />
                <ErrorMsg name="ownerId" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Người phát ngôn chính thức {isHighSeverity && <span className="text-red-500">*</span>}</label>
                <select {...register('spokespersonId')} className={`w-full text-sm rounded-xl focus:ring-red-500 ${isHighSeverity ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                  <option value="">-- Chọn --</option>
                  <option value="BGH_1">Hiệu trưởng</option>
                  <option value="PR_1">Trưởng phòng Truyền thông</option>
                </select>
                <ErrorMsg name="spokespersonId" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Phòng ban liên quan <span className="text-red-500">*</span></label>
                <MultiSelectCheckbox 
                  name="relatedDepartments" 
                  currentValues={watch('relatedDepartments') || []}
                  options={['BGH', 'Truyền thông', 'Học vụ', 'CTHS/Tâm lý', 'Giáo viên chủ nhiệm', 'Hành chính', 'Dịch vụ học đường', 'Y tế học đường', 'Bảo vệ', 'IT/Hệ thống']} 
                />
                <ErrorMsg name="relatedDepartments" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Nhóm xử lý {isHighSeverity && <span className="text-red-500">*</span>}</label>
                <MultiSelectCheckbox 
                  name="responseTeam" 
                  currentValues={watch('responseTeam') || []}
                  options={['user_1', 'user_2', 'user_3']} 
                />
                <ErrorMsg name="responseTeam" />
              </div>
            </div>
          </section>

          {/* Nhóm 5: Xử lý 24h đầu */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-indigo-500" /> 5. Kế hoạch xử lý tức thời
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Hành động đầu tiên <span className="text-red-500">*</span></label>
                  <textarea {...register('firstAction')} rows={2} placeholder="Xác minh với GVCN, liên hệ phụ huynh..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-red-500"></textarea>
                  <ErrorMsg name="firstAction" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Hạn hoàn thành hành động</label>
                  <div className="flex gap-2 items-center">
                    <input type="datetime-local" {...register('firstActionDeadline')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-red-500" />
                    {severity === 'Khẩn cấp' && <span className="text-[10px] font-bold text-red-600 uppercase bg-red-100 px-2 py-1 rounded">1 Giờ</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Kế hoạch xác minh thông tin {severity !== 'Theo dõi' && <span className="text-red-500">*</span>}</label>
                <textarea {...register('verificationPlan')} rows={2} className={`w-full text-sm rounded-xl focus:ring-red-500 ${severity !== 'Theo dõi' ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}></textarea>
                <ErrorMsg name="verificationPlan" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Biện pháp ngăn lan rộng {publicVisibility !== 'Nội bộ' && <span className="text-red-500">*</span>}</label>
                <textarea {...register('containmentPlan')} rows={2} className={`w-full text-sm rounded-xl focus:ring-red-500 ${publicVisibility !== 'Nội bộ' ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}></textarea>
                <ErrorMsg name="containmentPlan" />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" {...register('authorityContactNeeded')} className="text-red-600 rounded border-slate-300 focus:ring-red-500" />
                  <span className="text-sm font-bold text-slate-700">Cần báo cáo/liên hệ cơ quan quản lý nhà nước</span>
                </label>
              </div>
            </div>
          </section>

          {/* Nhóm 6: Truyền thông chính thức */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-sky-500" /> 6. Truyền thông chính thức
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-bold p-3 rounded-xl border border-slate-200">
                  <Shield className="w-4 h-4 text-indigo-500" /> 
                  Form này không tự động phát ngôn ra ngoài hệ thống. Mọi thông báo chính thức phải được duyệt bằng văn bản.
                </div>
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Thông điệp chính dự kiến</label>
                <textarea {...register('keyMessage')} rows={3} placeholder="Sẽ bắt buộc nhập khi chuyển trạng thái Sẵn sàng phản hồi" className="w-full text-sm border-slate-200 rounded-xl focus:ring-red-500"></textarea>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Kênh truyền thông dự kiến</label>
                <MultiSelectCheckbox 
                  name="communicationChannels" 
                  currentValues={watch('communicationChannels') || []}
                  options={['Gọi điện phụ huynh', 'Zalo lớp', 'Email', 'Cổng phụ huynh', 'Website', 'Fanpage', 'Họp trực tiếp', 'Văn bản chính thức']} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer w-fit mt-2 mb-4">
                  <input type="checkbox" {...register('approvalRequired')} className="text-red-600 rounded border-slate-300 focus:ring-red-500" />
                  <span className="text-sm font-bold text-slate-700">Cần BGH duyệt trước khi phát thông tin {isHighSeverity && <span className="text-red-500">*</span>}</span>
                </label>
                <ErrorMsg name="approvalRequired" />
                
                {watch('approvalRequired') && (
                  <>
                    <label className="text-xs font-bold text-slate-600">Người duyệt thông điệp <span className="text-red-500">*</span></label>
                    <select {...register('approverId')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-red-500">
                      <option value="">-- Chọn --</option>
                      <option value="BGH_1">Hiệu trưởng</option>
                    </select>
                    <ErrorMsg name="approverId" />
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Nhóm 7: Liên kết */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <LinkIcon className="w-4 h-4 text-slate-600" /> 7. Liên kết & Tự động hóa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ticket CSKH liên quan</label>
                <select {...register('relatedTicketId')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-red-500">
                  <option value="">-- Tùy chọn --</option>
                  <option value="tkt_1">CSKH-2026-0001: Phản ánh an toàn</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Sự kiện liên quan</label>
                <select {...register('relatedEventId')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-red-500">
                  <option value="">-- Tùy chọn --</option>
                  <option value="evt_1">Hội thao trường</option>
                </select>
              </div>

              <div className="space-y-3 pt-4 md:col-span-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" {...register('createRiskRecord')} className="text-red-600 rounded border-slate-300 focus:ring-red-500" />
                  <span className="text-sm font-bold text-slate-700">Tạo hồ sơ rủi ro (Risk Record) liên quan</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" {...register('createBoardDirective')} className="text-red-600 rounded border-slate-300 focus:ring-red-500" />
                  <span className="text-sm font-bold text-slate-700">Tạo chỉ đạo khẩn cấp từ BGH (Board Directive) {severity === 'Khẩn cấp' && <span className="text-red-500">*</span>}</span>
                </label>
                <ErrorMsg name="createBoardDirective" />
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" {...register('createTask')} className="text-red-600 rounded border-slate-300 focus:ring-red-500" />
                  <span className="text-sm font-bold text-slate-700">Tạo Task xử lý sự cố cho Nhóm xử lý</span>
                </label>
              </div>
              
              <div className="space-y-1.5 md:col-span-2 pt-2">
                <label className="text-xs font-bold text-slate-600">Ghi chú nội bộ</label>
                <textarea {...register('internalNote')} rows={2} placeholder="Không hiển thị ra ngoài hệ thống..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-red-500 bg-slate-50"></textarea>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Footer Actions */}
      <div className={`border-t px-6 py-4 flex items-center justify-between shrink-0 absolute bottom-0 left-0 right-0 z-20 ${isHighSeverity ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
          Hủy bỏ
        </button>
        <div className="flex gap-3">
          <button type="button" onClick={handleSubmit(data => handleActionSubmit(data, 'DRAFT'))} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            <Save className="w-4 h-4" /> Lưu nháp
          </button>
          <button type="button" onClick={handleSubmit(data => handleActionSubmit(data, 'DETECTED'))} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors shadow-sm">
            <ShieldAlert className="w-4 h-4" /> Tạo vụ việc
          </button>
          <button type="button" onClick={handleSubmit(data => handleActionSubmit(data, 'VERIFYING'))} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-colors shadow-sm ${isHighSeverity ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'}`}>
            <Send className="w-4 h-4" /> Tạo & Kích hoạt xử lý
          </button>
        </div>
      </div>
    </form>
  );
}
