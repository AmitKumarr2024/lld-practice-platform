const mongoose = require("mongoose");
const { env } = require("./env");

// Cached across warm serverless invocations (Vercel reuses the module scope
// between requests on the same instance) so we don't reconnect to MongoDB
// on every request. In a normal long-running server (npm run dev / start),
// this simply connects once at boot, same as before.
let cached = global.__lldMongooseConn;
if (!cached) {
  cached = global.__lldMongooseConn = { conn: null, promise: null };
}

async function connectDatabase() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(env.mongoUri).then((m) => {
      console.log(`[db] connected successfully`);
      return m;
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

module.exports = { connectDatabase, disconnectDatabase };
