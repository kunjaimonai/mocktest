import { createClient } from "@supabase/supabase-js";

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export const supabase = createClient(supabaseUrl, SUPABASE_ANON_KEY
);