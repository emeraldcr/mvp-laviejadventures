import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface OperatorAccount {
  _id?: ObjectId;
  name: string;
  company: string;
  email: string;
  password: string;
  status: "pending" | "approved" | "active";
  commissionRate: number;
  createdAt: Date;
}

export async function getOperatorsCollection() {
  const db = await getDb();
  return db.collection<OperatorAccount>("operators");
}

export async function findOperatorByEmail(email: string) {
  const col = await getOperatorsCollection();
  return col.findOne({ email: email.toLowerCase() });
}

export async function findOperatorById(id: string) {
  const col = await getOperatorsCollection();
  return col.findOne({ _id: new ObjectId(id) });
}

export async function createOperator(data: Omit<OperatorAccount, "_id">) {
  const col = await getOperatorsCollection();
  const result = await col.insertOne(data);
  return result;
}

export async function updateOperator(id: string, update: Partial<OperatorAccount>) {
  const col = await getOperatorsCollection();
  return col.updateOne({ _id: new ObjectId(id) }, { $set: update });
}

export async function listOperators() {
  const col = await getOperatorsCollection();
  return col.find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
}
