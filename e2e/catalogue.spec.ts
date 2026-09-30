import { expect, test } from "@playwright/test";

test("individual product cards and dynamic collection navigation stay connected", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.locator(".watch-product-card")).toHaveCount(6);
  await expect(page.getByText("Collection preview")).toHaveCount(0);

  await page.getByRole("link", { name: "View Meridian Silver 38" }).click();
  await expect(page).toHaveURL(/\/shop\/meridian-silver-38$/);
  await expect(page.getByRole("heading", { name: "Meridian Silver 38" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Preview only" })).toBeDisabled();
  await page.goto("/shop");

  await page.getByRole("button", { name: "Shop", exact: true }).click();
  const menu = page.locator(".mega");
  await expect(menu).toBeVisible();
  await expect(menu.locator("img.collection-lifestyle")).toHaveCount(6);
  await expect(menu.getByRole("link", { name: "GMT" })).toBeVisible();
  await menu.getByRole("link", { name: "GMT" }).click();

  await expect(page).toHaveURL(/collection=GMT/);
  await expect(page.getByRole("heading", { name: "GMT watches." })).toBeVisible();
  await expect(page.locator(".watch-product-card")).toHaveCount(1);
});
