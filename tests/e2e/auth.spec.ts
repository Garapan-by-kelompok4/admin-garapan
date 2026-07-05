import { test, expect } from "@playwright/test";

import { installFailedLoginMock } from "./helpers/mock-api";

test.describe("Auth gates & login", () => {
  test("redirects unauthenticated dashboard access to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: /Masuk ke Dashboard/i }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Password wajib diisi")).toBeVisible();
  });

  test("shows error on incorrect credentials", async ({ page }) => {
    await installFailedLoginMock(page);
    await page.goto("/login");

    await page.locator("#email").fill("admin-wrong@garapan.test");
    await page.locator("#password").fill("wrong-password");
    await page.getByRole("button", { name: /Masuk ke Dashboard/i }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Email atau password salah")).toBeVisible();
  });
});
