import { expect, test } from "@playwright/test";

test("hero loops without playback controls and offer appears only once", async ({ page }) => {
  await page.goto("/");
  const video = page.locator(".hero video");
  await expect(video).toHaveAttribute("autoplay", "");
  await expect(video).toHaveAttribute("loop", "");
  await expect(page.getByRole("button", { name: /pause background video|play background video/i })).toHaveCount(0);
  await expect(page.locator(".consultation-section")).not.toBeVisible();
  await expect(page.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Shipping", exact: true })).toBeVisible();

  await expect(page.getByRole("button", { name: "Claim my offer" })).toBeVisible({ timeout: 9_000 });
  await page.getByRole("button", { name: "Continue browsing" }).click();
  await expect(page.getByRole("button", { name: "Claim my offer" })).toHaveCount(0);
  await page.waitForTimeout(8_000);
  await expect(page.getByRole("button", { name: "Claim my offer" })).toHaveCount(0);
});
