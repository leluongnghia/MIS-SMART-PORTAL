'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  FileSpreadsheet, 
  Printer, 
  TrendingUp, 
  Calculator, 
  Award, 
  Download
} from 'lucide-react';
import { UserProfile } from '../../types';
import { exportToCsv } from '../../utils/exportUtils';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

interface Invoice {
  id: string;
  studentId?: string;
  studentCode?: string;
  student: string;
  amount: string;
  deadline: string;
  status: string;
  invoiceNo: string;
  paidDate?: string;
}

interface TeacherPayroll {
  id: string;
  name: string;
  basePay: number;
  teachingHours: number;
  overtimeHours: number;
  substitutionHours: number;
}

interface CertStudent {
  id: string;
  name: string;
  courseName: string;
  grade: string;
  status: string;
  certCode: string;
}

interface LmsFinancialsProps {
  currentUser: UserProfile;
  t: any;
  isFinanceAuthorized: boolean;
  lmsStudents: any[];
  tuitionFees: any[];
  setTuitionFees: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function LmsFinancials({
  currentUser,
  t,
  isFinanceAuthorized,
  lmsStudents,
  tuitionFees,
  setTuitionFees,
}: LmsFinancialsProps) {

  const [showAddInvoiceForm, setShowAddInvoiceForm] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState({
    studentId: '',
    studentName: '',
    studentCode: '',
    student: '',
    amount: '12,500,000đ',
    deadline: '2026-06-20',
    status: 'CHO_DONG'
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Personnel Payroll states
  const [baseSalaryRate, setBaseSalaryRate] = useState<number>(300000); // 300k VND per hour
  const [teachersPayroll, setTeachersPayroll] = useState<TeacherPayroll[]>([
    { id: 'T001', name: 'Cô Thanh Nhàn', basePay: 12000000, teachingHours: 42, overtimeHours: 8, substitutionHours: 4 },
    { id: 'T002', name: 'Thầy Đức Nam', basePay: 15000000, teachingHours: 50, overtimeHours: 12, substitutionHours: 6 },
    { id: 'T003', name: 'Thầy Quốc Đạt', basePay: 11000000, teachingHours: 38, overtimeHours: 5, substitutionHours: 2 }
  ]);

  // Certificate Issuance list (Persistent)
  const [certStudents, setCertStudents] = useState<CertStudent[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('mis_lms_cert_students') : null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'C101', name: 'Trần Mỹ Lệ', courseName: 'Chuyên đề Kịch nghệ Văn học 11', grade: '9.2', status: 'ISSUED', certCode: 'MIS-CERT-11204' },
      { id: 'C102', name: 'Hoàng Thùy Dương', courseName: 'Học phần Lập luận Logic toán 10', grade: '8.8', status: 'PENDING', certCode: '' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mis_lms_cert_students', JSON.stringify(certStudents));
  }, [certStudents]);

  const [activeCert, setActiveCert] = useState<CertStudent | null>(null);

  const downloadCertificate = (cert: CertStudent) => {
    const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${cert.certCode || 'MIS-CERT'} - ${cert.name}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; padding: 48px; color: #1f2937; }
    .cert { border: 10px solid #78350f; border-radius: 24px; padding: 48px; text-align: center; }
    .eyebrow { letter-spacing: 0.2em; font-size: 12px; color: #92400e; font-weight: 800; text-transform: uppercase; }
    h1 { margin: 20px 0 8px; font-size: 34px; color: #451a03; }
    h2 { margin: 0 0 24px; font-size: 24px; }
    p { font-size: 16px; line-height: 1.7; }
    .footer { display: flex; justify-content: space-between; gap: 24px; margin-top: 42px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="eyebrow">Giấy chứng nhận Đa Trí Tuệ MIS</div>
    <h1>${cert.name}</h1>
    <h2>${cert.courseName}</h2>
    <p>Đã hoàn thành xuất sắc học phần chuyên sâu, đạt điểm khóa ${cert.grade}/10 và được hệ thống MIS LMS xác thực.</p>
    <div class="footer">
      <div>Số chứng nhận: <strong>${cert.certCode || 'Đang cập nhật'}</strong></div>
      <div><strong>Chủ tịch Hội đồng MIS Hà Nội</strong><br/>[Đã đóng dấu điện tử]</div>
    </div>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cert.certCode || cert.id || 'MIS-CERT'}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const printSelectedInvoice = () => {
    window.print();
  };

  const handleExportInvoicesCsv = () => {
    const headers = ['Ma hoa don', 'Hoc vien', 'Dinh muc hoc phi', 'Han thanh toan', 'Trang thai', 'Ngay thanh toan'];
    const rows = tuitionFees.map(t => [
      t.invoiceNo,
      t.student,
      t.amount,
      t.deadline,
      t.status === 'DA_DONG' ? 'Da dong' : t.status === 'CHO_DONG' ? 'Cho dong' : 'Qua han',
      t.paidDate || 'Chua dong'
    ]);
    exportToCsv('MIS_Financial_Invoices.csv', headers, rows);
  };

  if (!isFinanceAuthorized) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Tuition Tracking Table */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Student Tuitions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <DollarSign className="text-emerald-600 w-4.5 h-4.5 animate-pulse" />
                  {t.tuition}
                </h3>
                <p className="text-[10.5px] text-slate-500">Mã hóa hóa đơn tài chính tự động cho từng đối tượng học viên liên cấp.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportInvoicesCsv}
                  className="px-2.5 py-1 text-[10.5px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg shadow-3xs transition-all cursor-pointer flex items-center gap-1.5 no-print"
                  title="Xuất danh sách hóa đơn ra Excel/CSV"
                  type="button"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất Excel</span>
                </button>

                <button
                  onClick={() => setShowAddInvoiceForm(!showAddInvoiceForm)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-750 text-white text-[10.5px] font-bold rounded-lg flex items-center gap-1 shadow-3xs cursor-pointer no-print"
                  type="button"
                >
                  <span>➕ {showAddInvoiceForm ? "Đóng ẩn" : "Lập Hóa Đơn"}</span>
                </button>
              </div>
            </div>

            {/* Add Invoice Form */}
            {showAddInvoiceForm && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newInvoiceData.studentId || !newInvoiceData.amount) return;
                  const nextId = tuitionFees.length + 1;
                  const newInv: Invoice = {
                    id: `HV00${nextId}`,
                    studentId: newInvoiceData.studentId,
                    studentCode: newInvoiceData.studentCode,
                    student: newInvoiceData.studentName,
                    amount: newInvoiceData.amount,
                    deadline: newInvoiceData.deadline,
                    status: newInvoiceData.status,
                    invoiceNo: `INV-2026-00${nextId}`,
                    paidDate: newInvoiceData.status === 'DA_DONG' ? new Date().toISOString().substring(0, 10) : undefined
                  };
                  setTuitionFees([...tuitionFees, newInv]);
                  setNewInvoiceData({
                    studentId: '',
                    studentName: '',
                    studentCode: '',
                    student: '',
                    amount: '12,500,000đ',
                    deadline: '2026-06-20',
                    status: 'CHO_DONG'
                  });
                  setShowAddInvoiceForm(false);
                }}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 space-y-3 font-sans"
              >
                <h4 className="text-xs font-bold text-slate-850">Lập phiếu yêu cầu học phí mới</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 block">Chọn học sinh thụ hưởng</label>
                    <select
                      value={newInvoiceData.studentId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const matched = lmsStudents.find(s => s.id === selectedId);
                        if (matched) {
                          setNewInvoiceData({
                            ...newInvoiceData,
                            studentId: selectedId,
                            studentName: matched.name,
                            studentCode: matched.code || '',
                            student: matched.name
                          });
                        } else {
                          setNewInvoiceData({
                            ...newInvoiceData,
                            studentId: '',
                            studentName: '',
                            studentCode: '',
                            student: ''
                          });
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-850 font-medium cursor-pointer"
                      required
                    >
                      <option value="">-- Chọn học sinh --</option>
                      {lmsStudents.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} - {s.code || s.id} ({s.className || 'Không lớp'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-450 block font-sans">Định mức thu</label>
                      <input
                        type="text"
                        value={newInvoiceData.amount}
                        onChange={(e) => setNewInvoiceData({...newInvoiceData, amount: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-850 font-semibold"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-450 block">Hạn nộp</label>
                      <input
                        type="date"
                        value={newInvoiceData.deadline}
                        onChange={(e) => setNewInvoiceData({...newInvoiceData, deadline: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-850"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold text-slate-500">Trạng thái phiếu:</span>
                    <select
                      value={newInvoiceData.status}
                      onChange={(e) => setNewInvoiceData({...newInvoiceData, status: e.target.value})}
                      className="bg-white border rounded text-xs px-2 py-0.5"
                    >
                      <option value="CHO_DONG">Chưa thu (CHO_DONG)</option>
                      <option value="DA_DONG">Đã đóng (DA_DONG)</option>
                      <option value="QUA_HAN">Quá hạn (QUA_HAN)</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddInvoiceForm(false)}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Huỷ bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-xs font-bold cursor-pointer shadow-3xs"
                    >
                      Lập phiếu học phí
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-150">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="px-4 py-2.5">Học viên</th>
                    <th className="px-4 py-2.5">Số hóa đơn</th>
                    <th className="px-4 py-2.5">Định mức học phí</th>
                    <th className="px-4 py-2.5">Hạn thanh toán</th>
                    <th className="px-4 py-2.5">Trạng thái</th>
                    <th className="px-4 py-2.5 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tuitionFees.map(item => {
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-800">👤 {item.student}</td>
                        <td className="px-4 py-3 font-mono text-slate-600 font-medium">{item.invoiceNo}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{item.amount}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{item.deadline}</td>
                        <td className="px-4 py-3">
                          <select
                            value={item.status}
                            onChange={(e) => {
                              const nextStatus = e.target.value;
                              setTuitionFees(prev => prev.map(t => t.id === item.id ? { ...t, status: nextStatus } : t));
                            }}
                            className={`text-[10.5px] px-1.5 py-0.5 rounded font-bold uppercase cursor-pointer border ${
                              item.status === 'DA_DONG' ? 'bg-emerald-100 text-emerald-800 border-emerald-305'
                                : item.status === 'CHO_DONG' ? 'bg-amber-100 text-amber-850 border-amber-305'
                                : 'bg-rose-100 text-rose-800 border-rose-305'
                            }`}
                          >
                            <option value="CHO_DONG">Chưa thu</option>
                            <option value="DA_DONG">Đã nộp</option>
                            <option value="QUA_HAN">Quá hạn</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700 font-sans">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(item)}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-700 rounded text-[10px] text-slate-650 font-bold transition-all cursor-pointer"
                          >
                            In Phiếu
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Visual printed invoice mock modal preview */}
            {selectedInvoice && (
              <div className="bg-slate-50 border-2 border-dashed border-emerald-500/30 p-5 rounded-xl space-y-4 animate-scale-up relative">
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 font-bold text-xs p-1"
                >
                  ✕ Đóng
                </button>

                <div className="text-center font-sans">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">HÓA ĐƠN THU TIỀN HỌC PHÍ MẪU</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Mã kiểm duyệt: {selectedInvoice.invoiceNo}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] border-t border-b border-slate-200 py-3 font-sans">
                  <div>
                    <span className="text-slate-400">Đơn vị nhận tiền:</span>
                    <strong className="block text-slate-800">Trường phổ thông liên cấp MIS</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Học sinh thụ hưởng:</span>
                    <strong className="block text-slate-800">{selectedInvoice.student}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Loại khoản thu:</span>
                    <strong className="block text-slate-800">Học bổng & Học phí học kỳ II</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Số tiền:</span>
                    <strong className="block text-emerald-700 font-bold">{selectedInvoice.amount}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-450">✓ Hệ thống hóa đơn điện tử tự động kết nối chi cục thuế.</span>
                  <button 
                    onClick={printSelectedInvoice}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3 h-3" />
                    Gửi Đi & In Ấn
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Regional revenue reports overview KPI ratings */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
                <TrendingUp className="text-emerald-600 w-4.5 h-4.5" />
                Doanh thu & Đánh giá thành tích các chi nhánh tuyển sinh
              </h3>
              <p className="text-[10px] text-slate-500">Giúp chủ quản phân tích hiệu năng đóng góp thực của các tổ, ban trực thuộc.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
              <div className="p-3 bg-slate-50 border rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Tổng Doanh Thu Quý II</span>
                <strong className="text-base text-emerald-700 font-bold block mt-1">1.82 tỷ VND</strong>
                <span className="text-[9.5px] text-slate-450 block mt-0.5">Mục tiêu: 2.00 tỷ VNĐ (91%)</span>
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Xếp hạng Chi nhánh MIS</span>
                <strong className="text-sm text-indigo-700 font-bold block mt-1">🥇 Tổ Toán - Tin (Đầu bảng)</strong>
                <span className="text-[9.5px] text-slate-450 block mt-0.5">Học phí thu khớp: 840 triệu</span>
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Chi phí chuyên môn</span>
                <strong className="text-base text-slate-700 font-bold block mt-1">456 triệu VND</strong>
                <span className="text-[9.5px] text-slate-450 block mt-0.5">Bao gồm lương bổ sung & Zoom</span>
              </div>
            </div>
          </div>

        </div>

        {/* Personnel payroll calculation & certificates on right */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Automated HR Payroll calculation */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Calculator className="text-emerald-600 w-4.1 h-4.1" />
                {t.personnel}
              </h3>
              <p className="text-[10px] text-slate-500">Thuế thu nhập, bảo hiểm xã hội tính tự động tích hợp từ biểu giảng viên.</p>
            </div>

            {/* Interactive salary slider tweak */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-slate-700 uppercase">Đơn giá/giờ dạy:</span>
                <strong className="font-mono text-emerald-700">{(baseSalaryRate).toLocaleString()} VNĐ/Giờ</strong>
              </div>
              <input 
                type="range"
                min={150000}
                max={600000}
                step={50000}
                value={baseSalaryRate}
                onChange={(e) => setBaseSalaryRate(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              {teachersPayroll.map(teacher => {
                // Wage math: Base pay + hours*rate + substitute_hours*rate*1.2
                const calculatedBonus = (teacher.teachingHours * baseSalaryRate) + (teacher.substitutionHours * baseSalaryRate * 1.2);
                const grossSalary = teacher.basePay + calculatedBonus;
                
                // Ins / tax deduction math
                const insuranceDeduction = grossSalary * 0.105; // 10.5% BHXH, BHYT
                const calculatedTax = Math.max(0, (grossSalary - 11000000) * 0.05); // Simplify PIT 5% above 11m
                const netSalary = grossSalary - insuranceDeduction - calculatedTax;

                return (
                  <div key={teacher.id} className="p-3 border border-slate-150 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <strong className="text-xs text-slate-800 block">👤 {teacher.name}</strong>
                      <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-800 px-1.5 py-0.5 rounded">
                        Thực nhận: {Math.round(netSalary / 1000).toLocaleString()}k
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 leading-snug">
                      <div>Lương cứng: <span className="font-semibold text-slate-700">{(teacher.basePay/1000).toLocaleString()}k</span></div>
                      <div>Giờ giảng bù: <span className="font-semibold text-indigo-700">+{Math.round(calculatedBonus/1000).toLocaleString()}k</span></div>
                      <div>Dành cho thuế: <span className="font-semibold text-rose-500">-{Math.round(calculatedTax/1000).toLocaleString()}k</span></div>
                      <div>Đóng bảo hiểm: <span className="font-semibold text-indigo-900">-{Math.round(insuranceDeduction/1000).toLocaleString()}k</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graduation Certificate Granting */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Award className="text-emerald-600 w-4.5 h-4.5" />
                {t.certs}
              </h3>
              <p className="text-[10px] text-slate-500">Cấp pháp chứng chỉ liên cấp sau khi học sinh xuất sắc vượt kỳ khảo thí trắc nghiệm tự động.</p>
            </div>

            <div className="space-y-2.5">
              {certStudents.map(c => {
                const isPending = c.status === 'PENDING';

                return (
                  <div key={c.id} className="p-3 bg-slate-50/80 border border-slate-150 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-slate-800 font-semibold">{c.name}</strong>
                        <span className="text-[10px] text-slate-500 block truncate mt-0.5 max-w-[150px]">{c.courseName}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded ${
                        isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isPending ? 'Đang duyệt' : 'Đã Cấp'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
                      <span className="text-[10px] text-slate-450 font-mono">Điểm khóa: {c.grade}/10</span>
                      {isPending ? (
                        <button
                          onClick={() => {
                            const code = `MIS-CERT-${Math.floor(10000 + Math.random() * 90000)}`;
                            setCertStudents(prev => prev.map(item => item.id === c.id ? { ...item, status: 'ISSUED', certCode: code } : item));
                          }}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-750 text-white rounded text-[9.5px] font-bold transition-all cursor-pointer"
                        >
                          Phê duyệt Cấp
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveCert(c)}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-[9.5px] font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          Xem Bằng
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Certificate high-fidelity layout display box */}
            {activeCert && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
                <div className="bg-white border-8 border-amber-900 rounded-3xl p-6 md:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative">
                  <button 
                    onClick={() => setActiveCert(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
                  >
                    ✕ Đóng
                  </button>

                  <div className="border border-amber-100/30 p-4 space-y-4">
                    <span className="text-[10px] text-amber-900 font-extrabold uppercase tracking-widest block">GIẤY CHỨNG NHẬN ĐA TRÍ TUỆ</span>
                    
                    <div className="py-2">
                      <h4 className="text-slate-500 font-normal italic text-xs">Chứng nhận học viên:</h4>
                      <h2 className="text-xl font-display font-black text-amber-950 mt-1">{activeCert.name}</h2>
                    </div>

                    <div className="text-xs leading-relaxed text-slate-755 font-serif px-4">
                      Đã hoàn thành xuất sắc học phần chuyên sâu <strong className="text-slate-800 block mt-1">"{activeCert.courseName}"</strong>
                      Đạt xếp loại vượt bậc trong kỳ thi kết thúc học trình liên cấp của MIS.
                    </div>

                    <div className="flex justify-between items-center text-[9.5px] border-t border-amber-950/10 pt-4 font-sans text-slate-450">
                      <div>
                        <span>Được chứng thực từ MIS LMS</span>
                        <span className="block font-mono font-bold mt-0.5">Số: {activeCert.certCode}</span>
                      </div>
                      <div className="text-center font-bold text-amber-900">
                        <span>CHỦ TỊCH HỘI ĐỒNG MIS HÀ NỘI</span>
                        <span className="block italic font-serif text-slate-600 mt-2">[Đã đóng dấu điện tử]</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => downloadCertificate(activeCert)}
                    className="w-full py-2 bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Tải Bằng Tốt Nghiệp PDF
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
