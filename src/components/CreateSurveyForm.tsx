import React, { useState, useEffect } from 'react';
import { SchoolSurvey } from '../types';
import { 
  X, Save, Send, ClipboardList,
  Info, Users, CalendarClock, HelpCircle, Settings, UserSquare, Link as LinkIcon, Plus, Trash2, Copy, ArrowUp, ArrowDown
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const questionSchema = z.object({
  id: z.string(),
  questionText: z.string().min(1, 'Vui lòng nhập nội dung câu hỏi'),
  questionType: z.string().min(1, 'Vui lòng chọn loại câu hỏi'),
  options: z.array(z.string()).optional(),
  required: z.boolean(),
  category: z.string().optional()
});

const formSchema = z.object({
  surveyTitle: z.string().min(1, 'Vui lòng nhập tên khảo sát'),
  surveyType: z.string().min(1, 'Vui lòng chọn loại khảo sát'),
  objective: z.string().min(1, 'Vui lòng nhập mục tiêu khảo sát'),
  description: z.string().optional(),
  semester: z.string().optional(),
  
  targetAudience: z.array(z.string()).min(1, 'Vui lòng chọn đối tượng khảo sát'),
  gradeIds: z.array(z.string()).optional(),
  classIds: z.array(z.string()).optional(),
  departmentIds: z.array(z.string()).optional(),
  estimatedRecipients: z.number().optional(),
  
  startAt: z.string().optional(),
  endAt: z.string().min(1, 'Vui lòng chọn thời gian kết thúc'),
  reminderAt: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  allowMultipleResponses: z.boolean().optional(),
  
  questions: z.array(questionSchema).min(1, 'Phải có ít nhất 1 câu hỏi'),
  
  visibleToParentPortal: z.boolean().optional(),
  visibleToStudentPortal: z.boolean().optional(),
  responsePrivacy: z.string().min(1, 'Vui lòng chọn quyền xem phản hồi'),
  showResultToRespondent: z.boolean().optional(),
  thankYouMessage: z.string().optional(),
  
  ownerDepartment: z.string().min(1, 'Vui lòng chọn phòng ban phụ trách'),
  ownerId: z.string().min(1, 'Vui lòng chọn người phụ trách'),
  approverId: z.string().optional(),
  reviewNote: z.string().optional(),
  
  relatedEventId: z.string().optional(),
  relatedTicketId: z.string().optional(),
  createFollowUpTask: z.boolean().optional(),
  createCapaIfNegative: z.boolean().optional(),
  negativeThreshold: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validate endAt > startAt
  if (data.startAt && data.endAt && new Date(data.endAt) <= new Date(data.startAt)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
      path: ['endAt']
    });
  }

  // Validate questions array
  data.questions.forEach((q, index) => {
    if ((q.questionType === 'Chọn một' || q.questionType === 'Chọn nhiều')) {
      if (!q.options || q.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Bắt buộc có ít nhất 2 phương án trả lời cho loại câu hỏi này',
          path: [`questions.${index}.options`]
        });
      }
    }
  });

  // Target audience conditional validation
  if (data.targetAudience.includes('Theo khối') && (!data.gradeIds || data.gradeIds.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vui lòng chọn khối áp dụng',
      path: ['gradeIds']
    });
  }
  if (data.targetAudience.includes('Theo lớp') && (!data.classIds || data.classIds.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vui lòng chọn lớp áp dụng',
      path: ['classIds']
    });
  }
  if (data.targetAudience.includes('Nội bộ phòng ban') && (!data.departmentIds || data.departmentIds.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vui lòng chọn phòng ban áp dụng',
      path: ['departmentIds']
    });
  }
});

type FormData = z.infer<typeof formSchema>;

interface CreateSurveyFormProps {
  onClose: () => void;
  onSubmit: (data: Partial<SchoolSurvey>) => void;
}

