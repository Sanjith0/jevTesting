// Playwright runner for select-all-schools.js.
//
//   npm install            (from this folder; uses your local Chrome)
//   node run-playwright.js
//
// A Chrome window opens with a persistent profile (./.hs-profile), so you only
// log in to Handshake once. Navigate to the job > Job details > schools Edit,
// then press Enter in this terminal. The script selects every school; you
// review and click Save in the browser.

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ask = (q) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, () => {
      rl.close();
      resolve();
    });
  });

(async () => {
  const context = await chromium.launchPersistentContext(path.join(__dirname, '.hs-profile'), {
    headless: false,
    channel: process.env.PW_CHANNEL || 'chrome',
    viewport: null,
  });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto('https://app.joinhandshake.com/');

  await ask('Log in, open the job\'s school picker ("Search by name" visible), then press Enter… ');

  page.on('console', (msg) => {
    if (msg.text().startsWith('[schools]')) console.log(msg.text());
  });
  await page.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'select-all-schools.js'), 'utf8') });
  const names = await page.evaluate(() => window.__schoolSelectRun);
  console.log(`Selected ${names ? names.length : 0} schools. Review in the browser and click Save.`);

  await ask('Press Enter to close the browser… ');
  await context.close();
})();
