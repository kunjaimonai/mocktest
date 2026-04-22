import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";  // <-- your supabase client
import { applyRateLimit, jsonNoStore } from "@/lib/api-guard";

export async function POST(request: Request) {
  const rateLimitResponse = applyRateLimit(request, "api-upload-sign", 30, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return jsonNoStore(
        { success: false, error: "No file uploaded" },
        400
      );
    }

    // ---- Validate file type ----
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return jsonNoStore(
        { success: false, error: "Invalid file type. Only PNG, JPG, JPEG, WEBP allowed" },
        400
      );
    }

    // ---- Validate file size (max 5MB) ----
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return jsonNoStore(
        { success: false, error: "File size too large. Maximum size is 5MB" },
        400
      );
    }

    // ---- Create a unique filename ----
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `sign_${timestamp}_${cleanName}`;

    // ---- Convert file to buffer ----
    const buffer = Buffer.from(await file.arrayBuffer());

    // ---- Upload to Supabase Storage ----
    const { error: uploadError } = await supabase.storage
      .from("signs")
      .upload(filename, buffer, {
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      console.error(uploadError);
      return jsonNoStore(
        { success: false, error: uploadError.message },
        500
      );
    }

    // ---- Generate public URL ----
    const { data: urlData } = supabase.storage
      .from("signs")
      .getPublicUrl(filename);

    return jsonNoStore({
      success: true,
      message: "File uploaded successfully",
      url: urlData.publicUrl,      // ✔ full public URL
      filename: filename           // ✔ for DB storage
    });
  } catch (error) {
    console.error("Upload error:", error);
    return jsonNoStore(
      { success: false, error: "Failed to upload file" },
      500
    );
  }
}
export async function DELETE(request: Request) {
  const rateLimitResponse = applyRateLimit(request, "api-upload-sign-delete", 20, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return jsonNoStore(
        { success: false, error: "No filename provided" },
        400
      );
    }

    // Security check
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return jsonNoStore(
        { success: false, error: "Invalid filename" },
        400
      );
    }

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from("signs")
      .remove([filename]);

    if (deleteError) {
      return jsonNoStore(
        { success: false, error: deleteError.message },
        500
      );
    }

    return jsonNoStore({
      success: true,
      message: "File deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return jsonNoStore(
      { success: false, error: "Failed to delete file" },
      500
    );
  }
}

