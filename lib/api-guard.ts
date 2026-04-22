import { NextResponse } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __rateLimitStore__?: Map<string, Bucket>;
};

const rateLimitStore =
  globalForRateLimit.__rateLimitStore__ ?? new Map<string, Bucket>();
globalForRateLimit.__rateLimitStore__ = rateLimitStore;

function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

export function jsonNoStore(payload: unknown, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export function applyRateLimit(
  req: Request,
  scope: string,
  limit = 60,
  windowMs = 60_000
) {
  const now = Date.now();
  const ip = getClientIp(req);
  const key = `${scope}:${ip}`;
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return null;
}

export function validateAdminToken(req: Request) {
  const requiredToken = process.env.ADMIN_API_TOKEN;
  if (!requiredToken) return null;

  const token = req.headers.get("x-admin-token");
  if (token !== requiredToken) {
    return jsonNoStore({ error: "Unauthorized" }, 401);
  }

  return null;
}
