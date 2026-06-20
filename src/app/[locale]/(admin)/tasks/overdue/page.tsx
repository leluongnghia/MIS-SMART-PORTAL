import Client from "./overdue-client";
import { getInitialData } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OverduePage() {
  const data = await getInitialData();
  return <Client initialData={data} />;
}
