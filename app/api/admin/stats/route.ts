import { createClient } from "@supabase/supabase-js";
import { applyRateLimit, jsonNoStore, validateAdminToken } from "@/lib/api-guard";

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

  return jsonNoStore({
    totalSchools: Number(stats?.total_schools ?? 0),
    pendingSchools: Number(stats?.pending_schools ?? 0),
    approvedSchools: Number(stats?.approved_schools ?? 0),
    questionsENCount: Number(stats?.english_questions ?? 0),
    questionsMLCount: Number(stats?.malayalam_questions ?? 0),
    totalQuestions: Number(stats?.total_questions ?? 0),
  });
}
