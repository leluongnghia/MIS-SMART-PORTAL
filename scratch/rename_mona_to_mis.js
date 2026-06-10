import fs from 'fs';
import path from 'path';

// 1. Update index.html
const indexHtmlPath = "c:\\Users\\pc\\Downloads\\remix_-quản-lý-công-việc-trường-học\\index.html";
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
indexHtml = indexHtml.replace(/MONA LMS/g, 'MIS LMS');
fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
console.log("Updated index.html");

// 2. Update index.css
const indexCssPath = "c:\\Users\\pc\\Downloads\\remix_-quản-lý-công-việc-trường-học\\src\\index.css";
let indexCss = fs.readFileSync(indexCssPath, 'utf8');
indexCss = indexCss.replace(/#mona-lms-hub-root/g, '#mis-lms-hub-root');
fs.writeFileSync(indexCssPath, indexCss, 'utf8');
console.log("Updated index.css");

// 3. Update App.tsx
const appTsxPath = "c:\\Users\\pc\\Downloads\\remix_-quản-lý-công-việc-trường-học\\src\\App.tsx";
let appTsx = fs.readFileSync(appTsxPath, 'utf8');
appTsx = appTsx.replace(/MonaLmsCenter/g, 'MisLmsCenter');
appTsx = appTsx.replace(/Mona LMS Portal/g, 'MIS LMS Portal');
fs.writeFileSync(appTsxPath, appTsx, 'utf8');
console.log("Updated App.tsx");

// 4. Update MonaLmsCenter.tsx and rename to MisLmsCenter.tsx
const oldLmsPath = "c:\\Users\\pc\\Downloads\\remix_-quản-lý-công-việc-trường-học\\src\\components\\MonaLmsCenter.tsx";
const newLmsPath = "c:\\Users\\pc\\Downloads\\remix_-quản-lý-công-việc-trường-học\\src\\components\\MisLmsCenter.tsx";

if (fs.existsSync(oldLmsPath)) {
    let lmsCode = fs.readFileSync(oldLmsPath, 'utf8');
    
    // Replacements
    lmsCode = lmsCode.replace(/MonaLmsCenter/g, 'MisLmsCenter');
    lmsCode = lmsCode.replace(/MONA LMS/g, 'MIS LMS');
    lmsCode = lmsCode.replace(/Mona LMS/g, 'MIS LMS');
    lmsCode = lmsCode.replace(/mona_lms_/g, 'mis_lms_');
    lmsCode = lmsCode.replace(/mona-lms-hub-root/g, 'mis-lms-hub-root');
    lmsCode = lmsCode.replace(/X-Mona-DRM-Shield/g, 'X-Mis-DRM-Shield');
    lmsCode = lmsCode.replace(/Mona SafeVideo/g, 'MIS SafeVideo');
    lmsCode = lmsCode.replace(/Mona/g, 'MIS'); // Fallback for general Mona mentions
    
    fs.writeFileSync(newLmsPath, lmsCode, 'utf8');
    fs.unlinkSync(oldLmsPath);
    console.log("Updated and renamed MonaLmsCenter.tsx to MisLmsCenter.tsx");
} else {
    console.log("MonaLmsCenter.tsx does not exist, check if already renamed");
}

console.log("Rebranding successfully completed!");
