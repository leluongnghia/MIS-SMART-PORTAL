const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/app/[locale]/(admin)/dashboard/dashboard-client.tsx");
let content = fs.readFileSync(file, "utf8");

const heatmapUI = `
  <div className="flex-1 w-full h-full flex gap-2">
    <div className="flex flex-col justify-around text-[10px] text-slate-500 font-medium text-right pr-2">
      <span>Tài chính</span>
      <span>Hoạt động</span>
      <span>Nhân sự</span>
      <span>Tuân thủ</span>
      <span>Danh tiếng</span>
    </div>
    <div className="flex-1 flex flex-col">
      <div className="flex-1 grid grid-rows-5 grid-cols-5 gap-1 mb-2">
        {(initialData?.heatmapData || Array(5).fill(Array(5).fill(0))).map((row, rIdx) => 
          row.map((val, cIdx) => {
            let bgClass = "bg-emerald-100";
            if (cIdx === 0) bgClass = "bg-emerald-200 dark:bg-emerald-900";
            if (cIdx === 1) bgClass = "bg-emerald-300 dark:bg-emerald-800";
            if (cIdx === 2) bgClass = "bg-yellow-300 dark:bg-yellow-800";
            if (cIdx === 3) bgClass = "bg-orange-400 dark:bg-orange-800";
            if (cIdx === 4) bgClass = "bg-red-500 dark:bg-red-800";
            
            // Override matrix logic for bottom left vs top right
            const score = rIdx + cIdx;
            if (score <= 2) bgClass = "bg-emerald-200 dark:bg-emerald-900";
            else if (score <= 4) bgClass = "bg-yellow-300 dark:bg-yellow-800";
            else if (score <= 6) bgClass = "bg-orange-400 dark:bg-orange-800";
            else bgClass = "bg-red-500 dark:bg-red-800";

            return (
              <div key={rIdx+"-"+cIdx} className={\`rounded flex items-center justify-center text-[10px] font-bold text-slate-800 dark:text-slate-100 \${bgClass}\`}>
                {val > 0 ? val : ""}
              </div>
            );
          })
        )}
      </div>
      <div className="grid grid-cols-5 gap-1 text-[10px] text-center text-slate-500 font-medium">
        <span>Rất thấp</span>
        <span>Thấp</span>
        <span>TB</span>
        <span>Cao</span>
        <span>Rất cao</span>
      </div>
    </div>
  </div>
`;

content = content.replace(
  /<div className="flex-1 min-w-\[200px\] h-\[180px\] bg-slate-100[\s\S]*?<\/div>/,
  heatmapUI
);

const funnelUI = `
  <div className="flex w-full h-[220px] mb-4 gap-6">
    {/* Visual Funnel */}
    <div className="flex-1 flex flex-col justify-center gap-1">
      {(initialData?.funnel || []).map((stage, i) => {
        const widths = ["100%", "85%", "70%", "55%", "40%"];
        const opacities = ["opacity-100", "opacity-80", "opacity-60", "opacity-40", "opacity-30"];
        return (
          <div key={i} className="flex justify-center w-full">
            <div 
              className={\`bg-blue-600 \${opacities[i]} flex items-center justify-center text-white text-xs font-bold transition-all\`} 
              style={{ width: widths[i], height: "30px", clipPath: "polygon(5% 0, 95% 0, 100% 100%, 0% 100%)" }}
            />
          </div>
        );
      })}
    </div>
    
    {/* Data Table */}
    <div className="flex-1 flex flex-col justify-center divide-y divide-slate-100 dark:divide-slate-800">
      {(initialData?.funnel || []).map((stage, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className={\`w-2 h-2 rounded-full bg-blue-600\`} />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{stage.label}</span>
          </div>
          <div className="flex gap-4 text-xs font-bold">
            <span className="text-slate-900 dark:text-slate-100 w-8 text-right">{stage.value}</span>
            <span className="text-slate-500 w-10 text-right">{stage.pct}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
`;

content = content.replace(
  /<div className="flex items-center justify-center h-\[180px\] bg-slate-100[\s\S]*?<\/div>/,
  funnelUI
);

fs.writeFileSync(file, content);
console.log("Patched dashboard UI features");
