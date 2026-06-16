import RiskClient from "./risk-client";
import { getInitialData } from "./actions";

export default async function RiskPage() {
  const data = await getInitialData();
  return <RiskClient initialData={data} />;
}
