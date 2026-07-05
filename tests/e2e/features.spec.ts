import { test, expect } from "@playwright/test";

import { installMockApi } from "./helpers/mock-api";

test.beforeEach(async ({ page }) => {
  await installMockApi(page);
});

const FEATURE_PAGES = [
  {
    path: "/dashboard",
    title: "Dashboard",
    marker: "Total User Aktif",
  },
  {
    path: "/users",
    title: "Manajemen User",
    marker: "E2E Test User",
  },
  {
    path: "/moderation",
    title: "Moderasi Konten",
    marker: "E2E Flagged Jasa",
  },
  {
    path: "/disputes",
    title: "Dispute & Laporan",
    marker: "E2E Reporter",
  },
  {
    path: "/transactions",
    title: "Transaksi & Escrow",
    marker: "E2E Jasa Title",
  },
  {
    path: "/chat",
    title: "Live Chat",
    marker: "E2E Chat User",
  },
  {
    path: "/articles",
    title: "Artikel & Blog",
    marker: "E2E Artikel Blog",
  },
  {
    path: "/settings",
    title: "Profil & Settings",
    marker: "#fullName",
    markerKind: "input-value" as const,
    markerValue: "E2E Admin Profile",
  },
] as const;

test.describe("Dashboard feature pages", () => {
  for (const feature of FEATURE_PAGES) {
    test(`loads ${feature.path}`, async ({ page }) => {
      await page.goto(feature.path);

      await expect(page.getByText(feature.title).first()).toBeVisible({
        timeout: 15_000,
      });

      if ("markerKind" in feature && feature.markerKind === "input-value") {
        await expect(page.locator(feature.marker)).toHaveValue(feature.markerValue, {
          timeout: 15_000,
        });
      } else {
        await expect(page.getByText(feature.marker).first()).toBeVisible({
          timeout: 15_000,
        });
      }
    });
  }
});
