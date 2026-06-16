"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserAction, updateUserWorkInfo, changeUserRole, changeUserDepartment, checkEmployeeCode } from "../../actions";
import {
  ChevronLeft, Save, AlertTriangle, CheckCircle, XCircle,
  User, Mail, Phone, Building2, Shield, Briefcase,
  BookOpen, Users, FileText, Star, Calendar
} from "lucide-react";

type User = {
  id: string;
  name: string;
  role: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  departmentId: string | null;
  employeeCode: string | null;
  staffType: string | null;
  joinedAt: Date | null;
  managerId: string | null;
  teachingLevel: string | null;
  subject: string | null;
  homeroomClassId: string | null;
  internalNote: string | null;
  status: string;
};

type Department = { id: string; name: string; code: string };
type UserSelect = { id: string; name: string; role: string };
type Actor = { id: string; role: string; departmentId: string | null };

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold ${
      type === "success"
        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-700"
        : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 text-rose-700"
    }`}>
      {type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      {message}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200";
const disabledCls = "w-full px-3 py-2.5 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-900 text-sm text-slate-400 cursor-not-allowed";

export default function UserEditClient({
  locale,
  user,
  departments,
  usersForSelect,
  actor,
}: {
  locale: string;
  user: User;
  departments: Department[];
  usersForSelect: UserSelect[];
  actor: Actor;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const isAdmin = actor.role === "ADMIN";

  // Basic info fields
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [title, setTitle] = useState(user.title || "");
  const [status, setStatus] = useState(user.status);
  const [employeeCode, setEmployeeCode] = useState(user.employeeCode || "");
  const [role, setRole] = useState(user.role);
  const [departmentId, setDepartmentId] = useState(user.departmentId || "");
  const [formError, setFormError] = useState("");

  // Work info fields
  const [staffType, setStaffType] = useState(user.staffType || "");
  const [joinedAt, setJoinedAt] = useState(user.joinedAt ? new Date(user.joinedAt).toISOString().substring(0, 10) : "");
  const [managerId, setManagerId] = useState(user.managerId || "");
  const [teachingLevel, setTeachingLevel] = useState(user.teachingLevel || "");
  const [subject, setSubject] = useState(user.subject || "");
  const [homeroomClassId, setHomeroomClassId] = useState(user.homeroomClassId || "");
  const [internalNote, setInternalNote] = useState(user.internalNote || "");

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name || name.trim().length < 2) {
      setFormError("Họ tên phải có ít nhất 2 ký tự.");
      return;
    }

    // Check employee code uniqueness if changed
    if (employeeCode && employeeCode !== user.employeeCode) {
      const check = await checkEmployeeCode(employeeCode, user.id);
      if (!check.available) {
        setFormError("Mã thành viên này đã được sử dụng.");
        return;
      }
    }

    // Confirm role/department change
    if (isAdmin && (role !== user.role) && !confirm(`Xác nhận đổi vai trò từ "${user.role}" → "${role}"?`)) return;
    if (isAdmin && (departmentId !== user.departmentId) && !confirm(`Xác nhận chuyển phòng ban?`)) return;

    startTransition(async () => {
      try {
        // 1. Update basic info
        const basicRes = await updateUserAction(user.id, {
          name: name.trim(),
          phone: phone || undefined,
          departmentId: isAdmin ? departmentId : undefined,
          role: isAdmin ? (role as any) : undefined,
          title: title || undefined,
          status: status as any,
        });

        if (!basicRes.success) {
          setFormError(basicRes.error || "Có lỗi khi cập nhật thông tin cơ bản.");
          return;
        }

        // 2. Update work info
        await updateUserWorkInfo(user.id, {
          staffType: staffType || undefined,
          joinedAt: joinedAt || null,
          managerId: managerId || null,
          teachingLevel: teachingLevel || null,
          subject: subject || null,
          homeroomClassId: homeroomClassId || null,
          internalNote: internalNote || null,
        });

        showToast("Đã lưu hồ sơ thành công!", "success");
        setTimeout(() => router.push(`/${locale}/users/${user.id}`), 1200);
      } catch (err: any) {
        setFormError(err.message || "Có lỗi không xác định.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {toast && <Toast {...toast} />}

      {/* Top bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push(`/${locale}/users/${user.id}`)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-500"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-black text-slate-800 dark:text-white">Sửa hồ sơ thành viên</h1>
          <p className="text-xs text-slate-400 mt-0.5">{user.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {formError && (
          <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 px-5 py-3.5 rounded-2xl text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {formError}
          </div>
        )}

        {/* Thông tin cơ bản */}
        <Section title="Thông tin cơ bản">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Mã thành viên" required>
              <input
                type="text"
                value={employeeCode}
                onChange={e => setEmployeeCode(e.target.value)}
                placeholder="VD: NV001, GV012"
                disabled={!isAdmin}
                className={isAdmin ? inputCls : disabledCls}
              />
            </FormField>

            <FormField label="Họ và tên" required>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className={inputCls}
              />
            </FormField>

            <FormField label="Email đăng nhập">
              <input type="email" value={user.email || ""} disabled className={disabledCls} />
              <p className="text-[10px] text-slate-400 mt-1">Email đăng nhập không thể thay đổi tại đây.</p>
            </FormField>

            <FormField label="Số điện thoại">
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                className={inputCls}
              />
            </FormField>

            <FormField label="Vai trò" required>
              {isAdmin ? (
                <select value={role} onChange={e => setRole(e.target.value)} className={inputCls}>
                  <option value="STAFF">Giáo viên / Nhân viên</option>
                  <option value="MANAGER">Trưởng phòng</option>
                  <option value="ADMIN">Ban Giám hiệu (Admin)</option>
                </select>
              ) : (
                <input type="text" value={user.role} disabled className={disabledCls} />
              )}
            </FormField>

            <FormField label="Phòng ban" required>
              {isAdmin ? (
                <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className={inputCls}>
                  <option value="">— Chọn phòng ban —</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              ) : (
                <input type="text" value={departments.find(d => d.id === user.departmentId)?.name || user.departmentId || "—"} disabled className={disabledCls} />
              )}
            </FormField>

            <FormField label="Chức danh">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="VD: Giáo viên Toán, Nhân viên Tuyển sinh..."
                className={inputCls}
              />
            </FormField>

            <FormField label="Trạng thái tài khoản">
              {isAdmin ? (
                <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
                  <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                  <option value="INVITED">Đã mời (INVITED)</option>
                  <option value="SUSPENDED">Đã khóa (SUSPENDED)</option>
                </select>
              ) : (
                <input type="text" value={status} disabled className={disabledCls} />
              )}
            </FormField>
          </div>
        </Section>

        {/* Thông tin công việc */}
        <Section title="Thông tin công việc">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Loại nhân sự">
              <select value={staffType} onChange={e => setStaffType(e.target.value)} className={inputCls}>
                <option value="">— Chưa chọn —</option>
                <option value="TEACHER">Giáo viên</option>
                <option value="STAFF">Nhân viên</option>
                <option value="MANAGER">Quản lý</option>
                <option value="CONTRACTOR">Cộng tác viên</option>
              </select>
            </FormField>

            <FormField label="Ngày vào làm">
              <input type="date" value={joinedAt} onChange={e => setJoinedAt(e.target.value)} className={inputCls} />
            </FormField>

            <FormField label="Người quản lý trực tiếp">
              <select value={managerId} onChange={e => setManagerId(e.target.value)} className={inputCls}>
                <option value="">— Không có —</option>
                {usersForSelect.filter(u => u.id !== user.id).map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </FormField>

            <FormField label="Cấp học phụ trách">
              <input type="text" value={teachingLevel} onChange={e => setTeachingLevel(e.target.value)} placeholder="VD: THPT, THCS..." className={inputCls} />
            </FormField>

            <FormField label="Môn phụ trách">
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="VD: Toán, Văn, Tiếng Anh..." className={inputCls} />
            </FormField>

            <FormField label="Lớp chủ nhiệm">
              <input type="text" value={homeroomClassId} onChange={e => setHomeroomClassId(e.target.value)} placeholder="VD: 10A1, 11B2..." className={inputCls} />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Ghi chú nội bộ">
                <textarea
                  value={internalNote}
                  onChange={e => setInternalNote(e.target.value)}
                  rows={3}
                  placeholder="Ghi chú chỉ hiển thị với admin và trưởng phòng..."
                  className={`${inputCls} resize-none`}
                />
              </FormField>
            </div>
          </div>
        </Section>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/users/${user.id}`)}
            className="px-5 py-2.5 text-sm font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Đang lưu..." : "Lưu hồ sơ"}
          </button>
        </div>
      </form>
    </div>
  );
}
