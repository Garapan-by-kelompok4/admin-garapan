import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFileSync(path, "utf8");

describe("Lighthouse regressions", () => {
  it("keeps sidebar group labels above Lighthouse contrast threshold", () => {
    const source = readSource("components/layout/sidebar.tsx");

    expect(source).not.toContain("tracking-wider text-ink-300");
    expect(source).toContain("tracking-wider text-ink-500");
  });

  it("keeps dashboard lower panels at a stable initial height", () => {
    const activityFeed = readSource(
      "components/dashboard/dashboard-activity-feed.tsx",
    );
    const attentionPanel = readSource(
      "components/dashboard/dashboard-attention-panel.tsx",
    );

    expect(activityFeed).toContain("min-h-[458px]");
    expect(activityFeed).toContain("h-[360px]");
    expect(attentionPanel).toContain("min-h-[458px]");
  });
});
