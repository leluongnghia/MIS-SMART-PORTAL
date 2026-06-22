'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Users, GraduationCap, Settings, Plus, Edit3, Trash2 } from 'lucide-react';
import { Dialog } from '@/src/components/ui/dialog';
import { createClass, deleteClass, updateClass } from './actions';

import Drawer from '@/src/components/ui/Drawer';
import StudentQuickProfile from '@/src/components/students/student-quick-profile';

export default function ClassesClient({ initialData }: { initialData: any }) {
  const [classes, setClasses] = useState<any[]>(initialData.classes || []);
  const [students, setStudents] = useState<any[]>(initialData.students || []);
  const defaultClass = classes.find((c: any) => students.some((s: any) => s.className === c.name)) || classes[0];
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClass?.id || '');
  const [isListDrawerOpen, setIsListDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [hienTuyChinh, setHienTuyChinh] = useState(false);
  const [classDialogMode, setClassDialogMode] = useState<'create' | 'edit' | null>(null);
  const [classForm, setClassForm] = useState<any>({ name: '', code: '', gradeLevel: '', capacity: 30, status: 'ACTIVE' });
  const [tuyChinhAnSiSo, setTuyChinhAnSiSo] = useState(false);
  const [tuyChinhAnTrangThai, setTuyChinhAnTrangThai] = useState(false);

  const selectedClass = classes.find((c: any) => c.id === selectedClassId);
  const classStudents = students.filter((s: any) => s.className === selectedClass?.name);
  const openClassCreate = () => {
    setClassForm({ name: '', code: '', gradeLevel: '', capacity: 30, status: 'ACTIVE' });
    setClassDialogMode('create');
  };
  const openClassEdit = () => {
    if (!selectedClass) return;
    setClassForm({ name: selectedClass.name || '', code: selectedClass.code || '', gradeLevel: selectedClass.gradeLevel || '', capacity: selectedClass.capacity || 30, status: selectedClass.status || 'ACTIVE' });
    setClassDialogMode('edit');
  };
  const submitClassForm = async () => {
    const result = classDialogMode === 'edit' ? await updateClass(selectedClass.id, classForm) : await createClass(classForm);
    if (!result.success || !result.data) {
      alert(result.error || 'Lưu lớp thất bại.');
      return;
    }
    if (classDialogMode === 'edit') {
      setClasses(prev => prev.map(item => item.id === result.data.id ? result.data : item));
      if (selectedClass.name !== result.data.name) {
        setStudents(prev => prev.map(student => student.className === selectedClass.name ? { ...student, className: result.data.name } : student));
      }
    } else {
      setClasses(prev => [result.data, ...prev]);
      setSelectedClassId(result.data.id);
    }
    setClassDialogMode(null);
  };
  const removeSelectedClass = async () => {
    if (!selectedClass || !confirm(`Xóa lớp "${selectedClass.name}"?`)) return;
    const result = await deleteClass(selectedClass.id);
    if (!result.success) {
      alert(result.error || 'Xóa lớp thất bại.');
      return;
    }
    const next = classes.filter(item => item.id !== selectedClass.id);
    setClasses(next);
    setSelectedClassId(next[0]?.id || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Quản lý Lớp học
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 font-bold bg-white"
          >
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Button variant="outline" className="gap-2 font-bold" onClick={() => setHienTuyChinh(true)}>
            <Settings className="h-4 w-4" /> Tùy chỉnh
          </Button>
          <Button variant="outline" className="gap-2 font-bold" onClick={openClassEdit} disabled={!selectedClass}>
            <Edit3 className="h-4 w-4" /> Sửa lớp
          </Button>
          <Button variant="destructive" className="gap-2 font-bold" onClick={removeSelectedClass} disabled={!selectedClass || classStudents.length > 0}>
            <Trash2 className="h-4 w-4" /> Xóa
          </Button>
          <Button className="gap-2 font-bold" onClick={openClassCreate}>
            <Plus className="h-4 w-4" /> Thêm lớp
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">Sĩ số lớp</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {tuyChinhAnSiSo ? "—" : classStudents.length}
              </h3>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setIsListDrawerOpen(true)}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">Khối lớp / Bấm xem DS</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedClass?.gradeLevel || 'N/A'}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Drawer
        isOpen={isListDrawerOpen}
        onClose={() => setIsListDrawerOpen(false)}
        title={`Danh sách học sinh - Lớp ${selectedClass?.name || ''}`}
        side="right"
        width="lg"
      >
        <div className="p-4">
          <div className="space-y-2">
            {classStudents.map((s: any) => (
              <div 
                key={s.id} 
                onClick={() => setSelectedStudent(s)}
                className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors"
              >
                <img src={`https://i.pravatar.cc/150?u=${s.id}`} alt="" className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</h4>
                  <p className="text-xs text-slate-500">Mã HS: {s.code}</p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-inset ring-emerald-600/20 px-2 py-0.5 border-0">
                  {s.payload?.status || 'Đang học'}
                </Badge>
              </div>
            ))}
            {classStudents.length === 0 && (
              <p className="text-center text-slate-500 py-8 italic">Lớp chưa có học sinh.</p>
            )}
          </div>
        </div>
      </Drawer>

      <StudentQuickProfile 
        isOpen={!!selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
        student={selectedStudent} 
      />


      <Card>
        <CardHeader>
          <CardTitle>Danh sách học sinh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400">Mã HS</th>
                  <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400">Họ và tên</th>
                  {!tuyChinhAnTrangThai && (
                    <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400">Trạng thái</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {classStudents.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{s.code}</td>
                    <td className="px-4 py-3 font-bold cursor-pointer text-blue-600 hover:underline" onClick={() => setSelectedStudent(s)}>{s.name}</td>
                    {!tuyChinhAnTrangThai && (
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          {s.payload?.status || 'Đang học'}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
                {classStudents.length === 0 && (
                  <tr>
                    <td colSpan={tuyChinhAnTrangThai ? 2 : 3} className="px-4 py-8 text-center text-slate-500 italic">
                      Chưa có học sinh nào trong lớp này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={hienTuyChinh}
        onOpenChange={setHienTuyChinh}
        title="Tùy chỉnh danh sách lớp học"
        description="Các tùy chọn này áp dụng ngay trên màn hình hiện tại."
      >
        <div className="space-y-4 text-sm">
          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <span>
              <span className="block font-bold text-slate-900 dark:text-white">Ẩn sĩ số lớp</span>
              <span className="text-xs text-slate-500">Giấu số lượng học sinh trong lớp trên thẻ tổng quan.</span>
            </span>
            <input type="checkbox" checked={tuyChinhAnSiSo} onChange={(e) => setTuyChinhAnSiSo(e.target.checked)} className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <span>
              <span className="block font-bold text-slate-900 dark:text-white">Ẩn cột trạng thái</span>
              <span className="text-xs text-slate-500">Ẩn cột Trạng thái trong bảng danh sách học sinh.</span>
            </span>
            <input type="checkbox" checked={tuyChinhAnTrangThai} onChange={(e) => setTuyChinhAnTrangThai(e.target.checked)} className="h-4 w-4" />
          </label>
        </div>
      </Dialog>

      <Dialog
        open={!!classDialogMode}
        onOpenChange={(open) => !open && setClassDialogMode(null)}
        title={classDialogMode === 'edit' ? 'Sửa lớp học' : 'Thêm lớp học'}
        description="Dữ liệu được lưu vào bảng classes."
        className="max-w-xl"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-lg border p-2 text-sm dark:bg-slate-900" placeholder="Tên lớp" value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} />
          <input className="rounded-lg border p-2 text-sm dark:bg-slate-900" placeholder="Mã lớp" value={classForm.code} onChange={e => setClassForm({ ...classForm, code: e.target.value })} />
          <input className="rounded-lg border p-2 text-sm dark:bg-slate-900" placeholder="Khối" value={classForm.gradeLevel} onChange={e => setClassForm({ ...classForm, gradeLevel: e.target.value })} />
          <input type="number" className="rounded-lg border p-2 text-sm dark:bg-slate-900" placeholder="Sức chứa" value={classForm.capacity} onChange={e => setClassForm({ ...classForm, capacity: Number(e.target.value) })} />
          <select className="rounded-lg border p-2 text-sm dark:bg-slate-900 md:col-span-2" value={classForm.status} onChange={e => setClassForm({ ...classForm, status: e.target.value })}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button variant="outline" onClick={() => setClassDialogMode(null)}>Hủy</Button>
            <Button onClick={submitClassForm} disabled={!classForm.name.trim()}>Lưu lớp</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
