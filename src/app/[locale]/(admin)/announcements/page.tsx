import AnnouncementsClient from "./announcements-client";
import { getInitialData } from "./actions";

export default async function AnnouncementsPage() {
  const data = await getInitialData();
  return <AnnouncementsClient initialData={data} />;
}
