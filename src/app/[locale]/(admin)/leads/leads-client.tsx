'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/src/lib/utils';
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
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent } from '@/src/components/ui/card';
import { Dialog } from '@/src/components/ui/dialog';
import { Textarea } from '@/src/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import {
  createLead,
  updateLead,
  deleteLead,
  type LeadStatus,
} from './actions';

const leadFormSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên học sinh là bắt buộc'),
  parentName: z.string().optional(),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  source: z.string().min(1, 'Nguồn là bắt buộc'),
  grade: z.string().min(1, 'Khối/Lớp đăng ký là bắt buộc'),
  status: z.enum([
    'new',
    'contacted',
    'consultation_scheduled',
    'application_submitted',
    'seat_reserved',
    'payment_confirmed',
    'enrolled',
    'lost',
  ]),
  assignedUserId: z.string().nullable().optional(),
  notes: z.string().optional(),
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
  new: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  contacted: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
  consultation_scheduled: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800',
  application_submitted: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  seat_reserved: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
  payment_confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  enrolled: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',
  lost: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
};

const statusLabels: Record<LeadStatus, string> = {
  new: 'Mới (New)',
  contacted: 'Đã liên hệ (Contacted)',
  consultation_scheduled: 'Lên lịch tư vấn (Consultation)',
  application_submitted: 'Nộp đơn học (Applied)',
  seat_reserved: 'Giữ chỗ (Reserved)',
  payment_confirmed: 'Đóng phí (Paid)',
  enrolled: 'Nhập học (Enrolled)',
  lost: 'Từ chối (Lost)',
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

  // Search/Filters states
  const [search, setSearch] = useState(filters.search);
  const [status, setStatus] = useState(filters.status);
  const [source, setSource] = useState(filters.source);
  const [grade, setGrade] = useState(filters.grade);

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
      status: 'new',
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

  // Mutations
  const onSubmitCreate = async (values: LeadFormValues) => {
    const result = await createLead(values);
    if (result.success) {
      setCreateOpen(false);
      createForm.reset();
      router.refresh();
    }
  };

  const onSubmitEdit = async (values: LeadFormValues) => {
    if (!activeLead) return;
    const result = await updateLead(activeLead.id, values);
    if (result.success) {
      setEditOpen(false);
      setActiveLead(null);
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!activeLead) return;
    const result = await deleteLead(activeLead.id);
    if (result.success) {
      setDeleteOpen(false);
      setActiveLead(null);
      router.refresh();
    }
  };

  // Table setup
  const columnHelper = createColumnHelper<Lead>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('leadCode', {
        header: 'Mã Lead',
        cell: info => <span className="font-mono text-xs font-bold">{info.getValue()}</span>,
      }),
      columnHelper.accessor('fullName', {
        header: 'Tên Học Sinh',
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
        header: 'Trạng Thái',
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
    [activeMenuId, locale, columnHelper, editForm],
  );

  const table = useReactTable({
    data: initialData.data,
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
        <Button
          onClick={() => setCreateOpen(true)}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm Lead Mới
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm tên, SĐT, mã..."
                className="pl-9"
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
              onChange={e => {
                setStatus(e.target.value);
                handleSearchAndFilters({ status: e.target.value, page: 1 });
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
            {/* Filter Source */}
            <Select
              value={source}
              onChange={e => {
                setSource(e.target.value);
                handleSearchAndFilters({ source: e.target.value, page: 1 });
              }}
            >
              <option value="all">Tất cả nguồn</option>
              {leadSources.map(src => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </Select>
            {/* Filter Grade */}
            <Select
              value={grade}
              onChange={e => {
                setGrade(e.target.value);
                handleSearchAndFilters({ grade: e.target.value, page: 1 });
              }}
            >
              <option value="all">Tất cả khối lớp</option>
              {gradeLevels.map(gr => (
                <option key={gr} value={gr}>
                  {gr}
                </option>
              ))}
            </Select>
            {/* Reset Filters */}
            <Button
              variant="outline"
              className="font-bold border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200"
              onClick={() => {
                setSearch('');
                setStatus('all');
                setSource('all');
                setGrade('all');
                router.push(`/${locale}/leads`);
              }}
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Container */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="border-b border-slate-100 dark:border-slate-800">
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className="text-xs font-bold text-slate-600 dark:text-slate-400">
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
                    className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-900/30"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="py-3.5 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-sm font-semibold text-slate-400">
                    Không có lead phù hợp với bộ lọc tuyển sinh.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        {initialData.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Hiển thị trang <span className="text-slate-900 dark:text-white font-bold">{initialData.currentPage}</span> trên tổng số <span className="text-slate-900 dark:text-white font-bold">{initialData.totalPages}</span> trang ({initialData.totalItems} kết quả)
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
              {createForm.formState.errors.email && (
                <p className="text-xs text-rose-600 font-bold">{createForm.formState.errors.email.message}</p>
              )}
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              disabled={createForm.formState.isSubmitting}
            >
              Lưu thông tin
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
              {editForm.formState.errors.email && (
                <p className="text-xs text-rose-600 font-bold">{editForm.formState.errors.email.message}</p>
              )}
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              disabled={editForm.formState.isSubmitting}
            >
              Lưu thay đổi
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
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              onClick={handleDelete}
            >
              Xác nhận xóa
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
