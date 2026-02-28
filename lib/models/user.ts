import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface AppUser {
  _id?: ObjectId;
  email: string;
  name: string;
  passwordHash?: string;
  auth0Sub?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

async function getUsersCollection() {
  const db = await getDb();
  return db.collection<AppUser>("users");
}

export async function findUserByEmail(email: string) {
  const users = await getUsersCollection();
  return users.findOne({ email: email.toLowerCase() });
}

export async function createCredentialsUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}) {
  const users = await getUsersCollection();
  const now = new Date();
  const result = await users.insertOne({
    email: input.email.toLowerCase(),
    name: input.name,
    passwordHash: input.passwordHash,
    createdAt: now,
    updatedAt: now,
  });

  return users.findOne({ _id: result.insertedId });
}

export async function upsertUserFromAuth0(input: {
  auth0Sub?: string;
  email?: string;
  name?: string;
  image?: string;
}) {
  if (!input.email) return null;

  const users = await getUsersCollection();
  const now = new Date();
  const email = input.email.toLowerCase();

  const existing = await users.findOne({ email });
  if (existing) {
    await users.updateOne(
      { _id: existing._id },
      {
        $set: {
          auth0Sub: input.auth0Sub ?? existing.auth0Sub,
          name: input.name ?? existing.name,
          image: input.image ?? existing.image,
          updatedAt: now,
        },
      }
    );

    return users.findOne({ _id: existing._id });
  }

  const result = await users.insertOne({
    email,
    name: input.name ?? email.split("@")[0],
    auth0Sub: input.auth0Sub,
    image: input.image,
    createdAt: now,
    updatedAt: now,
  });

  return users.findOne({ _id: result.insertedId });
}


export async function listUsers() {
  const users = await getUsersCollection();
  return users.find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).toArray();
}
