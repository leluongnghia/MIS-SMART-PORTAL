import { redirect } from "next/navigation";
import { checkAccess } from "./actions";
import UsersClient from "./users-client";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const check = await checkAccess();
  if (!check.authorized) {
    if (check.reason === "UNAUTHORIZED") {
      redirect(`/${locale}/dashboard`);
    }
    // 403 or redirect
    redirect(`/${locale}/dashboard`);
  }

  return <UsersClient locale={locale} initialActor={check.actor!} />;
}
