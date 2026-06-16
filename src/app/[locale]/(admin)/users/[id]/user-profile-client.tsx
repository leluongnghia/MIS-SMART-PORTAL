"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getUserActivityLog,
  updateUserSecurityStatus,
  changeUserRole,
  changeUserDepartment,
  softDeleteUserAction,
  restoreUserAction,
  updateUserWorkInfo,
} from "../actions";
import {
  Shield, Mail, Phone, Calendar, Clock, Briefcase,
  Edit2, Trash2, RotateCcw, Lock, Unlock, UserCheck,
  AlertTriangle, ChevronLeft, BookOpen, Users, Info,
  CheckCircle, XCircle, FileText, Building2, Star,
  KeyRound, Activity, User
} from "lucide-react";

type User = {
  id: string;
  name: string;
  role: string;
  roleName: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
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
  lastLoginAt: Date | null;
  emailVerifiedAt: Date | null;
  passwordChangedAt: Date | null;
  mustChangePassword: boolean;
  createdAt: Date;
  createdBy: string | null;
};

type Department = { id: string; name: string; code: string };
type Manager = { id: string; name: string } | null;
type Actor = { id: string; role: string; departmentId: string | null };

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Ban Giám hiệu",
  MANAGER: "Trưởng phòng",
  STAFF: "Giáo viên / Nhân viên",
};

const STAFF_TYPE_LABELS: Record<string, string> = {
  TEACHER: "Giáo viên",
  STAFF: "Nhân viên",
  MANAGER: "Quản lý",
  CONTRACTOR: "Cộng tác viên",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  INVITED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  SUSPENDED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  DELETED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INVITED: "Đã gửi lời mời",
  SUSPENDED: "Đã khóa",
  DELETED: "Đã xóa",
};

