import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { applyRateLimit } from "@/lib/api-guard";

export const runtime = "edge";

const SCHOOL_COOKIE = "school_session";

type CookiePayload = {
  school_id: number;
  school_name: string;
  has_badge: boolean;
  language: "en" | "ml" | "ta" | "bg";
};

type SessionStartRow = {
  id?: number;
  session_id?: number;
  set_id: number;
  school_id?: number;
  language?: string;
  mode?: string;
};

type PublicQuestion = {
  id: number;
  q: string;
  options: string[];
  sign: string | null;
  optionTypes: boolean[] | null;
};

const QUESTION_COLUMNS = "id,q,options,sign,optionTypes";

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

function jsonNoStore(payload: unknown, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

function getQuestionTable(language: string) {
  if (language === "ml") return "malayalam_questions";
  if (language === "ta") return "tamil_questions";
  if (language === "bg") return "badge_questions";
  return "english_questions";
}

function parseCookieValue(cookieHeader: string | null): CookiePayload | null {
  if (!cookieHeader) return null;

  const allCookies = cookieHeader.split(";").map((part) => part.trim());
  const raw = allCookies.find((part) => part.startsWith(`${SCHOOL_COOKIE}=`));
  if (!raw) return null;

  const value = raw.slice(`${SCHOOL_COOKIE}=`.length);
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as CookiePayload;
    if (!parsed?.school_id || !parsed?.language) return null;
    return parsed;
  } catch {
    return null;
  }
}

function normalizeSessionRow(rpcData: unknown): SessionStartRow | null {
  if (Array.isArray(rpcData)) {
    return (rpcData[0] as SessionStartRow | undefined) ?? null;
  }

  if (rpcData && typeof rpcData === "object") {
    return rpcData as SessionStartRow;
  }

  return null;
}

function stripAnswers(rows: Array<Record<string, unknown>>): PublicQuestion[] {
  return rows.map((row) => ({
    id: Number(row.id),
    q: String(row.q ?? ""),
    options: Array.isArray(row.options) ? (row.options as string[]) : [],
    sign: (row.sign as string | null) ?? null,
    optionTypes: Array.isArray(row.optionTypes)
      ? (row.optionTypes as boolean[])
      : null,
  }));
}

export async function POST(req: Request) {
  const rateLimitResponse = applyRateLimit(req, "api-mocktest", 120, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = parseCookieValue(req.headers.get("cookie"));
  if (!auth) {
    return jsonError("Unauthorized", 401);
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const requestType = String(body.type ?? "start");
  if (requestType === "school") {
    return jsonNoStore({
      id: auth.school_id,
      name: auth.school_name,
      has_badge: auth.has_badge,
      language: auth.language,
    });
  }

  const mode = body.mode === "practice" ? "practice" : "exam";
  const language =
    body.language === "en" ||
    body.language === "ml" ||
    body.language === "ta" ||
    body.language === "bg"
      ? String(body.language)
      : auth.language;

  const { data: rpcData, error: rpcError } = await supabase.rpc("start_session", {
    p_school_id: auth.school_id,
    p_language: language,
    p_mode: mode,
  });

  if (rpcError) {
    return jsonError("Failed to start session", 500);
  }

  const sessionRow = normalizeSessionRow(rpcData);
  const setId = sessionRow?.set_id;
  const sessionId = sessionRow?.session_id ?? sessionRow?.id;

  if (!setId || !sessionId) {
    return jsonError("Invalid session payload", 500);
  }

  const { data: questionSet, error: setError } = await supabase
    .from("question_sets")
    .select("question_ids")
    .eq("id", setId)
    .single();

  if (setError || !questionSet?.question_ids?.length) {
    return jsonError("Question set not found", 500);
  }

  const questionIds = questionSet.question_ids;
  const questionTable = getQuestionTable(language);

  const { data: questionsData, error: questionError } = await supabase
    .from(questionTable)
    .select(QUESTION_COLUMNS)
    .in("id", questionIds);

  if (questionError || !questionsData) {
    return jsonError("Failed to load questions", 500);
  }

  const byId = new Map(questionsData.map((row: Record<string, unknown>) => [Number(row.id), row]));
  const orderedRows = questionIds
    .map((id) => byId.get(id))
    .filter((row): row is Record<string, unknown> => Boolean(row));

  const safeQuestions = stripAnswers(orderedRows);

  return jsonNoStore({
    session_id: Number(sessionId),
    set_id: Number(setId),
    language,
    mode,
    total: safeQuestions.length,
    orderIds: questionIds,
    nextOffset: safeQuestions.length,
    done: true,
    questions: safeQuestions,
  });
}
