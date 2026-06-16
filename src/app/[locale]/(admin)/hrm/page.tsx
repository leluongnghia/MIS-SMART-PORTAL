import HrmClient from "./hrm-client";
import { getInitialData } from "./actions";

export default async function HrmPage() {
  const data = await getInitialData();
  return <HrmClient initialData={data} />;
}
