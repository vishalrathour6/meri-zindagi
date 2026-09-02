// Drives the running `pnpm dev` server with a real Chrome instance.
// Usage: node driver.cjs <command> [args...]
//   node driver.cjs smoke                  register+login+new diary entry+mood pick, screenshots at each step
//   node driver.cjs nav <path>              open a path (default logged-out), screenshot
//   node driver.cjs shot <path> <out.png>   nav + screenshot to an explicit file

const { chromium } = require("playwright-core");
const path = require("path");

const BASE_URL = process.env.MZ_BASE_URL || "http://localhost:3000";
const SHOT_DIR = process.env.MZ_SHOT_DIR || path.join(__dirname, "shots");
const fs = require("fs");
fs.mkdirSync(SHOT_DIR, { recursive: true });

async function withBrowser(fn) {
  const browser = await chromium.launch({
    channel: "chrome",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  try {
    await fn(page);
  } finally {
    if (consoleErrors.length) {
      console.log("CONSOLE ERRORS:", JSON.stringify(consoleErrors, null, 2));
    }
    await browser.close();
  }
}

async function registerAndLogin(page) {
  const email = `driver+${process.pid}${Math.floor(Math.random() * 1e6)}@example.test`;
  const password = "DriverCheck123!";

  await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });
  await page.locator('input[name="name"], input#name').first().fill("Driver Check");
  await page.locator('input[type="email"], input[name="email"]').first().fill(email);
  const pwInputs = page.locator('input[type="password"]');
  const pwCount = await pwInputs.count();
  for (let i = 0; i < pwCount; i++) await pwInputs.nth(i).fill(password);
  await page.locator('button[type="submit"]').first().click();

  // Register redirects to /login; on success from there, to /dashboard.
  await page.waitForURL((u) => !u.pathname.includes("/register"), { timeout: 10000 });
  if (page.url().includes("/login")) {
    await page.locator('input[type="email"], input[name="email"]').first().fill(email);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 10000 });
  }
  return { email, password };
}

async function smoke() {
  await withBrowser(async (page) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(SHOT_DIR, "01-landing.png") });
    console.log("landing:", page.url(), "-", await page.title());

    await registerAndLogin(page);
    console.log("post-auth:", page.url());
    await page.screenshot({ path: path.join(SHOT_DIR, "02-dashboard.png") });

    await page.goto(`${BASE_URL}/diary`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(SHOT_DIR, "03-diary-empty.png") });

    await page.getByRole("button", { name: "Add diary entry" }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SHOT_DIR, "04-new-entry.png") });

    const moodButtons = page.locator('button[aria-label][title]');
    const moodCount = await moodButtons.count();
    console.log("mood buttons found:", moodCount);
    if (moodCount > 0) {
      await moodButtons.first().click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(SHOT_DIR, "05-mood-selected-light.png") });

      const themeToggle = page
        .locator("button:has(svg.lucide-sun), button:has(svg.lucide-moon)")
        .first();
      if (await themeToggle.count()) {
        await themeToggle.click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(SHOT_DIR, "06-mood-selected-dark.png") });
      }
    }
    console.log("smoke OK, screenshots in", SHOT_DIR);
  });
}

async function nav(targetPath) {
  await withBrowser(async (page) => {
    await page.goto(`${BASE_URL}${targetPath}`, { waitUntil: "networkidle" });
    console.log("url:", page.url(), "-", await page.title());
    await page.screenshot({ path: path.join(SHOT_DIR, "nav.png") });
    console.log("screenshot:", path.join(SHOT_DIR, "nav.png"));
  });
}

async function shot(targetPath, outFile) {
  await withBrowser(async (page) => {
    await page.goto(`${BASE_URL}${targetPath}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: outFile, fullPage: true });
    console.log("screenshot:", outFile);
  });
}

const [, , cmd, ...rest] = process.argv;
(async () => {
  if (cmd === "smoke") await smoke();
  else if (cmd === "nav") await nav(rest[0] || "/");
  else if (cmd === "shot") await shot(rest[0] || "/", rest[1] || path.join(SHOT_DIR, "shot.png"));
  else {
    console.error("usage: node driver.cjs <smoke|nav|shot> [args]");
    process.exit(1);
  }
})();
