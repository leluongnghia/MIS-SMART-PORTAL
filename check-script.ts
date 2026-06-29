
import { db, schema } from "./src/libs/server/db";
import { eq } from "drizzle-orm";
async function check() {
  const users = await db.select().from(schema.users).where(eq(schema.users.role, 'ADMIN'));
  console.log("Admins:");
  for (const u of users) {
    console.log(u.id, u.email);
    const denies = await db.select().from(schema.userPermissions).where(eq(schema.userPermissions.userId, u.id));
    console.log("  Denies:", denies.length);
  }
  process.exit(0);
}
check();
