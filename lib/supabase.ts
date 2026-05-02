import "server-only";
import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl =
	process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseUrl = rawSupabaseUrl.replace(":5432", ":6543");
const supabaseServiceRoleKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ??
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
	"";

if (!supabaseUrl) {
	throw new Error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseServiceRoleKey) {
	throw new Error(
		"Missing SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY"
	);
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
	auth: {
		persistSession: false,
		autoRefreshToken: false,
		detectSessionInUrl: false,
	},
}) as any;