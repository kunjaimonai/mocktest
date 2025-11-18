import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const questions = await request.json();

    const { error } = await supabase
      .from("tamil_questions")
      .upsert(questions, { onConflict: "id" });

    if (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Malayalam questions updated successfully"
    });
  } catch (error) {
    console.error("Error updating Malayalam questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update Malayalam questions" },
      { status: 500 }
    );
  }
}
