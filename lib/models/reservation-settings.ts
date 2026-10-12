import { getDb } from "@/lib/helpers/mongodb";
import { COLLECTIONS } from "@/lib/constants/db";

export type PackageConfig = {
  id: string;
  name: string;
  priceCRC: number;
};

export type TourPricingOverride = {
  tourId: string;
  packages: PackageConfig[];
};

export interface ReservationSettings {
  _id?: string;
  ivaRate: number;
  tourPricing: TourPricingOverride[];
  updatedAt: Date;
}

const SETTINGS_KEY = "default";

async function getSettingsCollection() {
  const db = await getDb();
  return db.collection<ReservationSettings & { _id: string }>(COLLECTIONS.RESERVATION_SETTINGS);
}

export async function getReservationSettings() {
  const col = await getSettingsCollection();
  return col.findOne({ _id: SETTINGS_KEY });
}

export async function upsertReservationSettings(input: { ivaRate: number; tourPricing: TourPricingOverride[] }) {
  const col = await getSettingsCollection();
  await col.updateOne(
    { _id: SETTINGS_KEY },
    {
      $set: {
        ivaRate: input.ivaRate,
        tourPricing: input.tourPricing,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  return col.findOne({ _id: SETTINGS_KEY });
}
