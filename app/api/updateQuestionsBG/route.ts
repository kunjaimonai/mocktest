import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { applyRateLimit, jsonNoStore, validateAdminToken } from "@/lib/api-guard";

export async function POST(request: Request) {
  const rateLimitResponse = applyRateLimit(request, "api-update-questions-bg", 20, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const authResponse = validateAdminToken(request);
  if (authResponse) return authResponse;

  try {
    const questions = await request.json();

    const { error } = await supabase
      .from("badge_questions")
      .upsert(questions, { onConflict: "id" });

    if (error) {
      console.error(error);
      return jsonNoStore({ success: false, error: error.message }, 500);
    }

    return jsonNoStore({
      success: true,
      message: "Badge questions updated successfully"
    });
  } catch (error) {
    console.error("Error updating Badge questions:", error);
    return jsonNoStore(
      { success: false, error: "Failed to update Badge questions" },
      500
    );
  }
}
