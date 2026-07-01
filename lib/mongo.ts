import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI ?? "";
const MONGODB_DB = process.env.MONGODB_DB ?? "lva";

if (!MONGODB_URI) {
  // Allow runtime to fail later if no URI provided
}

let cached: { client: MongoClient; dbName: string } | null = (global as any)._mongoClient || null;

export async function getDb() {
  if (!cached) {
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