export default function CreateSurveyForm({ onClose, onSubmit }: CreateSurveyFormProps) {
  const [surveyCode] = useState(`KS-2026-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`);

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      surveyTitle: '',
      surveyType: '',
      objective: '',
      targetAudience: [],
      isAnonymous: false,
      allowMultipleResponses: false,
      questions: [
        {
          id: `q_${Date.now()}`,
          questionText: '',
          questionType: 'Chọn một',
          required: true,
          options: ['Phương án 1', 'Phương án 2']
        }
      ],
      visibleToParentPortal: false,
      visibleToStudentPortal: false,
      responsePrivacy: 'Chỉ người phụ trách',
      showResultToRespondent: false,
      thankYouMessage: 'Cảm ơn Quý phụ huynh/học sinh đã gửi phản hồi.',
      ownerDepartment: '',
      ownerId: 'Current User',
      createFollowUpTask: true,
      createCapaIfNegative: false,
    }
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion, move: moveQuestion } = useFieldArray({
    control,
    name: 'questions'
  });

  const targetAudience = watch('targetAudience') || [];
  const createCapaIfNegative = watch('createCapaIfNegative');

  // Auto set defaults based on Target Audience
  useEffect(() => {
    if (targetAudience.includes('Phụ huynh')) {
      setValue('visibleToParentPortal', true);
    }
    if (targetAudience.includes('Học sinh')) {
      setValue('visibleToStudentPortal', true);
    }
  }, [targetAudience, setValue]);

  const handleActionSubmit = (data: FormData, actionType: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED') => {
    if (actionType === 'PENDING_APPROVAL') {
      if (!data.approverId) {
        alert('Vui lòng chọn Người duyệt trước khi Gửi duyệt.');
        return;
      }
      if (!data.startAt) {
        alert('Bắt buộc có Thời gian bắt đầu khi Gửi duyệt.');
        return;
      }
      if (data.questions.length < 3) {
        const confirmResult = window.confirm('Nên có ít nhất 3 câu hỏi trước khi Gửi duyệt. Bạn có chắc chắn muốn tiếp tục không?');
        if (!confirmResult) return;
      }
    }
    onSubmit({ ...data, surveyCode, status: actionType });
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
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
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
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            Tạo Khảo Sát
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1 font-mono">
            {surveyCode} • New
          </p>
        </div>
        <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          
          {/* Nhóm 1: Thông tin khảo sát */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-indigo-500" /> 1. Thông tin khảo sát
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Tên khảo sát <span className="text-red-500">*</span></label>
                <input type="text" {...register('surveyTitle')} placeholder="Ví dụ: Khảo sát mức độ hài lòng của phụ huynh HK1" className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500 font-bold" />
                <ErrorMsg name="surveyTitle" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Loại khảo sát <span className="text-red-500">*</span></label>
                <select {...register('surveyType')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Chọn --</option>
                  <option value="Mức độ hài lòng phụ huynh">Mức độ hài lòng phụ huynh</option>
                  <option value="Ý kiến học sinh">Ý kiến học sinh</option>
                  <option value="Đánh giá dịch vụ học đường">Đánh giá dịch vụ học đường</option>
                  <option value="Đánh giá sự kiện">Đánh giá sự kiện</option>
                  <option value="Khảo sát bữa ăn bán trú">Khảo sát bữa ăn bán trú</option>
                  <option value="Khảo sát cơ sở vật chất">Khảo sát cơ sở vật chất</option>
                  <option value="Khảo sát nội bộ nhân sự">Khảo sát nội bộ nhân sự</option>
                  <option value="Khảo sát sau xử lý phản ánh">Khảo sát sau xử lý phản ánh</option>
                  <option value="Khác">Khác</option>
                </select>
                <ErrorMsg name="surveyType" />
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
                <label className="text-xs font-bold text-slate-600">Mục tiêu khảo sát <span className="text-red-500">*</span></label>
                <textarea {...register('objective')} rows={2} placeholder="Nêu mục tiêu cần thu thập ý kiến" className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500"></textarea>
                <ErrorMsg name="objective" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Mô tả ngắn</label>
                <textarea {...register('description')} rows={2} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500"></textarea>
              </div>
            </div>
          </section>

          {/* Nhóm 2: Đối tượng khảo sát */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-sky-500" /> 2. Đối tượng khảo sát
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Đối tượng <span className="text-red-500">*</span></label>
                <MultiSelectCheckbox 
                  name="targetAudience" 
                  currentValues={targetAudience}
                  options={['Phụ huynh', 'Học sinh', 'Giáo viên', 'Nhân viên', 'BGH', 'Theo lớp', 'Theo khối', 'Nội bộ phòng ban', 'Toàn trường']} 
                />
                <ErrorMsg name="targetAudience" />
              </div>

              {targetAudience.includes('Theo khối') && (
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

              {targetAudience.includes('Theo lớp') && (
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

              {targetAudience.includes('Nội bộ phòng ban') && (
                <div className="space-y-1.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-600">Phòng ban áp dụng <span className="text-red-500">*</span></label>
                  <MultiSelectCheckbox 
                    name="departmentIds" 
                    currentValues={watch('departmentIds') || []}
                    options={['Học vụ', 'Truyền thông', 'Hành chính', 'IT']} 
                  />
                  <ErrorMsg name="departmentIds" />
                </div>
              )}

              <div className="space-y-1.5 md:w-1/2 mt-2">
                <label className="text-xs font-bold text-slate-600">Số người nhận dự kiến</label>
                <input type="number" {...register('estimatedRecipients', { valueAsNumber: true })} placeholder="Auto calculate..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500 bg-slate-50" readOnly />
              </div>
            </div>
          </section>

          {/* Nhóm 3: Thời gian thực hiện */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <CalendarClock className="w-4 h-4 text-rose-500" /> 3. Thời gian thực hiện
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Thời gian bắt đầu</label>
                <input type="datetime-local" {...register('startAt')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
                <ErrorMsg name="startAt" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Thời gian kết thúc <span className="text-red-500">*</span></label>
                <input type="datetime-local" {...register('endAt')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
                <ErrorMsg name="endAt" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Thời gian nhắc phản hồi</label>
                <input type="datetime-local" {...register('reminderAt')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
              </div>
              <div className="space-y-3 pt-6">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" {...register('isAnonymous')} className="text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">Cho phép ẩn danh</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" {...register('allowMultipleResponses')} className="text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">Cho phép trả lời nhiều lần</span>
                </label>
              </div>
            </div>
          </section>

          {/* Nhóm 4: Câu hỏi khảo sát */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" /> 4. Câu hỏi khảo sát
              </h3>
              <button 
                type="button" 
                onClick={() => appendQuestion({
                  id: `q_${Date.now()}`,
                  questionText: '',
                  questionType: 'Chọn một',
                  required: true,
                  options: ['Phương án 1']
                })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm câu hỏi
              </button>
            </div>
            
            <ErrorMsg name="questions" />

            <div className="space-y-4">
              {questionFields.map((field, index) => {
                const qType = watch(`questions.${index}.questionType`);
                const needsOptions = ['Chọn một', 'Chọn nhiều'].includes(qType);
                const options = watch(`questions.${index}.options`) || [];

                return (
                  <div key={field.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative group">
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                      <button type="button" onClick={() => moveQuestion(index, index - 1)} disabled={index === 0} className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => moveQuestion(index, index + 1)} disabled={index === questionFields.length - 1} className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                      <div className="w-px h-3 bg-slate-200 mx-1"></div>
                      <button type="button" onClick={() => {
                        const currentQ = watch(`questions.${index}`);
                        appendQuestion({ ...currentQ, id: `q_${Date.now()}` });
                      }} className="p-1 text-slate-400 hover:text-indigo-600"><Copy className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => removeQuestion(index)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-600">Câu hỏi {index + 1} <span className="text-red-500">*</span></label>
                        <input type="text" {...register(`questions.${index}.questionText`)} placeholder="Nhập nội dung câu hỏi..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
                        <ErrorMsg name={`questions.${index}.questionText`} />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">Loại câu hỏi <span className="text-red-500">*</span></label>
                        <select {...register(`questions.${index}.questionType`)} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                          <option value="Chọn một">Chọn một</option>
                          <option value="Chọn nhiều">Chọn nhiều</option>
                          <option value="Thang điểm 1-5">Thang điểm 1-5</option>
                          <option value="Thang điểm 1-10">Thang điểm 1-10</option>
                          <option value="Câu trả lời ngắn">Câu trả lời ngắn</option>
                          <option value="Câu trả lời dài">Câu trả lời dài</option>
                          <option value="Có / Không">Có / Không</option>
                        </select>
                      </div>

                      {needsOptions && (
                        <div className="space-y-2 md:col-span-3 pt-2">
                          <label className="text-xs font-bold text-slate-600">Các phương án trả lời <span className="text-red-500">*</span></label>
                          {options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 bg-white"></div>
                              <input 
                                type="text" 
                                value={opt} 
                                onChange={(e) => {
                                  const newOptions = [...options];
                                  newOptions[optIndex] = e.target.value;
                                  setValue(`questions.${index}.options`, newOptions);
                                }} 
                                className="flex-1 text-sm border-slate-200 border-x-0 border-t-0 border-b bg-transparent focus:ring-0 px-0 py-1" 
                              />
                              <button type="button" onClick={() => {
                                setValue(`questions.${index}.options`, options.filter((_, i) => i !== optIndex));
                              }} className="p-1 text-slate-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                          <button 
                            type="button" 
                            onClick={() => setValue(`questions.${index}.options`, [...options, `Phương án ${options.length + 1}`])}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-1 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Thêm tùy chọn
                          </button>
                          <ErrorMsg name={`questions.${index}.options`} />
                        </div>
                      )}

                      <div className="md:col-span-3 flex items-center justify-between pt-4 mt-2 border-t border-slate-200">
                        <div className="w-1/3">
                          <input type="text" {...register(`questions.${index}.category`)} placeholder="Nhóm câu hỏi (Tùy chọn)" className="w-full text-xs border-slate-200 rounded-lg py-1.5 focus:ring-indigo-500 bg-white" />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-xs font-bold text-slate-600">Bắt buộc trả lời</span>
                          <div className="relative inline-flex items-center">
                            <input type="checkbox" {...register(`questions.${index}.required`)} className="sr-only peer" />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Nhóm 5: Cài đặt phản hồi */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-slate-600" /> 5. Cài đặt phản hồi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" {...register('visibleToParentPortal')} className="text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">Hiển thị trên Cổng phụ huynh</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" {...register('visibleToStudentPortal')} className="text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">Hiển thị trên Cổng học sinh</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer w-fit mt-4">
                  <input type="checkbox" {...register('showResultToRespondent')} className="text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">Cho người trả lời xem kết quả tổng hợp</span>
                </label>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Quyền xem phản hồi <span className="text-red-500">*</span></label>
                  <select {...register('responsePrivacy')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                    <option value="Chỉ người phụ trách">Chỉ người phụ trách</option>
                    <option value="Người phụ trách và BGH">Người phụ trách và BGH</option>
                    <option value="Phòng ban liên quan">Phòng ban liên quan</option>
                    <option value="Toàn bộ quản trị viên">Toàn bộ quản trị viên</option>
                  </select>
                  <ErrorMsg name="responsePrivacy" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Thông báo sau khi gửi</label>
                  <textarea {...register('thankYouMessage')} rows={2} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500"></textarea>
                </div>
              </div>
            </div>
          </section>

          {/* Nhóm 6: Phân công & duyệt */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <UserSquare className="w-4 h-4 text-emerald-500" /> 6. Phân công & duyệt
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Phòng ban phụ trách <span className="text-red-500">*</span></label>
                <select {...register('ownerDepartment')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Chọn --</option>
                  <option value="BGH">BGH</option>
                  <option value="Học vụ">Học vụ</option>
                  <option value="CTHS/Tâm lý">CTHS/Tâm lý</option>
                  <option value="Truyền thông">Truyền thông</option>
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
                <label className="text-xs font-bold text-slate-600">Người duyệt</label>
                <select {...register('approverId')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Chọn người duyệt --</option>
                  <option value="BGH_1">Hiệu trưởng</option>
                  <option value="BGH_2">Hiệu phó</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ghi chú cho người duyệt</label>
                <textarea {...register('reviewNote')} rows={1} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500"></textarea>
              </div>
            </div>
          </section>

          {/* Nhóm 7: Tổng hợp & liên kết xử lý */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <LinkIcon className="w-4 h-4 text-indigo-500" /> 7. Tổng hợp & Liên kết xử lý
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Sự kiện liên quan</label>
                <select {...register('relatedEventId')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Tùy chọn --</option>
                  <option value="evt_1">Ngày hội STEAM khối Tiểu học</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ticket CSKH liên quan</label>
                <select {...register('relatedTicketId')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Tùy chọn --</option>
                  <option value="tkt_1">CSKH-2026-0001: Phản ánh bữa ăn</option>
                </select>
              </div>

              <div className="space-y-3 pt-4 md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" {...register('createFollowUpTask')} className="text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">Tự động tạo task "Tổng hợp kết quả khảo sát" sau khi kết thúc</span>
                </label>
                <div className="flex items-start gap-4 flex-col sm:flex-row sm:items-center">
                  <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <input type="checkbox" {...register('createCapaIfNegative')} className="text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    <span className="text-sm font-bold text-slate-700">Gợi ý tạo CAPA (Khắc phục/Phòng ngừa) nếu kết quả tiêu cực</span>
                  </label>
                  {createCapaIfNegative && (
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-xs text-slate-600 font-medium">Ngưỡng:</span>
                      <select {...register('negativeThreshold')} className="text-xs border-slate-200 rounded py-1 pl-2 pr-6 focus:ring-indigo-500">
                        <option value="under_60">Dưới 60%</option>
                        <option value="under_3">Dưới 3/5 điểm</option>
                        <option value="under_50">Dưới 50%</option>
                      </select>
                    </div>
                  )}
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
            <ClipboardList className="w-4 h-4" /> Tạo khảo sát
          </button>
          <button type="button" onClick={handleSubmit(data => handleActionSubmit(data, 'PENDING_APPROVAL'))} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200">
            <Send className="w-4 h-4" /> Tạo & Gửi duyệt
          </button>
        </div>
      </div>
    </form>
  );
}
