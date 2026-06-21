'use client';

import { useState, useTransition, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/src/lib/utils';
import { useToast } from '@/src/components/ui/Toast';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  MoreVertical,
  FileSpreadsheet,
  Upload,
  Filter
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent } from '@/src/components/ui/card';
import { Dialog } from '@/src/components/ui/dialog';
import { Textarea } from '@/src/components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/src/components/ui/table';
import {
  createLead,
  updateLead,
  deleteLead,
  getAllLeadsForExport,
  type LeadStatus,
} from './actions';

const leadFormSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên học sinh là bắt buộc'),
  parentName: z.string().optional().nullable(),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')).nullable(),
  source: z.string().min(1, 'Nguồn là bắt buộc'),
  grade: z.string().min(1, 'Khối/Lớp đăng ký là bắt buộc'),
  status: z.enum([
    'received',
    'consulting',
    'test_scheduled',
    'test_participated',
    'seat_reserved',
    'docs_submitted',
    'enrolled',
    'cancelled',
  ]),
  assignedUserId: z.string().nullable().optional(),
  notes: z.string().optional().nullable(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface User {
  id: string;
  name: string;
}

interface Lead {
  id: string;
  leadCode: string;
  fullName: string;
  parentName: string | null;
  phone: string;
  email: string | null;
  source: string;
  grade: string;
  status: LeadStatus;
  assignedUserId: string | null;
  notes: string | null;
  createdAt: Date;
  
  dateOfBirth?: Date | null;
  currentClass?: string | null;
  currentSchool?: string | null;
  address?: string | null;
  enrollmentSystem?: string | null;
  testDate?: Date | null;
  testTime?: string | null;
  mathScore?: number | null;
  englishScore?: number | null;
  vietnameseScore?: number | null;
  scholarshipPercent?: number | null;
  finalTuition?: number | null;
  seatReservationFee?: number | null;
  seatReservationDate?: Date | null;
  nationalStudentId?: string | null;
  insuranceId?: string | null;
  moetStudentId?: string | null;
}

interface LeadsClientProps {
  locale: string;
  initialData: {
    data: Lead[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
  users: User[];
  filters: {
    search: string;
    status: string;
    source: string;
    grade: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    page: number;
  };
}

const statusBadgeStyles: Record<LeadStatus, string> = {
  received: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  consulting: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
  test_scheduled: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800',
  test_participated: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  seat_reserved: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
  docs_submitted: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  enrolled: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
};

const statusLabels: Record<LeadStatus, string> = {
  received: 'Tiếp nhận Data',
  consulting: 'Đang tư vấn',
  test_scheduled: 'Đăng ký Test',
  test_participated: 'Đã tham gia Test',
  seat_reserved: 'Đã giữ chỗ',
  docs_submitted: 'Đã nộp hồ sơ',
  enrolled: 'Đã nhập học',
  cancelled: 'Hủy/Rút hồ sơ',
};

const leadSources = ['Website', 'Facebook', 'TikTok', 'Google', 'Referral', 'Event', 'Other'];
const gradeLevels = [
  'Mầm non',
  'Lớp 1',
  'Lớp 2',
  'Lớp 3',
  'Lớp 4',
  'Lớp 5',
  'Lớp 6',
  'Lớp 7',
  'Lớp 8',
  'Lớp 9',
  'Lớp 10',
  'Lớp 11',
  'Lớp 12',
];

export default function LeadsClient({
  locale,
  initialData,
  users,
  filters,
}: LeadsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState(filters.sortBy || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(filters.sortOrder || 'desc');
  const [assignedFilter, setAssignedFilter] = useState('all');

  // Search/Filters states (must be before handleSort)
  const [search, setSearch] = useState(filters.search);
  const [status, setStatus] = useState(filters.status);
  const [source, setSource] = useState(filters.source);
  const [grade, setGrade] = useState(filters.grade);

  const handleSort = useCallback((col: string) => {
    const newOrder = sortBy === col && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(col);
    setSortOrder(newOrder);
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (status && status !== 'all') query.set('status', status);
    if (source && source !== 'all') query.set('source', source);
    if (grade && grade !== 'all') query.set('grade', grade);
    query.set('sortBy', col);
    query.set('sortOrder', newOrder);
    startTransition(() => router.push(`/${locale}/leads?${query.toString()}`));
  }, [sortBy, sortOrder, search, status, source, grade, locale, router]);

  // Forms
  const createForm = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      fullName: '',
      parentName: '',
      phone: '',
      email: '',
      source: 'Website',
      grade: 'Lớp 10',
      status: 'received',
      assignedUserId: '',
      notes: '',
    },
  });

  const editForm = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
  });

  const handleSearchAndFilters = (newFilters: {
    search?: string;
    status?: string;
    source?: string;
    grade?: string;
    page?: number;
  }) => {
    const query = new URLSearchParams();
    const s = newFilters.search !== undefined ? newFilters.search : search;
    const st = newFilters.status !== undefined ? newFilters.status : status;
    const src = newFilters.source !== undefined ? newFilters.source : source;
    const gr = newFilters.grade !== undefined ? newFilters.grade : grade;
    const p = newFilters.page !== undefined ? newFilters.page : filters.page;

    if (s) query.set('search', s);
    if (st && st !== 'all') query.set('status', st);
    if (src && src !== 'all') query.set('source', src);
    if (gr && gr !== 'all') query.set('grade', gr);
    if (p && p > 1) query.set('page', String(p));

    startTransition(() => {
      router.push(`/${locale}/leads?${query.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= initialData.totalPages) {
      handleSearchAndFilters({ page: newPage });
    }
  };

  const { success: toastSuccess, error: toastError } = useToast();

  const onSubmitCreate = async (values: LeadFormValues) => {
    const result = await createLead(values as any);
    if (result.success) {
      setCreateOpen(false);
      createForm.reset();
      toastSuccess('Tạo lead thành công', `Đã thêm hồ sơ tuyển sinh mới`);
      router.refresh();
    } else {
      toastError('Tạo lead thất bại', 'Vui lòng kiểm tra lại thông tin');
    }
  };

  const onSubmitEdit = async (values: LeadFormValues) => {
    if (!activeLead) return;
    const result = await updateLead(activeLead.id, values as any);
    if (result.success) {
      setEditOpen(false);
      setActiveLead(null);
      toastSuccess('Cập nhật thành công', `Đã lưu thông tin hồ sơ ${activeLead.fullName}`);
      router.refresh();
    } else {
      toastError('Cập nhật thất bại', 'Vui lòng thử lại');
    }
  };

  const handleDelete = async () => {
    if (!activeLead) return;
    const result = await deleteLead(activeLead.id);
    if (result.success) {
      setDeleteOpen(false);
      setActiveLead(null);
      toastSuccess('Đã xóa lead', `Đã xóa hồ sơ ${activeLead.fullName} khỏi hệ thống`);
      router.refresh();
    } else {
      toastError('Xóa thất bại', 'Vui lòng thử lại');
    }
  };

  // Export CSV — all leads from current filters via server action
  const [isExporting, setIsExporting] = useState(false);
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const allLeads = await getAllLeadsForExport({
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        source: source !== 'all' ? source : undefined,
        grade: grade !== 'all' ? grade : undefined,
      });
      if (!allLeads.length) {
        toastError('Không có dữ liệu', 'Không có lead nào để xuất với bộ lọc hiện tại');
        return;
      }

    const headers = [
      'Mã Lead',
      'Tên Học Sinh',
      'Ngày Sinh',
      'Lớp Đăng Ký',
      'Hệ Đăng Ký',
      'Nguồn',
      'Số Điện Thoại Phụ Huynh',
      'Họ Tên Phụ Huynh',
      'Email Phụ Huynh',
      'Lớp Đang Học Cũ',
      'Trường Đang Học Cũ',
      'Địa Chỉ',
      'Trạng Thái',
      'Mã Định Danh Cá Nhân',
      'Mã BHYT',
      'Mã BGD Cấp',
      'Ghi Chú',
    ];

    const rows = allLeads.map((l: any) => [
      l.leadCode,
      l.fullName,
      l.dateOfBirth ? new Date(l.dateOfBirth).toLocaleDateString('vi-VN') : '',
      l.grade,
      l.enrollmentSystem || '',
      l.source,
      l.phone,
      l.parentName || '',
      l.email || '',
      l.currentClass || '',
      l.currentSchool || '',
      l.address || '',
      statusLabels[l.status as LeadStatus] || l.status,
      l.nationalStudentId || '',
      l.insuranceId || '',
      l.moetStudentId || '',
      l.notes || '',
    ]);

    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
    rows.forEach((row: any[]) => {
      csvContent += row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MIS_CRM_Leads_Tuyensinh_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastSuccess('Xuất CSV thành công', `Đã xuất ${allLeads.length} lead`);
    } catch (err) {
      toastError('Xuất thất bại', 'Vui lòng thử lại');
    } finally {
      setIsExporting(false);
    }
  };

  // Excel / CSV Import function
  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        alert('Tệp CSV trống hoặc không có dữ liệu!');
        return;
      }

      // Simple CSV line parser that handles quotes
      const parseCsvLine = (line: string) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.replace(/^"|"$/g, '').trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.replace(/^"|"$/g, '').trim());
        return result;
      };

      const headers = lines[0].replace(/^\uFEFF/, '').split(',').map(h => h.replace(/^"|"$/g, '').trim());

      let count = 0;
      let successCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.length < 3) continue;

        const rowData: any = {};
        headers.forEach((header, idx) => {
          rowData[header] = values[idx] || '';
        });

        // Map columns dynamically
        const fullNameVal = rowData['Tên Học Sinh'] || rowData['fullName'] || '';
        const phoneVal = rowData['Số Điện Thoại Phụ Huynh'] || rowData['phone'] || '';
        const gradeVal = rowData['Lớp Đăng Ký'] || rowData['grade'] || 'Lớp 10';
        const sourceVal = rowData['Nguồn'] || rowData['source'] || 'Website';
        const parentNameVal = rowData['Họ Tên Phụ Huynh'] || rowData['parentName'] || '';
        const emailVal = rowData['Email Phụ Huynh'] || rowData['email'] || '';
        const notesVal = rowData['Ghi Chú'] || rowData['notes'] || '';

        if (!fullNameVal || !phoneVal) continue;

        count++;
        try {
          const res = await createLead({
            fullName: fullNameVal,
            parentName: parentNameVal,
            phone: phoneVal,
            email: emailVal,
            source: sourceVal,
            grade: gradeVal,
            status: 'received', // default to received
            notes: notesVal,
          });
          if (res.success) {
            successCount++;
          }
        } catch (err) {
          console.error('Error importing row:', err);
        }
      }

      alert(`Đã xử lý: ${count} dòng. Nhập thành công: ${successCount} Leads tuyển sinh mới!`);
      toastSuccess(`Nhập CSV thành công`, `Đã xử lý ${count} dòng, thêm được ${successCount} lead mới`);
      router.refresh();
    };

    reader.readAsText(file, 'utf-8');
  };

  // Filtered data (client-side by assignedUser after server-side filters)
  const displayData = useMemo(() => {
    if (assignedFilter === 'all') return initialData.data;
    return initialData.data.filter(l => l.assignedUserId === assignedFilter);
  }, [initialData.data, assignedFilter]);

  // Table setup
  const columnHelper = createColumnHelper<Lead>();

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <ChevronDownIcon className="h-3 w-3 text-slate-300 ml-1" />;
    return sortOrder === 'asc'
      ? <ChevronUp className="h-3 w-3 text-blue-500 ml-1" />
      : <ChevronDownIcon className="h-3 w-3 text-blue-500 ml-1" />;
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('leadCode', {
        header: () => (
          <button type="button" className="flex items-center font-bold" onClick={() => handleSort('leadCode')}>
            Mã Lead <SortIcon col="leadCode" />
          </button>
        ),
        cell: info => <span className="font-mono text-xs font-bold">{info.getValue()}</span>,
      }),
      columnHelper.accessor('fullName', {
        header: () => (
          <button type="button" className="flex items-center font-bold" onClick={() => handleSort('fullName')}>
            Tên Học Sinh <SortIcon col="fullName" />
          </button>
        ),
        cell: info => <span className="font-bold text-slate-950 dark:text-white">{info.getValue()}</span>,
      }),
      columnHelper.accessor('parentName', {
        header: 'Phụ Huynh',
        cell: info => info.getValue() || <span className="text-slate-400 dark:text-slate-600">-</span>,
      }),
      columnHelper.accessor('phone', {
        header: 'Điện Thoại',
        cell: info => <span className="font-mono text-xs">{info.getValue()}</span>,
      }),
      columnHelper.accessor('grade', {
        header: 'Lớp Đăng Ký',
      }),
      columnHelper.accessor('source', {
        header: 'Nguồn',
      }),
      columnHelper.accessor('status', {
        header: () => (
          <button type="button" className="flex items-center font-bold" onClick={() => handleSort('status')}>
            Trạng Thái <SortIcon col="status" />
          </button>
        ),
        cell: info => {
          const val = info.getValue();
          return (
            <Badge className={cn('border font-bold uppercase tracking-wider text-[10px]', statusBadgeStyles[val])}>
              {statusLabels[val]}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: info => {
          const lead = info.row.original;
          const open = activeMenuId === lead.id;
          return (
            <div className="relative flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={e => {
                  e.stopPropagation();
                  setActiveMenuId(open ? null : lead.id);
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {open && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                  <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                    <Link
                      href={`/${locale}/leads/${lead.id}`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-500" />
                      Chi tiết
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLead(lead);
                        editForm.reset({
                          fullName: lead.fullName,
                          parentName: lead.parentName || '',
                          phone: lead.phone,
                          email: lead.email || '',
                          source: lead.source,
                          grade: lead.grade,
                          status: lead.status,
                          assignedUserId: lead.assignedUserId || '',
                          notes: lead.notes || '',
                        });
                        setEditOpen(true);
                        setActiveMenuId(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                      Chỉnh sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLead(lead);
                        setDeleteOpen(true);
                        setActiveMenuId(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa lead
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        },
      }),
    ],
    [activeMenuId, locale, columnHelper, editForm, sortBy, sortOrder, handleSort],
  );

  const table = useReactTable({
    data: displayData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950 dark:text-white">Danh Sách Lead Tuyển Sinh</h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Quản lý thông tin học sinh đăng ký tư vấn tuyển sinh và quy trình tiếp nhận.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          {/* Export Excel Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCSV}
            disabled={isExporting}
            className="w-full sm:w-auto text-xs font-bold border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:text-slate-200"
          >
            <FileSpreadsheet className="mr-1.5 h-4 w-4 text-emerald-600" />
            {isExporting ? 'Đang xuất...' : 'Xuất Excel (CSV)'}
          </Button>

          {/* Import Excel Button */}
          <label className="w-full sm:w-auto">
            <span className="h-10 px-4 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex items-center justify-center text-xs font-bold gap-1.5 bg-white dark:bg-slate-950">
              <Upload className="h-4 w-4 text-blue-500" />
              Nhập từ Excel (CSV)
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>

          <Button
            onClick={() => setCreateOpen(true)}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm Lead Mới
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-0 bg-white/50 backdrop-blur shadow-sm dark:bg-slate-950/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-500" />
              Lọc Nâng Cao
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="font-bold border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200"
                onClick={() => {
                  setSearch('');
                  setStatus('all');
                  setSource('all');
                  setGrade('all');
                  setAssignedFilter('all');
                  router.push(`/${locale}/leads`);
                }}
              >
                Đặt lại bộ lọc
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm tên, SĐT, mã lead..."
                className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 rounded-xl"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  handleSearchAndFilters({ search: e.target.value, page: 1 });
                }}
              />
            </div>
            {/* Filter Status */}
            <Select
              value={status}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
              onChange={e => {
                setStatus(e.target.value);
                handleSearchAndFilters({ status: e.target.value, page: 1 });
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
            {/* Filter Source */}
            <Select
              value={source}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
              onChange={e => {
                setSource(e.target.value);
                handleSearchAndFilters({ source: e.target.value, page: 1 });
              }}
            >
              <option value="all">Tất cả nguồn</option>
              {leadSources.map(src => (
                <option key={src} value={src}>{src}</option>
              ))}
            </Select>
            {/* Filter Grade */}
            <Select
              value={grade}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
              onChange={e => {
                setGrade(e.target.value);
                handleSearchAndFilters({ grade: e.target.value, page: 1 });
              }}
            >
              <option value="all">Tất cả khối lớp</option>
              {gradeLevels.map(gr => (
                <option key={gr} value={gr}>{gr}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table Container */}
      <Card className="overflow-hidden border-0 shadow-lg rounded-2xl bg-white dark:bg-slate-950 relative">
        {isPending && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <span className="text-sm font-bold text-blue-600">Đang tải dữ liệu...</span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="border-b border-slate-100 dark:border-slate-800">
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider py-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    onClick={() => router.push(`/${locale}/leads/${row.original.id}`)}
                    className="border-b border-slate-50 hover:bg-blue-50/50 dark:border-slate-800/50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="py-4 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-sm font-bold text-slate-500">Không tìm thấy dữ liệu</p>
                      <p className="text-xs mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        {initialData.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Hiển thị trang <span className="text-blue-600 dark:text-blue-400 font-black">{initialData.currentPage}</span> / <span className="text-slate-900 dark:text-white font-bold">{initialData.totalPages}</span> ({initialData.totalItems} kết quả)
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                disabled={initialData.currentPage <= 1 || isPending}
                onClick={() => handlePageChange(initialData.currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={initialData.currentPage >= initialData.totalPages || isPending}
                onClick={() => handlePageChange(initialData.currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Lead Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Thêm Lead Tuyển Sinh Mới"
        description="Điền thông tin học sinh và thông tin liên hệ phụ huynh để đưa vào phễu tư vấn tuyển sinh."
      >
        <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4 font-sans text-slate-900 dark:text-slate-50">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Họ và tên học sinh *</label>
              <Input placeholder="Nguyễn Văn A" {...createForm.register('fullName')} />
              {createForm.formState.errors.fullName && (
                <p className="text-xs text-rose-600 font-bold">{createForm.formState.errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tên phụ huynh</label>
              <Input placeholder="Nguyễn Văn B" {...createForm.register('parentName')} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Số điện thoại phụ huynh *</label>
              <Input placeholder="0912345678" {...createForm.register('phone')} />
              {createForm.formState.errors.phone && (
                <p className="text-xs text-rose-600 font-bold">{createForm.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email liên hệ</label>
              <Input type="email" placeholder="parent@example.com" {...createForm.register('email')} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Lớp đăng ký *</label>
              <Select {...createForm.register('grade')}>
                {gradeLevels.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nguồn tuyển sinh *</label>
              <Select {...createForm.register('source')}>
                {leadSources.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Trạng thái *</label>
              <Select {...createForm.register('status')}>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Chuyên viên phụ trách</label>
              <Select {...createForm.register('assignedUserId')}>
                <option value="">-- Chưa chỉ định --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Ghi chú tuyển sinh</label>
            <Textarea placeholder="Chi tiết nhu cầu tư vấn hoặc lịch sử trao đổi ban đầu..." {...createForm.register('notes')} />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              className="font-bold"
              onClick={() => setCreateOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold min-w-[120px]"
              disabled={createForm.formState.isSubmitting}
            >
              {createForm.formState.isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thông tin'
              )}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Cập Nhật Thông Tin Lead"
        description="Sửa đổi thông tin tuyển sinh của học sinh hoặc trạng thái phễu."
      >
        <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4 font-sans text-slate-900 dark:text-slate-50">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Họ và tên học sinh *</label>
              <Input placeholder="Nguyễn Văn A" {...editForm.register('fullName')} />
              {editForm.formState.errors.fullName && (
                <p className="text-xs text-rose-600 font-bold">{editForm.formState.errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tên phụ huynh</label>
              <Input placeholder="Nguyễn Văn B" {...editForm.register('parentName')} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Số điện thoại phụ huynh *</label>
              <Input placeholder="0912345678" {...editForm.register('phone')} />
              {editForm.formState.errors.phone && (
                <p className="text-xs text-rose-600 font-bold">{editForm.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email liên hệ</label>
              <Input type="email" placeholder="parent@example.com" {...editForm.register('email')} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Lớp đăng ký *</label>
              <Select {...editForm.register('grade')}>
                {gradeLevels.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nguồn tuyển sinh *</label>
              <Select {...editForm.register('source')}>
                {leadSources.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Trạng thái *</label>
              <Select {...editForm.register('status')}>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Chuyên viên phụ trách</label>
              <Select {...editForm.register('assignedUserId')}>
                <option value="">-- Chưa chỉ định --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Ghi chú tuyển sinh</label>
            <Textarea placeholder="Chi tiết nhu cầu tư vấn hoặc lịch sử trao đổi ban đầu..." {...editForm.register('notes')} />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              className="font-bold"
              onClick={() => {
                setEditOpen(false);
                setActiveLead(null);
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold min-w-[120px]"
              disabled={editForm.formState.isSubmitting}
            >
              {editForm.formState.isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Lead Dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xác Nhận Xóa Lead"
        description={`Bạn có chắc chắn muốn xóa hồ sơ tuyển sinh của học sinh "${activeLead?.fullName || ''}"?`}
      >
        <div className="space-y-4 font-sans text-slate-900 dark:text-slate-50">
          <p className="text-sm text-slate-500">
            Hành động này sẽ xóa vĩnh viễn hồ sơ lead này khỏi hệ thống cơ sở dữ liệu và không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              className="font-bold"
              onClick={() => {
                setDeleteOpen(false);
                setActiveLead(null);
              }}
            >
              Hủy
            </Button>
            <Button
              type="button"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold min-w-[100px]"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
