import { db, schema } from "./src/libs/server/db";
import { eq } from "drizzle-orm";

async function main() {
  try {
    const row = await db.select().from(schema.rbacConfig).where(eq(schema.rbacConfig.id, "system_matrix")).limit(1);
    if (row.length > 0) {
      console.log(JSON.stringify(row[0].config, null, 2));
    } else {
      console.log("{}");
    }
  } catch (err) {
    console.error("DB Error:", err);
  }
  process.exit(0);
}
main();
