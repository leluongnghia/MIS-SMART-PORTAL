import { setRequestLocale } from 'next-intl/server';
import FacilitiesClient from './facilities-client';
import {
  getLocations,
  getAssets,
  getRepairRequests,
  getPurchaseRequests,
  getSupplies,
  getSuppliers,
  getSafetyChecks,
  getBookings,
  getRenovationProjects
} from './actions';

export const metadata = {
  title: 'CSVC, Thiết bị & Mua sắm | MIS Smart Portal',
  description: 'Quản lý phòng học, thiết bị, sửa chữa, bảo trì, mua sắm, bàn giao và kiểm kê.',
};

export default async function FacilitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  setRequestLocale(resolvedParams.locale);

  const [
    locationsRes, assetsRes, repairsRes,
    suppliesRes, suppliersRes, safetyChecksRes, bookingsRes, renovationsRes
  ] = await Promise.all([
    getLocations(),
    getAssets(),
    getRepairRequests(),
    getSupplies(),
    getSuppliers(),
    getSafetyChecks(),
    getBookings(),
    getRenovationProjects()
  ]);

  const locations = locationsRes.success ? locationsRes.data : [];
  const assets = assetsRes.success ? assetsRes.data : [];
  const repairRequests = repairsRes.success ? repairsRes.data : [];
  const supplies = suppliesRes.success ? suppliesRes.data : [];
  const suppliers = suppliersRes.success ? suppliersRes.data : [];
  const safetyChecks = safetyChecksRes.success ? safetyChecksRes.data : [];
  const bookings = bookingsRes.success ? bookingsRes.data : [];
  const renovationProjects = renovationsRes.success ? renovationsRes.data : [];

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CSVC, Thiết bị & Mua sắm</h1>
          <p className="text-muted-foreground">
            Quản lý phòng học, thiết bị, sửa chữa, bảo trì, mua sắm, bàn giao và kiểm kê.
          </p>
        </div>
      </div>
      <FacilitiesClient 
        initialLocations={locations} 
        initialAssets={assets} 
        initialRepairRequests={repairRequests} 
        initialSupplies={supplies}
        initialSuppliers={suppliers}
        initialSafetyChecks={safetyChecks}
        initialBookings={bookings}
        initialRenovationProjects={renovationProjects}
      />
    </div>
  );
}
