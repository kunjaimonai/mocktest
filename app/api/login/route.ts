import { supabase } from "@/lib/supabase";
import { applyRateLimit, jsonNoStore } from "@/lib/api-guard";

export async function POST(req: Request) {
  const rateLimitResponse = applyRateLimit(req, "api-login", 40, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const { institutionCode } = await req.json();

  if (!institutionCode) {
    return jsonNoStore({ error: "Institution code required" }, 400);
  }

  const { data, error } = await supabase
    .from("schools")
    .select("id,paymentstatus")
    .eq("id", institutionCode)
    .single();

  if (error || !data) {
    return jsonNoStore({ error: "Invalid institution code" }, 401);
  }

  if (data.paymentstatus !== "completed") {
    return jsonNoStore({ error: "Payment not approved yet" }, 403);
  }

  return jsonNoStore({ success: true, id: data.id }, 200);
}