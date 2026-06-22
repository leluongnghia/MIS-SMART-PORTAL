import Client from "../tasks-client";
import { getInitialData } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const data = await getInitialData();
  return <Client initialData={data} defaultTaskId={taskId} />;
}
