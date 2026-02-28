import { getDb } from "@/lib/mongodb";

export type PackageConfig = {
  id: string;
  name: string;
  priceCRC: number;
};

export type TourPricingOverride = {
  tourId: string;
  packages: PackageConfig[];
};

export interface B2BSettings {
  _id?: string;
  ivaRate: number;
  tourPricing: TourPricingOverride[];
  updatedAt: Date;
}

const SETTINGS_KEY = "default";

async function getSettingsCollection() {
  const db = await getDb();
  return db.collection<B2BSettings & { _id: string }>("b2b_settings");
}

export async function getB2BSettings() {
  const col = await getSettingsCollection();
  return col.findOne({ _id: SETTINGS_KEY });
}

export async function upsertB2BSettings(input: { ivaRate: number; tourPricing: TourPricingOverride[] }) {
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
