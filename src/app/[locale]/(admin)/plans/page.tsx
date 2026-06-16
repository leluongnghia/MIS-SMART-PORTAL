import PlansClient from "./plans-client";
import { getInitialData } from "./actions";

export default async function PlansPage() {
  const data = await getInitialData();
  return <PlansClient initialData={data} />;
}
