import { expect, test } from "@playwright/test";

import { installMockApi } from "./helpers/mock-api";

test.beforeEach(async ({ page }) => {
  await installMockApi(page);
  await page.setViewportSize({ width: 390, height: 844 });
});

test.describe("mobile responsive admin", () => {
  test("opens dashboard navigation from a mobile drawer", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(
      page.getByRole("button", { name: "Buka navigasi" }),
    ).toBeVisible();
    await expect(page.getByRole("complementary")).toBeHidden();

    await page.getByRole("button", { name: "Buka navigasi" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("link", { name: /Manajemen User/ })).toBeVisible();
  });

  test("renders list rows as mobile cards without a desktop table", async ({
    page,
  }) => {
    await page.goto("/users");

    const firstCard = page.getByTestId("mobile-data-card").first();
    await expect(firstCard).toBeVisible({
      timeout: 15_000,
    });
    await expect(firstCard.getByText("E2E Test User")).toBeVisible();
    await expect(page.locator("table")).toBeHidden();
  });

  test("uses list and detail screens for live chat", async ({ page }) => {
    await page.goto("/chat");

    await expect(page.getByText("E2E Chat User")).toBeVisible({
      timeout: 15_000,
    });
    await page.getByText("E2E Chat User").click();

    await expect(
      page.getByRole("button", { name: "Kembali ke daftar chat" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Kembali ke daftar chat" }).click();

    await expect(page.getByText("E2E Chat User")).toBeVisible();
  });

  test("keeps core pages within the viewport at responsive sizes", async ({
    page,
  }) => {
    const viewports = [
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ];
    const paths = [
      "/dashboard",
      "/users",
      "/moderation",
      "/disputes",
      "/transactions",
      "/chat",
      "/articles",
      "/settings",
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      for (const path of paths) {
        await page.goto(path);
        await expect(page.getByText("GARAPAN · Admin")).toBeVisible();

        const overflow = await page.evaluate(() => ({
          width: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));

        expect(
          overflow.scrollWidth,
          `${path} overflows at ${viewport.width}x${viewport.height}`,
        ).toBeLessThanOrEqual(overflow.width + 1);
      }
    }
  });

  test("opens operational detail dialogs as scrollable mobile bottom sheets", async ({
    page,
  }) => {
    const detailOpeners = [
      { path: "/users", label: "Lihat Detail" },
      { path: "/moderation", label: "Tinjau Konten" },
      { path: "/disputes", label: "Tinjau Laporan" },
      { path: "/transactions", label: "Lihat Detail Escrow" },
    ];

    for (const item of detailOpeners) {
      await page.goto(item.path);
      await page.getByRole("button", { name: item.label }).first().click();

      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      const box = await dialog.boundingBox();
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      expect(box, `${item.path} dialog has a bounding box`).not.toBeNull();
      expect(
        Math.round(box?.y ?? 0),
        `${item.path} dialog should leave backdrop visible above`,
      ).toBeGreaterThan(0);
      expect(
        Math.round((box?.y ?? 0) + (box?.height ?? 0)),
        `${item.path} dialog should touch viewport bottom`,
      ).toBe(viewportHeight);
      expect(
        Math.round(box?.height ?? 0),
        `${item.path} dialog should not consume the full viewport`,
      ).toBeLessThan(viewportHeight);

      await page.keyboard.press("Escape");
    }
  });
});
