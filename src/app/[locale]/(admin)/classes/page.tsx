import ClassesClient from "./classes-client";
import { getInitialData } from "./actions";

export default async function ClassesPage() {
  const data = await getInitialData();
  return <ClassesClient initialData={data} />;
}
