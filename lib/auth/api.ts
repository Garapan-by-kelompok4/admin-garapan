import "server-only";

/**
 * Base URL of the NestJS API. Server-only — never exposed to the client.
 * Route Handlers are the only place allowed to talk to NestJS directly.
 */
export function nestjsBaseUrl(): string {
  const url = process.env.NESTJS_API_URL;
  if (!url) {
    throw new Error("NESTJS_API_URL is not set");
  }
  return url.replace(/\/+$/, "");
}
