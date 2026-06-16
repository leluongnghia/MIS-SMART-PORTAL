import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection established to kill stale build processes...');
  
  // Find processes matching 'next' or 'node' that are running a build, and kill them.
  // Note: we want to avoid killing PM2 itself, so we target 'next-router-worker' and 'next-build'.
  const cmd = `ps aux | grep -i "next" | grep -v grep; echo "Killing next build processes..."; pkill -9 -f "next build" || true; pkill -9 -f "next-route" || true; pkill -9 -f "next-build" || true; echo "Stale build processes killed."`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('Kill process completed.');
      conn.end();
    })
    .on('data', (data) => process.stdout.write(data.toString()))
    .stderr.on('data', (data) => process.stderr.write(data.toString()));
  });
}).connect({
  host: '192.168.49.206',
  username: 'duong',
  password: 'd123456'
});
