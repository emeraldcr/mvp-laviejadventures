import { COLLECTIONS } from "@/lib/constants/db";
import { getDb } from "@/lib/mongodb";

export interface HeroSloganLog {
  es: string;
  en: string;
  model: string;
  prompt: string;
  rawResponse: string;
  createdAt: Date;
}

async function getHeroSloganCollection() {
  const db = await getDb();
  return db.collection<HeroSloganLog>(COLLECTIONS.HERO_SLOGANS);
}

export async function createHeroSloganLog(log: HeroSloganLog) {
  const collection = await getHeroSloganCollection();
  return collection.insertOne(log);
}
