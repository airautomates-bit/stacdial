import { expect, test } from "@playwright/test";

test("local admin access accepts only the approved email and remembers the session", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByLabel("Administrator password")).toHaveCount(0);
  await page.getByLabel("Administrator email").fill("vervestac@gmail.com");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("link", { name: "Product manager" })).toBeVisible({ timeout: 15_000 });

  await page.reload();
  await expect(page.getByRole("link", { name: "Pre-order manager" })).toBeVisible();
});
