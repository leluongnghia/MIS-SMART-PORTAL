"use client";

import { useEffect, useMemo, useState, useTransition, useRef } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import {
  bulkUpdateUsersAction,
  createUserAction,
  exportUsersAction,
  forcePasswordChangeAction,
  getAuditLogsForUser,
  getRolePermissionsMatrix,
  getUserStatsAction,
  getUsersList,
  importUsersAction,
  lockUserAction,
  logoutAllDevicesAction,
  permanentDeleteUserAction,
  resendUserInvitationAction,
  resetUserPasswordAction,
  restoreUserAction,
  saveRolePermissionsMatrix,
  softDeleteUserAction,
  unlockUserAction,
  updateUserAction,
} from "./actions";
import {
  DATA_SCOPE_OPTIONS,
  JOB_TITLES_LIST,
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  ROLE_COLORS,
  ROLE_LABELS,
  SCOPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "./users.constants";
import type { User } from "./users.types";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download,
  FileDown,
  FileSpreadsheet,
  History,
  KeyRound,
  Lock,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Unlock,
  Upload,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type Department = { id: string; name: string; code: string | null };
type Stats = { total: number; active: number; pendingInvite: number; pendingActivation: number; locked: number; admins: number; teachers: number; staff: number; deleted: number };

type FormState = {
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  role: string;
  title: string;
  status: string;
  dataScope: string;
  twoFactorEnabled: boolean;
  sendInvite: boolean;
  note: string;
};

const ROLES = Object.keys(ROLE_LABELS);
const STATUSES = ["ACTIVE", "PENDING_INVITE", "PENDING_ACTIVATION", "LOCKED", "SUSPENDED", "DELETED"];
const TABS = [
  { key: "ACTIVE", label: "Đang hoạt động" },
  { key: "PENDING_ACTIVATION", label: "Chờ kích hoạt" },
  { key: "LOCKED", label: "Bị khóa" },
  { key: "DELETED", label: "Đã xóa" },
  { key: "PENDING_INVITE", label: "Lời mời đã gửi" },
];

function emptyForm(dept = ""): FormState {
  return { name: "", email: "", phone: "", departmentId: dept, role: "STAFF", title: "", status: "ACTIVE", dataScope: "OWN", twoFactorEnabled: false, sendInvite: true, note: "" };
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(-2).map((p) => p[0]).join("").toUpperCase() || "U";
}

function timeAgo(value: Date | string | null) {
  if (!value) return "Chưa đăng nhập";
  const d = new Date(value);
  const diff = Date.now() - d.getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 1) return "Vừa xong";
  if (h < 24) return `${h} giờ trước`;
  if (h < 48) return "Hôm qua";
  return d.toLocaleDateString("vi-VN");
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const headers = Object.keys(rows[0] || { "Họ tên": "", Email: "" });
  const csv = [headers.join(","), ...rows.map((row) => headers.map((h) => `"${String(row[h] ?? "").replaceAll('"', '""')}"`).join(","))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function UsersClient({ locale, initialActor }: { locale: string; initialActor: any }) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [actor, setActor] = useState(initialActor);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, pendingInvite: 0, pendingActivation: 0, locked: 0, admins: 0, teachers: 0, staff: 0, deleted: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [jobTitleFilter, setJobTitleFilter] = useState("");
  const [dataScopeFilter, setDataScopeFilter] = useState("");
  const [twoFactorFilter, setTwoFactorFilter] = useState("all");
  const [lastLoginFilter, setLastLoginFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"name" | "role" | "lastLoginAt" | "status">("name");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formError, setFormError] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [matrixRole, setMatrixRole] = useState("ADMIN");
  const [matrix, setMatrix] = useState<any>({});
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const canAdmin = actor?.role === "ADMIN";
  const showTrash = activeTab === "DELETED";
  const statusFilter = activeTab === "LOCKED" ? "LOCKED" : activeTab;

  const loadUsers = () => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const [res, stat] = await Promise.all([
          getUsersList({ search, roleFilter, deptFilter, jobTitleFilter, statusFilter, dataScopeFilter, twoFactorFilter, lastLoginFilter, page, showTrash }),
          getUserStatsAction(),
        ]);
        setUsers(res.users as User[]);
        setDepartments(res.departments as Department[]);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.totalCount || 0);
        setActor(res.actor);
        setStats(stat);
      } catch (err: any) {
        setToast(err.message || "Không tải được danh sách người dùng");
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => { loadUsers(); }, [search, roleFilter, deptFilter, jobTitleFilter, dataScopeFilter, twoFactorFilter, lastLoginFilter, activeTab, page]);

  const sortedUsers = useMemo(() => [...users].sort((a: any, b: any) => String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? ""), "vi")), [users, sortKey]);

  const resetFilters = () => { setSearch(""); setRoleFilter(""); setDeptFilter(""); setJobTitleFilter(""); setDataScopeFilter(""); setTwoFactorFilter("all"); setLastLoginFilter("all"); setPage(1); };

  const notify = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(""), 2600); };

  const openCreate = () => { setForm(emptyForm(actor.role === "MANAGER" ? actor.departmentId || "" : departments[0]?.id || "")); setFormMode("create"); setFormError(""); };
  const openEdit = (user: User) => { setSelectedUser(user); setForm({ name: user.name, email: user.email || "", phone: user.phone || "", departmentId: user.departmentId || "", role: user.role, title: user.title || "", status: user.status, dataScope: user.dataScope || "OWN", twoFactorEnabled: !!user.twoFactorEnabled, sendInvite: false, note: "" }); setFormMode("edit"); setFormError(""); };

  const validateForm = () => {
    if (!form.name.trim()) return "Họ tên không được rỗng.";
    if (formMode === "create" && !/^\S+@\S+\.\S+$/.test(form.email)) return "Email không hợp lệ.";
    if (form.phone && !/^[0-9+\-\s().]{8,20}$/.test(form.phone)) return "Số điện thoại không hợp lệ.";
    if (!form.role) return "Phải chọn vai trò.";
    if (!form.departmentId) return "Phải chọn phòng ban.";
    if (!form.dataScope) return "Phải chọn phạm vi dữ liệu.";
    return "";
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateForm();
    if (err) return setFormError(err);
    const res = formMode === "create"
      ? await createUserAction(form)
      : selectedUser ? await updateUserAction(selectedUser.id, form) : { success: false, error: "Thiếu người dùng" };
    if (res.success) { setFormMode(null); notify(formMode === "create" ? "Đã tạo thành viên." : "Đã lưu thay đổi."); loadUsers(); } else setFormError(res.error || "Có lỗi xảy ra.");
  };

  const runUserAction = async (label: string, fn: () => Promise<any>, dangerous = false) => {
    if (dangerous && !confirm(`Xác nhận ${label}?`)) return;
    const res = await fn();
    if (res?.success) { notify(`Đã ${label}.`); loadUsers(); } else notify(res?.error || `Không thể ${label}.`);
  };

  const viewDetail = async (user: User) => {
    setSelectedUser(user); setIsDetailOpen(true); setAuditLogs([]);
    setAuditLogs(await getAuditLogsForUser(user.id));
  };

  const exportRows = async (onlySelected = false) => {
    const rows = onlySelected ? users.filter((u) => selectedIds.includes(u.id)) : await exportUsersAction({ search, roleFilter, deptFilter, statusFilter, dataScopeFilter });
    downloadCsv("mis-users-export.csv", (rows as any[]).map((u) => ({ "Họ tên": u.name, Email: u.email, "Số điện thoại": u.phone, "Phòng ban": departments.find((d) => d.id === u.departmentId)?.name || u.departmentId, "Chức danh": u.title, "Vai trò": ROLE_LABELS[u.role] || u.role, "Phạm vi dữ liệu": SCOPE_LABELS[u.dataScope] || u.dataScope, "Trạng thái": STATUS_LABELS[u.status] || u.status })));
    notify("Đã xuất CSV.");
  };

  const downloadTemplate = () => downloadCsv("mis-users-import-template.csv", [{ "Họ tên": "Nguyễn Văn A", Email: "a@mis.edu.vn", "Số điện thoại": "0900000000", "Phòng ban": "dept_bgh", "Tổ chuyên môn": "", "Chức danh": "Giáo viên", "Vai trò": "TEACHER", "Phạm vi dữ liệu": "CLASS", "Trạng thái": "ACTIVE", "Ghi chú": "" }]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setImportData(results.data);
      },
      error: (err) => {
        notify(`Lỗi đọc file: ${err.message}`);
      }
    });
  };

  const processImport = async () => {
    if (!importData.length) return notify("Không có dữ liệu để import");
    setImporting(true);
    
    // Ánh xạ dữ liệu từ CSV vào định dạng User
    const usersToImport = importData.map(row => ({
      name: row["Họ tên"] || row["name"] || "Không tên",
      email: row["Email"] || row["email"] || `import.${Date.now()}.${Math.random().toString(36).substring(7)}@mis.edu.vn`,
      phone: row["Số điện thoại"] || row["phone"] || "0900000000",
      departmentId: departments.find(d => d.name === row["Phòng ban"])?.id || departments[0]?.id || "dept_bgh",
      title: row["Chức danh"] || row["title"] || "Nhân viên",
      role: ["ADMIN", "MANAGER", "TEACHER", "STAFF"].includes(row["Vai trò"]) ? row["Vai trò"] : "STAFF",
      dataScope: ["ALL", "DEPARTMENT", "CLASS", "OWN"].includes(row["Phạm vi dữ liệu"]) ? row["Phạm vi dữ liệu"] : "OWN",
    }));

    try {
      const res = await importUsersAction(usersToImport);
      if (res.success) {
        notify(`Đã import thành công ${usersToImport.length} dòng.`);
        setIsImportOpen(false);
        setImportData([]);
        loadUsers();
      } else {
        notify(res.error || "Import lỗi");
      }
    } catch (err: any) {
      notify(`Lỗi hệ thống: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const openMatrix = async () => { setMatrix(await getRolePermissionsMatrix()); setIsMatrixOpen(true); };
  const togglePermission = (role: string, module: string, action: string) => setMatrix((m: any) => ({ ...m, [role]: { ...(m[role] || {}), [module]: { ...(m[role]?.[module] || {}), [action]: !m[role]?.[module]?.[action] } } }));

  const bulkAction = async (actionType: any, payload?: string) => {
    if (!selectedIds.length) return;
    if (["lock", "soft_delete"].includes(actionType) && !confirm("Xác nhận thao tác hàng loạt?")) return;
    const res = await bulkUpdateUsersAction(selectedIds, actionType, payload);
    if (res.success) { setSelectedIds([]); notify("Đã cập nhật hàng loạt."); loadUsers(); } else notify(res.error || "Bulk action lỗi");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-4 md:p-6 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/20">
      {toast && <div className="fixed right-4 top-4 z-[70] rounded-2xl border border-emerald-500/20 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 shadow-xl dark:bg-emerald-950 dark:text-emerald-300"><CheckCircle2 className="mr-2 inline h-4 w-4" />{toast}</div>}

      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-xl shadow-indigo-100/50 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300"><ShieldCheck className="h-4 w-4" /> RBAC & Account Security</div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Quản lý người dùng & phân quyền</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý tài khoản, vai trò, phòng ban và quyền truy cập hệ thống.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700"><UserPlus className="h-4 w-4" /> Thêm thành viên</button>
              <button onClick={() => setIsImportOpen(true)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Upload className="mr-2 inline h-4 w-4" />Import Excel</button>
              <button onClick={() => setIsExportOpen(true)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Download className="mr-2 inline h-4 w-4" />Export</button>
              <button onClick={openMatrix} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Shield className="mr-2 inline h-4 w-4" />Ma trận phân quyền</button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          {[
            { t: "Tổng thành viên", v: stats.total, i: Users, c: "from-slate-500 to-slate-700" },
            { t: "Giáo viên", v: stats.teachers, i: UserCog, c: "from-sky-500 to-blue-600" },
            { t: "Nhân viên", v: stats.staff, i: ShieldCheck, c: "from-cyan-500 to-teal-600" },
            { t: "Đang hoạt động", v: stats.active, i: CheckCircle2, c: "from-emerald-500 to-teal-600" },
            { t: "Chờ kích hoạt", v: stats.pendingActivation, i: History, c: "from-amber-500 to-orange-600" },
            { t: "Bị khóa", v: stats.locked, i: Lock, c: "from-rose-500 to-red-600" },
            { t: "BGH / Quản lý", v: stats.admins, i: Shield, c: "from-indigo-500 to-violet-600" },
            { t: "Đã xóa", v: stats.deleted, i: Trash2, c: "from-zinc-500 to-slate-700" }
          ].map((card) => <div key={card.t} className="rounded-3xl border border-white/70 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${card.c} text-white shadow-lg`}><card.i className="h-5 w-5" /></div><div className="text-2xl font-black text-slate-900 dark:text-white">{card.v}</div><div className="text-xs font-bold text-slate-500">{card.t}</div></div>)}
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200 p-3 dark:border-slate-800">
            {TABS.map((t) => <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(1); setSelectedIds([]); }} className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-black transition ${activeTab === t.key ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>{t.label}</button>)}
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3 xl:grid-cols-8">
            <div className="relative md:col-span-2"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo tên, email, số điện thoại" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950" /></div>
            <Select value={roleFilter} onChange={setRoleFilter} options={[['', 'Tất cả vai trò'], ...ROLES.map((r) => [r, ROLE_LABELS[r]])]} />
            <Select value={deptFilter} onChange={setDeptFilter} options={[['', 'Tất cả phòng ban'], ...departments.map((d) => [d.id, d.name])]} />
            <Select value={jobTitleFilter} onChange={setJobTitleFilter} options={[['', 'Tất cả chức danh'], ...JOB_TITLES_LIST.map((j) => [j, j])]} />
            <Select value={dataScopeFilter} onChange={setDataScopeFilter} options={[['', 'Tất cả phạm vi'], ...DATA_SCOPE_OPTIONS.map((s: any) => [s.value, s.label])]} />
            <Select value={twoFactorFilter} onChange={setTwoFactorFilter} options={[["all", "Tất cả 2FA"], ["enabled", "2FA bật"], ["disabled", "2FA tắt"]]} />
            <Select value={lastLoginFilter} onChange={setLastLoginFilter} options={[["all", "Đăng nhập: tất cả"], ["today", "Hôm nay"], ["7days", "7 ngày qua"], ["30days", "30 ngày qua"], ["never", "Chưa từng đăng nhập"]]} />
            <button onClick={resetFilters} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"><RefreshCw className="mr-2 inline h-4 w-4" />Đặt lại</button>
          </div>

          {selectedIds.length > 0 && <div className="mx-4 mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 p-3 text-sm dark:border-indigo-900 dark:bg-indigo-950/40"><b>{selectedIds.length} đã chọn</b><button onClick={() => bulkAction("lock")} className="btn-mini">Khóa</button><button onClick={() => bulkAction("unlock")} className="btn-mini">Mở khóa</button><button onClick={() => bulkAction("assign_data_scope", "OWN")} className="btn-mini">Scope OWN</button><button onClick={() => exportRows(true)} className="btn-mini">Export đã chọn</button><button onClick={() => bulkAction("soft_delete")} className="btn-mini danger">Xóa mềm</button></div>}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500 dark:bg-slate-950">
                <tr><th className="px-4 py-4"><input type="checkbox" checked={selectedIds.length === users.length && users.length > 0} onChange={(e) => setSelectedIds(e.target.checked ? users.map((u) => u.id) : [])} /></th>{[["name", "Họ tên / Email"], ["phone", "Điện thoại"], ["dept", "Bộ phận"], ["role", "Vai trò"], ["title", "Chức danh"], ["scope", "Phạm vi dữ liệu"], ["lastLoginAt", "Đăng nhập cuối"], ["2fa", "2FA"], ["status", "Trạng thái"], ["actions", "Thao tác"]].map(([k, l]) => <th key={k} onClick={() => ["name", "role", "lastLoginAt", "status"].includes(k) && setSortKey(k as any)} className="px-4 py-4">{l}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? <tr><td colSpan={11} className="p-12 text-center font-bold text-slate-500">Đang tải dữ liệu...</td></tr> : sortedUsers.length === 0 ? <tr><td colSpan={11} className="p-12 text-center"><UserCog className="mx-auto mb-3 h-12 w-12 text-slate-300" /><b>Không tìm thấy thành viên nào.</b><p className="text-slate-500">Hãy thay đổi bộ lọc hoặc thêm thành viên mới.</p></td></tr> : sortedUsers.map((user) => <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50"><td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(user.id)} onChange={(e) => setSelectedIds((ids) => e.target.checked ? [...ids, user.id] : ids.filter((id) => id !== user.id))} /></td><td className="px-4 py-4"><button onClick={() => viewDetail(user)} className="flex items-center gap-3 text-left"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 font-black text-white">{initials(user.name)}</div><div><div className="font-black text-slate-900 dark:text-white">{user.name}</div><div className="text-xs text-slate-500">{user.email}</div></div></button></td><td className="px-4 py-4 font-mono text-xs">{user.phone || "—"}</td><td className="px-4 py-4 font-semibold">{departments.find((d) => d.id === user.departmentId)?.name || "—"}</td><td className="px-4 py-4"><Badge cls={ROLE_COLORS[user.role]}>{ROLE_LABELS[user.role] || user.role}</Badge></td><td className="px-4 py-4 text-slate-500">{user.title || "—"}</td><td className="px-4 py-4"><Badge cls="bg-cyan-500/10 text-cyan-700 border-cyan-500/20 dark:text-cyan-300">{SCOPE_LABELS[user.dataScope] || user.dataScope || "OWN"}</Badge></td><td className="px-4 py-4 text-slate-500">{timeAgo(user.lastLoginAt)}</td><td className="px-4 py-4"><Badge cls={user.twoFactorEnabled ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-slate-500/10 text-slate-600 border-slate-500/20"}>{user.twoFactorEnabled ? "Bật" : user.role === "ADMIN" ? "Bắt buộc" : "Tắt"}</Badge></td><td className="px-4 py-4"><Badge cls={STATUS_COLORS[user.status]}>{STATUS_LABELS[user.status] || user.status}</Badge></td><td className="px-4 py-4"><ActionMenu user={user} canAdmin={canAdmin} onEdit={() => openEdit(user)} onDetail={() => viewDetail(user)} onReset={() => runUserAction("reset mật khẩu", () => resetUserPasswordAction(user.id), true)} onForce={() => runUserAction("buộc đổi mật khẩu", () => forcePasswordChangeAction(user.id, true), true)} onLock={() => runUserAction("khóa tài khoản", () => lockUserAction(user.id), true)} onUnlock={() => runUserAction("mở khóa", () => unlockUserAction(user.id))} onLogout={() => runUserAction("đăng xuất tất cả thiết bị", () => logoutAllDevicesAction(user.id), true)} onDelete={() => runUserAction("xóa mềm", () => softDeleteUserAction(user.id), true)} onRestore={() => runUserAction("khôi phục", () => restoreUserAction(user.id))} onPermanent={() => { if (confirm("Xóa vĩnh viễn? Thao tác không thể hoàn tác.")) runUserAction("xóa vĩnh viễn", () => permanentDeleteUserAction(user.id), true); }} onInvite={() => runUserAction("gửi lại lời mời", () => resendUserInvitationAction(user.id))} /></td></tr>)}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800"><span>Trang {page}/{totalPages} · {totalCount} bản ghi</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl border px-3 py-1.5 disabled:opacity-40">Trước</button><button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-xl border px-3 py-1.5 disabled:opacity-40">Sau</button></div></div>
        </section>
      </div>

      {formMode && <Modal title={formMode === "create" ? "Thêm thành viên" : "Sửa thông tin thành viên"} onClose={() => setFormMode(null)}><form onSubmit={submitForm} className="space-y-4">{formError && <div className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700"><AlertTriangle className="mr-2 inline h-4 w-4" />{formError}</div>}<div className="grid gap-4 md:grid-cols-2"><Field label="Họ và tên *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} /><Field label="Email *" value={form.email} disabled={formMode === "edit"} onChange={(v) => setForm({ ...form, email: v })} /><Field label="Số điện thoại" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} /><SelectField label="Phòng ban *" value={form.departmentId} onChange={(v) => setForm({ ...form, departmentId: v })} options={departments.map((d) => [d.id, d.name])} /><SelectField label="Vai trò hệ thống *" value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={ROLES.map((r) => [r, ROLE_LABELS[r]])} /><SelectField label="Chức danh" value={form.title} onChange={(v) => setForm({ ...form, title: v })} options={JOB_TITLES_LIST.map((j) => [j, j])} /><SelectField label="Phạm vi dữ liệu *" value={form.dataScope} onChange={(v) => setForm({ ...form, dataScope: v })} options={DATA_SCOPE_OPTIONS.map((s: any) => [s.value, s.label])} /><SelectField label="Trạng thái ban đầu" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={STATUSES.filter((s) => s !== "DELETED").map((s) => [s, STATUS_LABELS[s]])} /></div><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.twoFactorEnabled} onChange={(e) => setForm({ ...form, twoFactorEnabled: e.target.checked })} /> Bật/tắt 2FA</label><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.sendInvite} onChange={(e) => setForm({ ...form, sendInvite: e.target.checked })} /> Gửi email mời tham gia <span className="text-xs text-slate-400">(TODO SMTP nếu đã cấu hình)</span></label><textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Ghi chú" className="min-h-20 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950" /><div className="flex justify-end gap-2 border-t pt-4"><button type="button" onClick={() => setFormMode(null)} className="rounded-2xl border px-4 py-2 font-bold">Hủy</button><button className="rounded-2xl bg-indigo-600 px-5 py-2 font-black text-white">Lưu</button></div></form></Modal>}

      {isDetailOpen && selectedUser && <Modal title="Hồ sơ chi tiết & audit log" onClose={() => setIsDetailOpen(false)} wide><div className="space-y-5"><div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950"><div className="text-xl font-black">{selectedUser.name}</div><div className="text-sm text-slate-500">{selectedUser.email}</div><div className="mt-3 flex flex-wrap gap-2"><Badge cls={ROLE_COLORS[selectedUser.role]}>{ROLE_LABELS[selectedUser.role] || selectedUser.role}</Badge><Badge cls={STATUS_COLORS[selectedUser.status]}>{STATUS_LABELS[selectedUser.status] || selectedUser.status}</Badge><Badge cls="bg-cyan-500/10 text-cyan-700 border-cyan-500/20">{SCOPE_LABELS[selectedUser.dataScope] || selectedUser.dataScope}</Badge></div></div><div><h3 className="mb-3 font-black">Nhật ký thao tác</h3>{auditLogs.length === 0 ? <p className="text-sm text-slate-500">Chưa có audit log.</p> : auditLogs.map((l) => <div key={l.id} className="border-l-2 border-indigo-500 py-2 pl-4 text-sm"><b>{l.action}</b><div className="text-xs text-slate-500">{new Date(l.createdAt).toLocaleString("vi-VN")}</div></div>)}</div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">Lịch sử đăng nhập/thiết bị: đã có action backend, UI chi tiết sẽ nối tiếp sau.</div></div></Modal>}

      {isMatrixOpen && <Modal title="Ma trận phân quyền" onClose={() => setIsMatrixOpen(false)} wide><div className="space-y-4"><div className="flex items-center justify-between"><Select value={matrixRole} onChange={setMatrixRole} options={ROLES.map((r) => [r, ROLE_LABELS[r]])} /><div className="flex gap-2"><button onClick={() => setMatrix({})} className="rounded-xl border px-3 py-2 text-sm font-bold">Reset mặc định</button><button disabled={!canAdmin} onClick={async () => { const res = await saveRolePermissionsMatrix(matrix); notify(res.success ? "Đã lưu ma trận." : res.error || "Không lưu được"); }} className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-black text-white disabled:opacity-40">Lưu cấu hình</button></div></div><div className="max-h-[65vh] overflow-auto rounded-2xl border"><table className="w-full min-w-[900px] text-sm"><thead className="sticky top-0 bg-slate-50 dark:bg-slate-950"><tr><th className="p-3 text-left">Module</th>{PERMISSION_ACTIONS.map((a) => <th key={a.key} className="p-3 text-center">{a.label}</th>)}</tr></thead><tbody>{PERMISSION_MODULES.map((m) => <tr key={m.key} className="border-t dark:border-slate-800"><td className="p-3 font-bold">{m.label}</td>{PERMISSION_ACTIONS.map((a) => <td key={a.key} className="p-3 text-center"><input type="checkbox" disabled={!canAdmin || (matrixRole !== "ADMIN" && m.key === "users" && a.key === "configure")} checked={!!matrix?.[matrixRole]?.[m.key]?.[a.key]} onChange={() => togglePermission(matrixRole, m.key, a.key)} /></td>)}</tr>)}</tbody></table></div></div></Modal>}

      {isImportOpen && <Modal title="Import Excel/CSV" onClose={() => { setIsImportOpen(false); setImportData([]); }}><div className="space-y-4"><p className="text-sm text-slate-500">Upload Excel/CSV để tạo hàng loạt thành viên.</p><button onClick={downloadTemplate} className="w-full rounded-2xl border p-3 font-bold"><FileDown className="mr-2 inline h-4 w-4" />Tải file mẫu</button><label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/50"><Upload className="mb-2 h-6 w-6 text-slate-400" /><span className="text-sm font-bold text-slate-600 dark:text-slate-300">Chọn file CSV</span><input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} /></label>{importData.length > 0 && <div className="rounded-xl border bg-white p-3 dark:bg-slate-950"><div className="mb-2 text-sm font-bold text-slate-700">Preview ({importData.length} dòng)</div><div className="max-h-40 overflow-y-auto text-xs"><table className="w-full text-left"><thead><tr><th className="pb-2">Họ tên</th><th className="pb-2">Email</th><th className="pb-2">Phòng ban</th></tr></thead><tbody>{importData.slice(0, 5).map((r, i) => <tr key={i}><td className="py-1">{r["Họ tên"] || r.name}</td><td className="py-1">{r["Email"] || r.email}</td><td className="py-1">{r["Phòng ban"] || r.departmentId}</td></tr>)}{importData.length > 5 && <tr><td colSpan={3} className="pt-2 text-center text-slate-400">...và {importData.length - 5} dòng khác</td></tr>}</tbody></table></div><button onClick={processImport} disabled={importing} className="mt-3 w-full rounded-xl bg-indigo-600 p-2.5 font-black text-white disabled:opacity-50">{importing ? "Đang xử lý..." : "Xác nhận Import"}</button></div>}</div></Modal>}

      {isExportOpen && <Modal title="Export danh sách" onClose={() => setIsExportOpen(false)}><div className="space-y-3"><button onClick={() => exportRows(false)} className="w-full rounded-2xl border p-3 text-left font-bold">Export theo bộ lọc hiện tại</button><button onClick={() => exportRows(true)} disabled={!selectedIds.length} className="w-full rounded-2xl border p-3 text-left font-bold disabled:opacity-40">Export danh sách đã chọn</button><button onClick={downloadTemplate} className="w-full rounded-2xl border p-3 text-left font-bold">Tải file mẫu import</button></div></Modal>}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: any[] }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950">{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>; }
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: any[] }) { return <label className="space-y-1 text-xs font-black uppercase text-slate-500">{label}<select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium normal-case text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>; }
function Field({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) { return <label className="space-y-1 text-xs font-black uppercase text-slate-500">{label}<input disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium normal-case text-slate-800 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100" /></label>; }
function Badge({ children, cls }: { children: React.ReactNode; cls?: string }) { return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${cls || "bg-slate-100 text-slate-600 border-slate-200"}`}>{children}</span>; }
function Modal({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><div className={`max-h-[90vh] w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 ${wide ? "max-w-6xl" : "max-w-2xl"}`}><div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800"><h2 className="text-lg font-black text-slate-900 dark:text-white">{title}</h2><button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button></div><div className="max-h-[78vh] overflow-y-auto p-5">{children}</div></div></div>; }
function ActionMenu(props: any) { const [open, setOpen] = useState(false); const item = (label: string, fn: () => void, icon?: React.ReactNode, danger = false) => <button onClick={() => { setOpen(false); fn(); }} className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 ${danger ? "text-rose-600" : "text-slate-700 dark:text-slate-200"}`}>{icon}{label}</button>; return <div className="relative"><button onClick={() => setOpen(!open)} className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><MoreHorizontal className="h-4 w-4" /></button>{open && <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">{item("Xem chi tiết", props.onDetail, <UserCog className="h-4 w-4" />)}{item("Sửa thông tin", props.onEdit, <UserCog className="h-4 w-4" />)}{item("Reset mật khẩu", props.onReset, <KeyRound className="h-4 w-4" />)}{item("Buộc đổi mật khẩu lần sau", props.onForce, <RefreshCw className="h-4 w-4" />)}{props.user.status === "LOCKED" ? item("Mở khóa tài khoản", props.onUnlock, <Unlock className="h-4 w-4" />) : item("Khóa tài khoản", props.onLock, <Lock className="h-4 w-4" />)}{item("Gửi lại lời mời", props.onInvite, <Upload className="h-4 w-4" />)}{item("Đăng xuất khỏi tất cả thiết bị", props.onLogout, <Shield className="h-4 w-4" />)}{props.user.status === "DELETED" ? item("Khôi phục", props.onRestore, <RotateCcw className="h-4 w-4" />) : item("Xóa mềm", props.onDelete, <Trash2 className="h-4 w-4" />, true)}{props.canAdmin && item("Xóa vĩnh viễn", props.onPermanent, <Trash2 className="h-4 w-4" />, true)}</div>}</div>; }
