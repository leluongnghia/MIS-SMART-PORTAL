import React, { useState, useEffect } from 'react';
import { SchoolEvent } from '../types';
import { 
  X, Save, Send, ShieldAlert,
  Info, MapPin, Users, UserSquare, CheckSquare, Megaphone, CheckCircle
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  eventName: z.string().min(1, 'Vui lòng nhập tên sự kiện'),
  eventType: z.string().min(1, 'Vui lòng chọn loại sự kiện'),
  objective: z.string().min(1, 'Vui lòng nhập mục tiêu sự kiện'),
  description: z.string().optional(),
  semester: z.string().optional(),
  
  startAt: z.string().min(1, 'Vui lòng chọn thời gian bắt đầu'),
  endAt: z.string().min(1, 'Vui lòng chọn thời gian kết thúc'),
  preparationStartAt: z.string().optional(),
  location: z.string().min(1, 'Vui lòng chọn hoặc nhập địa điểm'),
  backupLocation: z.string().optional(),
  isOnline: z.boolean().optional(),
  onlineLink: z.string().optional(),

  participants: z.array(z.string()).min(1, 'Vui lòng chọn đối tượng tham gia'),
  gradeIds: z.array(z.string()).optional(),
  classIds: z.array(z.string()).optional(),
  expectedAttendees: z.number().min(0).optional(),
  guestNote: z.string().optional(),

  ownerDepartment: z.string().min(1, 'Vui lòng chọn phòng ban phụ trách'),
  ownerId: z.string().min(1, 'Vui lòng chọn người phụ trách chính'),
  coDepartments: z.array(z.string()).optional(),
  eventTeam: z.array(z.string()).optional(),
  approverId: z.string().optional(),
  
  budget: z.number().min(0).optional(),
  content: z.string().optional(),

  checklist: z.array(z.object({
    id: z.string(),
    enabled: z.boolean(),
    title: z.string(),
    assigneeId: z.string().optional(),
    dueAt: z.string().optional(),
    createTask: z.boolean()
  })),

  needCommunicationPlan: z.boolean().optional(),
  needParentNotice: z.boolean().optional(),
  communicationChannels: z.array(z.string()).optional(),
  plannedAnnouncementAt: z.string().optional(),
  relatedCommunicationIds: z.array(z.string()).optional(),

  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  safetyPlan: z.string().optional(),
  medicalSupportNeeded: z.boolean().optional(),
  securitySupportNeeded: z.boolean().optional(),
  emergencyContact: z.string().optional(),
  createRiskRecord: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // Validate endAt > startAt
  if (data.startAt && data.endAt && new Date(data.endAt) <= new Date(data.startAt)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
      path: ['endAt']
    });
  }

  // Risk validations
  if (data.riskLevel === 'HIGH' || data.riskLevel === 'CRITICAL') {
    if (!data.safetyPlan || data.safetyPlan.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bắt buộc nhập phương án an toàn khi rủi ro Cao/Nghiêm trọng',
        path: ['safetyPlan']
      });
    }
    if (!data.emergencyContact || data.emergencyContact.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bắt buộc có đầu mối xử lý sự cố khi rủi ro Cao/Nghiêm trọng',
        path: ['emergencyContact']
      });
    }
  }

  // Participants sub-options validations
  if (data.participants.includes('Theo khối') && (!data.gradeIds || data.gradeIds.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vui lòng chọn khối tham gia',
      path: ['gradeIds']
    });
  }
  if (data.participants.includes('Theo lớp') && (!data.classIds || data.classIds.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vui lòng chọn lớp tham gia',
      path: ['classIds']
    });
  }
});

type FormData = z.infer<typeof formSchema>;

const DEFAULT_CHECKLIST = [
  "Kế hoạch chương trình", "Phân công nhân sự", "Thông báo phụ huynh/học sinh", 
  "Truyền thông trước sự kiện", "Chuẩn bị địa điểm", "Âm thanh/ánh sáng/thiết bị", 
  "An toàn học sinh", "Y tế học đường", "Hậu cần", "Chụp ảnh/quay phim", 
  "Kịch bản xử lý sự cố", "Tổng kết sau sự kiện"
];

interface CreateEventFormProps {
  onClose: () => void;
  onSubmit: (data: Partial<SchoolEvent>) => void;
}

