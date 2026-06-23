import React, { useState, useEffect } from 'react';
import { ParentSupportTicket } from '../types';
import { 
  X, AlertTriangle, Save, Send, Paperclip, Search, 
  Clock, ShieldAlert, Tag, UserSquare, Calendar, FileText
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  channel: z.string().min(1, 'Vui lòng chọn kênh tiếp nhận'),
  receivedBy: z.string().min(1, 'Vui lòng nhập người tiếp nhận'),
  parentName: z.string().min(1, 'Vui lòng nhập họ tên phụ huynh'),
  parentPhone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
  parentEmail: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  relationship: z.string().min(1, 'Vui lòng chọn quan hệ'),
  preferredContactMethod: z.string(),
  studentId: z.string().optional(),
  studentName: z.string().optional(),
  className: z.string().optional(),
  homeroomTeacher: z.string().optional(),
  title: z.string().min(1, 'Vui lòng nhập tiêu đề ticket'),
  description: z.string().min(20, 'Nội dung chi tiết tối thiểu 20 ký tự'),
  expectedResolution: z.string().optional(),
  isSensitive: z.boolean().optional(),
  category: z.string().min(1, 'Vui lòng chọn loại vụ việc'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  departmentOwner: z.string().min(1, 'Vui lòng chọn phòng ban'),
  assigneeId: z.string().optional(),
  internalNote: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.priority === 'critical') {
    if (!data.assigneeId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bắt buộc chọn người xử lý chính',
        path: ['assigneeId']
      });
    }
    if (!data.internalNote || data.internalNote.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ghi chú nội bộ tối thiểu 5 ký tự',
        path: ['internalNote']
      });
    }
  }
});

type FormData = z.infer<typeof formSchema>;

interface CreateTicketFormProps {
  onClose: () => void;
  onSubmit: (data: Partial<ParentSupportTicket>) => void;
}

