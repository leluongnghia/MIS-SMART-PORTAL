import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  X,
  Plus,
  Trash2,
  Paperclip,
  Save,
  Send,
  Building2,
  Users,
  Tag,
  Link as LinkIcon
} from 'lucide-react';
import { DocumentItem } from '../types';

// Define Zod schema
const documentSchema = z.object({
  docCode: z.string().min(1, 'Mã tài liệu là bắt buộc'),
  title: z.string().min(5, 'Tên tài liệu tối thiểu 5 ký tự'),
  docType: z.enum(['SOP', 'FORM', 'POLICY', 'GUIDELINE', 'CHECKLIST', 'RECORD', 'REPORT', 'REFERENCE']),
  category: z.enum(['Hành chính - Nhân sự', 'Kiểm soát nội bộ', 'Tài sản/Cơ sở vật chất', 'Đơn từ & Phê duyệt', 'CSKH Phụ huynh', 'Truyền thông/Sự kiện', 'Học vụ', 'Học sinh', 'Khác']),
  departmentOwner: z.string().min(1, 'Phòng ban sở hữu là bắt buộc'),
  ownerId: z.string().min(1, 'Người phụ trách là bắt buộc'),
  description: z.string().optional(),
  
  version: z.string().min(1, 'Phiên bản là bắt buộc'),
  issuedDate: z.string().optional(),
  effectiveDate: z.string().optional(),
  nextReviewDate: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'NEEDS_REVIEW', 'EXPIRED', 'ARCHIVED']),
  
  relatedModules: z.array(z.string()),
  tags: z.array(z.string()),
  priority: z.enum(['Bình thường', 'Quan trọng', 'Bắt buộc']),
  targetAudience: z.array(z.string()).min(1, 'Chọn ít nhất 1 đối tượng sử dụng'),
  
  content: z.string().optional(),
  internalNote: z.string().optional(),

  // SOP specific
  purpose: z.string().optional(),
  scope: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

interface CreateDocumentFormProps {
  onClose: () => void;
  onSubmitSuccess: (data: DocumentFormValues) => void;
  initialData?: Partial<DocumentItem>;
}

