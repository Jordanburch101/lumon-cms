/**
 * Creates a Better Auth credential account for an existing Payload user.
 * This bridges existing admin users so they can log in via the frontend /login page.
 *
 * Usage: bun run scripts/seed-ba-account.ts <email> <password>
 */

import { getPayload } from "payload";
import config from "../src/payload.config";

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: bun run scripts/seed-ba-account.ts <email> <password>");
  process.exit(1);
}

async function main() {
  const payload = await getPayload({ config });

  // Find the existing user
  const users = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
  });

  if (users.docs.length === 0) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  const user = users.docs[0];
  console.log(`Found user: ${user.email} (id: ${user.id}, role: ${user.role})`);

  // Check if BA account already exists
  const existing = await payload.find({
    collection: "ba-accounts",
    where: {
      and: [
        { userId: { equals: user.id } },
        { providerId: { equals: "credential" } },
      ],
    },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    console.log("BA credential account already exists. Updating password...");
    // Hash the password using BA's crypto
    const { hashPassword } = await import("better-auth/crypto");
    const hashedPassword = await hashPassword(password);

    await payload.update({
      collection: "ba-accounts",
      id: existing.docs[0].id,
      data: { password: hashedPassword },
    });
    console.log("Password updated.");
    process.exit(0);
  }

  // Hash the password using BA's crypto (scrypt)
  const { hashPassword } = await import("better-auth/crypto");
  const hashedPassword = await hashPassword(password);

  // Create the BA credential account
  await payload.create({
    collection: "ba-accounts",
    data: {
      accountId: String(user.id),
      providerId: "credential",
      userId: user.id as number,
      password: hashedPassword,
    },
  });

  console.log("BA credential account created successfully.");
  console.log(`User can now log in at /login with email: ${email}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
