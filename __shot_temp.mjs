import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:3000";
const out = process.argv[2] || "penalitos";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 760 }, deviceScaleFactor: 2 });
page.on("console", (m) => { if (m.type() === "error") console.log("PAGE ERR:", m.text()); });
page.on("pageerror", (e) => console.log("PAGE EXCEPTION:", e.message));

await page.goto(`${base}/penalitos-preview-temp`, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(4000);
await page.screenshot({ path: `${out}-idle.png` });

// Goal: capture mid-flight and result
await page.click("#btn-goal");
await page.waitForTimeout(950);
await page.screenshot({ path: `${out}-goal-mid.png` });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}-goal-end.png` });

// Save
await page.click("#btn-save");
await page.waitForTimeout(1150);
await page.screenshot({ path: `${out}-save-mid.png` });
await page.waitForTimeout(1100);
await page.screenshot({ path: `${out}-save-end.png` });

await browser.close();
console.log("done");
