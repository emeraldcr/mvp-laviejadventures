const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const baseUrl = "http://127.0.0.1:3000";

async function auditPage(page) {
  return page.evaluate(() => ({
    bodyTextLength: document.body.innerText.trim().length,
    brokenImages: Array.from(document.images)
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.getAttribute("src")),
    errorOverlay: Boolean(
      document.querySelector("[data-nextjs-dialog], #webpack-dev-server-client-overlay"),
    ),
    h1: document.querySelector("h1")?.textContent?.trim() ?? null,
    scrollWidth: document.documentElement.scrollWidth,
    signs: document.querySelectorAll("[data-sign-id]").length,
    title: document.title,
    viewportWidth: window.innerWidth,
  }));
}

(async () => {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });
  const outputDir = os.tmpdir();
  const errors = [];
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  desktop.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  desktop.on("pageerror", (error) => errors.push(`page: ${error.message}`));

  const response = await desktop.goto(`${baseUrl}/cafeteria`, {
    waitUntil: "networkidle",
    timeout: 45000,
  });
  await desktop.evaluate(() => document.fonts.ready);

  const heroPath = path.join(outputDir, "cafeteria-desktop-hero.png");
  await desktop.screenshot({ path: heroPath, fullPage: false });

  const signIds = ["menu", "calientes", "frias", "comidas", "sinpe", "proposito"];
  const artworkPaths = {};
  for (const signId of signIds) {
    const artworkPath = path.join(outputDir, `cafeteria-${signId}.png`);
    await desktop.locator(`[data-sign-id="${signId}"] [role="img"]`).screenshot({
      path: artworkPath,
    });
    artworkPaths[signId] = artworkPath;
  }

  const desktopAudit = await auditPage(desktop);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const mobileErrors = [];
  mobile.on("console", (message) => {
    if (message.type() === "error") mobileErrors.push(`console: ${message.text()}`);
  });
  mobile.on("pageerror", (error) => mobileErrors.push(`page: ${error.message}`));
  const mobileResponse = await mobile.goto(`${baseUrl}/cafeteria`, {
    waitUntil: "networkidle",
    timeout: 45000,
  });
  await mobile.evaluate(() => document.fonts.ready);
  const mobilePath = path.join(outputDir, "cafeteria-mobile.png");
  await mobile.screenshot({ path: mobilePath, fullPage: false });
  const mobileAudit = await auditPage(mobile);

  await desktop.emulateMedia({ media: "print" });
  await desktop.evaluate(() => {
    document.documentElement.dataset.cafeteriaPrint = "sinpe";
  });
  const printAudit = await desktop.evaluate(() => ({
    visibleSigns: Array.from(document.querySelectorAll("[data-sign-id]")).filter(
      (element) => getComputedStyle(element).display !== "none",
    ).length,
    screenChromeVisible: Array.from(document.querySelectorAll("header, nav, footer")).filter(
      (element) => getComputedStyle(element).display !== "none",
    ).length,
  }));
  const printPath = path.join(outputDir, "cafeteria-print-sinpe.png");
  await desktop.locator('[data-sign-id="sinpe"] [role="img"]').screenshot({ path: printPath });

  const homeResponse = await desktop.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 45000 });

  console.log(
    JSON.stringify(
      {
        artworkPaths,
        desktop: { status: response?.status(), ...desktopAudit },
        errors,
        homeStatus: homeResponse?.status(),
        mobile: { status: mobileResponse?.status(), ...mobileAudit },
        mobileErrors,
        paths: { heroPath, mobilePath, printPath },
        print: printAudit,
      },
      null,
      2,
    ),
  );

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
