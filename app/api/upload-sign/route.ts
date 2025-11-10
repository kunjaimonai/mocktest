import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";  // <-- your supabase client

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // ---- Validate file type ----
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only PNG, JPG, JPEG, WEBP allowed" },
        { status: 400 }
      );
    }

    // ---- Validate file size (max 5MB) ----
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size too large. Maximum size is 5MB" },
        { status: 400 }
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
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    // ---- Generate public URL ----
    const { data: urlData } = supabase.storage
      .from("signs")
      .getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: urlData.publicUrl,      // ✔ full public URL
      filename: filename           // ✔ for DB storage
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { success: false, error: "No filename provided" },
        { status: 400 }
      );
    }

    // Security check
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json(
        { success: false, error: "Invalid filename" },
        { status: 400 }
      );
    }

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from("signs")
      .remove([filename]);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    );
  }
}

