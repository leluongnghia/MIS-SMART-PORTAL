import KpiClient from "./kpi-client";
import { getInitialData } from "./actions";

export default async function KpiPage() {
  const data = await getInitialData();
  return <KpiClient initialData={data} />;
}
