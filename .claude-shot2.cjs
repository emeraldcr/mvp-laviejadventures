const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1100 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await p.goto(process.argv[2] + '/cafeteria', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  // Español
  await p.screenshot({ path: `${process.argv[3]}/page-es.png` });
  // Cambiar a inglés
  await p.getByRole('button', { name: /Switch to English/i }).click();
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${process.argv[3]}/page-en.png` });
  const h1 = await p.locator('h1').first().innerText();
  const nav = await p.locator('nav[aria-label] a').allInnerTexts();
  const pend = await p.locator('aside li span').first().innerText();
  console.log('EN h1:', h1);
  console.log('EN nav:', nav.join(' | '));
  console.log('EN first pending:', pend);
  // Volver a español para confirmar que el toggle es reversible
  await p.getByRole('button', { name: /Cambiar a español/i }).click();
  await p.waitForTimeout(700);
  console.log('ES h1:', await p.locator('h1').first().innerText());
  console.log('ERRORS:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
