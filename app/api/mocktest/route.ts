import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { applyRateLimit } from "@/lib/api-guard";

export const runtime = "nodejs";

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

type QuestionSetRow = {
  question_ids: number[];
};

type PublicQuestion = {
  id: number;
  q: string;
  options: string[];
  sign: string | null;
  optionTypes: boolean[] | null;
  answerIndex?: number;
};

const QUESTION_COLUMNS_BASE = "id,q,options,sign,optionTypes";
const QUESTION_COLUMNS_WITH_ANS = 'id,q,options,sign,optionTypes,"answerIndex"';

function shuffleArray<T>(items: T[]) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

  let value = raw.slice(`${SCHOOL_COOKIE}=`.length);
  
  // Decode the cookie value - the browser URL-encodes it when sending
  try {
    value = decodeURIComponent(value);
  } catch {
    // If decoding fails, use as-is
  }
  
  try {
    const parsed = JSON.parse(value) as CookiePayload;
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

function stripAnswers(
  rows: Array<Record<string, unknown>>,
  includeAnswers = false
): PublicQuestion[] {
  return rows.map((row) => {
    const base: PublicQuestion = {
      id: Number(row.id),
      q: String(row.q ?? ""),
      options: Array.isArray(row.options) ? (row.options as string[]) : [],
      sign: (row.sign as string | null) ?? null,
      optionTypes: Array.isArray(row.optionTypes)
        ? (row.optionTypes as boolean[])
        : null,
    };

    if (includeAnswers) {
      const ai = Object.prototype.hasOwnProperty.call(row, "answerIndex")
        ? Number((row as any).answerIndex)
        : undefined;
      if (typeof ai === "number" && !Number.isNaN(ai)) {
        base.answerIndex = ai;
      }
    }

    return base;
  });
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
    const { data: schoolData } = await supabase
      .from("schools")
      .select("id,name,number,paymentstatus,logo,screenshot,has_badge")
      .eq("id", auth.school_id)
      .single();

    const school = (schoolData as Record<string, unknown> | null) ?? null;

    return jsonNoStore({
      id: Number(school?.id ?? auth.school_id),
      name: String(school?.name ?? auth.school_name),
      number: String(school?.number ?? ""),
      paymentStatus: String(school?.paymentstatus ?? "pending"),
      logo: String(school?.logo ?? ""),
      screenshot: String(school?.screenshot ?? ""),
      has_badge: Boolean(school?.has_badge ?? auth.has_badge),
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

  // Build a fresh random set each time so repeated sessions do not reuse the same order.
  const sessionId = Math.floor(Math.random() * 1000000);
  const questionTable = getQuestionTable(language);
  const selectCols = QUESTION_COLUMNS_WITH_ANS;
  const { data: allQuestions, error: questionsError } = await supabase
    .from(questionTable)
    .select(selectCols);

  if (questionsError || !allQuestions) {
    return jsonError("Failed to load questions", 500);
  }

  const shuffledQuestions = shuffleArray(
    stripAnswers(allQuestions as Record<string, unknown>[], true)
  );
  const requestedLimit =
    typeof body.questionLimit === "number" ? Number(body.questionLimit) : 0;
  const limit = Math.max(
    1,
    Math.min(requestedLimit > 0 ? requestedLimit : shuffledQuestions.length, shuffledQuestions.length)
  );
  const safeQuestions = shuffledQuestions.slice(0, limit);
  const questionIds = safeQuestions.map((q) => q.id);

  return jsonNoStore({
    session_id: sessionId,
    set_id: null,
    language,
    mode,
    total: safeQuestions.length,
    orderIds: questionIds,
    nextOffset: safeQuestions.length,
    done: true,
    questions: safeQuestions,
  });
}
