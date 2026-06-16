import Client from "./tasks-client";
import { getInitialData } from "./actions";

export default async function Page() {
  const data = await getInitialData();
  return <Client initialData={data} />;
}