export default function CreateTicketForm({ onClose, onSubmit }: CreateTicketFormProps) {
  const [ticketCode] = useState(`CSKH-2026-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`);
  const [receivedAt] = useState(new Date().toISOString().slice(0, 16));

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channel: '',
      receivedBy: 'Current User', // Mock current user
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      relationship: '',
      preferredContactMethod: 'Gọi điện',
      studentId: '',
      studentName: '',
      className: '',
      homeroomTeacher: '',
      title: '',
      description: '',
      expectedResolution: '',
      isSensitive: false,
      category: '',
      priority: 'low',
      departmentOwner: '',
      assigneeId: '',
      internalNote: '',
    }
  });

  const priority = watch('priority');
  const [slaPreview, setSlaPreview] = useState('Chưa tính toán');

  useEffect(() => {
    switch (priority) {
      case 'low': setSlaPreview('3 ngày làm việc'); break;
      case 'medium': setSlaPreview('2 ngày làm việc'); break;
      case 'high': setSlaPreview('24 giờ'); break;
      case 'critical': setSlaPreview('4 giờ (Khẩn cấp)'); break;
      default: setSlaPreview('Chưa tính toán');
    }
  }, [priority]);

  const handleActionSubmit = (data: FormData, status: 'NEW' | 'DRAFT' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ASSIGNED' | 'ESCALATED') => {
    if (status === 'ASSIGNED' && !data.assigneeId) {
      alert('Vui lòng chọn Người xử lý chính để Giao việc.');
      return;
    }
    onSubmit({ ...data, ticketCode, receivedAt, status });
  };

  const ErrorMsg = ({ name }: { name: keyof FormData }) => {
    if (!errors[name]) return null;
    return <p className="text-red-500 text-[11px] font-medium mt-1">{errors[name]?.message}</p>;
  };

  return (
    <form className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            Tạo Ticket CSKH Phụ huynh
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1 font-mono">
            {ticketCode} • Draft
          </p>
        </div>
        <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          
          {/* Nhóm 1: Thông tin tiếp nhận */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-indigo-500" /> 1. Thông tin tiếp nhận
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Thời gian tiếp nhận <span className="text-red-500">*</span></label>
                <input type="datetime-local" value={receivedAt} readOnly className="w-full text-sm border-slate-200 rounded-xl bg-slate-50 text-slate-500 focus:ring-0" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Kênh tiếp nhận <span className="text-red-500">*</span></label>
                <select {...register('channel')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Chọn kênh --</option>
                  <option value="Trực tiếp">Trực tiếp</option>
                  <option value="Điện thoại">Điện thoại</option>
                  <option value="Email">Email</option>
                  <option value="Zalo">Zalo</option>
                  <option value="Cổng phụ huynh">Cổng phụ huynh</option>
                  <option value="Họp phụ huynh">Họp phụ huynh</option>
                  <option value="Giáo viên chuyển tiếp">Giáo viên chuyển tiếp</option>
                  <option value="Khác">Khác</option>
                </select>
                <ErrorMsg name="channel" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Người tiếp nhận <span className="text-red-500">*</span></label>
                <input type="text" {...register('receivedBy')} readOnly className="w-full text-sm border-slate-200 rounded-xl bg-slate-50 text-slate-500 focus:ring-0" />
                <ErrorMsg name="receivedBy" />
              </div>
            </div>
          </section>

          {/* Nhóm 2: Người phản ánh */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <UserSquare className="w-4 h-4 text-emerald-500" /> 2. Người phản ánh
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Họ tên phụ huynh <span className="text-red-500">*</span></label>
                <input type="text" {...register('parentName')} placeholder="Ví dụ: Nguyễn Văn A" className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
                <ErrorMsg name="parentName" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Số điện thoại <span className="text-red-500">*</span></label>
                <input type="tel" {...register('parentPhone')} placeholder="09xxxx..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
                <ErrorMsg name="parentPhone" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Email</label>
                <input type="email" {...register('parentEmail')} placeholder="abc@email.com" className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
                <ErrorMsg name="parentEmail" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Quan hệ với học sinh <span className="text-red-500">*</span></label>
                <select {...register('relationship')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Chọn --</option>
                  <option value="Bố">Bố</option>
                  <option value="Mẹ">Mẹ</option>
                  <option value="Ông/Bà">Ông/Bà</option>
                  <option value="Người giám hộ">Người giám hộ</option>
                  <option value="Khác">Khác</option>
                </select>
                <ErrorMsg name="relationship" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Cách phản hồi mong muốn</label>
                <select {...register('preferredContactMethod')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="Gọi điện">Gọi điện</option>
                  <option value="Zalo">Zalo</option>
                  <option value="Email">Email</option>
                  <option value="Cổng phụ huynh">Cổng phụ huynh</option>
                  <option value="Gặp trực tiếp">Gặp trực tiếp</option>
                </select>
              </div>
            </div>
          </section>

          {/* Nhóm 3: Học sinh liên quan */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <UserSquare className="w-4 h-4 text-sky-500" /> 3. Học sinh liên quan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Học sinh (Tìm kiếm)</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Tìm theo tên hoặc mã HS..." className="w-full pl-9 text-sm border-slate-200 rounded-xl focus:ring-indigo-500 bg-slate-50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Họ tên học sinh</label>
                <input type="text" {...register('studentName')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Lớp</label>
                <input type="text" {...register('className')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Giáo viên chủ nhiệm</label>
                <input type="text" {...register('homeroomTeacher')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500" />
              </div>
            </div>
          </section>

          {/* Nhóm 4: Nội dung vụ việc */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> 4. Nội dung vụ việc
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Tiêu đề ticket <span className="text-red-500">*</span></label>
                <input type="text" {...register('title')} placeholder="Ví dụ: Phụ huynh phản ánh điều hòa lớp 3A hoạt động kém" className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500 font-bold" />
                <ErrorMsg name="title" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Nội dung chi tiết <span className="text-red-500">*</span></label>
                <textarea {...register('description')} placeholder="Mô tả chi tiết nội dung sự việc..." rows={4} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500"></textarea>
                <ErrorMsg name="description" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Mong muốn của phụ huynh</label>
                <textarea {...register('expectedResolution')} rows={2} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500 bg-amber-50/30"></textarea>
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors w-fit">
                  <input type="checkbox" {...register('isSensitive')} className="text-red-600 rounded border-slate-300 focus:ring-red-500" />
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-500" /> Đánh dấu đây là vụ việc nhạy cảm
                  </span>
                </label>
              </div>
              <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center mt-2 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                <Paperclip className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-600">Kéo thả hoặc click để đính kèm file/ảnh</span>
                <span className="text-xs text-slate-400 mt-1">Hỗ trợ .jpg, .png, .pdf, .docx (Max 10MB)</span>
              </div>
            </div>
          </section>

          {/* Nhóm 5: Phân loại & SLA */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-purple-500" /> 5. Phân loại & SLA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Loại vụ việc <span className="text-red-500">*</span></label>
                  <select {...register('category')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                    <option value="">-- Chọn --</option>
                    <option value="Học tập">Học tập</option>
                    <option value="Hành vi/tâm lý học sinh">Hành vi/tâm lý học sinh</option>
                    <option value="Giáo viên">Giáo viên</option>
                    <option value="Dịch vụ học đường">Dịch vụ học đường</option>
                    <option value="Cơ sở vật chất">Cơ sở vật chất</option>
                    <option value="Bữa ăn/bán trú">Bữa ăn/bán trú</option>
                    <option value="An toàn học sinh">An toàn học sinh</option>
                    <option value="Truyền thông">Truyền thông</option>
                    <option value="Lịch học/sự kiện">Lịch học/sự kiện</option>
                    <option value="Khác">Khác</option>
                  </select>
                  <ErrorMsg name="category" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Mức độ ưu tiên <span className="text-red-500">*</span></label>
                  <select {...register('priority')} className={`w-full text-sm rounded-xl focus:ring-indigo-500 font-bold ${priority === 'critical' ? 'bg-red-50 border-red-200 text-red-700' : 'border-slate-200'}`}>
                    <option value="low">Thấp</option>
                    <option value="medium">Vừa</option>
                    <option value="high">Cao</option>
                    <option value="critical">Nghiêm trọng</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-full">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> SLA Dự kiến
                </h4>
                <div className="text-lg font-black text-slate-800">{slaPreview}</div>
                
                {priority === 'critical' && (
                  <div className="mt-3 p-3 bg-red-100 text-red-800 rounded-lg text-xs font-medium flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-1">Cảnh báo vụ việc nghiêm trọng!</strong>
                      Sẽ tự động kích hoạt cờ Rủi ro (Risk Flag) và thông báo khẩn cấp tới BGH. Bạn bắt buộc phải ghi chú nội bộ và chỉ định người xử lý ngay lập tức.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Nhóm 6: Phân công xử lý */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <UserSquare className="w-4 h-4 text-orange-500" /> 6. Phân công xử lý
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Phòng ban phụ trách <span className="text-red-500">*</span></label>
                <select {...register('departmentOwner')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Chọn --</option>
                  <option value="Học vụ">Học vụ</option>
                  <option value="CTHS/Tâm lý">CTHS/Tâm lý</option>
                  <option value="Giáo viên chủ nhiệm">Giáo viên chủ nhiệm</option>
                  <option value="Hành chính">Hành chính</option>
                  <option value="Dịch vụ học đường">Dịch vụ học đường</option>
                  <option value="Truyền thông">Truyền thông</option>
                  <option value="BGH">BGH</option>
                  <option value="Khác">Khác</option>
                </select>
                <ErrorMsg name="departmentOwner" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">
                  Người xử lý chính {priority === 'critical' && <span className="text-red-500">*</span>}
                </label>
                <select {...register('assigneeId')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500">
                  <option value="">-- Chưa chỉ định --</option>
                  <option value="user_1">Nguyễn Văn Quản Lý</option>
                  <option value="user_2">Trần Thị Nhân Viên</option>
                </select>
                <ErrorMsg name="assigneeId" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">
                  Ghi chú nội bộ ban đầu {priority === 'critical' && <span className="text-red-500">*</span>}
                </label>
                <textarea {...register('internalNote')} rows={2} placeholder="Các ghi chú dành riêng cho nội bộ trường..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-indigo-500 bg-indigo-50/30"></textarea>
                <ErrorMsg name="internalNote" />
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
          <button type="button" onClick={handleSubmit(data => handleActionSubmit(data, 'DRAFT'))} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
            <Save className="w-4 h-4" /> Lưu nháp
          </button>
          <button type="button" onClick={handleSubmit(data => handleActionSubmit(data, 'NEW'))} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors shadow-sm">
            Tạo Ticket
          </button>
          <button type="button" onClick={handleSubmit(data => handleActionSubmit(data, 'ASSIGNED'))} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200">
            <Send className="w-4 h-4" /> Tạo & Giao xử lý
          </button>
        </div>
      </div>
    </form>
  );
}
