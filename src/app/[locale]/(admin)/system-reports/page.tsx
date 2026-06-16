
import SystemReportsClient from "./system-reports-client";
import { getInitialData } from "./actions";

export default async function SystemReportsPage() {
  const data = await getInitialData();
  return <SystemReportsClient initialData={data} />;
}

