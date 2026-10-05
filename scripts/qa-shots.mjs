import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE = 'http://127.0.0.1:4310';
const OUT = '/workspace/qa/generator_collector_fixed';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  locale: 'ar',
});
const page = await context.newPage();
page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.text().includes('418') || msg.text().includes('Hydration')) {
    console.log('CONSOLE', msg.type(), msg.text().slice(0, 200));
  }
});

async function shot(name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log('saved', file);
}

// Fresh login
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 60000 });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await shot('01_login.png');

await page.getByText('دخول', { exact: true }).click();
await page.waitForTimeout(800);
await page.getByText('تحديث الآن', { exact: true }).click();
await page.waitForSelector('text=القائمة', { timeout: 20000 });
await page.waitForTimeout(600);
await shot('02_list.png');

// Open first unpaid card → subscriber detail (C4)
const cards = page.locator('[aria-label^="بطاقة"]');
const count = await cards.count();
console.log('cards', count);
if (count > 0) {
  await cards.first().click();
  await page.waitForTimeout(800);
  await shot('03_subscriber.png');

  // Receive from C4
  const recv = page.getByRole('button', { name: 'استلام' });
  if (await recv.count()) {
    await recv.first().click();
    await page.waitForTimeout(700);
  }
} else {
  // fallback: click any استلام on list
  await page.getByText('استلام', { exact: true }).first().click();
  await page.waitForTimeout(700);
}

// Switch to partial + keypad
const partial = page.getByText('استلام جزئي', { exact: true });
if (await partial.count()) {
  await partial.click();
  await page.waitForTimeout(500);
}
await shot('04_payment_partial_keypad.png');

// Enter a valid partial amount via keypad (e.g. 10000)
for (const d of ['1', '0', '0', '0', '0']) {
  await page.getByRole('button', { name: d, exact: true }).click();
  await page.waitForTimeout(80);
}
await page.waitForTimeout(300);
await page.getByText(/تأكيد استلام/).click();
await page.waitForTimeout(1000);
await shot('05_receipt.png');

await page.goto(`${BASE}/eod`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await shot('06_end_of_day.png');

await browser.close();
console.log('done', OUT);
