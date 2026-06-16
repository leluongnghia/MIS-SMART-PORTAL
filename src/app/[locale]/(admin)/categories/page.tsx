import CategoriesClient from "./categories-client";
import { getInitialData } from "./actions";

export default async function CategoriesPage() {
  const data = await getInitialData();
  return <CategoriesClient initialData={data} />;
}
