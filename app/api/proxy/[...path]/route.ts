import { NextResponse, type NextRequest } from "next/server";

import { nestjsBaseUrl } from "@/lib/auth/api";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

type RouteContext = { params: Promise<{ path: string[] }> };

// Hop-by-hop / sensitive headers we must not forward upstream.
const STRIPPED_REQUEST_HEADERS = new Set([
  "host",
  "cookie",
  "connection",
  "content-length",
]);

// Bodyless methods must not carry content-type upstream —
// NestJS body-parser will try to deserialise the (absent) body and return 500.
const BODYLESS_METHODS = new Set(["GET", "HEAD", "DELETE", "OPTIONS"]);

/**
 * Authenticated passthrough to NestJS. The client calls `/api/proxy/<path>`
 * with `credentials: 'include'`; we attach `Authorization: Bearer <access>` from
 * the httpOnly cookie and stream the upstream response back verbatim.
 *
 * 401s are forwarded as-is so the client's `apiClient` can run its
 * refresh-then-retry flow (the refresh cookie is not visible here by design —
 * it is scoped to /api/auth).
 */
async function handle(request: NextRequest, context: RouteContext) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
  }

  const { path } = await context.params;
  const target = `${nestjsBaseUrl()}/${path
    .map(encodeURIComponent)
    .join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  const isBodyless = BODYLESS_METHODS.has(request.method);
  request.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (STRIPPED_REQUEST_HEADERS.has(k)) return;
    if (isBodyless && k === "content-type") return;
    headers.set(key, value);
  });
  headers.set("Authorization", `Bearer ${accessToken}`);

  const hasBody = ["POST", "PUT", "PATCH"].includes(request.method);
  const bodyBuffer = hasBody ? await request.arrayBuffer() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: bodyBuffer,
      redirect: "manual",
      cache: "no-store",
    });
  } catch (err) {
    console.error("Proxy fetch failed:", err);
    return NextResponse.json(
      { message: "Gagal menghubungi server backend" },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }

  // Force disable browser and intermediate caching for all proxy requests
  responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  responseHeaders.set("Pragma", "no-cache");
  responseHeaders.set("Expires", "0");

  // 204 No Content / 205 Reset Content must not carry a body
  if (upstream.status === 204 || upstream.status === 205) {
    return new NextResponse(null, {
      status: upstream.status,
      headers: responseHeaders,
    });
  }

  const responseBody = await upstream.arrayBuffer();

  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
};
