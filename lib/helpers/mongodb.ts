import { MongoClient, Db } from "mongodb";
import { DB_NAME } from "@/lib/constants/db";

declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function validateMongoUri(connectionUri: string): void {
  if (!connectionUri) {
    throw new Error(
      "MONGODB_URI environment variable is not set. " +
      "Set it to your full MongoDB connection string, e.g. " +
      "mongodb+srv://user:password@cluster.xxxxx.mongodb.net/dbname"
    );
  }

  if (connectionUri.startsWith("mongodb+srv://")) {
    try {
      const url = new URL(connectionUri);
      const hostname = url.hostname;
      // A valid SRV hostname must contain at least one dot (e.g. cluster.abc.mongodb.net)
      if (!hostname.includes(".")) {
        throw new Error(
          `MONGODB_URI hostname "${hostname}" is not a fully-qualified domain name. ` +
          `Expected something like "cluster.xxxxx.mongodb.net". ` +
          `Ensure MONGODB_URI is set to the complete connection string copied from MongoDB Atlas.`
        );
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("MONGODB_URI")) throw err;
      throw new Error(`MONGODB_URI is not a valid URL. ${err}`);
    }
  }
}

function mongoUri() {
  const connectionUri = process.env.MONGODB_URI ?? "";
  validateMongoUri(connectionUri);
  return connectionUri;
}

async function connectClient() {
  const client = new MongoClient(mongoUri(), {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10_000,
  });
  await client.connect();
  await client.db(process.env.MONGODB_DB || DB_NAME).command({ ping: 1 });
  return client;
}

async function getClient() {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectClient();
  }

  try {
    global._mongoClient = await global._mongoClientPromise;
    await global._mongoClient.db(process.env.MONGODB_DB || DB_NAME).command({ ping: 1 });
    return global._mongoClient;
  } catch {
    await global._mongoClient?.close().catch(() => {});
    global._mongoClient = undefined;
    global._mongoClientPromise = connectClient();
    global._mongoClient = await global._mongoClientPromise;
    return global._mongoClient;
  }
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(process.env.MONGODB_DB || DB_NAME);
}
