import { getTickets, getSlaBreaches, getStaffUsers, getStudents, getClasses, getTicketStats } from "./actions";
import { getCurrentActor } from "@/src/libs/server/auth-helper";
import TicketsClient from "./tickets-client";

export const metadata = { title: "CSKH Phụ huynh – MIS Portal" };

export default async function TicketsPage() {
  const [tickets, slaBreaches, staffUsers, actor, students, classes, initialStats] = await Promise.all([
    getTickets(),
    getSlaBreaches(),
    getStaffUsers(),
    getCurrentActor(),
    getStudents(),
    getClasses(),
    getTicketStats(),
  ]);

  return (
    <TicketsClient
      initialTickets={tickets}
      initialSlaBreaches={slaBreaches}
      staffUsers={staffUsers}
      currentActor={actor}
      students={students}
      classes={classes}
      initialStats={initialStats}
    />
  );
}
