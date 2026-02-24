import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "lva";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
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

export async function getDb(): Promise<Db> {
  if (!global._mongoClient) {
    validateMongoUri(uri);
    global._mongoClient = new MongoClient(uri);
    await global._mongoClient.connect();
  }

  return global._mongoClient.db(dbName);
}
