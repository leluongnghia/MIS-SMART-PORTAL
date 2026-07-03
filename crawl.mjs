import { chromium } from '@playwright/test';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('Khởi động trình duyệt...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Đăng nhập...');
  await page.goto(`${BASE_URL}/vi/dashboard`);

  // Wait for mock users to render and click the first mock user (which is Hoang Van A - Admin)
  const buttons = page.locator('button').filter({ hasText: 'Chủ tịch' }).first();
  await buttons.click();

  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard**', { timeout: 10000 });
  console.log('Đăng nhập thành công, thu thập danh sách menu...');

  // Get all sidebar links
  const links = await page.$$eval('aside nav a[href]', (elements) => {
    return elements.map(el => ({
      text: el.innerText.trim(),
      href: el.getAttribute('href')
    }));
  });

  const uniqueLinks = [];
  const seenHrefs = new Set();
  for (const link of links) {
    if (link.href && !seenHrefs.has(link.href)) {
      seenHrefs.add(link.href);
      uniqueLinks.push(link);
    }
  }

  console.log(`Tìm thấy ${uniqueLinks.length} module cần kiểm tra.`);

  const report = [
    '# BÁO CÁO TRẠNG THÁI MODULE (Tự động)',
    '',
    '| Module | Đường dẫn | Trạng thái | Ghi chú |',
    '|---|---|---|---|'
  ];

  for (let i = 0; i < uniqueLinks.length; i++) {
    const item = uniqueLinks[i];
    let fullUrl = item.href.startsWith('http') ? item.href : `${BASE_URL}${item.href}`;
    console.log(`Đang quét [${i + 1}/${uniqueLinks.length}]: ${item.text} (${item.href})`);

    try {
      const response = await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 5000 });
      const status = response ? response.status() : 0;

      const bodyText = await page.innerText('body');

      let pageStatus = '✅ OK';
      let note = 'Hoạt động';

      if (status >= 400 || bodyText.includes('This page could not be found') || bodyText.includes('404')) {
        pageStatus = '❌ 404 Error';
        note = 'Chưa có trang (Placeholder)';
      } else if (bodyText.includes('Application error') || status >= 500) {
        pageStatus = '🔥 500 Error';
        note = 'Lỗi server (Crash)';
      } else if (bodyText.includes('Đang phát triển') || bodyText.includes('Coming soon') || bodyText.includes('xây dựng')) {
        pageStatus = '🚧 Đang PT';
        note = 'Module UI tĩnh, đang làm';
      }

      report.push(`| ${item.text.replace(/\n/g, ' ')} | \`${item.href}\` | ${pageStatus} | ${note} |`);
    } catch (e) {
      report.push(`| ${item.text.replace(/\n/g, ' ')} | \`${item.href}\` | ❌ Lỗi | Timeout/Không tải được |`);
    }
  }

  console.log('Quét xong! Đang xuất báo cáo...');
  fs.writeFileSync('C:\\Users\\pc\\.gemini\\antigravity-ide\\brain\\97594f56-7463-4fc7-b697-dbdfe5c511a5\\module_report.md', report.join('\n'), 'utf-8');
  await browser.close();
  console.log('Báo cáo đã được lưu vào artifacts.');
}

run().catch(err => {
  console.error('Lỗi khi chạy crawler:', err);
  process.exit(1);
});
