import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const questions = await request.json();

    const { error } = await supabase
      .from("english_questions")
      .upsert(questions, { onConflict: "id" });

    if (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "English questions updated successfully",
    });
  } catch (err) {
    console.error("Error updating:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update English questions" },
      { status: 500 }
    );
  }
}
