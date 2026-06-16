import http from 'http';

const BASE = 'http://192.168.49.206:3000';

// Find what routes actually exist by testing known paths
const routes = [
  '/vi/tasks',
  '/vi/tasks/board',
  '/vi/forecast',
  '/vi/plans',
  '/vi/planning',
  '/vi/schedule',
  '/vi/events',
  '/vi/calendar',
  '/vi/categories',
  '/vi/catalog',
  '/vi/kpi',
  '/vi/analytics',
  '/vi/reports',
  '/vi/system-reports',
  '/vi/data',
  '/vi/okr',
  '/vi/risk',
  '/vi/settings',
  '/vi/admissions',
  '/vi/leads',
  '/vi/students',
  '/vi/payments',
];

async function checkRoute(path) {
  return new Promise((resolve) => {
    const req = http.get(BASE + path, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ path, status: res.statusCode });
      });
    });
    req.on('error', (err) => resolve({ path, status: 'ERR' }));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ path, status: 'TIMEOUT' });
    });
  });
}

(async () => {
  console.log('Discovering all available routes...\n');
  for (const route of routes) {
    const result = await checkRoute(route);
    const icon = result.status === 200 ? '✅' : result.status === 302 || result.status === 307 ? '↩️' : '❌';
    console.log(`${icon} [${result.status}] ${result.path}`);
  }
  console.log('\nDone!');
})();
