import { chromium } from "playwright";

const shotDir = "C:\\Users\\aroja\\AppData\\Local\\Temp\\claude\\c--Users-aroja-Documents-Github-mvp-laviejadventures\\d7b3bf3f-261a-4041-ba5d-69e0ecc55068\\scratchpad";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push("pageerror: " + err.message));

// --- /flyers ---
await page.goto("http://localhost:3000/flyers", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const cardCount = await page.locator("[data-flyer-card]").count();
console.log("flyer card count:", cardCount);

await page.screenshot({ path: shotDir + "\\flyers-full.png", fullPage: true });

// Zoom into the first card
const firstCard = page.locator("[data-flyer-card]").first();
await firstCard.screenshot({ path: shotDir + "\\flyers-card1-before-edit.png" });

// Toggle "Editar objetos" on the first card
const editButton = firstCard.getByRole("button", { name: /Editar objetos/i });
await editButton.click();
await page.waitForTimeout(300);
await firstCard.screenshot({ path: shotDir + "\\flyers-card1-editing.png" });

// Try dragging the "copy" (title) movable group
const canvas = firstCard.locator("[data-layout-canvas]").first();
const movable = canvas.locator('[data-layout-group-id="copy"]');
const box = await movable.boundingBox();
console.log("copy group box:", box);

if (box) {
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 40, startY - 60, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(300);
}

await firstCard.screenshot({ path: shotDir + "\\flyers-card1-after-drag.png" });

const draggedBox = await movable.boundingBox();
console.log("copy group box after drag:", draggedBox);

console.log("console errors on /flyers:", JSON.stringify(consoleErrors));

// --- /rotulos ---
consoleErrors.length = 0;
await page.goto("http://localhost:3000/rotulos", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const flyersLink = page.getByRole("link", { name: /Ver flyers para Instagram/i });
const linkVisible = await flyersLink.isVisible().catch(() => false);
console.log("rotulos -> flyers link visible:", linkVisible);

await page.screenshot({ path: shotDir + "\\rotulos-top.png" });
if (linkVisible) {
  await flyersLink.scrollIntoViewIfNeeded();
  await page.screenshot({ path: shotDir + "\\rotulos-link.png" });
}

console.log("console errors on /rotulos:", JSON.stringify(consoleErrors));

await browser.close();
