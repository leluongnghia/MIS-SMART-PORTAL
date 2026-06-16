"use client";

import { useState, useTransition } from "react";
import { updateMyProfile } from "../users/actions";
import {
  User, Mail, Phone, Building2, Shield, Briefcase,
  Edit2, Save, X, CheckCircle, XCircle, Clock, Calendar,
  KeyRound, AlertTriangle, Star
} from "lucide-react";

type UserProfile = {
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
  status: string;
  lastLoginAt: Date | null;
  emailVerifiedAt: Date | null;
  mustChangePassword: boolean;
  createdAt: Date;
};

type Department = { id: string; name: string; code: string };
type Actor = { id: string; role: string; departmentId: string | null };

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Ban Giám hiệu (Quản trị viên)",
  MANAGER: "Trưởng phòng",
  STAFF: "Giáo viên / Nhân viên",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  INVITED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  SUSPENDED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  DELETED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INVITED: "Chưa kích hoạt",
  SUSPENDED: "Đã khóa",
  DELETED: "Đã xóa",
};

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold animate-in slide-in-from-bottom-3 duration-300 ${
      type === "success"
        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-700"
        : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 text-rose-700"
    }`}>
      {type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      {message}
    </div>
  );
}

export default function ProfileClient({
  locale,
  user: initialUser,
  departments,
  actor,
}: {
  locale: string;
  user: UserProfile;
  departments: Department[];
  actor: Actor;
}) {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [phone, setPhone] = useState(user.phone || "");
  const [formError, setFormError] = useState("");

  const dept = departments.find(d => d.id === user.departmentId);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = () => {
    setFormError("");
    startTransition(async () => {
      const res = await updateMyProfile({ phone: phone || null });
      if (res.success) {
        showToast("Đã cập nhật hồ sơ!", "success");
        setUser(u => ({ ...u, phone: phone || null }));
        setEditing(false);
      } else {
        setFormError(res.error || "Có lỗi xảy ra.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {toast && <Toast {...toast} />}

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2.5">
            <User className="h-6 w-6 text-indigo-600" />
            Hồ sơ cá nhân
          </h1>
          <p className="text-sm text-slate-500 mt-1">Thông tin tài khoản của bạn trong hệ thống MIS Smart Portal</p>
        </div>

        {/* Must change password warning */}
        {user.mustChangePassword && (
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-5 py-4 rounded-2xl text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Quản trị viên yêu cầu bạn đổi mật khẩu trong lần đăng nhập tới.
          </div>
        )}

        {/* Avatar + Name Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 h-28" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-14 mb-5">
              <div className="h-28 w-28 rounded-2xl border-4 border-white dark:border-slate-900 bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-white text-4xl shadow-xl uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="pb-2 flex-1 min-w-0">
                <h2 className="text-xl font-black text-slate-900 dark:text-white truncate">{user.name}</h2>
                <p className="text-sm text-slate-500">{user.title || "Chưa có chức danh"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${STATUS_COLORS[user.status] || ""}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${user.status === "ACTIVE" ? "bg-emerald-500" : "bg-amber-500"}`} />
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

        {/* Editable info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Thông tin cá nhân</h2>
            {!editing ? (
              <button
                onClick={() => { setEditing(true); setFormError(""); setPhone(user.phone || ""); }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 transition"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isPending ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            )}
          </div>

          <div className="p-6 space-y-5">
            {formError && (
              <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold">
                <XCircle className="h-3.5 w-3.5" />
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoRow icon={Star} label="Mã thành viên" value={user.employeeCode || "—"} locked />
              <InfoRow icon={User} label="Họ và tên" value={user.name} locked />
              <InfoRow icon={Mail} label="Email đăng nhập" value={user.email || "—"} locked />

              <div>
                <p className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5 mb-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Số điện thoại
                </p>
                {editing ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="09xxxxxxxx"
                    className="w-full px-3 py-2.5 border border-indigo-300 dark:border-indigo-700 rounded-xl bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200">{user.phone || "—"}</p>
                )}
              </div>

              <InfoRow icon={Shield} label="Vai trò hệ thống" value={ROLE_LABELS[user.role] || user.role} locked />
              <InfoRow icon={Building2} label="Phòng ban" value={dept?.name || "Chưa gán"} locked />
              <InfoRow icon={Briefcase} label="Chức danh" value={user.title || "—"} locked />
            </div>
          </div>
        </div>

        {/* Account security info (read-only) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-500" />
              Bảo mật tài khoản
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoRow icon={Clock} label="Lần đăng nhập cuối" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("vi-VN") : "Chưa đăng nhập"} />
            <InfoRow icon={Mail} label="Email xác minh" value={user.emailVerifiedAt ? new Date(user.emailVerifiedAt).toLocaleDateString("vi-VN") : "Chưa xác minh"} />
            <InfoRow icon={Calendar} label="Ngày tạo tài khoản" value={new Date(user.createdAt).toLocaleDateString("vi-VN")} />
            <InfoRow
              icon={KeyRound}
              label="Yêu cầu đổi mật khẩu"
              value={user.mustChangePassword ? "Có — cần đổi lần đăng nhập tới" : "Không"}
              highlight={user.mustChangePassword}
            />
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl px-5 py-4 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
          <p className="font-bold mb-1">Lưu ý bảo mật</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Không chia sẻ tài khoản với người khác.</li>
            <li>Để thay đổi email hoặc vai trò, liên hệ Quản trị viên trường.</li>
            <li>Nếu phát hiện hoạt động bất thường, liên hệ bộ phận IT ngay.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon, label, value, locked, highlight
}: {
  icon: any;
  label: string;
  value: string;
  locked?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5 mb-1.5">
        <Icon className="h-3.5 w-3.5" />
        {label}
        {locked && <span className="text-slate-300 dark:text-slate-600 text-[10px] ml-1">(không sửa được)</span>}
      </p>
      <p className={`text-sm font-semibold ${highlight ? "text-amber-600 dark:text-amber-400" : "text-slate-800 dark:text-slate-200"}`}>
        {value}
      </p>
    </div>
  );
}
