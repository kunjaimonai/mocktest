import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // your supabase client

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const id = formData.get("id") as string;

    if (!file || !type || !id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["logo", "screenshot"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
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
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Generate public URL
    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      url: publicUrl.publicUrl,
      filename,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
