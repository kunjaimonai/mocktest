import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 });

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'image/jpeg';

  return new Response(buffer, {
    headers: { 'Content-Type': contentType },
  });
}

export async function POST(req: Request) {
  const { type, schoolId, language } = await req.json();

  if (type === 'school') {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

if (type === 'questions') {
  const table =
    language === 'en' ? 'english_questions' :
    language === 'ml' ? 'malayalam_questions' :
    language === 'ta' ? 'tamil_questions' :
    'badge_questions';

  const limit = language === 'bg' ? 20 : 30;

  // Get total count first
  const { count } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  // Pick random offset
  const randomOffset = Math.floor(Math.random() * ((count ?? limit) - limit));

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .range(randomOffset, randomOffset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}