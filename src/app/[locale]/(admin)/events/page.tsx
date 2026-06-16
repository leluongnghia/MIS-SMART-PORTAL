import EventsClient from "./events-client";
import { getInitialData } from "./actions";

export default async function EventsPage() {
  const data = await getInitialData();
  return <EventsClient initialData={data} />;
}
