import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface AppUser {
  _id?: ObjectId;
  email: string;
  name: string;
  passwordHash?: string;
  auth0Sub?: string;
  image?: string;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export type UserPreferences = {
  notifications: {
    emailEnabled: boolean;
    bookingReminders: boolean;
    promotions: boolean;
    weeklySummary: boolean;
  };
  dashboard: {
    compactView: boolean;
    showSupportCard: boolean;
    defaultBookingTab: "upcoming" | "past";
  };
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  notifications: {
    emailEnabled: true,
    bookingReminders: true,
    promotions: false,
    weeklySummary: false,
  },
  dashboard: {
    compactView: false,
    showSupportCard: true,
    defaultBookingTab: "upcoming",
  },
};

function mergeUserPreferences(preferences?: Partial<UserPreferences> | null): UserPreferences {
  return {
    notifications: {
      ...DEFAULT_USER_PREFERENCES.notifications,
      ...(preferences?.notifications ?? {}),
    },
    dashboard: {
      ...DEFAULT_USER_PREFERENCES.dashboard,
      ...(preferences?.dashboard ?? {}),
    },
  };
}

async function getUsersCollection() {
  const db = await getDb();
  return db.collection<AppUser>("users");
}

export async function findUserByEmail(email: string) {
  const users = await getUsersCollection();
  return users.findOne({ email: email.toLowerCase() });
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
    { email: email.toLowerCase() },
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
    email: input.email.toLowerCase(),
    name: input.name,
    passwordHash: input.passwordHash,
    preferences: DEFAULT_USER_PREFERENCES,
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
  const users = await getUsersCollection();
  const now = new Date();

  if (input.auth0Sub) {
    const existingBySub = await users.findOne({ auth0Sub: input.auth0Sub });
    if (existingBySub) {
      const normalizedEmail = input.email?.toLowerCase();
      await users.updateOne(
        { _id: existingBySub._id },
        {
          $set: {
            email: normalizedEmail ?? existingBySub.email,
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
          preferences: mergeUserPreferences(existing.preferences),
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
    preferences: DEFAULT_USER_PREFERENCES,
    createdAt: now,
    updatedAt: now,
  });

  return users.findOne({ _id: result.insertedId });
}


export async function listUsers() {
  const users = await getUsersCollection();
  return users.find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).toArray();
}
