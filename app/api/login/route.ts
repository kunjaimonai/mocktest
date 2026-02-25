import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { institutionCode } = await req.json();

  if (!institutionCode) {
    return new Response(
      JSON.stringify({ error: "Institution code required" }),
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("schools")
    .select("*")
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