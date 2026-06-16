import DirectivesClient from "./directives-client";
import { getInitialData } from "./actions";

export default async function DirectivesPage() {
  const data = await getInitialData();
  return <DirectivesClient initialData={data} />;
}
