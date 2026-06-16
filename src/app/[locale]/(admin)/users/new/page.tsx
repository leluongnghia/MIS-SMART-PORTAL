import { redirect } from "next/navigation";
import { getDepartmentsForSelect } from "../actions";
import UserCreateClient from "./user-create-client";
import { getCurrentActor } from "@/src/libs/server/auth-helper";

export default async function UserNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const actor = await getCurrentActor();
  if (!actor) redirect(`/${locale}/dashboard`);

  // Only ADMIN and MANAGER can create users
  if (actor.role === "STAFF") {
    redirect(`/${locale}/dashboard`);
  }

  const departments = await getDepartmentsForSelect();

  return (
    <UserCreateClient
      locale={locale}
      departments={departments}
      actor={actor as any}
    />
  );
}
