import { checkAccess } from './actions';
import UsersClient from './users-client';

function PermissionAccessDenied() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <h2 className="text-lg font-black">Khong co quyen truy cap</h2>
      <p className="mt-2 text-sm font-medium">
        Man hinh quan ly nguoi dung va phan quyen chi danh cho Admin hoac cap quan ly duoc phan quyen.
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
