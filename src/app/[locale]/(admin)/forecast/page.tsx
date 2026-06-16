import ForecastClient from "./forecast-client";
import { getInitialData } from "./actions";

export default async function ForecastPage() {
  const data = await getInitialData();
  return <ForecastClient initialData={data} />;
}
