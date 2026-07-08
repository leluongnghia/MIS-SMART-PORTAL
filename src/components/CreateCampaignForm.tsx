import React, { useState } from 'react';
import { X, Send, Megaphone, CheckCircle, Upload, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tên chiến dịch'),
  objective: z.string().min(1, 'Vui lòng nhập mục tiêu'),
  audience: z.array(z.string()).min(1, 'Chọn ít nhất 1 đối tượng'),
  channels: z.array(z.string()).min(1, 'Chọn ít nhất 1 kênh'),
  startAt: z.string().min(1, 'Chọn thời gian bắt đầu'),
  endAt: z.string().min(1, 'Chọn thời gian kết thúc'),
  managerId: z.string().min(1, 'Nhập người phụ trách'),
  content: z.string().min(1, 'Nhập nội dung chính'),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateCampaignForm({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: any) => void }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      objective: '',
      audience: [],
      channels: [],
      startAt: '',
      endAt: '',
      managerId: 'Current User', // Mock default
      content: ''
    }
  });

  const [postSchedule, setPostSchedule] = useState<any[]>([]);

  const audienceWatch = watch('audience');
  const channelsWatch = watch('channels');

  const MultiSelectCheckbox = ({ options, name, currentValues }: { options: string[], name: any, currentValues: string[] }) => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map(opt => {
          const isSelected = currentValues.includes(opt);
          return (
            <label key={opt} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border ${isSelected ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
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
              {isSelected && <CheckCircle className="w-3 h-3 text-sky-600" />}
              {opt}
            </label>
          );
        })}
      </div>
    );
  };

  const submitForm = (data: FormData) => {
    onSubmit({
      ...data,
      postSchedule,
      status: 'draft'
    });
  };

  return (
    <form className="flex flex-col h-full bg-slate-50 relative" onSubmit={handleSubmit(submitForm)}>
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            Tạo Chiến Dịch Truyền Thông
          </h2>
        </div>
        <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-sky-500" /> 1. Thông tin chung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Tên chiến dịch <span className="text-red-500">*</span></label>
                <input type="text" {...register('title')} placeholder="Ví dụ: Truyền thông tuyển sinh HK2" className="w-full text-sm border-slate-200 rounded-xl focus:ring-sky-500 font-bold" />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Mục tiêu <span className="text-red-500">*</span></label>
                <textarea {...register('objective')} rows={2} placeholder="Mục tiêu chính..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-sky-500"></textarea>
                {errors.objective && <p className="text-xs text-red-500">{errors.objective.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Thời gian bắt đầu <span className="text-red-500">*</span></label>
                <input type="date" {...register('startAt')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-sky-500" />
                {errors.startAt && <p className="text-xs text-red-500">{errors.startAt.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Thời gian kết thúc <span className="text-red-500">*</span></label>
                <input type="date" {...register('endAt')} className="w-full text-sm border-slate-200 rounded-xl focus:ring-sky-500" />
                {errors.endAt && <p className="text-xs text-red-500">{errors.endAt.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Người phụ trách <span className="text-red-500">*</span></label>
                <input type="text" {...register('managerId')} readOnly className="w-full text-sm border-slate-200 rounded-xl bg-slate-50 text-slate-500 focus:ring-0" />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">
              2. Kênh & Đối tượng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Kênh truyền thông <span className="text-red-500">*</span></label>
                <MultiSelectCheckbox 
                  name="channels" 
                  currentValues={channelsWatch}
                  options={['Facebook', 'Website', 'Zalo', 'TikTok', 'Email', 'Bảng tin nội bộ']} 
                />
                {errors.channels && <p className="text-xs text-red-500">{errors.channels.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Đối tượng <span className="text-red-500">*</span></label>
                <MultiSelectCheckbox 
                  name="audience" 
                  currentValues={audienceWatch}
                  options={['Toàn trường', 'Học sinh', 'Phụ huynh', 'Giáo viên', 'Công chúng', 'Khác']} 
                />
                {errors.audience && <p className="text-xs text-red-500">{errors.audience.message}</p>}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">
              3. Nội dung & Media
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Nội dung chính <span className="text-red-500">*</span></label>
                <textarea {...register('content')} rows={4} placeholder="Nội dung truyền tải..." className="w-full text-sm border-slate-200 rounded-xl focus:ring-sky-500"></textarea>
                {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 mb-2 block">Upload Media đính kèm (Poster, Video)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Kéo thả file media vào đây hoặc click để upload</p>
                  <p className="text-xs text-slate-500 mt-1">Hỗ trợ JPG, PNG, MP4 (Max: 50MB)</p>
                </div>
              </div>
            </div>
          </section>
          
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">
              4. Lịch đăng bài dự kiến
            </h3>
            <div className="space-y-3">
              {postSchedule.map((post, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200 text-sm">
                  <span className="font-bold text-slate-700 min-w-[100px]">{post.date}</span>
                  <span className="text-sky-600 font-medium px-2 py-1 bg-sky-100 rounded-md text-xs">{post.channel}</span>
                  <span className="flex-1 text-slate-600 truncate">{post.topic}</span>
                  <button type="button" onClick={() => setPostSchedule(postSchedule.filter((_, i) => i !== idx))} className="p-1 text-red-500 hover:bg-red-50 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <input type="date" id="newDate" className="text-sm border-slate-200 rounded-lg focus:ring-sky-500" />
                <select id="newChannel" className="text-sm border-slate-200 rounded-lg focus:ring-sky-500">
                  <option value="Facebook">Facebook</option>
                  <option value="Website">Website</option>
                  <option value="Tiktok">Tiktok</option>
                </select>
                <input type="text" id="newTopic" placeholder="Chủ đề bài đăng..." className="flex-1 text-sm border-slate-200 rounded-lg focus:ring-sky-500" />
                <button type="button" onClick={() => {
                  const d = (document.getElementById('newDate') as HTMLInputElement).value;
                  const c = (document.getElementById('newChannel') as HTMLSelectElement).value;
                  const t = (document.getElementById('newTopic') as HTMLInputElement).value;
                  if (d && c && t) {
                    setPostSchedule([...postSchedule, { date: d, channel: c, topic: t, status: 'draft' }]);
                    (document.getElementById('newTopic') as HTMLInputElement).value = '';
                  }
                }} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-900">
                  Thêm
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>

      <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex items-center justify-end gap-3 sticky bottom-0 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
          Hủy bỏ
        </button>
        <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-sm shadow-sky-600/20 rounded-xl transition-all flex items-center gap-2 active:scale-95">
          <Send className="w-4 h-4" /> Tạo chiến dịch
        </button>
      </div>
    </form>
  );
}
