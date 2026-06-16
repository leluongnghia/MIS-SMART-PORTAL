"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUserAction, checkEmployeeCode } from "../actions";
import {
  ChevronLeft, UserPlus, AlertTriangle, CheckCircle, XCircle
} from "lucide-react";

type Department = { id: string; name: string; code: string };
type Actor = { id: string; role: string; departmentId: string | null };

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold ${
      type === "success"
        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
        : "bg-rose-50 border-rose-200 text-rose-700"
    }`}>
      {type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      {message}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200";
const disabledCls = "w-full px-3 py-2.5 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-900 text-sm text-slate-400 cursor-not-allowed";

export default function UserCreateClient({
  locale,
  departments,
  actor,
}: {
  locale: string;
  departments: Department[];
  actor: Actor;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [formError, setFormError] = useState("");

  const isAdmin = actor.role === "ADMIN";

  const [employeeCode, setEmployeeCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MANAGER" | "STAFF">("STAFF");
  const [departmentId, setDepartmentId] = useState(
    isAdmin ? (departments[0]?.id || "") : (actor.departmentId || "")
  );
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INVITED">("INVITED");

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
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setFormError("Email không hợp lệ.");
      return;
    }
    if (!departmentId) {
      setFormError("Phải chọn phòng ban.");
      return;
    }
    if (!isAdmin && role !== "STAFF") {
      setFormError("Trưởng phòng chỉ được tạo vai trò Nhân viên / Giáo viên.");
      return;
    }
    if (!isAdmin && actor.departmentId && actor.departmentId !== departmentId) {
      setFormError("Trưởng phòng chỉ được tạo thành viên trong phòng của mình.");
      return;
    }

    // Check employee code uniqueness
    if (employeeCode) {
      const check = await checkEmployeeCode(employeeCode);
      if (!check.available) {
        setFormError("Mã thành viên này đã được sử dụng.");
        return;
      }
    }

    startTransition(async () => {
      const res = await createUserAction({
        name: name.trim(),
        email: email.trim(),
        phone: phone || undefined,
        departmentId,
        role,
        title: title || undefined,
        status,
      });

      if (res.success) {
        showToast("Đã tạo thành viên thành công!", "success");
        setTimeout(() => router.push(`/${locale}/users`), 1200);
      } else {
        setFormError(res.error || "Có lỗi xảy ra.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {toast && <Toast {...toast} />}

      {/* Top bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push(`/${locale}/users`)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-500"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-black text-slate-800 dark:text-white">Tạo thành viên mới</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAdmin ? "Quản trị viên trường" : `Trưởng phòng — ${departments.find(d => d.id === actor.departmentId)?.name || actor.departmentId}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {formError && (
          <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 px-5 py-3.5 rounded-2xl text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {formError}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Thông tin thành viên</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {isAdmin && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Mã thành viên</label>
                <input
                  type="text"
                  value={employeeCode}
                  onChange={e => setEmployeeCode(e.target.value)}
                  placeholder="VD: NV001, GV012"
                  className={inputCls}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Họ và tên <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Nguyễn Văn A"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Email <span className="text-rose-500">*</span></label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="username@mis.edu.vn"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Vai trò <span className="text-rose-500">*</span></label>
              {isAdmin ? (
                <select value={role} onChange={e => setRole(e.target.value as any)} className={inputCls}>
                  <option value="STAFF">Giáo viên / Nhân viên</option>
                  <option value="MANAGER">Trưởng phòng</option>
                  <option value="ADMIN">Ban Giám hiệu (Admin)</option>
                </select>
              ) : (
                <input type="text" value="Giáo viên / Nhân viên (STAFF)" disabled className={disabledCls} />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Phòng ban <span className="text-rose-500">*</span></label>
              {isAdmin ? (
                <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className={inputCls}>
                  <option value="">— Chọn phòng ban —</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              ) : (
                <input type="text" value={departments.find(d => d.id === actor.departmentId)?.name || "—"} disabled className={disabledCls} />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Chức danh</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="VD: Giáo viên Toán, Nhân viên Tuyển sinh"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Trạng thái ban đầu</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)} className={inputCls}>
                <option value="INVITED">Gửi lời mời (INVITED)</option>
                <option value="ACTIVE">Kích hoạt ngay (ACTIVE)</option>
              </select>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Trưởng phòng chỉ được tạo thành viên với vai trò Giáo viên / Nhân viên trong phòng ban của mình.</span>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/users`)}
            className="px-5 py-2.5 text-sm font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {isPending ? "Đang tạo..." : "Tạo thành viên"}
          </button>
        </div>
      </form>
    </div>
  );
}
