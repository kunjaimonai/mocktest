import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
export async function POST(req: Request) {
  try {
    const school = await req.json();
    console.log("Received body:", school);

    const { data, error } = await supabase
      .from("schools")
      .upsert([school], { onConflict: "id" })
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ message: "OK", data }, { status: 200 });
  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
