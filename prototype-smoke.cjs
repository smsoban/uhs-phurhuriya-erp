const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Learning with purpose/i }).waitFor();
  await page.screenshot({ path: 'prototype-home.png', fullPage: true });

  await page.getByRole('button', { name: /Student registration/i }).click();
  await page.getByLabel('Student full name').fill('Demo Student');
  await page.getByLabel('Father / guardian name').fill('Demo Guardian');
  await page.getByLabel('Date of birth').fill('2012-06-14');
  await page.getByLabel('Parent / guardian mobile').fill('9876543210');
  await page.locator('.consent input').check();
  await page.getByRole('button', { name: /Submit for review/i }).click();
  await page.getByText(/submitted for admin approval/i).waitFor();

  await page.getByRole('button', { name: /ERP Login/i }).click();
  await page.getByRole('button', { name: /Sign in as admin/i }).click();
  await page.getByRole('heading', { name: 'School overview' }).waitFor();
  await page.getByRole('button', { name: /Registrations/i }).first().click();
  await page.getByText('Demo Student').waitFor();
  await page.locator('tbody tr', { hasText: 'Demo Student' }).getByRole('button', { name: /Review/i }).click();
  await page.getByRole('button', { name: /Approve & create record/i }).click();
  await page.getByText(/approved/i).last().waitFor();
  await page.screenshot({ path: 'prototype-admin.png', fullPage: true });

  await page.getByRole('button', { name: /Sign out/i }).click();
  await page.getByRole('button', { name: /ERP Login/i }).click();
  await page.getByRole('button', { name: /^Teacher$/i }).click();
  await page.getByRole('button', { name: /Sign in as teacher/i }).click();
  await page.getByRole('heading', { name: /Good afternoon, Neha/i }).waitFor();
  await page.getByRole('button', { name: /My leave/i }).click();
  await page.getByRole('button', { name: /Apply for leave/i }).click();
  await page.getByRole('button', { name: /Submit request/i }).click();
  await page.getByText(/submitted to admin/i).waitFor();

  await page.getByRole('button', { name: /Sign out/i }).click();
  await page.getByRole('button', { name: /ERP Login/i }).click();
  await page.getByRole('button', { name: /^Student$/i }).click();
  await page.getByRole('button', { name: /Sign in as student/i }).click();
  await page.getByRole('heading', { name: /Hello, Sana/i }).waitFor();
  await page.getByRole('button', { name: /Exams & results/i }).click();
  await page.getByRole('button', { name: /Start test/i }).click();
  const questions = page.locator('.question');
  await questions.nth(0).getByText('CPU', { exact: true }).click();
  await questions.nth(1).getByText('Mouse', { exact: true }).click();
  await questions.nth(2).getByText('1024 bytes', { exact: true }).click();
  await page.getByRole('button', { name: /Submit answers/i }).click();
  await page.getByText('You scored 3/3').waitFor();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await mobile.getByRole('heading', { name: /Learning with purpose/i }).waitFor();
  await mobile.screenshot({ path: 'prototype-mobile.png', fullPage: false });

  console.log(JSON.stringify({ flows: ['public registration', 'admin approval', 'teacher leave', 'student quiz', 'mobile layout'], consoleErrors: errors }, null, 2));
  await browser.close();
  if (errors.length) process.exitCode = 1;
})();
