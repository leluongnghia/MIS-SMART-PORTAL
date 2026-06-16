
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/app/[locale]/(admin)/tasks/tasks-client.tsx");
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  /const tasksData = \[[\s\S]*?\];/g,
  "const tasksData = initialData?.data || [];"
);

fs.writeFileSync(file, content);
console.log("Patched tasks client.");

