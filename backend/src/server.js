const { createApp } = require("./app");
const { connectDatabase } = require("./config/database");
const { env } = require("./config/env");

async function main() {
  await connectDatabase();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[server] LLD Practice Platform API listening on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});
