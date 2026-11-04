import { createHash } from "node:crypto";
import { getDb } from "@/lib/data/mongodb";

let indexReady: Promise<string> | undefined;

// Shared across instances: the unique _id makes concurrent increments atomic.
// Counters remain enforceable independently of asynchronous TTL cleanup.
export async function allowRequest(key: string, limit: number, windowMs = 60_000): Promise<boolean> {
  const bucket = Math.floor(Date.now() / windowMs);
  const id = createHash("sha256").update(`${key}:${bucket}`).digest("hex");
  const collection = (await getDb()).collection<{ _id: string; count: number; expiresAt: Date }>("security_rate_limits");
  indexReady ??= collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(error => { indexReady = undefined; throw error; });
  await indexReady;
  const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 2) * windowMs) } };
  try {
    const result = await collection.findOneAndUpdate({ _id: id }, update, { upsert: true, returnDocument: "after" });
    return Boolean(result && result.count <= limit);
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    const result = await collection.findOneAndUpdate({ _id: id }, { $inc: { count: 1 } }, { returnDocument: "after" });
    return Boolean(result && result.count <= limit);
  }
}
