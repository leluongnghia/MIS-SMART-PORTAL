const fs = require('fs');

const logPath = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\f650d2a9-141d-434f-9354-a7f7b1cf5aa9\\.system_generated\\logs\\transcript.jsonl';
if (!fs.existsSync(logPath)) {
  console.error('Log not found');
  process.exit(1);
}

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
console.log(`Analyzing ${lines.length} lines...`);

const targets = [
  'src/App.tsx',
  'src/components/IntelligenceAndOkrHub.tsx',
  'src/components/AcademicOperations.tsx',
  'src/components/SchoolLogistics.tsx',
  'src/components/HrmCenter.tsx',
  'src/components/SchoolRequests.tsx',
  'src/main.tsx'
];

function cleanViewContent(viewContent) {
  const lines = viewContent.split('\n');
  const cleanLines = [];
  let started = false;
  for (const line of lines) {
    if (line.startsWith('Showing lines') || line.includes('The following code has been modified')) {
      started = true;
      continue;
    }
    if (line.includes('The above content shows') || line.includes('The above content does NOT show')) {
      break;
    }
    if (started) {
      const match = line.match(/^\d+:\s?(.*)$/);
      if (match) {
        cleanLines.push(match[1]);
      } else {
        // Fallback if line number doesn't match perfectly
        cleanLines.push(line);
      }
    }
  }
  return cleanLines.join('\n');
}

const fileStates = {};

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    // 1. Check for VIEW_FILE type steps
    if (obj.type === 'VIEW_FILE' && obj.content) {
      // Find which target file is this
      const matchedTarget = targets.find(t => {
        const cleanT = t.replace(/\//g, '\\\\');
        const cleanT2 = t;
        return obj.content.includes(cleanT) || obj.content.includes(cleanT2);
      });
      
      if (matchedTarget) {
        if (!fileStates[matchedTarget]) fileStates[matchedTarget] = [];
        fileStates[matchedTarget].push({
          step: obj.step_index,
          type: 'view',
          content: cleanViewContent(obj.content)
        });
      }
    }
    
    // 2. Check for write_to_file tool calls
    if (obj.tool_calls) {
      for (const tc of obj.tool_calls) {
        const name = tc.name;
        const args = tc.args || {};
        if (name === 'default_api:write_to_file' || name === 'write_to_file') {
          const targetFile = args.TargetFile || '';
          const matchedTarget = targets.find(t => targetFile.replace(/\\/g, '/').includes(t));
          if (matchedTarget) {
            if (!fileStates[matchedTarget]) fileStates[matchedTarget] = [];
            fileStates[matchedTarget].push({
              step: obj.step_index,
              type: 'write',
              content: args.CodeContent
            });
          }
        }
      }
    }
  } catch (e) {
    // Ignore JSON errors
  }
}

for (const f in fileStates) {
  console.log(`File: ${f}, states available at steps:`, fileStates[f].map(x => `${x.step} (${x.type}, length: ${x.content.length})`));
}

fs.writeFileSync('C:\\Users\\pc\\.gemini\\antigravity\\scratch\\file_states.json', JSON.stringify(fileStates, null, 2), 'utf8');
console.log('Report written to C:\\Users\\pc\\.gemini\\antigravity\\scratch\\file_states.json');
