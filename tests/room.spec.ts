import { test, expect } from "@playwright/test";

test.describe("Chat functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('input[id="username"]', "helmi");
    await page.fill('input[id="room"]', "room-1");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/room/room-1");
  });

  test("should see list people online", async ({ page }) => {
    // status user should appear in list
    await expect(page.getByText("Online").first()).toBeVisible();

    // Username user should appear in list
    await expect(page.getByText("helmi").first()).toBeVisible();
  });

  test("should send and receive messages", async ({ page }) => {
    // Send a message
    const message = "Hello, this is a test message!";
    await page.fill('input[placeholder="Type your message..."]', message);
    await page.click('button[type="submit"]');

    // Message should appear in chat
    await expect(page.locator(`text=${message}`)).toBeVisible();
  });
});
