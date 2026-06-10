import fs from 'fs';

const filePath = "c:\\Users\\pc\\Downloads\\remix_-quản-lý-công-việc-trường-học\\src\\App.tsx";
let content = fs.readFileSync(filePath, 'utf8');

// Normalize CRLFs
let normalizedContent = content.replace(/\r\n/g, '\n');

// 2. Use Regex to find the Header tabs block
const headerRegex = /(\{\/\* OVERVIEW TABS \*\/\}[\s\S]*?<div className="flex flex-wrap items-center gap-6 border-b border-slate-200 mb-6 px-1 mt-6">[\s\S]*?<\/div>)/;

const match = normalizedContent.match(headerRegex);

if (match) {
    const headerReplacement = `{/* OVERVIEW TABS */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 mb-6 mt-6">
                <button 
                  onClick={() => setOverviewTab('TASKS')}
                  className={\`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer \${
                    overviewTab === 'TASKS' 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-100 scale-[1.01]' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200 font-bold'
                  }\`}
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  Nhiệm vụ &amp; Chỉ đạo
                </button>
                <button 
                  onClick={() => setOverviewTab('INTELLIGENCE')}
                  className={\`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer \${
                    overviewTab === 'INTELLIGENCE' 
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100 scale-[1.01]' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200 font-bold'
                  }\`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  Đa Trí Tuệ &amp; OKRs
                </button>
                <button 
                  onClick={() => setOverviewTab('LMS')}
                  className={\`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer \${
                    overviewTab === 'LMS' 
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100 scale-[1.01]' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200 font-bold'
                  }\`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  MIS LMS Portal
                </button>
                <button 
                  onClick={() => setOverviewTab('ACADEMIC')}
                  className={\`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer \${
                    overviewTab === 'ACADEMIC' 
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-100 scale-[1.01]' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200 font-bold'
                  }\`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  Học Vụ &amp; Giáo Án
                </button>
                <button 
                  onClick={() => setOverviewTab('LOGISTICS')}
                  className={\`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer \${
                    overviewTab === 'LOGISTICS' 
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-100 scale-[1.01]' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200 font-bold'
                  }\`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Vận Hành &amp; Thiết Bị
                </button>
                <button 
                  onClick={() => setOverviewTab('HRM')}
                  className={\`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer \${
                    overviewTab === 'HRM' 
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-100 scale-[1.01]' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200 font-bold'
                  }\`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Nhân Sự &amp; Phép
                </button>
                <button 
                  onClick={() => setOverviewTab('REQUESTS')}
                  className={\`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer \${
                    overviewTab === 'REQUESTS' 
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-100 scale-[1.01]' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200 font-bold'
                  }\`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  Đề Xuất &amp; Phê Duyệt
                </button>
             </div>`;
             
    normalizedContent = normalizedContent.replace(headerRegex, headerReplacement);
    fs.writeFileSync(filePath, normalizedContent, 'utf8');
    console.log("Header Tabs Replaced successfully via Regex!");
} else {
    console.log("Header Target NOT found in Regex matching!");
}
