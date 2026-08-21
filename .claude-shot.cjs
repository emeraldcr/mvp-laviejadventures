const { chromium } = require('playwright');
const ids = ['menu','calientes','frias','comidas','sinpe','proposito','legal'];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto(process.argv[2] + '/cafeteria', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);

  for (const id of ids) {
    const art = p.locator(`[data-sign-id="${id}"] [role="img"]`).first();
    await art.scrollIntoViewIfNeeded();
    await p.waitForTimeout(400);
    await art.screenshot({ path: `${process.argv[3]}/${id}.png` });
    // Detectar desbordamiento real dentro de la lamina.
    const of = await art.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const bad = [];
      el.querySelectorAll('*').forEach((c) => {
        const cr = c.getBoundingClientRect();
        if (cr.height === 0 || cr.width === 0) return;
        if (cr.bottom > r.bottom + 2 || cr.right > r.right + 2 || cr.top < r.top - 2) {
          const cls = (typeof c.className === 'string' ? c.className : '').slice(0, 55);
          bad.push(`${c.tagName}.${cls} bottom=${(cr.bottom - r.bottom).toFixed(0)} right=${(cr.right - r.right).toFixed(0)}`);
        }
      });
      return { scrollH: el.scrollHeight, clientH: el.clientHeight, overflow: el.scrollHeight - el.clientHeight, bad: bad.slice(0, 5) };
    });
    console.log(id, JSON.stringify(of));
  }
  console.log('ERRORS:', errs.length ? errs.slice(0,8).join(' | ') : 'none');
  await b.close();
})();
