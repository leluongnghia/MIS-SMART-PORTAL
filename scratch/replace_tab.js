import fs from 'fs';

const filePath = "c:\\Users\\pc\\Downloads\\remix_-quản-lý-công-việc-trường-học\\src\\App.tsx";

let content = fs.readFileSync(filePath, 'utf8');

// Use Regex to find the HRM button and the closing </div>
const hrmRegex = /(<button\s+onClick=\{\(\)\s+=>\s+setOverviewTab\('HRM'\)\}[\s\S]*?<\/button>)\s*(<\/div>)/;

const match = content.match(hrmRegex);

if (match) {
    const hrmButtonHtml = match[1];
    const closingDiv = match[2];
    
    // Indentation
    const lines = hrmButtonHtml.split('\n');
    const firstLine = lines[0];
    const spaces = firstLine.match(/^\s*/)[0];
    
    const requestsButtonHtml = `\n${spaces}<button \n${spaces}  onClick={() => setOverviewTab('REQUESTS')}\n${spaces}  className={\`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 \${overviewTab === 'REQUESTS' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}\n${spaces}>\n${spaces}  <FileCheck className="w-4 h-4" />\n${spaces}  Đề Xuất &amp; Phê Duyệt\n${spaces}</button>`;
    
    const replacement = hrmButtonHtml + requestsButtonHtml + '\n' + spaces + closingDiv;
    
    const newContent = content.replace(hrmRegex, replacement);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Replacement Succeeded via ES Module Regex!");
} else {
    console.log("Target regex NOT found in content!");
}
