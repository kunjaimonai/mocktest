-- Supabase RPC functions for performance optimization
-- Run in Supabase SQL editor (or migration tool)

-- 1) Random question sampler (replaces app-side shuffle over large sets)
create or replace function public.get_random_questions(
  p_language text,
  p_limit integer default 30
)
returns table (
  id integer,
  q text,
  sign text,
  options text[],
  "answerIndex" integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_table text;
  v_limit integer := greatest(1, least(coalesce(p_limit, 30), 200));
begin
  v_table := case p_language
    when 'en' then 'english_questions'
    when 'ml' then 'malayalam_questions'
    when 'ta' then 'tamil_questions'
    when 'bg' then 'badge_questions'
    else 'english_questions'
  end;

  return query execute format(
    'select id, q, sign, options, "answerIndex" from public.%I order by random() limit %s',
    v_table,
    v_limit
  );
end;
$$;

revoke all on function public.get_random_questions(text, integer) from public;
grant execute on function public.get_random_questions(text, integer) to authenticated, service_role;


-- 2) Transaction-safe school registration with unique 4-digit ID generation
create or replace function public.create_school_registration(
  p_name text,
  p_number text,
  p_paymentstatus text default 'pending',
  p_screenshot text default '',
  p_logo text default ''
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id integer;
  v_attempt integer := 0;
begin
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'School name is required';
  end if;

  if p_number is null or length(trim(p_number)) = 0 then
    raise exception 'Mobile number is required';
  end if;

  loop
    v_attempt := v_attempt + 1;
    if v_attempt > 20 then
      raise exception 'Unable to generate unique institution code';
    end if;

    v_id := floor(1000 + random() * 9000)::integer;

    begin
      insert into public.schools (id, name, number, paymentstatus, screenshot, logo)
      values (v_id, p_name, p_number, coalesce(p_paymentstatus, 'pending'), coalesce(p_screenshot, ''), coalesce(p_logo, ''));
      return v_id;
    exception
      when unique_violation then
        -- Retry on ID collision
        null;
    end;
  end loop;
end;
$$;

revoke all on function public.create_school_registration(text, text, text, text, text) from public;
grant execute on function public.create_school_registration(text, text, text, text, text) to authenticated, service_role;


-- 3) Single-call dashboard aggregates
create or replace function public.get_admin_dashboard_counts()
returns table (
  total_schools bigint,
  pending_schools bigint,
  approved_schools bigint,
  english_questions bigint,
  malayalam_questions bigint,
  total_questions bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from public.schools) as total_schools,
    (select count(*) from public.schools where paymentstatus = 'pending') as pending_schools,
    (select count(*) from public.schools where paymentstatus = 'completed') as approved_schools,
    (select count(*) from public.english_questions) as english_questions,
    (select count(*) from public.malayalam_questions) as malayalam_questions,
    ((select count(*) from public.english_questions) +
     (select count(*) from public.malayalam_questions)) as total_questions;
$$;

revoke all on function public.get_admin_dashboard_counts() from public;
grant execute on function public.get_admin_dashboard_counts() to authenticated, service_role;


-- Recommended indexes (safe no-op if already present)
create index if not exists idx_schools_paymentstatus on public.schools (paymentstatus);
create index if not exists idx_english_questions_id on public.english_questions (id);
create index if not exists idx_malayalam_questions_id on public.malayalam_questions (id);
create index if not exists idx_tamil_questions_id on public.tamil_questions (id);
create index if not exists idx_badge_questions_id on public.badge_questions (id);