export default function CreateEventForm({ onClose, onSubmit }: CreateEventFormProps) {
  const [eventCode] = useState(`SK-2026-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`);

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: '',
      eventType: '',
      objective: '',
      isOnline: false,
      participants: [],
      ownerDepartment: '',
      ownerId: 'Current User',
      riskLevel: 'MEDIUM',
      needCommunicationPlan: false,
      needParentNotice: false,
      medicalSupportNeeded: false,
      securitySupportNeeded: false,
      createRiskRecord: false,
      checklist: DEFAULT_CHECKLIST.map((title, index) => ({
        id: `chk_${index}`,
        enabled: true,
        title,
        createTask: false
      }))
    }
  });

  const { fields: checklistFields } = useFieldArray({
    control,
    name: 'checklist'
  });

  const eventType = watch('eventType');
  const participants = watch('participants') || [];
  const riskLevel = watch('riskLevel');
  const isOnline = watch('isOnline');

  // Auto set defaults based on Event Type
  useEffect(() => {
    if (['Truyền thông', 'Lễ hội', 'Hội thảo', 'Ngoại khóa'].includes(eventType)) {
      setValue('needCommunicationPlan', true);
    }
  }, [eventType, setValue]);

  // Auto set defaults based on Participants
  useEffect(() => {
    if (participants.includes('Phụ huynh') || participants.includes('Học sinh')) {
      setValue('needParentNotice', true);
    }
  }, [participants, setValue]);

  // Auto set defaults based on Risk Level
  useEffect(() => {
    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
      setValue('createRiskRecord', true);
    }
  }, [riskLevel, setValue]);

  const handleActionSubmit = (data: FormData, actionType: 'DRAFT' | 'PLANNING' | 'PENDING_APPROVAL') => {
    if (actionType === 'PENDING_APPROVAL') {
      if (!data.approverId) {
        alert('Vui lòng chọn Người duyệt kế hoạch trước khi Gửi duyệt.');
        return;
      }
    }
    onSubmit({ ...data, eventCode, status: actionType });
  };

  const ErrorMsg = ({ name }: { name: string }) => {
    // Nested error object resolution
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
            Tạo Sự Kiện Trường Học
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1 font-mono">
            {eventCode} • New
          </p>
        </div>
        <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          
          {/* Nhóm 1: Thông tin cơ bản */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-indigo-500" /> 1. Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Tên sự kiện <span className="text-red-500">*</span></label>
                <input type="text" {...register('eventName')} placeholder="Ví dụ: Ngày hội STEAM khối Tiểu học" className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500 font-bold" />
                <ErrorMsg name="eventName" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Loại sự kiện <span className="text-red-500">*</span></label>
                <select {...register('eventType')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Chọn --</option>
                  <option value="Học thuật">Học thuật</option>
                  <option value="Ngoại khóa">Ngoại khóa</option>
                  <option value="Họp phụ huynh">Họp phụ huynh</option>
                  <option value="Lễ hội">Lễ hội</option>
                  <option value="Hội thảo">Hội thảo</option>
                  <option value="Truyền thông">Truyền thông</option>
                  <option value="Nội bộ">Nội bộ</option>
                  <option value="Khẩn cấp">Khẩn cấp</option>
                  <option value="Khác">Khác</option>
                </select>
                <ErrorMsg name="eventType" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Học kỳ / Năm học</label>
                <select {...register('semester')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Tùy chọn --</option>
                  <option value="HK1 - 2026/2027">HK1 - 2026/2027</option>
                  <option value="HK2 - 2026/2027">HK2 - 2026/2027</option>
                  <option value="Hè 2026">Hè 2026</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Mục tiêu sự kiện <span className="text-red-500">*</span></label>
                <textarea {...register('objective')} rows={2} placeholder="Nêu mục tiêu chính của sự kiện" className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500"></textarea>
                <ErrorMsg name="objective" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Nội dung chương trình</label>
                <textarea {...register('content')} rows={3} placeholder="Mô tả chi tiết nội dung chương trình, các hoạt động chính..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500"></textarea>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Mô tả ngắn</label>
                <textarea {...register('description')} rows={2} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500"></textarea>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ngân sách dự kiến (VND)</label>
                <input type="number" {...register('budget', { valueAsNumber: true })} placeholder="Ví dụ: 10000000" className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500 font-mono" />
                <ErrorMsg name="budget" />
              </div>
            </div>
          </section>

          {/* Nhóm 2: Thời gian & Địa điểm */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-rose-500" /> 2. Thời gian & Địa điểm
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Thời gian bắt đầu <span className="text-red-500">*</span></label>
                <input type="datetime-local" {...register('startAt')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
                <ErrorMsg name="startAt" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Thời gian kết thúc <span className="text-red-500">*</span></label>
                <input type="datetime-local" {...register('endAt')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
                <ErrorMsg name="endAt" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ngày bắt đầu chuẩn bị</label>
                <input type="date" {...register('preparationStartAt')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Địa điểm tổ chức <span className="text-red-500">*</span></label>
                <select {...register('location')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Chọn hoặc nhập --</option>
                  <option value="Hội trường">Hội trường</option>
                  <option value="Sân trường">Sân trường</option>
                  <option value="Phòng STEAM">Phòng STEAM</option>
                  <option value="Thư viện">Thư viện</option>
                  <option value="Phòng học">Phòng học</option>
                  <option value="Online">Online</option>
                  <option value="Ngoài trường">Ngoài trường</option>
                  <option value="Khác">Khác</option>
                </select>
                <ErrorMsg name="location" />
              </div>
              
              <div className="space-y-1.5 md:col-span-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" {...register('isOnline')} className="text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">Đây là sự kiện Online</span>
                </label>
              </div>
              
              {isOnline && (
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600">Link tham gia online</label>
                  <input type="url" {...register('onlineLink')} placeholder="Zoom, Google Meet, Teams link..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
                </div>
              )}
            </div>
          </section>

          {/* Nhóm 3: Đối tượng tham gia */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-sky-500" /> 3. Đối tượng tham gia
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Đối tượng <span className="text-red-500">*</span></label>
                <MultiSelectCheckbox 
                  name="participants" 
                  currentValues={participants}
                  options={['Toàn trường', 'Học sinh', 'Phụ huynh', 'Giáo viên', 'Nhân viên', 'BGH', 'Khách mời', 'Theo lớp', 'Theo khối', 'Nội bộ phòng ban']} 
                />
                <ErrorMsg name="participants" />
              </div>

              {participants.includes('Theo khối') && (
                <div className="space-y-1.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-600">Khối tham gia <span className="text-red-500">*</span></label>
                  <MultiSelectCheckbox 
                    name="gradeIds" 
                    currentValues={watch('gradeIds') || []}
                    options={['Khối 10', 'Khối 11', 'Khối 12']} 
                  />
                  <ErrorMsg name="gradeIds" />
                </div>
              )}

              {participants.includes('Theo lớp') && (
                <div className="space-y-1.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-600">Lớp tham gia <span className="text-red-500">*</span></label>
                  <MultiSelectCheckbox 
                    name="classIds" 
                    currentValues={watch('classIds') || []}
                    options={['10A1', '10A2', '11B1', '12C1']} 
                  />
                  <ErrorMsg name="classIds" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Số lượng dự kiến</label>
                  <input type="number" {...register('expectedAttendees', { valueAsNumber: true })} placeholder="0" className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
                </div>
                {participants.includes('Khách mời') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Ghi chú khách mời</label>
                    <textarea {...register('guestNote')} rows={1} placeholder="VIP, đại biểu..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500"></textarea>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Nhóm 4: Nhân sự phụ trách */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <UserSquare className="w-4 h-4 text-emerald-500" /> 4. Nhân sự phụ trách
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Phòng ban phụ trách <span className="text-red-500">*</span></label>
                <select {...register('ownerDepartment')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Chọn --</option>
                  <option value="BGH">BGH</option>
                  <option value="Truyền thông">Truyền thông</option>
                  <option value="Học vụ">Học vụ</option>
                  <option value="CTHS/Tâm lý">CTHS/Tâm lý</option>
                  <option value="Hành chính">Hành chính</option>
                  <option value="Dịch vụ học đường">Dịch vụ học đường</option>
                  <option value="Giáo viên chủ nhiệm">Giáo viên chủ nhiệm</option>
                  <option value="Khác">Khác</option>
                </select>
                <ErrorMsg name="ownerDepartment" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Người phụ trách chính <span className="text-red-500">*</span></label>
                <input type="text" {...register('ownerId')} readOnly className="w-full text-sm border-slate-200 rounded-xl bg-slate-50 text-slate-500 focus:ring-0" />
                <ErrorMsg name="ownerId" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Phòng ban phối hợp</label>
                <MultiSelectCheckbox 
                  name="coDepartments" 
                  currentValues={watch('coDepartments') || []}
                  options={['Truyền thông', 'Hành chính', 'Dịch vụ học đường']} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Người duyệt kế hoạch { (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') && <span className="text-red-500">*</span>}</label>
                <select {...register('approverId')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Chọn người duyệt --</option>
                  <option value="BGH_1">Hiệu trưởng</option>
                  <option value="BGH_2">Hiệu phó</option>
                </select>
                <ErrorMsg name="approverId" />
              </div>
            </div>
          </section>

          {/* Nhóm 5: Checklist chuẩn bị */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <CheckSquare className="w-4 h-4 text-violet-500" /> 5. Checklist chuẩn bị
            </h3>
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100/50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">Dùng</th>
                    <th className="px-4 py-3">Hạng mục</th>
                    <th className="px-4 py-3 w-48">Phụ trách</th>
                    <th className="px-4 py-3 w-40">Hạn chót</th>
                    <th className="px-4 py-3 w-24 text-center">Tạo Task</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {checklistFields.map((item, index) => (
                    <tr key={item.id} className={watch(`checklist.${index}.enabled`) ? 'bg-white' : 'bg-slate-50/50 opacity-50'}>
                      <td className="px-4 py-2 text-center">
                        <input type="checkbox" {...register(`checklist.${index}.enabled`)} className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                      </td>
                      <td className="px-4 py-2 font-medium text-slate-700">
                        {item.title}
                        <input type="hidden" {...register(`checklist.${index}.title`)} />
                      </td>
                      <td className="px-4 py-2">
                        <select 
                          {...register(`checklist.${index}.assigneeId`)} 
                          disabled={!watch(`checklist.${index}.enabled`)}
                          className="w-full text-xs border-slate-200 rounded-lg py-1.5 focus:ring-indigo-500 disabled:bg-slate-100 disabled:opacity-50"
                        >
                          <option value="">-- Chọn --</option>
                          <option value="user_1">Nguyễn Văn A</option>
                          <option value="user_2">Trần Thị B</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="date" 
                          {...register(`checklist.${index}.dueAt`)} 
                          disabled={!watch(`checklist.${index}.enabled`)}
                          className="w-full text-xs border-slate-200 rounded-lg py-1.5 focus:ring-indigo-500 disabled:bg-slate-100 disabled:opacity-50" 
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input 
                          type="checkbox" 
                          {...register(`checklist.${index}.createTask`)} 
                          disabled={!watch(`checklist.${index}.enabled`)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 disabled:opacity-50" 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Nhóm 6: Truyền thông & Thông báo */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-amber-500" /> 6. Truyền thông & Thông báo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" {...register('needCommunicationPlan')} className="text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">Cần kế hoạch truyền thông</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" {...register('needParentNotice')} className="text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">Cần thông báo phụ huynh</span>
                </label>
              </div>
              
              <div className="space-y-1.5 md:row-span-2">
                <label className="text-xs font-bold text-slate-600">Kênh thông báo</label>
                <MultiSelectCheckbox 
                  name="communicationChannels" 
                  currentValues={watch('communicationChannels') || []}
                  options={['Cổng phụ huynh', 'Zalo', 'Email', 'Website', 'Fanpage', 'Bảng tin nội bộ']} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Thời gian dự kiến thông báo</label>
                <input type="datetime-local" {...register('plannedAnnouncementAt')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
              </div>
            </div>
          </section>

          {/* Nhóm 7: Rủi ro & An toàn */}
          <section className={`bg-white rounded-2xl border p-6 shadow-sm ${riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? 'border-red-300 bg-red-50/10' : 'border-slate-200'}`}>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <ShieldAlert className={`w-4 h-4 ${riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-slate-500'}`} /> 
              7. Rủi ro & An toàn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Mức rủi ro sự kiện <span className="text-red-500">*</span></label>
                <div className="flex gap-4 mt-1">
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value={level} {...register('riskLevel')} className="text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                      <span className={`text-sm font-bold ${
                        level === 'LOW' ? 'text-green-600' : 
                        level === 'MEDIUM' ? 'text-amber-600' : 
                        level === 'HIGH' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {level === 'LOW' ? 'Thấp' : level === 'MEDIUM' ? 'Vừa' : level === 'HIGH' ? 'Cao' : 'Nghiêm trọng'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Phương án an toàn {(riskLevel === 'HIGH' || riskLevel === 'CRITICAL') && <span className="text-red-500">*</span>}</label>
                <textarea {...register('safetyPlan')} rows={2} className={`w-full text-sm rounded-xl focus:ring-indigo-500 ${riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}></textarea>
                <ErrorMsg name="safetyPlan" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Đầu mối xử lý sự cố {(riskLevel === 'HIGH' || riskLevel === 'CRITICAL') && <span className="text-red-500">*</span>}</label>
                <input type="text" {...register('emergencyContact')} className={`w-full text-sm rounded-xl focus:ring-indigo-500 ${riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? 'border-red-300' : 'border-slate-200'}`} />
                <ErrorMsg name="emergencyContact" />
              </div>

              <div className="space-y-3 pt-6">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" {...register('medicalSupportNeeded')} className="text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">Cần Y tế học đường hỗ trợ</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" {...register('securitySupportNeeded')} className="text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">Cần Bảo vệ/Hậu cần hỗ trợ</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" {...register('createRiskRecord')} className="text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">Tạo hồ sơ rủi ro liên quan</span>
                </label>
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
          <button type="button" onClick={handleSubmit(data => handleActionSubmit(data, 'PLANNING'))} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors shadow-sm">
            Tạo sự kiện
          </button>
          <button type="button" onClick={handleSubmit(data => handleActionSubmit(data, 'PENDING_APPROVAL'))} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200">
            <Send className="w-4 h-4" /> Tạo & Gửi duyệt
          </button>
        </div>
      </div>
    </form>
  );
}
