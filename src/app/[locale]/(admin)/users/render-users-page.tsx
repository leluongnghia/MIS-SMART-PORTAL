import { checkAccess } from './actions';
import UsersClient from './users-client';

function PermissionAccessDenied() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <h2 className="text-lg font-black">Không có quyền truy cập</h2>
      <p className="mt-2 text-sm font-medium">
        Màn hình quản lý người dùng và phân quyền chỉ dành cho Admin hoặc cấp quản lý được phân quyền.
      </p>
    </div>
  );
}

export async function renderUsersPage(locale: string) {
  const check = await checkAccess();
  if (!check.authorized) {
    return <PermissionAccessDenied />;
  }

  return <UsersClient locale={locale} initialActor={check.actor!} />;
}
