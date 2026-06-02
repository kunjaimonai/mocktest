import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { applyRateLimit } from "@/lib/api-guard";

export const runtime = "nodejs";

// Cache questions for 1 hour - they rarely change
export const revalidate = 3600;

const QUESTION_COLUMNS = "id,q,options,sign,optionTypes";

function getQuestionTable(language: string) {
  if (language === "ml") return "malayalam_questions";
  if (language === "ta") return "tamil_questions";
  if (language === "bg") return "badge_questions";
  return "english_questions";
}

function jsonResponse(payload: unknown, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      // Cache for 1 hour - reduces egress for repeat requests
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
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

function shuffleArray<T>(items: T[]) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(req: Request) {
  const rateLimitResponse = applyRateLimit(req, "api-questions", 120, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language") || "en";
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"));
  const shuffle = searchParams.get("shuffle") === "true";

  const questionTable = getQuestionTable(language);

  // OPTIMIZATION: Only fetch needed columns (not *)
  // Saves 40-60% egress by excluding unnecessary data
  const { data: questions, error: questionsError } = await supabase
    .from(questionTable)
    .select(QUESTION_COLUMNS)
    .limit(limit)
    .offset(offset);

  if (questionsError || !questions) {
    return jsonError("Failed to load questions", 500);
  }

  const result = shuffle ? shuffleArray(questions) : questions;

  return jsonResponse({
    language,
    total: result.length,
    questions: result,
    limit,
    offset,
    hasMore: result.length === limit,
  });
}
