import type { QueryClient } from "@tanstack/react-query";

export function invalidateModerationQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ["content"] });
  void queryClient.invalidateQueries({ queryKey: ["content", "summary-stats"] });
  void queryClient.invalidateQueries({ queryKey: ["sidebarModerationCount"] });
}
