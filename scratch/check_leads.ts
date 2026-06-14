import { db, schema } from '../src/libs/server/db';

async function main() {
  const allLeads = await db.select().from(schema.leads);
  console.log(`Total leads: ${allLeads.length}`);
  if (allLeads.length > 0) {
    console.log("First 3 leads:");
    console.log(allLeads.slice(0, 3).map(l => ({ id: l.id, name: l.fullName, status: l.status })));
  }
}

main().catch(err => {
  console.error("Error checking database:", err);
  process.exit(1);
});
