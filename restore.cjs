const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:/Users/pc/.gemini/antigravity-ide/brain/2fbfc6dc-c048-48ee-ac08-eb1f172a0232/.system_generated/logs/transcript.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const filesToWrite = {};

  for await (const line of rl) {
    try {
      const step = JSON.parse(line);
      if (step.tool_calls) {
        for (const tc of step.tool_calls) {
          if (tc.name === 'write_to_file' || tc.name === 'default_api:write_to_file') {
            let file = tc.args.TargetFile;
            if (file) {
               file = file.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
               if (file.includes('(admin)')) {
                 let code = tc.args.CodeContent;
                 if (typeof code === 'string') {
                    // sometimes tool args code is wrapped in quotes
                    if (code.startsWith('"') && code.endsWith('"')) {
                       code = JSON.parse(code); // parse JSON encoded string
                    }
                 }
                 filesToWrite[file] = code;
               }
            }
          }
        }
      }
    } catch(e) {}
  }

  for (const [file, content] of Object.entries(filesToWrite)) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Restored: ' + file);
  }
}

processLineByLine();
