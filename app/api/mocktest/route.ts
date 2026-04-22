import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { applyRateLimit, jsonNoStore } from '@/lib/api-guard';

const QUESTION_COLUMNS = 'id,q,sign,options,answerIndex';
const CHUNK_SIZE = 8;
const MAX_EXAM_QUESTION_LIMIT = 30;
const MAX_PRACTICE_QUESTION_LIMIT = 80;
const ALLOWED_PROXY_HOSTS = new Set(['cprcrmwwpcixfhfyjmuk.supabase.co']);

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function orderRowsByIds<T extends { id: number }>(rows: T[], ids: number[]) {
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as T[];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const rateLimitResponse = applyRateLimit(req, 'api-mocktest-image', 240, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 });

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (!ALLOWED_PROXY_HOSTS.has(parsedUrl.hostname)) {
    return NextResponse.json({ error: 'Forbidden host' }, { status: 403 });
  }

  const response = await fetch(url, { cache: 'force-cache' });
  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'image/jpeg';

  return new Response(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
    },
  });
}

export async function POST(req: Request) {
  const rateLimitResponse = applyRateLimit(req, 'api-mocktest-post', 120, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const {
    type,
    schoolId,
    language,
    index,
    offset,
    orderIds,
    mode,
    questionLimit,
  } = await req.json();

  const getQuestionTable = (lang: string) =>
    lang === 'en'
      ? 'english_questions'
      : lang === 'ml'
      ? 'malayalam_questions'
      : lang === 'ta'
      ? 'tamil_questions'
      : 'badge_questions';

  if (type === 'school') {
    const { data, error } = await supabase
      .from('schools')
      .select('id,name,number,logo,screenshot,has_badge,paymentstatus')
      .eq('id', schoolId)
      .single();

    if (error) return jsonNoStore({ error: error.message }, 500);
    return jsonNoStore(data);
  }

  if (type === 'start') {
    const isExam = mode === 'exam';
    const defaultLimit = isExam
      ? language === 'bg'
        ? 20
        : 30
      : 60;
    const rawLimit = Number.isInteger(questionLimit)
      ? questionLimit
      : parseInt(String(questionLimit ?? defaultLimit), 10);
    const safeLimit = Number.isNaN(rawLimit)
      ? defaultLimit
      : Math.max(
          1,
          Math.min(
            rawLimit,
            isExam ? MAX_EXAM_QUESTION_LIMIT : MAX_PRACTICE_QUESTION_LIMIT
          )
        );

    const { data: rpcData, error: rpcError } = await supabase.rpc('get_random_questions', {
      p_language: language,
      p_limit: safeLimit,
    });

    let randomizedQuestions = (rpcData as Array<{ id: number; q: string; sign?: string; options: string[]; answerIndex: number }> | null) ?? null;

    if (rpcError || !randomizedQuestions) {
      const table = getQuestionTable(language);
      const { data, error: dataError } = await supabase
        .from(table)
        .select(QUESTION_COLUMNS)
        .order('id', { ascending: false })
        .limit(safeLimit);

      if (dataError) {
        return jsonNoStore(
          {
            error:
              rpcError?.message || dataError.message || 'Failed to load questions',
          },
          500
        );
      }

      randomizedQuestions = shuffleArray(data ?? []);
    }

    const randomizedOrderIds = randomizedQuestions.map((row) => row.id);
    const firstIds = randomizedOrderIds.slice(0, CHUNK_SIZE);
    const firstChunk = orderRowsByIds(randomizedQuestions, firstIds);

    return jsonNoStore({
      total: randomizedOrderIds.length,
      orderIds: randomizedOrderIds,
      questions: firstChunk,
      nextOffset: firstChunk.length,
      done: firstChunk.length >= randomizedOrderIds.length,
    });
  }

  if (type === 'nextChunk') {
    const table = getQuestionTable(language);
    const safeOrderIds = Array.isArray(orderIds) ? orderIds : [];
    const startOffset = Number.isInteger(offset)
      ? offset
      : parseInt(String(offset ?? '0'), 10);

    if (Number.isNaN(startOffset) || startOffset < 0) {
      return jsonNoStore({ error: 'Invalid offset' }, 400);
    }

    const chunkIds = safeOrderIds.slice(startOffset, startOffset + CHUNK_SIZE);

    const { data, error } = chunkIds.length
      ? await supabase
          .from(table)
          .select(QUESTION_COLUMNS)
          .in('id', chunkIds)
      : { data: [], error: null };

    if (error) return jsonNoStore({ error: error.message }, 500);

    const safeData = orderRowsByIds(data ?? [], chunkIds);
    return jsonNoStore({
      questions: safeData,
      nextOffset: startOffset + safeData.length,
      done: safeData.length < CHUNK_SIZE || startOffset + safeData.length >= safeOrderIds.length,
    });
  }

  // Backward-compatible legacy modes
  if (type === 'questions') {
    const table = getQuestionTable(language);

    const { data, error } = await supabase
      .from(table)
      .select(QUESTION_COLUMNS)
      .order('id', { ascending: true });

    if (error) return jsonNoStore({ error: error.message }, 500);
    return jsonNoStore(data ?? []);
  }

  if (type === 'questionsCount') {
    const table = getQuestionTable(language);

    const { count, error } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true });

    if (error) return jsonNoStore({ error: error.message }, 500);
    return jsonNoStore({ count: count ?? 0 });
  }

  if (type === 'question') {
    const table = getQuestionTable(language);
    const idx = Number.isInteger(index) ? index : parseInt(String(index ?? '0'), 10);

    if (Number.isNaN(idx) || idx < 0) {
      return jsonNoStore({ error: 'Invalid index' }, 400);
    }

    const { data, error } = await supabase
      .from(table)
      .select(QUESTION_COLUMNS)
      .order('id', { ascending: true })
      .range(idx, idx)
      .maybeSingle();

    if (error) return jsonNoStore({ error: error.message }, 500);
    return jsonNoStore(data ?? null);
  }

  return jsonNoStore({ error: 'Invalid type' }, 400);
}