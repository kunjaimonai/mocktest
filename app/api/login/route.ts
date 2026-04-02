import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { institutionCode } = await req.json();

  if (!institutionCode) {
    return new Response(
      JSON.stringify({ error: "Institution code required" }),
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("schools")
    .select("id,paymentstatus")
    .eq("id", institutionCode)
    .single();

  if (error || !data) {
    return new Response(
      JSON.stringify({ error: "Invalid institution code" }),
      { status: 401 }
    );
  }

  if (data.paymentstatus !== "completed") {
    return new Response(
      JSON.stringify({ error: "Payment not approved yet" }),
      { status: 403 }
    );
  }

  return new Response(
    JSON.stringify({ success: true, id: data.id }),
    { status: 200 }
  );
}