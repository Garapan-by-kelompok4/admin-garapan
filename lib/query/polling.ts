/** Shared TanStack Query polling intervals (ms). */
export const CHAT_POLL_INTERVAL_MS = 5_000;
export const OPS_BADGE_POLL_INTERVAL_MS = 30_000;
export const TRANSACTIONS_BADGE_POLL_INTERVAL_MS = 60_000;

/** Pause interval polling while the tab is hidden; resume when visible. */
export function visibilityAwareInterval(
  intervalMs: number,
  isDocumentVisible: boolean,
): number | false {
  return isDocumentVisible ? intervalMs : false;
}
