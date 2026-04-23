import { supabase } from "@/lib/supabase";
import { applyRateLimit, jsonNoStore } from "@/lib/api-guard";

export const runtime = "edge";

const VALID_TTL_MS = 30 * 60 * 1000;
const INVALID_TTL_MS = 5 * 60 * 1000;
const COOKIE_MAX_AGE_SECONDS = 8 * 60 * 60;
const SCHOOL_COOKIE = "school_session";

type SchoolCookiePayload = {
  school_id: number;
  school_name: string;
  has_badge: boolean;
  language: "en" | "ml" | "ta" | "bg";
};

type CacheEntry = {
  expiresAt: number;
  payload: SchoolCookiePayload;
};

const globalCache = globalThis as typeof globalThis & {
  __validSchoolCodeCache__?: Map<string, CacheEntry>;
  __invalidSchoolCodeCache__?: Map<string, number>;
};

const validCodeCache =
  globalCache.__validSchoolCodeCache__ ?? new Map<string, CacheEntry>();
const invalidCodeCache =
  globalCache.__invalidSchoolCodeCache__ ?? new Map<string, number>();

globalCache.__validSchoolCodeCache__ = validCodeCache;
globalCache.__invalidSchoolCodeCache__ = invalidCodeCache;

function toLanguage(input: unknown): SchoolCookiePayload["language"] {
  if (input === "ml" || input === "ta" || input === "bg") return input;
  return "en";
}

function isExpired(expiresAt: number) {
  return Date.now() >= expiresAt;
}

function buildSuccessResponse(payload: SchoolCookiePayload) {
  const response = jsonNoStore(
    {
      success: true,
      id: payload.school_id,
      name: payload.school_name,
      has_badge: payload.has_badge,
      language: payload.language,
    },
    200
  );

  response.cookies.set(SCHOOL_COOKIE, encodeURIComponent(JSON.stringify(payload)), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export async function POST(req: Request) {
  const rateLimitResponse = applyRateLimit(req, "api-login", 40, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const { institutionCode, language } = await req.json();
  const normalizedCode = String(institutionCode ?? "").trim();
  const preferredLanguage = toLanguage(language);

  if (!normalizedCode) {
    return jsonNoStore({ error: "Institution code required" }, 400);
  }

  const cachedInvalidExpiry = invalidCodeCache.get(normalizedCode);
  if (cachedInvalidExpiry && !isExpired(cachedInvalidExpiry)) {
    return jsonNoStore({ error: "Invalid institution code" }, 401);
  }

  const cachedValidEntry = validCodeCache.get(normalizedCode);
  if (cachedValidEntry && !isExpired(cachedValidEntry.expiresAt)) {
    return buildSuccessResponse({
      ...cachedValidEntry.payload,
      language: preferredLanguage,
    });
  }

  if (cachedInvalidExpiry && isExpired(cachedInvalidExpiry)) {
    invalidCodeCache.delete(normalizedCode);
  }

  if (cachedValidEntry && isExpired(cachedValidEntry.expiresAt)) {
    validCodeCache.delete(normalizedCode);
  }

  const { data, error } = await supabase
    .from("schools")
    .select("id,name,has_badge,paymentstatus")
    .eq("id", normalizedCode)
    .single();

  if (error || !data) {
    invalidCodeCache.set(normalizedCode, Date.now() + INVALID_TTL_MS);
    return jsonNoStore({ error: "Invalid institution code" }, 401);
  }

  if (data.paymentstatus !== "completed") {
    return jsonNoStore({ error: "Payment not approved yet" }, 403);
  }

  const payload: SchoolCookiePayload = {
    school_id: Number(data.id),
    school_name: String(data.name ?? "School"),
    has_badge: Boolean(data.has_badge),
    language: preferredLanguage,
  };

  validCodeCache.set(normalizedCode, {
    payload,
    expiresAt: Date.now() + VALID_TTL_MS,
  });

  return buildSuccessResponse(payload);
}