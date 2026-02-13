import { hashPassword } from "../lib/hash";
import { logger } from "../lib/logger";
import { closeDatabase, db } from "./index";
import { users } from "./schema/index";

const log = logger.child({ module: "seed" });

async function seed() {
  log.info("Starting database seed...");

  // Create demo admin user
  const adminPassword = await hashPassword("password123");
  await db
    .insert(users)
    .values({
      name: "Admin",
      email: "admin@corestack.dev",
      passwordHash: adminPassword,
      role: "admin",
    })
    .onConflictDoNothing({ target: users.email });
  log.info({ email: "admin@corestack.dev", role: "admin" }, "Seeded user");

  // Create demo regular user
  const userPassword = await hashPassword("password123");
  await db
    .insert(users)
    .values({
      name: "Demo User",
      email: "demo@corestack.dev",
      passwordHash: userPassword,
      role: "user",
    })
    .onConflictDoNothing({ target: users.email });
  log.info({ email: "demo@corestack.dev", role: "user" }, "Seeded user");

  log.info("Seed complete");
  await closeDatabase();
}

seed().catch((err) => {
  log.fatal(err, "Seed failed");
  process.exit(1);
});
