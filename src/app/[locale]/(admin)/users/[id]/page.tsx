import { redirect } from "next/navigation";
import { getUserById } from "../actions";
import UserProfileClient from "./user-profile-client";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const result = await getUserById(id);

  if (result.error === "UNAUTHORIZED") {
    redirect(`/${locale}/dashboard`);
  }
  if (result.error === "FORBIDDEN") {
    redirect(`/${locale}/dashboard`);
  }
  if (result.error === "NOT_FOUND" || !result.user) {
    redirect(`/${locale}/users`);
  }

  return (
    <UserProfileClient
      locale={locale}
      user={result.user as any}
      departments={result.departments}
      manager={result.manager as any}
      actor={result.actor as any}
    />
  );
}
