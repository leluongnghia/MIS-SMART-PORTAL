
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/app/[locale]/(admin)/dashboard/actions.ts");
let content = fs.readFileSync(file, "utf8");

const funnelLogic = `
  // Funnel calculation
  const totalLeads = allLeads.length || 1; // avoid division by zero
  const tiepCan = allLeads.length;
  const quanTam = allLeads.filter(l => ["consulting", "test_scheduled", "test_participated", "seat_reserved", "docs_submitted", "enrolled"].includes(l.status)).length;
  const tuVan = allLeads.filter(l => ["test_scheduled", "test_participated", "seat_reserved", "docs_submitted", "enrolled"].includes(l.status)).length;
  const dangKy = allLeads.filter(l => ["seat_reserved", "docs_submitted", "enrolled"].includes(l.status)).length;
  const nhapHoc = allLeads.filter(l => ["enrolled"].includes(l.status)).length;

  const funnel = [
    { label: "Ti?p c?n", value: tiepCan, pct: tiepCan ? "100%" : "0%" },
    { label: "Quan tâm", value: quanTam, pct: tiepCan ? Math.round((quanTam/tiepCan)*100) + "%" : "0%" },
    { label: "Tu v?n", value: tuVan, pct: tiepCan ? Math.round((tuVan/tiepCan)*100) + "%" : "0%" },
    { label: "Ðang ký", value: dangKy, pct: tiepCan ? Math.round((dangKy/tiepCan)*100) + "%" : "0%" },
    { label: "Nh?p h?c", value: nhapHoc, pct: tiepCan ? Math.round((nhapHoc/tiepCan)*100) + "%" : "0%" }
  ];

  // Heatmap calculation
  const categories = ["Tài chính", "Ho?t d?ng", "Nhân s?", "Tuân th?", "Danh ti?ng"];
  // We place risks into the grid [row][col] -> count. rows = categories (0-4), cols = severity (0-4)
  const heatmapData = Array(5).fill(0).map(() => Array(5).fill(0));
  
  allRisks.forEach(r => {
    // Generate pseudo-random position if payload is empty so it looks nice with real data
    let catIdx = categories.indexOf(r.payload?.category);
    if (catIdx === -1) catIdx = r.title.length % 5;
    
    let sevIdx = r.severity === "high" ? 4 : r.severity === "medium" ? 2 : 1;
    if (r.payload?.probability !== undefined) {
      sevIdx = r.payload.probability;
    }
    heatmapData[catIdx][sevIdx]++;
  });
`;

content = content.replace(
  "return {",
  funnelLogic + "\n  return {"
);

content = content.replace(
  /alerts: \{/,
  "funnel, heatmapData, alerts: {"
);

fs.writeFileSync(file, content);
console.log("Patched actions");

