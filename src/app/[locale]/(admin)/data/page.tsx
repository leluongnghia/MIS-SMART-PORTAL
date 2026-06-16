import DataClient from "./data-client";
import { getInitialData } from "./actions";

export default async function DataPage() {
  const data = await getInitialData();
  return <DataClient initialData={data} />;
}
