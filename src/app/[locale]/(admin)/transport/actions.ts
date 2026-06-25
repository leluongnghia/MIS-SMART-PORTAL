'use server';

import { listRoutes, listVehicles } from '@/src/libs/server/transport';

export async function fetchTransportRoutes() {
  return await listRoutes();
}

export async function fetchTransportVehicles() {
  return await listVehicles();
}
