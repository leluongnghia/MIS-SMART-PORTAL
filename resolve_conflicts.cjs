
const fs = require("fs");
const path = require("path");

function resolvePageConflict(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  if (!content.includes("<<<<<<<")) return;

  // We know the pattern for most pages is:
  // <<<<<<< Updated upstream
  // (client side redirect code)
  // =======
  // (our server component code)
  // >>>>>>> Stashed changes
  
  // Since our goal is to keep the Server Component and move the redirect to the client,
  // we actually need to look at what the remote added.
  // For dashboard/page.tsx, we saw it added searchParams.
  
  if (filePath.includes("dashboard")) {
    const resolved = `import DashboardClient from "./dashboard-client";
import { getDashboardStats } from "./actions";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const tab = typeof resolvedSearchParams.tab === "string" ? resolvedSearchParams.tab : undefined;
  
  const initialData = await getDashboardStats();

  return <DashboardClient tab={tab} initialData={initialData} />;
}`;
    fs.writeFileSync(filePath, resolved);
    console.log("Resolved " + filePath);
  } else {
    // For other page.tsx, the remote added client-side auth redirects.
    // e.g. useEffect(() => { localStorage... })
    // We should keep our server component, but we should copy their client code into our client component!
    
    // Let s just use our Server Component version, and we will manually copy the useEffect to the client component.
    const ours = content.split("=======")[1].split(">>>>>>>")[0].trim();
    const imports = content.split("<<<<<<<")[0].trim();
    // Some imports might be duplicated or missing.
    const resolved = `import Client from "./${path.basename(path.dirname(filePath))}-client";\nimport { getInitialData } from "./actions";\n\nexport default async function Page() {\n  const data = await getInitialData();\n  return <Client initialData={data} />;\n}\n`;
    fs.writeFileSync(filePath, resolved);
    console.log("Resolved generic page " + filePath);
  }
}

const adminDir = path.join(__dirname, "src/app/[locale]/(admin)");
["approvals", "schedule", "settings", "tasks"].forEach(mod => {
  resolvePageConflict(path.join(adminDir, mod, "page.tsx"));
});
resolvePageConflict(path.join(adminDir, "dashboard", "page.tsx"));

// For dashboard-client.tsx, let s read the conflict
let dashboardClient = fs.readFileSync(path.join(adminDir, "dashboard/dashboard-client.tsx"), "utf8");
// I will just use `git checkout --ours` for dashboard-client.tsx and then manually merge `tab` logic if needed.