const ACTION_LABELS: Record<string, string> = {
  CREATE_USER: "Tạo tài khoản",
  UPDATE_USER: "Cập nhật hồ sơ",
  UPDATE_USER_WORK_INFO: "Cập nhật thông tin công việc",
  UPDATE_MY_PROFILE: "Cập nhật hồ sơ cá nhân",
  CHANGE_USER_ROLE: "Đổi vai trò",
  CHANGE_USER_DEPARTMENT: "Đổi phòng ban",
  SUSPEND_USER: "Khóa tài khoản",
  ACTIVATE_USER: "Kích hoạt tài khoản",
  DELETE_USER_SOFT: "Xóa mềm",
  RESTORE_USER: "Khôi phục",
  REQUIRE_PASSWORD_CHANGE: "Yêu cầu đổi mật khẩu",
  CLEAR_PASSWORD_CHANGE: "Bỏ yêu cầu đổi mật khẩu",
};

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold animate-in slide-in-from-bottom-3 duration-300 ${
        type === "success"
          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
          : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400"
      }`}
    >
      {type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      {message}
    </div>
  );
}

export default function UserProfileClient({
  locale,
  user: initialUser,
  departments,
  manager: initialManager,
  actor,
}: {
  locale: string;
  user: User;
  departments: Department[];
  manager: Manager;
  actor: Actor;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"basic" | "work" | "security" | "log">("basic");
  const [user, setUser] = useState<User>(initialUser);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [logsLoaded, setLogsLoaded] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  // Work form state
  const [workEdit, setWorkEdit] = useState(false);
  const [formStaffType, setFormStaffType] = useState(user.staffType || "");
  const [formJoinedAt, setFormJoinedAt] = useState(
    user.joinedAt ? new Date(user.joinedAt).toISOString().substring(0, 10) : ""
  );
  const [formManagerId, setFormManagerId] = useState(user.managerId || "");
  const [formTeachingLevel, setFormTeachingLevel] = useState(user.teachingLevel || "");
  const [formSubject, setFormSubject] = useState(user.subject || "");
  const [formHomeroomClass, setFormHomeroomClass] = useState(user.homeroomClassId || "");
  const [formInternalNote, setFormInternalNote] = useState(user.internalNote || "");

  const isAdmin = actor.role === "ADMIN";
  const isManager = actor.role === "MANAGER";
  const isOwnProfile = actor.id === user.id;

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSecurityAction = (action: "SUSPEND" | "ACTIVATE" | "REQUIRE_PASSWORD_CHANGE") => {
    const confirmMsg =
      action === "SUSPEND"
        ? `Bạn có chắc muốn khóa tài khoản "${user.name}"?`
        : action === "ACTIVATE"
        ? `Kích hoạt lại tài khoản "${user.name}"?`
        : `Yêu cầu "${user.name}" đổi mật khẩu lần đăng nhập tới?`;

    if (!confirm(confirmMsg)) return;

    startTransition(async () => {
      const res = await updateUserSecurityStatus(user.id, action);
      if (res.success) {
        showToast("Cập nhật thành công!", "success");
        // Refresh user
        setUser((u) => ({
          ...u,
          status:
            action === "SUSPEND" ? "SUSPENDED" : action === "ACTIVATE" ? "ACTIVE" : u.status,
          mustChangePassword: action === "REQUIRE_PASSWORD_CHANGE" ? true : u.mustChangePassword,
        }));
      } else {
        showToast(res.error || "Có lỗi xảy ra.", "error");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Xóa mềm thành viên "${user.name}"?`)) return;
    startTransition(async () => {
      const res = await softDeleteUserAction(user.id);
      if (res.success) {
        showToast("Đã xóa mềm thành viên.", "success");
        setTimeout(() => router.push(`/${locale}/users`), 1200);
      } else {
        showToast(res.error || "Có lỗi xảy ra.", "error");
      }
    });
  };

  const handleRestore = () => {
    startTransition(async () => {
      const res = await restoreUserAction(user.id);
      if (res.success) {
        showToast("Đã khôi phục tài khoản.", "success");
        setUser((u) => ({ ...u, status: "ACTIVE" }));
      } else {
        showToast(res.error || "Có lỗi xảy ra.", "error");
      }
    });
  };

  const handleSaveWork = () => {
    startTransition(async () => {
      const res = await updateUserWorkInfo(user.id, {
        staffType: formStaffType || undefined,
        joinedAt: formJoinedAt || null,
        managerId: formManagerId || null,
        teachingLevel: formTeachingLevel || null,
        subject: formSubject || null,
        homeroomClassId: formHomeroomClass || null,
        internalNote: formInternalNote || null,
      });
      if (res.success) {
        showToast("Đã lưu thông tin công việc.", "success");
        setUser((u) => ({
          ...u,
          staffType: formStaffType || null,
          joinedAt: formJoinedAt ? new Date(formJoinedAt) : null,
          managerId: formManagerId || null,
          teachingLevel: formTeachingLevel || null,
          subject: formSubject || null,
          homeroomClassId: formHomeroomClass || null,
          internalNote: formInternalNote || null,
        }));
        setWorkEdit(false);
      } else {
        showToast(res.error || "Có lỗi xảy ra.", "error");
      }
    });
  };

  const loadActivityLogs = async () => {
    if (logsLoaded) return;
    setLogsLoading(true);
    try {
      const res = await getUserActivityLog(user.id, 1, 50);
      if (!res.error) {
        setActivityLogs(res.logs);
        setLogsLoaded(true);
      }
    } finally {
      setLogsLoading(false);
    }
  };

  const dept = departments.find((d) => d.id === user.departmentId);

  const tabs = [
    { key: "basic", label: "Thông tin cơ bản", icon: User },
    { key: "work", label: "Thông tin công việc", icon: Briefcase },
    { key: "security", label: "Bảo mật tài khoản", icon: Shield },
    { key: "log", label: "Nhật ký hoạt động", icon: Activity },
  ] as const;

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
          <h1 className="text-lg font-black text-slate-800 dark:text-white">Hồ sơ thành viên</h1>
          <p className="text-xs text-slate-400 mt-0.5">{user.employeeCode || user.id}</p>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {(isAdmin || (isManager && dept?.id === actor.departmentId)) && user.status !== "DELETED" && (
            <button
              onClick={() => router.push(`/${locale}/users/${user.id}/edit`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow-sm"
            >
              <Edit2 className="h-4 w-4" />
              Sửa hồ sơ
            </button>
          )}
          {isAdmin && user.status === "DELETED" && (
            <button
              onClick={handleRestore}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition shadow-sm disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Khôi phục
            </button>
          )}
          {isAdmin && user.status !== "DELETED" && user.id !== actor.id && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-xl border border-rose-200 dark:border-rose-800 transition disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Xóa mềm
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-24" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-5 -mt-12 mb-4">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-24 w-24 rounded-2xl border-4 border-white dark:border-slate-900 object-cover shadow-lg"
                />
              ) : (
                <div className="h-24 w-24 rounded-2xl border-4 border-white dark:border-slate-900 bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-white text-3xl shadow-lg uppercase">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="pb-1 min-w-0 flex-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white truncate">{user.name}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{user.title || "Chưa có chức danh"}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${STATUS_COLORS[user.status] || ""}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${user.status === "ACTIVE" ? "bg-emerald-500" : user.status === "SUSPENDED" ? "bg-rose-500" : "bg-amber-500"}`} />
                {STATUS_LABELS[user.status] || user.status}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Shield className="h-3 w-3" />
                {ROLE_LABELS[user.role] || user.role}
              </span>
              {dept && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Building2 className="h-3 w-3" />
                  {dept.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key as any);
                  if (key === "log") loadActivityLogs();
                }}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === key
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Tab 1: Thông tin cơ bản */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Mã thành viên" icon={Star} value={user.employeeCode || "—"} mono />
                  <Field label="Họ và tên" icon={User} value={user.name} />
                  <Field label="Email" icon={Mail} value={user.email || "—"} mono />
                  <Field label="Số điện thoại" icon={Phone} value={user.phone || "—"} mono />
                  <Field label="Phòng ban" icon={Building2} value={dept?.name || "Chưa gán phòng ban"} />
                  <Field label="Vai trò" icon={Shield} value={ROLE_LABELS[user.role] || user.role} />
                  <Field label="Chức danh" icon={Briefcase} value={user.title || "—"} />
                  <Field label="Trạng thái" icon={CheckCircle} value={STATUS_LABELS[user.status] || user.status} badge statusKey={user.status} />
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Ngày tạo tài khoản" icon={Calendar} value={new Date(user.createdAt).toLocaleDateString("vi-VN")} />
                </div>
              </div>
            )}

            {/* Tab 2: Thông tin công việc */}
            {activeTab === "work" && (
              <div className="space-y-5">
                {(isAdmin || isManager) && !workEdit && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setWorkEdit(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 transition"
                    >
                      <Edit2 className="h-4 w-4" />
                      Sửa thông tin công việc
                    </button>
                  </div>
                )}
                {!workEdit ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Loại nhân sự" icon={Users} value={STAFF_TYPE_LABELS[user.staffType || ""] || "—"} />
                    <Field label="Ngày vào làm" icon={Calendar} value={user.joinedAt ? new Date(user.joinedAt).toLocaleDateString("vi-VN") : "—"} />
                    <Field label="Người quản lý trực tiếp" icon={UserCheck} value={initialManager?.name || "—"} />
                    <Field label="Cấp học phụ trách" icon={BookOpen} value={user.teachingLevel || "—"} />
                    <Field label="Môn phụ trách" icon={BookOpen} value={user.subject || "—"} />
                    <Field label="Lớp chủ nhiệm" icon={Users} value={user.homeroomClassId || "—"} />
                    {(isAdmin || isManager) && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-bold uppercase text-slate-400 mb-1">Ghi chú nội bộ</p>
                        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 min-h-[60px] whitespace-pre-wrap">
                          {user.internalNote || <span className="text-slate-400 italic">Không có ghi chú</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Loại nhân sự</label>
                        <select value={formStaffType} onChange={e => setFormStaffType(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="">— Chưa chọn —</option>
                          <option value="TEACHER">Giáo viên</option>
                          <option value="STAFF">Nhân viên</option>
                          <option value="MANAGER">Quản lý</option>
                          <option value="CONTRACTOR">Cộng tác viên</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Ngày vào làm</label>
                        <input type="date" value={formJoinedAt} onChange={e => setFormJoinedAt(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cấp học phụ trách</label>
                        <input type="text" value={formTeachingLevel} onChange={e => setFormTeachingLevel(e.target.value)} placeholder="Ví dụ: THPT, THCS..." className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Môn phụ trách</label>
                        <input type="text" value={formSubject} onChange={e => setFormSubject(e.target.value)} placeholder="Ví dụ: Toán, Văn..." className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Lớp chủ nhiệm</label>
                        <input type="text" value={formHomeroomClass} onChange={e => setFormHomeroomClass(e.target.value)} placeholder="Ví dụ: 10A1" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    </div>
                    {(isAdmin || isManager) && (
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Ghi chú nội bộ</label>
                        <textarea value={formInternalNote} onChange={e => setFormInternalNote(e.target.value)} rows={3} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Ghi chú nội bộ (chỉ admin/trưởng phòng xem)" />
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button onClick={() => setWorkEdit(false)} className="px-4 py-2 text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300">Hủy</button>
                      <button onClick={handleSaveWork} disabled={isPending} className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50 shadow-sm">
                        {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Bảo mật tài khoản */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Trạng thái tài khoản" icon={Shield} value={STATUS_LABELS[user.status] || user.status} badge statusKey={user.status} />
                  <Field label="Lần đăng nhập cuối" icon={Clock} value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("vi-VN") : "Chưa đăng nhập"} />
                  <Field label="Email đã xác minh" icon={Mail} value={user.emailVerifiedAt ? new Date(user.emailVerifiedAt).toLocaleDateString("vi-VN") : "Chưa xác minh"} />
                  <Field label="Ngày đổi mật khẩu gần nhất" icon={KeyRound} value={user.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleDateString("vi-VN") : "—"} />
                  <Field label="Yêu cầu đổi mật khẩu" icon={AlertTriangle} value={user.mustChangePassword ? "Có — cần đổi lần đăng nhập tới" : "Không"} highlight={user.mustChangePassword} />
                </div>

                {isAdmin && user.id !== actor.id && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Hành động bảo mật</h3>
                    <div className="flex flex-wrap gap-3">
                      {user.status !== "SUSPENDED" && user.status !== "DELETED" && (
                        <button
                          onClick={() => handleSecurityAction("SUSPEND")}
                          disabled={isPending}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl hover:bg-rose-100 transition disabled:opacity-50"
                        >
                          <Lock className="h-4 w-4" />
                          Khóa tài khoản
                        </button>
                      )}
                      {user.status === "SUSPENDED" && (
                        <button
                          onClick={() => handleSecurityAction("ACTIVATE")}
                          disabled={isPending}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 transition disabled:opacity-50"
                        >
                          <Unlock className="h-4 w-4" />
                          Mở khóa tài khoản
                        </button>
                      )}
                      {!user.mustChangePassword && (
                        <button
                          onClick={() => handleSecurityAction("REQUIRE_PASSWORD_CHANGE")}
                          disabled={isPending}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-100 transition disabled:opacity-50"
                        >
                          <KeyRound className="h-4 w-4" />
                          Yêu cầu đổi mật khẩu
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Nhật ký hoạt động */}
            {activeTab === "log" && (
              <div className="space-y-4">
                {logsLoading ? (
                  <div className="flex items-center gap-3 text-slate-500 py-8 justify-center">
                    <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Đang tải nhật ký...</span>
                  </div>
                ) : activityLogs.length === 0 ? (
                  <div className="py-12 text-center">
                    <Activity className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500">Chưa có nhật ký hoạt động</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-4 pl-5">
                    {activityLogs.map((log) => {
                      const meta = log.metadata as any || {};
                      return (
                        <div key={log.id} className="relative">
                          <div className="absolute -left-[25px] top-2 h-3 w-3 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900" />
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                {ACTION_LABELS[log.action] || log.action}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(log.createdAt).toLocaleString("vi-VN")}
                              </span>
                            </div>
                            {meta.before && meta.after && (
                              <div className="mt-1 text-xs text-slate-500 space-y-0.5">
                                {Object.keys(meta.after).filter(k => !['updatedBy','updatedAt'].includes(k) && meta.before[k] !== meta.after[k]).map(k => (
                                  <p key={k}>
                                    <span className="font-semibold text-slate-600 dark:text-slate-400">{k}:</span>{" "}
                                    <span className="line-through text-rose-400">{String(meta.before[k] ?? "—")}</span>
                                    {" → "}
                                    <span className="text-emerald-600 dark:text-emerald-400">{String(meta.after[k] ?? "—")}</span>
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Field display component
function Field({
  label, icon: Icon, value, mono, badge, statusKey, highlight
}: {
  label: string;
  icon: any;
  value: string;
  mono?: boolean;
  badge?: boolean;
  statusKey?: string;
  highlight?: boolean;
}) {
  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    INVITED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    SUSPENDED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    DELETED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5 mb-1.5">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      {badge && statusKey ? (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black border ${STATUS_COLORS[statusKey] || ""}`}>
          {value}
        </span>
      ) : (
        <p className={`text-sm ${mono ? "font-mono" : "font-semibold"} text-slate-800 dark:text-slate-200 ${highlight ? "text-amber-600 dark:text-amber-400" : ""}`}>
          {value}
        </p>
      )}
    </div>
  );
}

