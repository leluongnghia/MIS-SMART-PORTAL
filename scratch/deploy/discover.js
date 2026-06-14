import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connection established successfully!');
  
  // Find package.json files in /home and /var/www
  const cmd = "find /home /var/www -maxdepth 4 -name 'package.json' 2>/dev/null";
  console.log(`Executing: ${cmd}`);
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution error:', err);
      conn.end();
      return;
    }
    
    let output = '';
    stream.on('close', (code, signal) => {
      console.log(`Command exited with code ${code}`);
      const paths = output.trim().split('\n').filter(Boolean);
      console.log('Found package.json files at:');
      console.log(paths);
      
      if (paths.length === 0) {
        console.log('No package.json files found on the remote server under /home or /var/www.');
        conn.end();
        return;
      }
      
      // Let's print the content of each package.json to identify which one is ours
      let completed = 0;
      paths.forEach((pkgPath) => {
        const catCmd = `cat "${pkgPath}"`;
        conn.exec(catCmd, (err2, stream2) => {
          if (err2) {
            completed++;
            if (completed === paths.length) conn.end();
            return;
          }
          let content = '';
          stream2.on('data', (data) => {
            content += data;
          });
          stream2.on('close', () => {
            console.log(`\n--- ${pkgPath} ---`);
            try {
              const json = JSON.parse(content);
              console.log(`Name: ${json.name}, Version: ${json.version}`);
            } catch (e) {
              console.log(content.slice(0, 200) + '...');
            }
            completed++;
            if (completed === paths.length) {
              console.log('Done discovery.');
              conn.end();
            }
          });
        });
      });
    }).on('data', (data) => {
      output += data;
    }).stderr.on('data', (data) => {
      console.error('STDERR:', data.toString());
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect({
  host: '192.168.49.206',
  port: 22,
  username: 'duong',
  password: 'd123456'
});
