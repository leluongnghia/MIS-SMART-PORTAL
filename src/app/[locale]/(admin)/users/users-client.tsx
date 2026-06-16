"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getUsersList, createUserAction, updateUserAction, softDeleteUserAction, restoreUserAction, getAuditLogsForUser } from "./actions";
import { 
  Search, UserPlus, Edit2, Trash2, RotateCcw, 
  X, Shield, Mail, Phone, Calendar, Info, ExternalLink,
  CheckCircle, AlertTriangle, UserMinus, Clock 
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
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  createdBy: string | null;
};

type Department = {
  id: string;
  name: string;
  code: string;
};

export default function UsersClient({ locale, initialActor }: { locale: string; initialActor: any }) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [actor, setActor] = useState(initialActor);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters state
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showTrash, setShowTrash] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userAuditLogs, setUserAuditLogs] = useState<any[]>([]);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<'ADMIN' | 'MANAGER' | 'STAFF'>('STAFF');
  const [formDept, setFormDept] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INVITED' | 'SUSPENDED'>('ACTIVE');
  const [formError, setFormError] = useState("");

  const loadUsers = () => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const res = await getUsersList({
          search,
          roleFilter,
          deptFilter,
          statusFilter,
          page,
          showTrash
        });
        setUsers(res.users as any);
        setDepartments(res.departments);
        setTotalPages(res.totalPages);
        setTotalCount(res.totalCount);
        setActor(res.actor);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, deptFilter, statusFilter, page, showTrash]);

  // Open User Detail + audit history
  const handleViewDetails = async (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
    setUserAuditLogs([]);
    try {
      const logs = await getAuditLogsForUser(user.id);
      setUserAuditLogs(logs);
    } catch (err) {
      console.error(err);
    }
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole('STAFF');
    // Lock department for manager, default to BGH for admin or first dept
    setFormDept(actor.role === 'MANAGER' ? actor.departmentId || "" : departments[0]?.id || "");
    setFormTitle("");
    setFormStatus('ACTIVE');
    setFormError("");
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || formName.trim().length < 2) {
      setFormError("Họ tên phải chứa ít nhất 2 ký tự.");
      return;
    }
    if (!formEmail || !/\S+@\S+\.\S+/.test(formEmail)) {
      setFormError("Email không hợp lệ.");
      return;
    }
    if (!formDept) {
      setFormError("Phòng ban là bắt buộc.");
      return;
    }

    try {
      const res = await createUserAction({
        name: formName,
        email: formEmail,
        phone: formPhone,
        departmentId: formDept,
        role: formRole,
        title: formTitle,
        status: formStatus
      });

      if (res.success) {
        setIsCreateOpen(false);
        loadUsers();
      } else {
        setFormError(res.error || "Có lỗi xảy ra.");
      }
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  // Open Edit Form
  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email || "");
    setFormPhone(user.phone || "");
    setFormRole(user.role as any);
    setFormDept(user.departmentId || "");
    setFormTitle(user.title || "");
    setFormStatus(user.status as any);
    setFormError("");
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || formName.trim().length < 2) {
      setFormError("Họ tên phải chứa ít nhất 2 ký tự.");
      return;
    }
    if (!selectedUser) return;

    try {
      const res = await updateUserAction(selectedUser.id, {
        name: formName,
        phone: formPhone,
        departmentId: formDept,
        role: formRole,
        title: formTitle,
        status: formStatus
      });

      if (res.success) {
        setIsEditOpen(false);
        loadUsers();
      } else {
        setFormError(res.error || "Có lỗi xảy ra.");
      }
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (user: User) => {
    if (confirm(`Bạn có chắc chắn muốn xóa mềm thành viên "${user.name}"?`)) {
      const res = await softDeleteUserAction(user.id);
      if (res.success) {
        loadUsers();
      } else {
        alert(res.error);
      }
    }
  };

  const handleRestore = async (user: User) => {
    const res = await restoreUserAction(user.id);
    if (res.success) {
      loadUsers();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Quản lý thành viên
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {actor.role === 'ADMIN' ? 'Ban giám hiệu quản trị toàn trường' : `Trưởng phòng quản trị bộ phận: ${departments.find(d => d.id === actor.departmentId)?.name || 'Chưa rõ'}`}
          </p>
        </div>
        <button
          onClick={() => router.push(`/${locale}/users/new`)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition duration-200"
        >
          <UserPlus className="h-5 w-5" />
          Thêm thành viên
        </button>
      </div>

      {/* Tabs for Admin (Active vs Trash) */}
      {actor.role === 'ADMIN' && (
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => { setShowTrash(false); setPage(1); }}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
              !showTrash
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Đang hoạt động ({!showTrash ? totalCount : '...'})
          </button>
          <button
            onClick={() => { setShowTrash(true); setPage(1); }}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
              showTrash
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Thành viên đã xóa ({showTrash ? totalCount : '...'})
          </button>
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên, email, sđt..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="">Tất cả Vai trò</option>
            <option value="ADMIN">Ban Giám hiệu (ADMIN)</option>
            <option value="MANAGER">Trưởng phòng (MANAGER)</option>
            <option value="STAFF">Nhân viên / Giáo viên (STAFF)</option>
          </select>
        </div>

        {actor.role === 'ADMIN' && (
          <div>
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">Tất cả Phòng ban</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="">Tất cả Trạng thái</option>
            <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
            <option value="INVITED">Đã mời (INVITED)</option>
            <option value="SUSPENDED">Đã khóa (SUSPENDED)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold animate-pulse">Đang tải dữ liệu thành viên...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Info className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">Không tìm thấy thành viên nào</h3>
            <p className="text-sm text-slate-400 mt-1">Hãy thay đổi bộ lọc hoặc thêm thành viên mới.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Họ tên / Email</th>
                  <th className="py-4 px-6">Điện thoại</th>
                  <th className="py-4 px-6">Bộ phận</th>
                  <th className="py-4 px-6">Vai trò / Chức danh</th>
                  <th className="py-4 px-6 text-center">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {users.map((user) => {
                  const dept = departments.find((d) => d.id === user.departmentId);
                  const statusColors: Record<string, string> = {
                    ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                    INVITED: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                    SUSPENDED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
                    DELETED: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
                  };

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-base uppercase shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 hover:underline block truncate text-left"
                          >
                            {user.name}
                          </button>
                          <span className="text-xs text-slate-400 truncate block mt-0.5">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono text-xs">
                        {user.phone || "—"}
                      </td>
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-semibold">
                        {dept?.name || "BGH / Toàn trường"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="block font-bold text-xs uppercase text-indigo-600 dark:text-indigo-400">
                          {user.role}
                        </span>
                        <span className="text-xs text-slate-400 block mt-0.5">{user.title || "Chưa gán chức danh"}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black border ${statusColors[user.status] || ''}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1 shrink-0">
                        {showTrash ? (
                          <button
                            onClick={() => handleRestore(user)}
                            title="Khôi phục tài khoản"
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-emerald-600 dark:text-emerald-400 transition inline-block"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => router.push(`/${locale}/users/${user.id}`)}
                              title="Xem hồ sơ thành viên"
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition inline-block"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/${locale}/users/${user.id}/edit`)}
                              title="Chỉnh sửa hồ sơ"
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 transition inline-block"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              title="Xóa mềm"
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-rose-600 dark:text-rose-400 transition inline-block"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-3 px-6 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Hiển thị trang {page} / {totalPages} (Tổng số {totalCount} thành viên)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
              >
                Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-slate-800 dark:text-white text-lg">Tạo thành viên mới</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Họ tên *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="username@mis.edu.vn"
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="09xxxxxxxx"
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {actor.role === 'ADMIN' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vai trò *</label>
                      <select
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value as any)}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="STAFF">Nhân viên / Giáo viên</option>
                        <option value="MANAGER">Trưởng phòng</option>
                        <option value="ADMIN">Ban Giám hiệu (Admin)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phòng ban *</label>
                      <select
                        value={formDept}
                        onChange={(e) => setFormDept(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                  <p><strong>Bộ phận:</strong> {departments.find(d => d.id === actor.departmentId)?.name || actor.departmentId}</p>
                  <p><strong>Vai trò được tạo:</strong> Giáo viên / Nhân viên (STAFF) <span className="text-[10px] text-slate-400 italic">(Cố định theo quyền của Trưởng phòng)</span></p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Chức danh / Tiêu đề</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Giáo viên môn Toán, Chuyên viên Tuyển sinh..."
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Trạng thái ban đầu</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                  <option value="INVITED">Gửi lời mời (INVITED)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
                >
                  Tạo thành viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-slate-800 dark:text-white text-lg">Cập nhật thành viên</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Họ tên *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {actor.role === 'ADMIN' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vai trò *</label>
                      <select
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value as any)}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="STAFF">Nhân viên / Giáo viên</option>
                        <option value="MANAGER">Trưởng phòng</option>
                        <option value="ADMIN">Ban Giám hiệu (Admin)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phòng ban *</label>
                      <select
                        value={formDept}
                        onChange={(e) => setFormDept(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                  <p><strong>Bộ phận:</strong> {departments.find(d => d.id === selectedUser.departmentId)?.name || selectedUser.departmentId}</p>
                  <p><strong>Vai trò:</strong> {selectedUser.role} <span className="text-[10px] text-slate-400 italic">(Trưởng phòng không thể thay đổi thông tin hệ thống của nhân viên)</span></p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Chức danh / Tiêu đề</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Trạng thái tài khoản</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                  <option value="INVITED">Đã mời (INVITED)</option>
                  <option value="SUSPENDED">Khóa tài khoản (SUSPENDED)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-sm font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL SIDE PANEL / MODAL */}
      {isDetailOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-end">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-slate-800 dark:text-white text-lg">Hồ sơ chi tiết</h3>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Card */}
              <div className="text-center space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="h-20 w-20 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-3xl mx-auto uppercase">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800 dark:text-white">{selectedUser.name}</h4>
                  <p className="text-sm text-slate-400 mt-0.5">{selectedUser.title || "Chức danh chưa xác định"}</p>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black border ${
                  selectedUser.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                }`}>
                  {selectedUser.status}
                </span>
              </div>

              {/* Info Details */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Thông tin liên hệ & Quyền</h5>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">{selectedUser.email || "Không có Email"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">{selectedUser.phone || "Không có SĐT"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-indigo-500" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white text-xs uppercase block">{selectedUser.role}</span>
                      <span className="text-xs text-slate-400">{selectedUser.roleName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500 text-xs">
                      Tạo ngày: {new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Audit logs Timeline */}
              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Nhật ký thao tác
                </h5>
                {userAuditLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Chưa có nhật ký hoạt động cho thành viên này.</p>
                ) : (
                  <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-4">
                    {userAuditLogs.map((log) => (
                      <div key={log.id} className="relative text-xs">
                        {/* Bullet */}
                        <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-indigo-500 border border-white dark:border-slate-900" />
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-300">{log.action}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(log.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
