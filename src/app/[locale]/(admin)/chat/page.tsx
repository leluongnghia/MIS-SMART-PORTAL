import { redirect } from "next/navigation";
import { getCurrentActor } from "@/src/libs/server/auth-helper";
import ChatClient from "./chat-client";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const actor = await getCurrentActor();
  if (!actor) {
    redirect(`/${locale}/dashboard`);
  }

  return <ChatClient locale={locale} initialActor={actor} />;
}
