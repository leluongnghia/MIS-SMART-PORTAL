
const fs = require("fs");
const path = require("path");

const adminDir = path.join(__dirname, "src/app/[locale]/(admin)");
const modules = fs.readdirSync(adminDir).filter(f => fs.statSync(path.join(adminDir, f)).isDirectory());

for (const mod of modules) {
  if (mod === "dashboard" || mod === "admissions" || mod === "leads") continue; // already done or different
  
  const pagePath = path.join(adminDir, mod, "page.tsx");
  if (!fs.existsSync(pagePath)) continue;
  
  let pageContent = fs.readFileSync(pagePath, "utf8");
  if (pageContent.includes("use client")) {
    const clientPath = path.join(adminDir, mod, `${mod}-client.tsx`);
    
    // Modify client to accept initialData
    let newClientContent = pageContent.replace(/export default function\s+([A-Za-z0-9_]+)\s*\(\)\s*\{/, "export default function $1({ initialData }: { initialData?: any }) {");
    
    fs.writeFileSync(clientPath, newClientContent);
    
    // Create new page.tsx
    const functionName = mod.charAt(0).toUpperCase() + mod.slice(1) + "Page";
    const clientName = mod.charAt(0).toUpperCase() + mod.slice(1) + "Client";
    
    const newPageContent = `import ${clientName} from "./${mod}-client";\nimport { getInitialData } from "./actions";\n\nexport default async function ${functionName}() {\n  const data = await getInitialData();\n  return <${clientName} initialData={data} />;\n}\n`;
    fs.writeFileSync(pagePath, newPageContent);
    
    // Create actions.ts
    const actionsPath = path.join(adminDir, mod, "actions.ts");
    if (!fs.existsSync(actionsPath)) {
      let table = "tasks";
      if (mod === "directives") table = "directives";
      else if (mod === "approvals") table = "leaveRequests";
      else if (mod === "students") table = "students";
      else if (mod === "hrm") table = "employeeProfiles";
      else if (mod === "risk") table = "risks";
      else if (mod === "events") table = "events";
      
      const actionsContent = `\"use server\";\n\nimport { db, schema } from \"@/src/libs/server/db\";\n\nexport async function getInitialData() {\n  try {\n    const data = await db.select().from(schema.${table} || schema.tasks);\n    return { data };\n  } catch (e) {\n    return { data: [] };\n  }\n}\n`;
      fs.writeFileSync(actionsPath, actionsContent);
    }
    console.log(`Refactored ${mod}`);
  }
}

