import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI ?? "";
const MONGODB_DB = process.env.MONGODB_DB ?? "lva";

let cached: { client: MongoClient; dbName: string } | null = (global as any)._mongoClient || null;

export async function getDb() {
  if (!cached) {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI env var is not set");
    }
    const client = new MongoClient(MONGODB_URI, {});
    await client.connect();
    cached = { client, dbName: MONGODB_DB };
    (global as any)._mongoClient = cached;
  }
  return cached!.client.db(cached!.dbName);
}

export async function closeClient() {
  if (cached) {
    await cached.client.close();
    cached = null;
    (global as any)._mongoClient = null;
  }
}
