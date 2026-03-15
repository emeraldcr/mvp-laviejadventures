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

export async function listHeroSloganLogs(limit = 200) {
  const collection = await getHeroSloganCollection();
  const docs = await collection
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return docs.map((doc) => ({
    _id: doc._id.toString(),
    es: doc.es,
    en: doc.en,
    model: doc.model,
    prompt: doc.prompt,
    rawResponse: doc.rawResponse,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
  }));
}
