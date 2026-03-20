import { MongoClient } from "mongodb";

// In development, use a global to prevent multiple connections during hot-reload.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let _prodClientPromise: Promise<MongoClient> | undefined;

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set.");
  }
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    if (!_prodClientPromise) {
      const client = new MongoClient(uri);
      _prodClientPromise = client.connect();
    }
    return _prodClientPromise;
  }
}

export async function getDb(dbName = "mongoori-finds") {
  const c = await getClientPromise();
  return c.db(dbName);
}

export default getClientPromise;
