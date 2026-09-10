const mongoose = require("mongoose");
const { env } = require("./env");

// Cached across warm serverless invocations.
// Vercel can reuse the same module instance between requests,
// so we avoid creating a new MongoDB connection every time.

let cached = global.__lldMongooseConn;

if (!cached) {
  cached = global.__lldMongooseConn = {
    conn: null,
    promise: null,
  };
}

async function connectDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);

    if (!env.mongoUri) {
      throw new Error("MONGODB_URI environment variable is missing");
    }

    cached.promise = mongoose
      .connect(env.mongoUri)
      .then((connection) => {
        console.log("[db] connected successfully");
        return connection;
      })
      .catch((error) => {
        console.error("[db] connection failed:", error.message);

        cached.promise = null;

        throw error;
      });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}

async function disconnectDatabase() {
  await mongoose.disconnect();

  cached.conn = null;
  cached.promise = null;
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
