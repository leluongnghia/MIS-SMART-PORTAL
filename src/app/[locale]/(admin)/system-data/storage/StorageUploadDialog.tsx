import React, { useState } from 'react';
import { Dialog } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';
import { FILE_CATEGORIES, RELATED_MODULES, STORAGE_SCOPE } from './storage.constants';
import { uploadStorageFile } from './actions';
import { useToast } from '@/src/components/ui/Toast';

export function StorageUploadDialog({
  open,
  onOpenChange,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast({ variant: 'error', title: 'Lỗi', message: 'Vui lòng chọn file' });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({ variant: 'error', title: 'Lỗi', message: 'Dung lượng file vượt quá 20MB' });
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append('file', file);

    try {
      setLoading(true);
      await uploadStorageFile(formData);
      toast({ variant: 'success', title: 'Thành công', message: 'Tải lên file thành công' });
      onSuccess();
      onOpenChange(false);
      setFile(null);
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="Tải lên tài liệu"
      description="Tải lên tài liệu mới vào kho dữ liệu. Giới hạn dung lượng 20MB."
      className="sm:max-w-[500px]"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="file" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Chọn file <span className="text-red-500">*</span></label>
            <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
          </div>
          <div className="grid gap-2">
            <label htmlFor="displayName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Tên tài liệu <span className="text-red-500">*</span></label>
            <Input id="displayName" name="displayName" defaultValue={file?.name || ''} required />
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Mô tả</label>
            <Textarea id="description" name="description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Danh mục <span className="text-red-500">*</span></label>
              <Select name="category" required defaultValue={FILE_CATEGORIES[0]}>
                <option value="" disabled>Chọn danh mục</option>
                {FILE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="relatedModule" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Module liên quan</label>
              <Select name="relatedModule" defaultValue={RELATED_MODULES[0]}>
                <option value="" disabled>Chọn module</option>
                <option value="none">Không có</option>
                {RELATED_MODULES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="visibility" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Phạm vi chia sẻ <span className="text-red-500">*</span></label>
            <Select name="visibility" required defaultValue={STORAGE_SCOPE.PRIVATE}>
              <option value="" disabled>Chọn phạm vi</option>
              <option value={STORAGE_SCOPE.PRIVATE}>Cá nhân</option>
              <option value={STORAGE_SCOPE.DEPARTMENT}>Phòng ban</option>
              <option value={STORAGE_SCOPE.SCHOOL_WIDE}>Toàn trường</option>
              <option value={STORAGE_SCOPE.ADMIN_ONLY}>Chỉ Quản trị viên</option>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading || !file}>
            {loading ? 'Đang tải lên...' : 'Tải lên'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
