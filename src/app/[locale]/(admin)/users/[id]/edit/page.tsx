import { redirect } from "next/navigation";
import { getUserById, getDepartmentsForSelect, getUsersForSelect } from "../../actions";
import UserEditClient from "./user-edit-client";
import { getCurrentActor, isAdminTruong, isTruongPhong } from "@/src/libs/server/auth-helper";

export default async function UserEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const actor = await getCurrentActor();
  if (!actor) redirect(`/${locale}/dashboard`);

  const result = await getUserById(id);
  if (result.error || !result.user) redirect(`/${locale}/users`);

  const user = result.user;

  // Permission check: only admin or manager in same dept can edit
  const canEdit =
    isAdminTruong(actor) ||
    (isTruongPhong(actor) && actor.departmentId === user.departmentId && user.role === "STAFF");

  if (!canEdit) redirect(`/${locale}/users/${id}`);

  const departments = await getDepartmentsForSelect();
  const usersForSelect = await getUsersForSelect();

  return (
    <UserEditClient
      locale={locale}
      user={user as any}
      departments={departments}
      usersForSelect={usersForSelect}
      actor={actor as any}
    />
  );
}
