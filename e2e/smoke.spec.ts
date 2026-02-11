import { expect, test } from "@playwright/test";

test.describe("Smoke", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Core Stack/i);
  });
});
