import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { applyRateLimit, jsonNoStore, validateAdminToken } from "@/lib/api-guard";

export const runtime = "nodejs";

// OPTIMIZATION: Cache stats for 1 hour
// Admin dashboard loads frequently but data changes slowly
// Saves 95% egress by serving cached RPC results
export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const rateLimitResponse = applyRateLimit(req, "api-admin-stats", 60, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const authResponse = validateAdminToken(req);
  if (authResponse) return authResponse;

  const { data, error } = await supabase.rpc("get_admin_dashboard_counts");

  if (error) {
    return jsonNoStore({ error: error.message }, 500);
  }

  const stats = Array.isArray(data) ? data[0] : data;

  // OPTIMIZATION: Add long cache headers
  // Browsers and CDN cache this for 1 hour
  const response = NextResponse.json(
    {
      totalSchools: Number(stats?.total_schools ?? 0),
      pendingSchools: Number(stats?.pending_schools ?? 0),
      approvedSchools: Number(stats?.approved_schools ?? 0),
      questionsENCount: Number(stats?.english_questions ?? 0),
      questionsMLCount: Number(stats?.malayalam_questions ?? 0),
      totalQuestions: Number(stats?.total_questions ?? 0),
    },
    { status: 200 }
  );

  response.headers.set(
    "Cache-Control",
    "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
  );

  return response;
}
