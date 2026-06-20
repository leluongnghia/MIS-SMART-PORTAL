'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Users, GraduationCap, Settings } from 'lucide-react';

import Drawer from '@/src/components/ui/Drawer';
import StudentQuickProfile from '@/src/components/students/student-quick-profile';

export default function ClassesClient({ initialData }: { initialData: any }) {
  const { classes = [], students = [] } = initialData;
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [isListDrawerOpen, setIsListDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const selectedClass = classes.find((c: any) => c.id === selectedClassId);
  const classStudents = students.filter((s: any) => s.className === selectedClass?.name);

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
          <Button variant="outline" className="gap-2 font-bold">
            <Settings className="h-4 w-4" /> Tùy chỉnh
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
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{classStudents.length}</h3>
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
                  <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {classStudents.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{s.code}</td>
                    <td className="px-4 py-3 font-bold cursor-pointer text-blue-600 hover:underline" onClick={() => setSelectedStudent(s)}>{s.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        {s.payload?.status || 'Đang học'}
                      </span>
                    </td>
                  </tr>
                ))}
                {classStudents.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500 italic">
                      Chưa có học sinh nào trong lớp này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
