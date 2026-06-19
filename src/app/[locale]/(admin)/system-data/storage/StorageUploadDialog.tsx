import React, { useState } from 'react';
import { Dialog } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';
import { FILE_CATEGORIES, RELATED_MODULES, STORAGE_SCOPE } from './storage.constants';
import { checkDuplicateFileName, uploadStorageFile } from './actions';
import { useToast } from '@/src/components/ui/Toast';

const SAFE = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.txt,.zip';
const DANGER = ['exe', 'bat', 'cmd', 'sh', 'msi', 'js'];

export function StorageUploadDialog({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [conflictMode, setConflictMode] = useState('version');
  const [duplicate, setDuplicate] = useState(false);

  const onPick = async (picked?: File) => {
    setFile(picked || null);
    setDuplicate(false);
    if (!picked) return;
    const ext = picked.name.split('.').pop()?.toLowerCase() || '';
    if (DANGER.includes(ext)) {
      toast({ variant: 'error', title: 'File nguy hiểm', message: `Không cho phép .${ext}` });
      setFile(null);
      return;
    }
    const max = ext === 'zip' ? 50 : ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? 10 : 20;
    if (picked.size > max * 1024 * 1024) {
      toast({ variant: 'error', title: 'Vượt dung lượng', message: `File tối đa ${max}MB` });
      setFile(null);
      return;
    }
    const dup = await checkDuplicateFileName(picked.name);
    setDuplicate(dup.exists);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return toast({ variant: 'error', title: 'Lỗi', message: 'Vui lòng chọn file hợp lệ' });
    const formData = new FormData(e.currentTarget);
    formData.append('file', file);
    formData.set('conflictMode', conflictMode);
    try {
      setLoading(true);
      await uploadStorageFile(formData);
      toast({ variant: 'success', title: 'Tải lên thành công', message: 'File đã xuất hiện trong bảng.' });
      onSuccess();
      onOpenChange(false);
      setFile(null);
      setDuplicate(false);
    } catch (error: any) {
      toast({ variant: 'error', title: 'Upload thất bại', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return <Dialog open={open} onOpenChange={onOpenChange} title="Tải lên tài liệu" description="Chỉ nhận file an toàn. Ảnh tối đa 10MB, file thường 20MB, ZIP 50MB." className="sm:max-w-[680px]">
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900 dark:bg-indigo-950/20">
        <label htmlFor="storage-file" className="text-sm font-bold">Chọn file *</label>
        <Input id="storage-file" type="file" accept={SAFE} onChange={(e) => onPick(e.target.files?.[0])} required className="mt-2" />
        {file && <p className="mt-2 text-xs text-slate-500">{file.name} · {(file.size / 1024 / 1024).toFixed(2)}MB</p>}
      </div>
      {duplicate && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        File trùng tên. Chọn cách xử lý: <Select value={conflictMode} onChange={(e) => setConflictMode(e.target.value)} className="mt-2"><option value="version">Tạo phiên bản mới</option><option value="overwrite">Ghi đè metadata</option><option value="cancel">Hủy upload</option></Select>
      </div>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2"><label className="text-sm font-bold" htmlFor="displayName">Tên tài liệu *</label><Input id="displayName" name="displayName" defaultValue={file?.name || ''} required /></div>
        <div className="grid gap-2"><label className="text-sm font-bold">Quyền tải xuống</label><Select name="downloadPermission" defaultValue="ALLOWED"><option value="ALLOWED">Cho phép tải xuống</option><option value="VIEW_ONLY">Chỉ xem</option></Select></div>
      </div>
      <div className="grid gap-2"><label className="text-sm font-bold" htmlFor="description">Mô tả</label><Textarea id="description" name="description" placeholder="Mô tả ngắn về nội dung, mục đích sử dụng..." /></div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2"><label className="text-sm font-bold">Danh mục *</label><Select name="category" required defaultValue=""><option value="" disabled>Chọn danh mục</option>{FILE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</Select></div>
        <div className="grid gap-2"><label className="text-sm font-bold">Module liên quan</label><Select name="relatedModule" defaultValue="Khác">{RELATED_MODULES.map(c => <option key={c} value={c}>{c}</option>)}</Select></div>
        <div className="grid gap-2"><label className="text-sm font-bold">Phạm vi *</label><Select name="visibility" required defaultValue={STORAGE_SCOPE.PRIVATE}><option value={STORAGE_SCOPE.PRIVATE}>Cá nhân</option><option value={STORAGE_SCOPE.DEPARTMENT}>Phòng ban</option><option value={STORAGE_SCOPE.SCHOOL_WIDE}>Toàn trường</option><option value={STORAGE_SCOPE.ADMIN_ONLY}>Chỉ quản trị viên</option></Select></div>
      </div>
      <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button><Button type="submit" disabled={loading || !file}>{loading ? 'Đang tải...' : 'Tải lên'}</Button></div>
    </form>
  </Dialog>;
}
