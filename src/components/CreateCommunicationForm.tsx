import React, { useState, useEffect } from 'react';
import { CommunicationContent } from '../types';
import { 
  X, Save, Send, Paperclip, 
  Info, AlignLeft, CalendarClock, Users, CheckCircle
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
  contentGroup: z.string().min(1, 'Vui lòng chọn nhóm nội dung'),
  priority: z.enum(['normal', 'important', 'urgent']),
  ownerDepartment: z.string().min(1, 'Vui lòng chọn phòng ban phụ trách'),
  summary: z.string().min(20, 'Tóm tắt nội dung tối thiểu 20 ký tự'),
  body: z.string().min(1, 'Vui lòng nhập nội dung chi tiết'),
  channels: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 kênh đăng'),
  relatedEventId: z.string().optional(),
  plannedPublishAt: z.string().optional(),
  authorId: z.string().min(1, 'Vui lòng chọn người soạn'),
  approverId: z.string().optional(),
  approvalDeadline: z.string().optional(),
  audience: z.array(z.string()).min(1, 'Vui lòng chọn đối tượng nhận thông tin'),
  gradeIds: z.array(z.string()).optional(),
  classIds: z.array(z.string()).optional(),
  visibleToParent: z.boolean().optional(),
  reviewNote: z.string().optional(),
  internalNote: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.priority === 'urgent') {
    if (!data.approverId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bắt buộc chọn người duyệt khi mức độ là Khẩn cấp',
        path: ['approverId']
      });
    }
    if (!data.plannedPublishAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bắt buộc chọn thời gian dự kiến đăng',
        path: ['plannedPublishAt']
      });
    }
    if (!data.internalNote || data.internalNote.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ghi chú nội bộ tối thiểu 5 ký tự để giải thích lý do khẩn cấp',
        path: ['internalNote']
      });
    }
  }

  if (data.audience.includes('Theo khối') && (!data.gradeIds || data.gradeIds.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vui lòng chọn khối áp dụng',
      path: ['gradeIds']
    });
  }

  if (data.audience.includes('Theo lớp') && (!data.classIds || data.classIds.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vui lòng chọn lớp áp dụng',
      path: ['classIds']
    });
  }
});

type FormData = z.infer<typeof formSchema>;

interface CreateCommunicationFormProps {
  onClose: () => void;
  onSubmit: (data: Partial<CommunicationContent>) => void;
}

