const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\f650d2a9-141d-434f-9354-a7f7b1cf5aa9\\.system_generated\\logs\\transcript.jsonl';
const fileHistory = {};

if (!fs.existsSync(logPath)) {
  console.error('Log file not found at:', logPath);
  process.exit(1);
}

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
console.log(`Read ${lines.length} lines from log.`);

function cleanString(str) {
  if (!str) return str;
  let cleaned = str.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  // Remove escaped quotes and backslashes
  return cleaned.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (const tc of obj.tool_calls) {
        const name = tc.name;
        const args = tc.args;
        if (!args) continue;
        
        if (name === 'default_api:write_to_file' || name === 'write_to_file') {
          const target = cleanString(args.TargetFile);
          if (target && target.endsWith('.tsx') && !target.includes('LanguageContext') && !target.includes('translations')) {
            if (!fileHistory[target]) {
              fileHistory[target] = [];
            }
            fileHistory[target].push({
              step: obj.step_index,
              action: 'write',
              content: cleanString(args.CodeContent)
            });
          }
        } else if (name === 'default_api:replace_file_content' || name === 'replace_file_content' || name === 'default_api:multi_replace_file_content' || name === 'multi_replace_file_content') {
          const target = cleanString(args.TargetFile);
          if (target && target.endsWith('.tsx')) {
            if (!fileHistory[target]) {
              fileHistory[target] = [];
            }
            fileHistory[target].push({
              step: obj.step_index,
              action: 'replace',
              args: {
                TargetContent: cleanString(args.TargetContent),
                ReplacementContent: cleanString(args.ReplacementContent)
              }
            });
          }
        }
      }
    }
  } catch (e) {
    // Ignore invalid JSON lines
  }
}

console.log('Found history for files:', Object.keys(fileHistory));
fs.writeFileSync('C:\\Users\\pc\\.gemini\\antigravity\\scratch\\history_report.json', JSON.stringify(fileHistory, null, 2), 'utf8');
console.log('Report written to C:\\Users\\pc\\.gemini\\antigravity\\scratch\\history_report.json');
