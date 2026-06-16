import http from 'http';

const BASE = 'http://192.168.49.206:3000';
const routes = [
  '/vi/dashboard',
  '/vi/tasks',
  '/vi/tasks/board',
  '/vi/approvals',
  '/vi/planning',
  '/vi/directives',
  '/vi/announcements',
  '/vi/hrm',
  '/vi/analytics',
  '/vi/catalog',
  '/vi/calendar',
  '/api/notifications/summary?userId=user_001',
  '/api/core/tasks',
  '/api/core/workspaces',
];

async function checkRoute(path) {
  return new Promise((resolve) => {
    const req = http.get(BASE + path, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const preview = body.slice(0, 120).replace(/\s+/g, ' ');
        resolve({ path, status: res.statusCode, preview });
      });
    });
    req.on('error', (err) => resolve({ path, status: 'ERR', preview: err.message }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ path, status: 'TIMEOUT', preview: '' });
    });
  });
}

(async () => {
  console.log('Testing all routes...\n');
  for (const route of routes) {
    const result = await checkRoute(route);
    const icon = result.status === 200 ? '✅' : result.status === 302 || result.status === 307 ? '↩️' : '❌';
    console.log(`${icon} [${result.status}] ${result.path}`);
    if (result.status !== 200) {
      console.log(`   Preview: ${result.preview.slice(0, 100)}`);
    }
  }
  console.log('\nDone!');
})();
