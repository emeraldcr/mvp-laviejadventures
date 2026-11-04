import { createHash } from "node:crypto";
import { validEmail, validResetToken } from "@/lib/security/validation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/data/mongodb";
import { COLLECTIONS } from "@/lib/data/collections";
import type { UserPreferences } from "@/lib/auth/types";
import { DEFAULT_USER_PREFERENCES } from "@/lib/auth/user-preferences";

export type { UserPreferences };
export { DEFAULT_USER_PREFERENCES };

export interface AppUser {
  _id?: ObjectId;
  email: string;
  name: string;
  passwordHash?: string;
  resetToken?: string | null;
  resetTokenHash?: string | null;
  emailVerified?: boolean;
  sessionVersion?: number;
  resetExpiry?: Date | null;
  auth0Sub?: string;
  image?: string;
  phone?: string;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

function mergeUserPreferences(preferences?: Partial<UserPreferences> | null): UserPreferences {
  return {
    notifications: {
      ...DEFAULT_USER_PREFERENCES.notifications,
      ...(preferences?.notifications ?? {}),
    },
  };
}

let userIndexesReady: Promise<unknown> | undefined;

async function getUsersCollection() {
  const db = await getDb();
  const users = db.collection<AppUser>(COLLECTIONS.USERS);
  userIndexesReady ??= Promise.all([
    users.createIndex({ email: 1 }, { unique: true }),
    users.createIndex({ auth0Sub: 1 }, { unique: true, partialFilterExpression: { auth0Sub: { $type: "string" } } }),
  ]).catch(error => { userIndexesReady = undefined; throw error; });
  await userIndexesReady;
  return users;
}

export async function findUserByEmail(email: string) {
  if (!validEmail(email)) return null;
  const users = await getUsersCollection();
  return users.findOne({ email: email.trim().toLowerCase() });
}

export async function getUserPreferencesByEmail(email: string): Promise<UserPreferences | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  return mergeUserPreferences(user.preferences);
}

export async function updateUserPreferencesByEmail(
  email: string,
  preferences: UserPreferences
): Promise<UserPreferences | null> {
  const users = await getUsersCollection();
  const mergedPreferences = mergeUserPreferences(preferences);

  const result = await users.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    {
      $set: {
        preferences: mergedPreferences,
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
    }
  );

  if (!result) return null;
  return mergeUserPreferences(result.preferences);
}

export async function createCredentialsUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}) {
  const users = await getUsersCollection();
  const now = new Date();
  const result = await users.insertOne({
    email: input.email.trim().toLowerCase(),
    name: input.name,
    passwordHash: input.passwordHash,
    preferences: DEFAULT_USER_PREFERENCES,
    createdAt: now,
    updatedAt: now,
  });

  return users.findOne({ _id: result.insertedId });
}

export async function findUserByResetToken(token: string) {
  if (!validResetToken(token)) return null;
  const users = await getUsersCollection();
  return users.findOne({ resetTokenHash: createHash("sha256").update(token).digest("hex"), resetExpiry: { $gt: new Date() } });
}

export async function setUserResetToken(id: string, token: string, expiry: Date) {
  const users = await getUsersCollection();
  return users.updateOne(
    { _id: new ObjectId(id) },
    { $set: { resetTokenHash: createHash("sha256").update(token).digest("hex"), resetExpiry: expiry, updatedAt: new Date() }, $unset: { resetToken: "" } }
  );
}

export async function consumeUserResetToken(token: unknown, passwordHash: string) {
  if (!validResetToken(token)) return false;
  const users = await getUsersCollection();
  const result = await users.updateOne(
    { resetTokenHash: createHash("sha256").update(token).digest("hex"), resetExpiry: { $gt: new Date() } },
    { $set: { passwordHash, emailVerified: true, updatedAt: new Date() },
      $unset: { resetToken: "", resetTokenHash: "", resetExpiry: "" },
      $inc: { sessionVersion: 1 } },
  );
  return result.modifiedCount === 1;
}

export async function clearUserResetToken(id: string) {
  const users = await getUsersCollection();
  return users.updateOne(
    { _id: new ObjectId(id) },
    { $set: { resetToken: null, resetTokenHash: null, resetExpiry: null, updatedAt: new Date() } }
  );
}

export async function updateUserPassword(id: string, passwordHash: string) {
  const users = await getUsersCollection();
  return users.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        passwordHash,
        resetToken: null,
        resetTokenHash: null,
        resetExpiry: null,
        updatedAt: new Date(),
      },
      $inc: { sessionVersion: 1 },
    }
  );
}

export async function updateUserPasswordByEmail(email: string, passwordHash: string) {
  const users = await getUsersCollection();
  return users.updateOne(
    { email: email.trim().toLowerCase() },
    {
      $set: {
        passwordHash,
        resetToken: null,
        resetTokenHash: null,
        resetExpiry: null,
        updatedAt: new Date(),
      },
      $inc: { sessionVersion: 1 },
    }
  );
}

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
};

export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;

  return {
    name: user.name ?? "",
    email: user.email,
    phone: user.phone ?? "",
  };
}

export async function updateUserProfileByEmail(
  email: string,
  updates: { name: string; phone: string }
): Promise<UserProfile | null> {
  const users = await getUsersCollection();

  const result = await users.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    {
      $set: {
        name: updates.name.trim(),
        phone: updates.phone.trim(),
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
    }
  );

  if (!result) return null;

  return {
    name: result.name ?? "",
    email: result.email,
    phone: result.phone ?? "",
  };
}

export async function upsertUserFromAuth0(input: {
  auth0Sub?: string;
  emailVerified?: boolean;
  email?: string;
  name?: string;
  image?: string;
}) {
  if (input.emailVerified !== true || !validEmail(input.email) || typeof input.auth0Sub !== "string" || !input.auth0Sub) return null;
  const users = await getUsersCollection();
  const now = new Date();

  if (input.auth0Sub) {
    const existingBySub = await users.findOne({ auth0Sub: input.auth0Sub });
    if (existingBySub) {
      if (existingBySub.email !== input.email.trim().toLowerCase()) return null;
      await users.updateOne(
        { _id: existingBySub._id },
        {
          $set: {
            email: existingBySub.email,
            emailVerified: true,
            name: input.name ?? existingBySub.name,
            image: input.image ?? existingBySub.image,
            preferences: mergeUserPreferences(existingBySub.preferences),
            updatedAt: now,
          },
        }
      );

      return users.findOne({ _id: existingBySub._id });
    }
  }

  if (!input.email) return null;

  const email = input.email.trim().toLowerCase();

  const existing = await users.findOne({ email });
  // Linking identities requires reauthentication of both accounts. A matching
  // email alone must never replace an existing identity or password account.
  if (existing) return null;

  const result = await users.insertOne({
    email,
    name: input.name ?? email.split("@")[0],
    auth0Sub: input.auth0Sub,
    emailVerified: true,
    image: input.image,
    preferences: DEFAULT_USER_PREFERENCES,
    createdAt: now,
    updatedAt: now,
  });

  return users.findOne({ _id: result.insertedId });
}


export async function listUsers() {
  const users = await getUsersCollection();
  return users.find({}, { projection: { passwordHash: 0, resetToken: 0, resetTokenHash: 0, resetExpiry: 0 } }).sort({ createdAt: -1 }).toArray();
}
