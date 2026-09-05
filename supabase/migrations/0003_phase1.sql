-- ============================================================
-- Migration 0003: Phase 1 features
-- - Islamic Quizzes (quizzes + quiz_questions)
-- - Precise lecture datetime for the countdown timer
-- Run this AFTER 0001_init.sql and 0002_posts.sql.
-- ============================================================

-- ------------------------------------------------------------
-- quizzes
-- ------------------------------------------------------------
create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- quiz_questions: multiple-choice, one correct option per question
-- ------------------------------------------------------------
create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null check (correct_option in ('a', 'b', 'c', 'd')),
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table quizzes enable row level security;
alter table quiz_questions enable row level security;

-- quizzes: public can read published; admins manage all
create policy "quizzes_public_read_published" on quizzes
  for select using (status = 'published');
create policy "quizzes_admin_read_all" on quizzes
  for select using (is_admin());
create policy "quizzes_admin_write" on quizzes
  for insert with check (is_admin());
create policy "quizzes_admin_update" on quizzes
  for update using (is_admin());
create policy "quizzes_admin_delete" on quizzes
  for delete using (is_admin());

-- quiz_questions: public can read questions belonging to a published quiz; admins manage all
create policy "quiz_questions_public_read_published" on quiz_questions
  for select using (
    exists (select 1 from quizzes where quizzes.id = quiz_questions.quiz_id and quizzes.status = 'published')
  );
create policy "quiz_questions_admin_read_all" on quiz_questions
  for select using (is_admin());
create policy "quiz_questions_admin_write" on quiz_questions
  for insert with check (is_admin());
create policy "quiz_questions_admin_update" on quiz_questions
  for update using (is_admin());
create policy "quiz_questions_admin_delete" on quiz_questions
  for delete using (is_admin());

-- ------------------------------------------------------------
-- lectures: add a precise timestamp for the countdown timer.
-- The existing lecture_date / lecture_time text fields are kept
-- for display; lecture_datetime (if set) drives the countdown.
-- ------------------------------------------------------------
alter table lectures add column if not exists lecture_datetime timestamptz;
