import { getTickets, getSlaBreaches, getStaffUsers } from "./actions";
import { getCurrentActor } from "@/src/libs/server/auth-helper";
import TicketsClient from "./tickets-client";

export const metadata = { title: "CSKH Phụ huynh – MIS Portal" };

export default async function TicketsPage() {
  const [tickets, slaBreaches, staffUsers, actor] = await Promise.all([
    getTickets(),
    getSlaBreaches(),
    getStaffUsers(),
    getCurrentActor(),
  ]);

  return (
    <TicketsClient
      initialTickets={tickets}
      initialSlaBreaches={slaBreaches}
      staffUsers={staffUsers}
      currentActor={actor}
    />
  );
}
