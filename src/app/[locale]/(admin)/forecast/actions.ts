"use server";

import { db, schema } from "@/src/libs/server/db";
import { revalidatePath } from "next/cache";
import { getCurrentActor, isAdminTruong, isTruongPhong, writeAuditLog } from "@/src/libs/server/auth-helper";
import { getJsonSetting, setJsonSetting } from "@/src/libs/server/module-settings";

const FORECAST_PARAMS_KEY = 'forecast:model_params';
const FORECAST_SCENARIOS_KEY = 'forecast:saved_scenarios';
const defaultForecastParams = {
  admissionsGrowth: 12,
  tuitionReminderRate: 85,
  attendanceHealthRate: 96,
  turnoverRetentionRate: 90,
};

function canManageForecast(actor: Awaited<ReturnType<typeof getCurrentActor>>) {
  return !!actor && (isAdminTruong(actor) || isTruongPhong(actor) || actor.workspaceId === 'BGH');
}

export async function getInitialData() {
  try {
    const data = await db.select().from(schema.tasks || schema.tasks);
    return {
      data,
      params: await getJsonSetting(FORECAST_PARAMS_KEY, defaultForecastParams),
      scenarios: await getJsonSetting<any[]>(FORECAST_SCENARIOS_KEY, []),
    };
  } catch (e) {
    return { data: [], params: defaultForecastParams, scenarios: [] };
  }
}

export async function saveForecastScenario(input: { metric: string; params: typeof defaultForecastParams; summary: any }) {
  try {
    const actor = await getCurrentActor();
    if (!canManageForecast(actor)) return { success: false, error: 'Unauthorized' };
    const current = await getJsonSetting<any[]>(FORECAST_SCENARIOS_KEY, []);
    const scenario = {
      id: `forecast_${Date.now()}`,
      metric: input.metric,
      params: input.params,
      summary: input.summary,
      actorId: actor?.id,
      actorName: actor?.name,
      createdAt: new Date().toISOString(),
    };
    await setJsonSetting(FORECAST_PARAMS_KEY, input.params, { group: 'forecast', label: 'Forecast model params', updatedBy: actor?.id });
    await setJsonSetting(FORECAST_SCENARIOS_KEY, [scenario, ...current].slice(0, 24), { group: 'forecast', label: 'Forecast scenarios', updatedBy: actor?.id });
    await writeAuditLog(actor?.id || null, 'save_forecast_scenario', 'forecast', scenario.id, { after: scenario, module: 'forecast' });
    revalidatePath('/[locale]/forecast', 'layout');
    return { success: true, data: scenario };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
