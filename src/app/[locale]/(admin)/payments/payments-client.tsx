'use client';

import { useState, useTransition, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/src/lib/utils';
import { generateVietQRPayment } from '@/src/lib/vietqr';
import { useToast } from '@/src/components/ui/Toast';
import { confirmPayment, createPayment, getPayments } from './actions';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Copy,
  Check,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Dialog } from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';

interface Payment {
  id: string;
  leadId: string;
  studentId: string | null;
  type: 'seat_reservation' | 'tuition' | 'admission_fee';
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  transferContent: string;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Lead {
  id: string;
  leadCode: string;
  fullName: string;
  status: string;
}

interface JoinedPayment {
  payment: Payment;
  lead: {
    id: string;
    leadCode: string;
    fullName: string;
  };
}

interface PaymentsClientProps {
  locale: string;
  initialPayments: JoinedPayment[];
  leads: Lead[];
}

const paymentFormSchema = z.object({
  leadId: z.string().min(1, 'Vui lòng chọn học sinh/candidate'),
  type: z.enum(['seat_reservation', 'tuition', 'admission_fee']),
  amount: z.number().min(1000, 'Số tiền tối thiểu là 1,000 VND'),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

const statusBadgeStyles: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-amber-300 dark:border-amber-800',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
  failed: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800',
  cancelled: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
  cancelled: 'Đã hủy',
};

const typeLabels: Record<string, string> = {
  seat_reservation: 'Giữ chỗ (Seat Reservation)',
  tuition: 'Học phí (Tuition)',
  admission_fee: 'Lệ phí tuyển sinh (Admission Fee)',
};

export default function PaymentsClient({
  locale,
  initialPayments,
  leads,
}: PaymentsClientProps) {
  const [payments, setPayments] = useState<JoinedPayment[]>(initialPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<JoinedPayment | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmPaymentId, setConfirmPaymentId] = useState<string | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  // React Hook Form for Create Payment
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      leadId: '',
      type: 'seat_reservation',
      amount: 1000000,
    },
  });

  const selectedType = watch('type');

  // Auto-fill typical amounts based on payment type
  useMemo(() => {
    if (selectedType === 'seat_reservation') {
      setValue('amount', 5000000); // 5,000,000 VND standard seat reservation fee
    } else if (selectedType === 'admission_fee') {
      setValue('amount', 2000000); // 2,000,000 VND admission fee
    } else if (selectedType === 'tuition') {
      setValue('amount', 35000000); // 35,000,000 VND standard tuition
    }
  }, [selectedType, setValue]);

  // Sync payments when prop updates
  useMemo(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch =
        p.lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lead.leadCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.payment.transferContent.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || p.payment.status === statusFilter;
      const matchesType = typeFilter === 'all' || p.payment.type === typeFilter;

      let matchesDate = true;
      const createdAt = new Date(p.payment.createdAt);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && createdAt >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && createdAt <= end;
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [payments, searchTerm, statusFilter, typeFilter, startDate, endDate]);

  const handleCreatePayment = async (data: PaymentFormValues) => {
    startTransition(async () => {
      try {
        const res = await createPayment(data);
        if (res.success) {
          setIsCreateOpen(false);
          reset();
          toastSuccess('Tạo hóa đơn thành công', 'Hóa đơn mới đã được tạo và QR đã sẵn sàng');
          const latestList = await getPayments();
          setPayments(latestList as any);
        } else {
          toastError('Tạo hóa đơn thất bại', 'Vui lòng kiểm tra lại thông tin');
        }
      } catch (error) {
        toastError('Lỗi hệ thống', 'Không thể tạo hóa đơn, vui lòng thử lại');
      }
    });
  };

  const handleConfirmPayment = async (paymentId: string) => {
    startTransition(async () => {
      try {
        const res = await confirmPayment(paymentId);
        if (res.success) {
          setIsDetailOpen(false);
          setSelectedPayment(null);
          setIsConfirmOpen(false);
          setConfirmPaymentId(null);
          toastSuccess('Xác nhận thành công', 'Trạng thái thanh toán đã được cập nhật');
          const latestList = await getPayments();
          setPayments(latestList as any);
        } else {
          toastError('Xác nhận thất bại', 'Vui lòng thử lại');
        }
      } catch (error) {
        toastError('Lỗi hệ thống', 'Không thể xác nhận thanh toán');
      }
    });
  };

  const handleExportPaymentsCSV = () => {
    if (!filteredPayments.length) {
      toastError('Không có dữ liệu', 'Không có giao dịch nào để xuất');
      return;
    }
    const headers = ['Học Sinh', 'Mã Hồ Sơ', 'Loại Phí', 'Số Tiền (VND)', 'Nội Dung CK', 'Trạng Thái', 'Ngày Tạo', 'Đã Thanh Toán'];
    const rows = filteredPayments.map(row => [
      row.lead.fullName,
      row.lead.leadCode,
      typeLabels[row.payment.type] || row.payment.type,
      row.payment.amount,
      row.payment.transferContent,
      statusLabels[row.payment.status],
      new Date(row.payment.createdAt).toLocaleDateString('vi-VN'),
      row.payment.paidAt ? new Date(row.payment.paidAt).toLocaleDateString('vi-VN') : '',
    ]);
    let csv = '\uFEFF';
    csv += headers.map(h => `"${h}"`).join(',') + '\n';
    rows.forEach(row => { csv += row.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',') + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MIS_Payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastSuccess('Xuất thành công', `Đã xuất ${filteredPayments.length} giao dịch`);
  };

  // VietQR Config defaults
  const bankConfig = {
    bankCode: 'MB', // MBBank
    accountNumber: '190367899999',
    accountName: 'TRUONG LIEN CAP MIS',
  };

  const selectedPaymentQR = useMemo(() => {
    if (!selectedPayment) return '';
    return generateVietQRPayment({
      bankCode: bankConfig.bankCode,
      accountNumber: bankConfig.accountNumber,
      accountName: bankConfig.accountName,
      amount: selectedPayment.payment.amount,
      transferContent: selectedPayment.payment.transferContent,
    });
  }, [selectedPayment]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            Quản Lý Học Phí & Thanh Toán
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Xem danh sách các khoản phí, hóa đơn giữ chỗ, học phí và xuất mã thanh toán VietQR.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportPaymentsCSV}
            className="hidden sm:flex gap-2"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Xuất CSV
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto shadow-md">
            <Plus className="mr-2 h-4 w-4" /> Tạo hóa đơn thu phí
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      <Card className="border-slate-100 dark:border-slate-900 bg-white/50 dark:bg-slate-950/20 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div className="relative col-span-1 sm:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <Input
                placeholder="Tìm theo mã tuyển sinh, tên học sinh, nội dung chuyển khoản..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 bg-white dark:bg-slate-950"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ thanh toán</option>
                <option value="paid">Đã thanh toán</option>
                <option value="failed">Thất bại</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tất cả loại phí</option>
                <option value="seat_reservation">Giữ chỗ (Seat Reservation)</option>
                <option value="tuition">Học phí (Tuition)</option>
                <option value="admission_fee">Lệ phí tuyển sinh</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 dark:border-slate-900 pt-3">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Lọc theo ngày tạo:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none"
              />
              <span className="text-slate-400 text-xs font-bold">đến</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none"
              />
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="h-8 text-xs font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
                >
                  Xóa lọc ngày
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List Table */}
      <Card className="border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-150 bg-slate-50/75 dark:border-slate-900 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 font-semibold text-[13px]">
                <th className="p-4">Học sinh</th>
                <th className="p-4">Mã hồ sơ</th>
                <th className="p-4">Khoản thu</th>
                <th className="p-4">Số tiền (VND)</th>
                <th className="p-4">Nội dung CK</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Không tìm thấy dữ liệu thanh toán phù hợp.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(row => (
                  <tr
                    key={row.payment.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                      {row.lead.fullName}
                    </td>
                    <td className="p-4">
                      <Badge className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-350">
                        {row.lead.leadCode}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-450">
                      {typeLabels[row.payment.type] || row.payment.type}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                      {row.payment.amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-4 font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      {row.payment.transferContent}
                    </td>
                    <td className="p-4 text-center">
                      <Badge
                        className={cn(
                          'text-[10px] uppercase font-black tracking-wide border px-2 py-0.5',
                          statusBadgeStyles[row.payment.status]
                        )}
                      >
                        {statusLabels[row.payment.status]}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500 dark:text-slate-450">
                      {new Date(row.payment.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(row);
                          setIsDetailOpen(true);
                        }}
                        className="h-8 gap-1 text-xs px-2.5 border-slate-200 dark:border-slate-800"
                      >
                        <Eye className="h-3.5 w-3.5" /> Chi tiết & QR
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Payment Dialog */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Tạo yêu cầu thanh toán"
        description="Chọn học sinh và loại khoản thu để xuất hóa đơn và mã chuyển khoản VietQR."
        className="max-w-md"
      >
        <form onSubmit={handleSubmit(handleCreatePayment)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Chọn học sinh/hồ sơ tuyển sinh
            </label>
            <select
              {...register('leadId')}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Chọn hồ sơ --</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.leadCode} - {lead.fullName} ({lead.status})
                </option>
              ))}
            </select>
            {errors.leadId && (
              <span className="text-xs text-rose-500 font-bold">{errors.leadId.message}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Loại khoản thu
            </label>
            <select
              {...register('type')}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="seat_reservation">Giữ chỗ (Seat Reservation)</option>
              <option value="tuition">Học phí (Tuition Fee)</option>
              <option value="admission_fee">Lệ phí tuyển sinh (Admission Fee)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Số tiền thu (VND)
            </label>
            <Input
              type="number"
              placeholder="VD: 5000000"
              className="bg-white dark:bg-slate-950"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <span className="text-xs text-rose-500 font-bold">{errors.amount.message}</span>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                reset();
              }}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Đang tạo...' : 'Tạo hóa đơn'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Payment Detail and VietQR Dialog */}
      <Dialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        title="Thông tin thanh toán & mã VietQR"
        className="max-w-2xl"
      >
        {selectedPayment && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column: QR and transfer instruction */}
            <div className="flex flex-col items-center justify-center p-4 border border-slate-100 dark:border-slate-900 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-center">
              <div className="bg-white p-3 rounded-lg shadow-sm mb-3">
                {/* Embedded VietQR placeholder image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPaymentQR}
                  alt="VietQR Payment Code"
                  className="w-56 h-56 object-contain"
                />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                MÃ VIETQR CHUYỂN KHOẢN TỰ ĐỘNG
              </p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[220px]">
                Quét mã này bằng ứng dụng ngân hàng di động để tự động điền số tiền & nội dung chuyển khoản.
              </p>
            </div>

            {/* Right Column: Text details and actions */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Thông tin học sinh
                </h3>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {selectedPayment.lead.fullName}
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  Mã hồ sơ: {selectedPayment.lead.leadCode}
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-100 dark:border-slate-900 pt-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Chi tiết thanh toán
                </h3>
                
                {/* Bank account details */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100 dark:border-slate-900">
                    <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                    <span className="font-bold">MBBank ({bankConfig.bankCode})</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100 dark:border-slate-900">
                    <span className="text-slate-500">Số tài khoản:</span>
                    <span className="font-mono font-bold flex items-center gap-1.5">
                      {bankConfig.accountNumber}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(bankConfig.accountNumber, 'acc')}
                        className="h-5 w-5 hover:bg-slate-100 dark:hover:bg-slate-900"
                        title="Sao chép"
                      >
                        {copiedField === 'acc' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                      </Button>
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100 dark:border-slate-900">
                    <span className="text-slate-500">Tên tài khoản:</span>
                    <span className="font-semibold uppercase">{bankConfig.accountName}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100 dark:border-slate-900">
                    <span className="text-slate-500">Số tiền chuyển:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {selectedPayment.payment.amount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100 dark:border-slate-900">
                    <span className="text-slate-500">Nội dung chuyển khoản:</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      {selectedPayment.payment.transferContent}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(selectedPayment.payment.transferContent, 'content')}
                        className="h-5 w-5 hover:bg-slate-100 dark:hover:bg-slate-900"
                        title="Sao chép"
                      >
                        {copiedField === 'content' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                      </Button>
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Trạng thái:</span>
                    <Badge
                      className={cn(
                        'text-[9px] uppercase font-black border px-2 py-0',
                        statusBadgeStyles[selectedPayment.payment.status]
                      )}
                    >
                      {statusLabels[selectedPayment.payment.status]}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Confirm Actions */}
              <div className="border-t border-slate-100 dark:border-slate-900 pt-4 mt-2 flex flex-col gap-2">
                {selectedPayment.payment.status === 'pending' ? (
                  <>
                    <Button
                      onClick={() => {
                        setConfirmPaymentId(selectedPayment.payment.id);
                        setIsConfirmOpen(true);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
                      disabled={isPending}
                    >
                      Xác nhận Đã Nhận Tiền (Manual Confirm)
                    </Button>
                    {/* Confirm Dialog */}
                    {isConfirmOpen && confirmPaymentId && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
                        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 p-6 space-y-4">
                          <h3 className="font-black text-slate-900 dark:text-white text-base">Xác nhận thanh toán</h3>
                          <p className="text-sm text-slate-500">Bạn có chắc chắn đã nhận được tiền chuyển khoản cho hóa đơn này? Thao tác này không thể hoàn tác.</p>
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => { setIsConfirmOpen(false); setConfirmPaymentId(null); }} disabled={isPending}>
                              Hủy
                            </Button>
                            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleConfirmPayment(confirmPaymentId)} disabled={isPending}>
                              {isPending ? 'Đang xử lý...' : 'Xác nhận'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-100 dark:border-emerald-900">
                    <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                    Hóa đơn này đã được thanh toán đầy đủ
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                  className="w-full border-slate-200 dark:border-slate-800"
                  disabled={isPending}
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
