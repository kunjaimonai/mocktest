import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { applyRateLimit, jsonNoStore } from "@/lib/api-guard";

type SchoolPayload = {
  id?: number;
  name?: string;
  number?: string;
  paymentstatus?: "pending" | "completed";
  screenshot?: string;
  logo?: string;
};

export async function POST(req: Request) {
  const rateLimitResponse = applyRateLimit(req, "api-update-schools", 20, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const school = (await req.json()) as SchoolPayload;

    if (!school?.name || !school?.number) {
      return jsonNoStore({ error: "Missing required fields" }, 400);
    }

    if (!school.id) {
      const { data: createdId, error: createError } = await (supabase as any).rpc(
        "create_school_registration",
        {
          p_name: school.name,
          p_number: school.number,
          p_paymentstatus: school.paymentstatus ?? "pending",
          p_screenshot: school.screenshot ?? "",
          p_logo: school.logo ?? "",
        }
      );

      if (createError) {
        console.error("Supabase RPC Error:", createError);
        return jsonNoStore({ error: createError.message }, 500);
      }

      const created = Number(createdId);
      if (!created) {
        return jsonNoStore({ error: "Failed to generate institution code" }, 500);
      }

      return jsonNoStore({ message: "OK", id: created }, 200);
    }

    const { error: updateError } = await (supabase as any)
      .from("schools")
      .upsert(
        [
          {
            id: school.id,
            name: school.name,
            number: school.number,
            paymentstatus: school.paymentstatus ?? "pending",
            screenshot: school.screenshot ?? "",
            logo: school.logo ?? "",
          },
        ],
        { onConflict: "id" }
      );

    if (updateError) {
      console.error("Supabase Error:", updateError);
      return jsonNoStore({ error: updateError.message }, 500);
    }

    return jsonNoStore({ message: "OK", id: school.id }, 200);
  } catch (error: any) {
    console.error("Server error:", error);
    return jsonNoStore({ error: error.message }, 500);
  }
}
