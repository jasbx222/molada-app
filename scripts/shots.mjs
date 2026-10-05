import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT = '/workspace/generator_app/mobile/screenshots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  locale: 'ar',
});
const page = await context.newPage();

async function shot(name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log('saved', file);
}

await page.goto('http://127.0.0.1:3465/login', { waitUntil: 'networkidle', timeout: 60000 });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await shot('login.png');

await page.getByText('دخول', { exact: true }).click();
await page.waitForTimeout(1600);
await shot('bootstrap.png');

await page.getByText('تحديث الآن', { exact: true }).click();
await page.waitForSelector('text=استلام', { timeout: 20000 });
await page.waitForTimeout(700);
await shot('list.png');

await page.getByText('استلام', { exact: true }).first().click();
await page.waitForTimeout(1000);
await shot('payment.png');

await page.getByText(/تأكيد استلام/).click();
await page.waitForTimeout(1600);
await shot('receipt.png');

await page.goto('http://127.0.0.1:3465/eod', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await shot('end-of-day.png');

await page.goto('http://127.0.0.1:3465/queue', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await shot('queue.png');

await browser.close();
console.log('done');