export default function CreateCommunicationForm({ onClose, onSubmit }: CreateCommunicationFormProps) {
  const [contentCode] = useState(`TT-2026-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`);

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      contentGroup: '',
      priority: 'normal',
      ownerDepartment: '',
      summary: '',
      body: '',
      channels: [],
      authorId: 'Current User', // Mock default
      approverId: '',
      audience: [],
      gradeIds: [],
      classIds: [],
      visibleToParent: false,
      reviewNote: '',
      internalNote: '',
    }
  });

  const priority = watch('priority');
  const channels = watch('channels') || [];
  const audience = watch('audience') || [];

  // Auto set visibleToParent if channels include Cổng phụ huynh
  useEffect(() => {
    if (channels.includes('Cổng phụ huynh')) {
      setValue('visibleToParent', true);
    }
  }, [channels, setValue]);

  const handleActionSubmit = (data: FormData, status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED') => {
    if (status === 'PENDING_APPROVAL' && !data.plannedPublishAt) {
      alert('Vui lòng chọn Thời gian dự kiến đăng trước khi Gửi duyệt.');
      return;
    }
    if (status === 'PENDING_APPROVAL' && !data.approverId) {
      alert('Vui lòng chọn Người duyệt trước khi Gửi duyệt.');
      return;
    }

    onSubmit({ ...data, contentCode, status });
  };

  const ErrorMsg = ({ name }: { name: keyof FormData }) => {
    if (!errors[name]) return null;
    return <p className="text-red-500 text-[11px] font-medium mt-1">{errors[name]?.message}</p>;
  };

  const MultiSelectCheckbox = ({ options, name, currentValues }: { options: string[], name: 'channels' | 'audience' | 'gradeIds' | 'classIds', currentValues: string[] }) => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map(opt => {
          const isSelected = currentValues.includes(opt);
          return (
            <label key={opt} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
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
              {isSelected && <CheckCircle className="w-3 h-3 text-indigo-600" />}
              {opt}
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <form className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            Tạo Nội dung Truyền thông
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1 font-mono">
            {contentCode} • Draft
          </p>
        </div>
        <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          
          {/* Nhóm 1: Thông tin chung */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-indigo-500" /> 1. Thông tin chung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Tiêu đề <span className="text-red-500">*</span></label>
                <input type="text" {...register('title')} placeholder="Nhập tiêu đề truyền thông..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500 font-bold" />
                <ErrorMsg name="title" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Nhóm nội dung <span className="text-red-500">*</span></label>
                <select {...register('contentGroup')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Chọn --</option>
                  <option value="Thông báo phụ huynh">Thông báo phụ huynh</option>
                  <option value="Tin hoạt động học sinh">Tin hoạt động học sinh</option>
                  <option value="Sự kiện">Sự kiện</option>
                  <option value="Thành tích">Thành tích</option>
                  <option value="Cảnh báo/khẩn cấp">Cảnh báo/khẩn cấp</option>
                  <option value="Nội quy/quy trình">Nội quy/quy trình</option>
                  <option value="Truyền thông nội bộ">Truyền thông nội bộ</option>
                  <option value="Khác">Khác</option>
                </select>
                <ErrorMsg name="contentGroup" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Mức độ ưu tiên <span className="text-red-500">*</span></label>
                <select {...register('priority')} className={`w-full text-sm rounded-xl focus:ring-indigo-500 font-bold ${priority === 'urgent' ? 'bg-red-50 border-red-200 text-red-700' : 'border-slate-200'}`}>
                  <option value="normal">Thường</option>
                  <option value="important">Quan trọng</option>
                  <option value="urgent">Khẩn cấp</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Phòng ban phụ trách <span className="text-red-500">*</span></label>
                <select {...register('ownerDepartment')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Chọn --</option>
                  <option value="Truyền thông">Truyền thông</option>
                  <option value="Học vụ">Học vụ</option>
                  <option value="CTHS/Tâm lý">CTHS/Tâm lý</option>
                  <option value="Hành chính">Hành chính</option>
                  <option value="Dịch vụ học đường">Dịch vụ học đường</option>
                  <option value="BGH">BGH</option>
                  <option value="Khác">Khác</option>
                </select>
                <ErrorMsg name="ownerDepartment" />
              </div>
            </div>
          </section>

          {/* Nhóm 2: Nội dung & kênh đăng */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <AlignLeft className="w-4 h-4 text-emerald-500" /> 2. Nội dung & Kênh đăng
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Tóm tắt nội dung <span className="text-red-500">*</span></label>
                <textarea {...register('summary')} rows={2} placeholder="Nhập tóm tắt (ít nhất 20 ký tự)..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500"></textarea>
                <ErrorMsg name="summary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Nội dung chi tiết <span className="text-red-500">*</span></label>
                <textarea {...register('body')} rows={6} placeholder="Soạn thảo nội dung..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500"></textarea>
                <ErrorMsg name="body" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Kênh đăng <span className="text-red-500">*</span></label>
                <MultiSelectCheckbox 
                  name="channels" 
                  currentValues={channels}
                  options={['Website', 'Fanpage', 'Zalo', 'Email', 'Cổng phụ huynh', 'Bảng tin nội bộ', 'Nhóm lớp', 'Khác']} 
                />
                <ErrorMsg name="channels" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Sự kiện liên quan</label>
                <select {...register('relatedEventId')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Không có --</option>
                  <option value="evt_1">Khai giảng năm học mới</option>
                  <option value="evt_2">Hội thao trường</option>
                </select>
              </div>
            </div>
          </section>

          {/* Nhóm 3: Lịch đăng & Duyệt */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <CalendarClock className="w-4 h-4 text-amber-500" /> 3. Lịch đăng & Duyệt
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Thời gian dự kiến đăng {priority === 'urgent' && <span className="text-red-500">*</span>}</label>
                <input type="datetime-local" {...register('plannedPublishAt')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
                <ErrorMsg name="plannedPublishAt" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Hạn duyệt</label>
                <input type="datetime-local" {...register('approvalDeadline')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Người soạn <span className="text-red-500">*</span></label>
                <input type="text" {...register('authorId')} readOnly className="w-full text-sm border-slate-200 rounded-xl bg-slate-50 text-slate-500 focus:ring-0" />
                <ErrorMsg name="authorId" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Người duyệt {priority === 'urgent' && <span className="text-red-500">*</span>}</label>
                <select {...register('approverId')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Chọn --</option>
                  <option value="user_1">Nguyễn Văn Hiệu Trưởng</option>
                  <option value="user_2">Trần Thị Trưởng Phòng PR</option>
                </select>
                <ErrorMsg name="approverId" />
              </div>
            </div>
          </section>

          {/* Nhóm 4: Đối tượng hiển thị */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-sky-500" /> 4. Đối tượng nhận thông tin
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Đối tượng <span className="text-red-500">*</span></label>
                <MultiSelectCheckbox 
                  name="audience" 
                  currentValues={audience}
                  options={['Toàn trường', 'Phụ huynh', 'Học sinh', 'Giáo viên', 'Nhân viên', 'BGH', 'Theo lớp', 'Theo khối', 'Nội bộ phòng ban']} 
                />
                <ErrorMsg name="audience" />
              </div>

              {audience.includes('Theo khối') && (
                <div className="space-y-1.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-600">Khối áp dụng <span className="text-red-500">*</span></label>
                  <MultiSelectCheckbox 
                    name="gradeIds" 
                    currentValues={watch('gradeIds') || []}
                    options={['Khối 10', 'Khối 11', 'Khối 12']} 
                  />
                  <ErrorMsg name="gradeIds" />
                </div>
              )}

              {audience.includes('Theo lớp') && (
                <div className="space-y-1.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-600">Lớp áp dụng <span className="text-red-500">*</span></label>
                  <MultiSelectCheckbox 
                    name="classIds" 
                    currentValues={watch('classIds') || []}
                    options={['10A1', '10A2', '11B1', '12C1']} 
                  />
                  <ErrorMsg name="classIds" />
                </div>
              )}

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors w-fit">
                  <input type="checkbox" {...register('visibleToParent')} className="text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">
                    Hiển thị trên cổng phụ huynh
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* Nhóm 5: File đính kèm & Ghi chú */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4">
              <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                <Paperclip className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-600">Kéo thả hoặc click để đính kèm file/ảnh</span>
                <span className="text-xs text-slate-400 mt-1">Hỗ trợ .jpg, .png, .pdf (Max 10MB)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Ghi chú cho người duyệt</label>
                  <textarea {...register('reviewNote')} rows={2} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500 bg-amber-50/30"></textarea>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Ghi chú nội bộ {priority === 'urgent' && <span className="text-red-500">*</span>}</label>
                  <textarea {...register('internalNote')} rows={2} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500 bg-slate-50"></textarea>
                  <ErrorMsg name="internalNote" />
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 absolute bottom-0 left-0 right-0 z-20">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
          Hủy bỏ
        </button>
        <div className="flex gap-3">
          <button type="button" onClick={handleSubmit(data => handleActionSubmit(data, 'DRAFT'))} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            <Save className="w-4 h-4" /> Lưu nháp
          </button>
          <button type="button" onClick={handleSubmit(data => handleActionSubmit(data, 'APPROVED'))} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors shadow-sm">
            Tạo mới
          </button>
          <button type="button" onClick={handleSubmit(data => handleActionSubmit(data, 'PENDING_APPROVAL'))} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200">
            <Send className="w-4 h-4" /> Tạo & Gửi duyệt
          </button>
        </div>
      </div>
    </form>
  );
}
