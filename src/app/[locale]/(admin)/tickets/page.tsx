import { getTickets, getSlaBreaches } from "./actions";
import TicketsClient from "./tickets-client";

export const metadata = { title: "CSKH Phụ huynh – MIS Portal" };

export default async function TicketsPage() {
  const [tickets, slaBreaches] = await Promise.all([getTickets(), getSlaBreaches()]);
  return <TicketsClient initialTickets={tickets} initialSlaBreaches={slaBreaches} />;
}
