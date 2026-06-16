import StudentsClient from "./students-client";
import { getInitialData } from "./actions";

export default async function StudentsPage() {
  const data = await getInitialData();
  return <StudentsClient initialData={data} />;
}
