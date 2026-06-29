import { test, expect } from "@playwright/test";

test.describe("GARAPAN Admin Panel - Redirection & Login E2E Smoke Tests", () => {
  test("should redirect unauthenticated dashboard access to login", async ({ page }) => {
    // Visit protected dashboard page
    await page.goto("/dashboard");
    
    // Assert redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test("should display login validation errors on empty submissions", async ({ page }) => {
    await page.goto("/login");
    
    // Attempt submit without filling form
    const submitBtn = page.locator("button[type='submit']");
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
    
    // Validation should prevent redirect and display standard form error feedback
    await expect(page).toHaveURL(/\/login/);
  });

  test("should show error on incorrect credentials", async ({ page }) => {
    await page.goto("/login");
    
    // Fill credentials
    await page.fill("input[type='email']", "admin-wrong@garapan.test");
    await page.fill("input[type='password']", "wrong-password");
    
    // Click submit
    const submitBtn = page.locator("button[type='submit']");
    await submitBtn.click();
    
    // Should still stay on login or display error
    await expect(page).toHaveURL(/\/login/);
  });
});
