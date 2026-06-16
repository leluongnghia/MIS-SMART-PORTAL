import { redirect } from "next/navigation";
import { getCurrentActor } from "@/src/libs/server/auth-helper";
import { db, schema } from "@/src/libs/server/db";
import { eq } from "drizzle-orm";
import ProfileClient from "./profile-client";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const actor = await getCurrentActor();
  if (!actor) redirect(`/${locale}/dashboard`);

  // Load full user data
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, actor.id))
    .limit(1);

  if (!user) redirect(`/${locale}/dashboard`);

  const departments = await db.select().from(schema.departments);

  return (
    <ProfileClient
      locale={locale}
      user={user as any}
      departments={departments}
      actor={actor as any}
    />
  );
}
