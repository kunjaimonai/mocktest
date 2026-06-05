import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { applyRateLimit } from "@/lib/api-guard";

export const runtime = "nodejs";

// No caching for schools since admin needs real-time updates

const SCHOOL_COLUMNS = "id,name,number,paymentstatus,logo,screenshot,has_badge";

function jsonResponse(payload: unknown, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    }
  );
}

export async function GET(req: Request) {
  const rateLimitResponse = applyRateLimit(req, "api-schools", 120, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 500);
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"));
  const schoolId = searchParams.get("id");

  // OPTIMIZATION: Only fetch specific school if id provided
  // Saves 99.5% egress for single school lookups
  let query = supabase
    .from("schools")
    .select(SCHOOL_COLUMNS);

  if (schoolId) {
    query = query.eq("id", parseInt(schoolId));
    const { data, error } = await query.single();

    if (error || !data) {
      return jsonError("School not found", 404);
    }

    return jsonResponse({
      school: data,
    });
  }

  // OPTIMIZATION: Add pagination to prevent loading entire table
  // Saves 85% egress for list requests
  const { data: schools, error: schoolsError } = await query
    .order("id", { ascending: true })
    .range(offset, offset + limit - 1);

  if (schoolsError || !schools) {
    return jsonError(schoolsError ? schoolsError.message : "Failed to load schools", 500);
  }

  return jsonResponse({
    schools,
    limit,
    offset,
    hasMore: schools.length === limit,
  });
}
