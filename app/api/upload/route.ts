import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // your supabase client
import { applyRateLimit, jsonNoStore } from "@/lib/api-guard";

export async function POST(req: NextRequest) {
  const rateLimitResponse = applyRateLimit(req, "api-upload", 20, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const id = formData.get("id") as string;

    if (!file || !type || !id) {
      return jsonNoStore({ error: "Missing required fields" }, 400);
    }

    if (!["logo", "screenshot"].includes(type)) {
      return jsonNoStore({ error: "Invalid type" }, 400);
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create unique filename
    const extension = file.name.split(".").pop();
    const filename = `${type}-${id}-${Date.now()}.${extension}`;

    // Upload to respective bucket
    const bucket = type === "logo" ? "logo" : "screenshot";

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error(uploadError);
      return jsonNoStore({ error: uploadError.message }, 500);
    }

    // Generate public URL
    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return jsonNoStore({
      success: true,
      url: publicUrl.publicUrl,
      filename,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    return jsonNoStore({ error: "Upload failed" }, 500);
  }
}
