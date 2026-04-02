import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const QUESTION_COLUMNS = 'id,q,sign,options,answerIndex';
const CHUNK_SIZE = 8;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 });

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
  const { type, schoolId, language, index, offset } = await req.json();

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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (type === 'start') {
    const table = getQuestionTable(language);

    const [{ count, error: countError }, { data, error: dataError }] =
      await Promise.all([
        supabase.from(table).select('id', { count: 'exact', head: true }),
        supabase
          .from(table)
          .select(QUESTION_COLUMNS)
          .order('id', { ascending: true })
          .range(0, CHUNK_SIZE - 1),
      ]);

    if (countError || dataError) {
      return NextResponse.json(
        { error: countError?.message || dataError?.message || 'Failed to load questions' },
        { status: 500 }
      );
    }

    const safeData = data ?? [];
    return NextResponse.json({
      total: count ?? 0,
      questions: safeData,
      nextOffset: safeData.length,
      done: safeData.length >= (count ?? 0),
    });
  }

  if (type === 'nextChunk') {
    const table = getQuestionTable(language);
    const startOffset = Number.isInteger(offset)
      ? offset
      : parseInt(String(offset ?? '0'), 10);

    if (Number.isNaN(startOffset) || startOffset < 0) {
      return NextResponse.json({ error: 'Invalid offset' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(table)
      .select(QUESTION_COLUMNS)
      .order('id', { ascending: true })
      .range(startOffset, startOffset + CHUNK_SIZE - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const safeData = data ?? [];
    return NextResponse.json({
      questions: safeData,
      nextOffset: startOffset + safeData.length,
      done: safeData.length < CHUNK_SIZE,
    });
  }

  // Backward-compatible legacy modes
  if (type === 'questions') {
    const table = getQuestionTable(language);

    const { data, error } = await supabase
      .from(table)
      .select(QUESTION_COLUMNS)
      .order('id', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  if (type === 'questionsCount') {
    const table = getQuestionTable(language);

    const { count, error } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ count: count ?? 0 });
  }

  if (type === 'question') {
    const table = getQuestionTable(language);
    const idx = Number.isInteger(index) ? index : parseInt(String(index ?? '0'), 10);

    if (Number.isNaN(idx) || idx < 0) {
      return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(table)
      .select(QUESTION_COLUMNS)
      .order('id', { ascending: true })
      .range(idx, idx)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? null);
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}