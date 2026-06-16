const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/app/[locale]/(admin)/tasks/tasks-client.tsx");
let content = fs.readFileSync(file, "utf8");

const parseLogic = `
  const dbTasks = initialData?.data || [];
  
  const getColCards = (status) => dbTasks.filter((t) => t.status === status).map((t) => ({
    title: t.title,
    user: t.assignedId || "Unknown",
    date: t.deadline ? new Date(t.deadline).toLocaleDateString("vi-VN") : "No date",
    tag: t.priority === "high" ? "Cao" : t.priority === "medium" ? "Trung bình" : "Thấp",
    tagCol: t.priority === "high" ? "bg-red-50 text-red-600" : t.priority === "medium" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
  }));

  const kanbanColumns = [
    { title: "Cần làm", count: getColCards("pending").length, colBg: "bg-slate-50 dark:bg-slate-800/50", cards: getColCards("pending") },
    { title: "Đang xử lý", count: getColCards("in_progress").length, colBg: "bg-blue-50 dark:bg-blue-900/20", cards: getColCards("in_progress") },
    { title: "Chờ duyệt", count: getColCards("review").length, colBg: "bg-purple-50 dark:bg-purple-900/20", cards: getColCards("review") },
    { title: "Hoàn thành", count: getColCards("completed").length, colBg: "bg-emerald-50 dark:bg-emerald-900/20", cards: getColCards("completed") }
  ];
`;

content = content.replace(
  /export default function TasksClient\(\{ initialData \}: \{ initialData\?: any \}\) \{/,
  "export default function TasksClient({ initialData }: { initialData?: any }) {" + parseLogic
);

// We need to replace the inline array: 
// {[ { title: 'Cần làm' ... } ... ].map((col, i) => (
// Since the encoding might be mangled, let's use a regex that captures the map structure.
content = content.replace(
  /\{\[\s*\{\s*title:[^]*?\]\.map\(\(col,\s*i\)/,
  "{kanbanColumns.map((col, i)"
);

fs.writeFileSync(file, content);
console.log("Patched tasks client part 2.");
