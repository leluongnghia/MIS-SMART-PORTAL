
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/app/[locale]/(admin)/reports/page.tsx");

const newContent = `import ReportsClient from "./reports-client";
import { getReportsData } from "./actions";

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dbData = await getReportsData();

  return <ReportsClient locale={locale} data={dbData as any} />;
}
`;

fs.writeFileSync(file, newContent);
console.log("Patched reports/page.tsx");

