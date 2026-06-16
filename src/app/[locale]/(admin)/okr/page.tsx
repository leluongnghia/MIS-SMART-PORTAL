import OkrClient from "./okr-client";
import { getInitialData } from "./actions";

export default async function OkrPage() {
  const data = await getInitialData();
  return <OkrClient initialData={data} />;
}
