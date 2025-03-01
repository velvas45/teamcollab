import { test, expect, type Page } from "@playwright/test";

// Helper function for login
async function login(page: Page, name: string, room: string) {
  await page.goto("/login");

  // Wait for form to be ready
  await page.waitForSelector("form", { state: "visible" });

  // Use fill instead of type for better cross-browser compatibility
  await page.fill('input[id="username"]', name);
  await page.fill('input[id="room"]', room);

  // Wait for button to be ready and visible
  await page.waitForSelector('button[type="submit"]', { state: "visible" });

  // Use waitForLoadState before clicking
  await page.waitForLoadState("networkidle");

  // Click with force: true for WebKit
  await page.click('button[type="submit"]', { force: true });
}

test.describe("Authentication", () => {
  // Add setup for each test
  test.beforeEach(async ({ page }) => {
    // Ensure clean state
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.evaluate(() => window.sessionStorage.clear());
  });

  test("should allow user to login", async ({ page, browserName }) => {
    // Skip if running on WebKit in CI (if needed)
    test.skip(
      browserName === "webkit" && Boolean(process.env.CI),
      "This test is unstable on WebKit in CI"
    );

    await login(page, "helmi", "room-1");

    // Add explicit waits for WebKit
    await page.waitForURL("/room/room-1", { waitUntil: "networkidle" });

    // Wait for content to be visible
    await page.waitForSelector("text=helmi", { state: "visible" });

    // Verify URL and content
    await expect(page).toHaveURL("/room/room-1");
    await expect(page.getByRole("banner").getByText("helmi")).toBeVisible();
  });
});
