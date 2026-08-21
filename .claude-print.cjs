const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1100 } });
  await p.goto(process.argv[2] + '/cafeteria', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1000);
  await p.emulateMedia({ media: 'print' });
  await p.waitForTimeout(400);
  // Todas las laminas visibles en impresion completa
  const all = await p.evaluate(() => [...document.querySelectorAll('[data-sign-id]')]
      .map(e => `${e.dataset.signId}:${getComputedStyle(e).display}`).join(' '));
  console.log('PRINT all ->', all);
  // Impresion selectiva del rotulo nuevo
  await p.evaluate(() => { document.documentElement.dataset.cafeteriaPrint = 'legal'; });
  await p.waitForTimeout(300);
  const one = await p.evaluate(() => [...document.querySelectorAll('[data-sign-id]')]
      .map(e => `${e.dataset.signId}:${getComputedStyle(e).display}`).join(' '));
  console.log('PRINT legal only ->', one);
  const chrome = await p.evaluate(() => {
    const h = document.querySelector('header');
    const d = document.querySelector('[data-sign-id="legal"] aside');
    return `header:${getComputedStyle(h).display} details:${d ? getComputedStyle(d).display : 'n/a'}`;
  });
  console.log('PRINT chrome ->', chrome);
  await p.pdf({ path: `${process.argv[3]}/cafeteria-print.pdf`, landscape: true, format: 'A4', printBackground: true });
  await b.close();
})();
