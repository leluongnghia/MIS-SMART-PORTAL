
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/app/[locale]/(admin)/dashboard/seed.ts");
let content = fs.readFileSync(file, "utf8");

// Insert logic to seed leads and payments
const insertLogic = `
  const leadCount = await db.select({ count: sql\\\`count(*)\\\` }).from(schema.leads);
  if (leadCount[0].count === 0) {
    console.log("Seeding leads and payments for reports...");
    const l1 = uuidv4();
    const l2 = uuidv4();
    const l3 = uuidv4();
    const l4 = uuidv4();
    
    await db.insert(schema.leads).values([
      { id: l1, fullName: "H?c sinh A", status: "enrolled", source: "Facebook", grade: "Kh?i 10" },
      { id: l2, fullName: "H?c sinh B", status: "enrolled", source: "Google", grade: "Kh?i 10" },
      { id: l3, fullName: "H?c sinh C", status: "seat_reserved", source: "Facebook", grade: "Kh?i 11" },
      { id: l4, fullName: "H?c sinh D", status: "docs_submitted", source: "Website", grade: "Kh?i 10" },
    ]);

    await db.insert(schema.payments).values([
      { id: uuidv4(), leadId: l1, type: "tuition", amount: 15000000, status: "paid" },
      { id: uuidv4(), leadId: l2, type: "tuition", amount: 15000000, status: "paid" },
      { id: uuidv4(), leadId: l3, type: "seat_reservation", amount: 5000000, status: "paid" },
    ]);
  }
`;

content = content.replace(
  /console\.log\("Seeding complete!"\);/,
  insertLogic + "\n  console.log(\"Seeding complete!\");"
);

fs.writeFileSync(file, content);
console.log("Patched seed.ts");

