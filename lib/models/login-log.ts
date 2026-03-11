import { getDb } from "@/lib/mongodb";

export interface LoginLog {
  userType: "admin" | "operator" | "user";
  userId?: string;
  emailOrUsername: string;
  device: string;
  ip?: string;
  createdAt: Date;
}

async function getLoginLogsCollection() {
  const db = await getDb();
  return db.collection<LoginLog>("login_logs");
}

export async function createLoginLog(log: LoginLog) {
  const col = await getLoginLogsCollection();
  return col.insertOne(log);
}

export async function listLoginLogs(limit = 300) {
  const col = await getLoginLogsCollection();
  return col.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
}
