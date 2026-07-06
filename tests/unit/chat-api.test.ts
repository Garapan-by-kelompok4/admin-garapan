import { afterEach, describe, expect, it, vi } from "vitest";

import { chatApi } from "@/lib/api/chat";

describe("chatApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches the lightweight admin unread count through the BFF proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ unreadCount: 3 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(chatApi.getUnreadCount()).resolves.toEqual({
      unreadCount: 3,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/proxy/live-chat-admin/unread-count",
      expect.objectContaining({ credentials: "include" }),
    );
  });
});