export default function CreateDocumentForm({ onClose, onSubmitSuccess, initialData }: CreateDocumentFormProps) {
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      docCode: initialData?.docCode || `DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: initialData?.title || '',
      docType: initialData?.docType || 'SOP',
      category: initialData?.category || 'Hành chính - Nhân sự',
      departmentOwner: initialData?.departmentOwner || '',
      ownerId: initialData?.ownerId || '',
      description: initialData?.description || '',
      version: initialData?.version || '1.0',
      issuedDate: initialData?.issuedDate || '',
      effectiveDate: initialData?.effectiveDate || '',
      nextReviewDate: initialData?.nextReviewDate || '',
      status: initialData?.status || 'DRAFT',
      relatedModules: initialData?.relatedModules || [],
      tags: initialData?.tags || [],
      priority: initialData?.priority || 'Bình thường',
      targetAudience: initialData?.targetAudience || [],
      content: initialData?.content || '',
      internalNote: initialData?.internalNote || '',
      purpose: initialData?.purpose || '',
      scope: initialData?.scope || '',
    },
  });

  const docType = watch('docType');
  const tags = watch('tags');
  const relatedModules = watch('relatedModules');
  const targetAudience = watch('targetAudience');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const toggleArrayItem = (field: 'relatedModules' | 'targetAudience', item: string) => {
    const current = watch(field);
    if (current.includes(item)) {
      setValue(field, current.filter(i => i !== item));
    } else {
      setValue(field, [...current, item]);
    }
  };

  const onSubmit = async (data: DocumentFormValues, actionType: 'DRAFT' | 'ACTIVE' | 'PENDING_APPROVAL') => {
    try {
      const finalData = { ...data, status: actionType };
      console.log('Submit Document Final Data:', finalData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      onSubmitSuccess(finalData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
      <div className="shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Tạo tài liệu mới
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kho quy trình, văn bản, biểu mẫu & tri thức</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Nhóm 1: Thông tin chung */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center font-bold text-xs">1</div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Thông tin chung</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mã tài liệu <span className="text-red-500">*</span></label>
              <input type="text" {...register('docCode')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500" readOnly />
              {errors.docCode && <p className="text-red-500 text-xs mt-1">{errors.docCode.message}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Loại tài liệu <span className="text-red-500">*</span></label>
              <select {...register('docType')} className="w-full px-3 py-2 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500">
                <option value="SOP">Quy trình/SOP</option>
                <option value="FORM">Biểu mẫu</option>
                <option value="POLICY">Chính sách</option>
                <option value="GUIDELINE">Hướng dẫn</option>
                <option value="CHECKLIST">Checklist</option>
                <option value="RECORD">Biên bản</option>
                <option value="REPORT">Báo cáo mẫu</option>
                <option value="REFERENCE">Tài liệu tham khảo</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tên tài liệu <span className="text-red-500">*</span></label>
              <input type="text" {...register('title')} placeholder="Ví dụ: Quy trình xin nghỉ phép" className="w-full px-3 py-2 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nhóm nghiệp vụ <span className="text-red-500">*</span></label>
              <select {...register('category')} className="w-full px-3 py-2 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500">
                <option value="Hành chính - Nhân sự">Hành chính - Nhân sự</option>
                <option value="Kiểm soát nội bộ">Kiểm soát nội bộ</option>
                <option value="Tài sản/Cơ sở vật chất">Tài sản/Cơ sở vật chất</option>
                <option value="Đơn từ & Phê duyệt">Đơn từ & Phê duyệt</option>
                <option value="CSKH Phụ huynh">CSKH Phụ huynh</option>
                <option value="Truyền thông/Sự kiện">Truyền thông/Sự kiện</option>
                <option value="Học vụ">Học vụ</option>
                <option value="Học sinh">Học sinh</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phòng ban sở hữu <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input type="text" {...register('departmentOwner')} placeholder="Nhập tên phòng ban..." className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500" />
              </div>
              {errors.departmentOwner && <p className="text-red-500 text-xs mt-1">{errors.departmentOwner.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Người phụ trách <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Users className="w-4 h-4" />
                </div>
                <input type="text" {...register('ownerId')} placeholder="ID hoặc Tên người phụ trách..." className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500" />
              </div>
              {errors.ownerId && <p className="text-red-500 text-xs mt-1">{errors.ownerId.message}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mô tả ngắn</label>
              <textarea {...register('description')} rows={2} placeholder="Tóm tắt về tài liệu này..." className="w-full px-3 py-2 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* SOP Specific Fields */}
        {docType === 'SOP' && (
          <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/20 flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">S</div>
              <h3 className="font-semibold text-indigo-800 dark:text-indigo-300">Thông tin Quy trình (SOP)</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mục đích quy trình</label>
                <textarea {...register('purpose')} rows={2} placeholder="Mục đích ban hành quy trình..." className="w-full px-3 py-2 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phạm vi áp dụng</label>
                <textarea {...register('scope')} rows={2} placeholder="Phạm vi và đối tượng cụ thể..." className="w-full px-3 py-2 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
              </div>
            </div>
          </div>
        )}

        {/* Nhóm 2: Hiệu lực */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">2</div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Cài đặt Hiệu lực</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phiên bản <span className="text-red-500">*</span></label>
              <input type="text" {...register('version')} className="w-full px-3 py-2 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500" />
              {errors.version && <p className="text-red-500 text-xs mt-1">{errors.version.message}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ngày ban hành</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input type="date" {...register('issuedDate')} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ngày hiệu lực</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input type="date" {...register('effectiveDate')} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ngày rà soát tiếp theo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input type="date" {...register('nextReviewDate')} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Nhóm 3: Phân loại & Đối tượng */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center font-bold text-xs">3</div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Phân loại & Đối tượng</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mức độ quan trọng</label>
                <select {...register('priority')} className="w-full px-3 py-2 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500">
                  <option value="Bình thường">Bình thường</option>
                  <option value="Quan trọng">Quan trọng</option>
                  <option value="Bắt buộc">Bắt buộc</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Module liên kết</label>
                <div className="flex flex-wrap gap-2">
                  {['WORKFLOW_APPROVALS', 'HRM', 'LOGISTICS', 'RISK_CENTER', 'EVENTS'].map(mod => (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => toggleArrayItem('relatedModules', mod)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        relatedModules.includes(mod)
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Đối tượng sử dụng <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {['BGH', 'HCNS', 'Giáo viên', 'Nhân viên', 'Phụ huynh', 'Học sinh'].map(aud => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => toggleArrayItem('targetAudience', aud)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                      targetAudience.includes(aud)
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    {targetAudience.includes(aud) && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {aud}
                  </button>
                ))}
              </div>
              {errors.targetAudience && <p className="text-red-500 text-xs mt-1">{errors.targetAudience.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tags</label>
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    placeholder="Nhập tag và nhấn Enter..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button type="button" onClick={handleAddTag} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                  Thêm
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      #{t}
                      <button type="button" onClick={() => handleRemoveTag(t)} className="text-slate-400 hover:text-red-500 focus:outline-none">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nhóm 4: Nội dung / File đính kèm */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 flex items-center justify-center font-bold text-xs">4</div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Nội dung & File đính kèm</h3>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nội dung tóm tắt / Hướng dẫn</label>
              <textarea {...register('content')} rows={5} placeholder="Nhập nội dung văn bản / quy trình tại đây..." className="w-full px-3 py-2 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 resize-none font-mono"></textarea>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ghi chú nội bộ</label>
              <textarea {...register('internalNote')} rows={2} placeholder="Ghi chú dành riêng cho người quản lý..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button type="button" className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto">
                <Paperclip className="w-4 h-4" />
                Đính kèm File
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Action Bar */}
      <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 z-10 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          Hủy bỏ
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit((d) => onSubmit(d, 'DRAFT'))}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Lưu nháp
          </button>
          
          <button
            type="button"
            onClick={handleSubmit((d) => onSubmit(d, 'PENDING_APPROVAL'))}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/80 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Lưu & Gửi duyệt
          </button>

          <button
            type="button"
            onClick={handleSubmit((d) => onSubmit(d, 'ACTIVE'))}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Ban hành ngay
          </button>
        </div>
      </div>
    </div>
  );
}
