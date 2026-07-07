import path from "node:path";

import { test as setup, expect } from "@playwright/test";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

import { installMockApi } from "./helpers/mock-api";

const authFile = path.join(__dirname, "../../playwright/.auth/admin.json");

setup("cache authenticated session", async ({ page, context, baseURL }) => {
  await installMockApi(page);

  await context.addCookies([
    {
      name: ACCESS_TOKEN_COOKIE,
      value: "e2e-mock-access-token",
      url: baseURL ?? "http://localhost:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/dashboard");
  await expect(page.getByText("Total User Aktif")).toBeVisible({
    timeout: 30_000,
  });

  await page.context().storageState({ path: authFile });
});
