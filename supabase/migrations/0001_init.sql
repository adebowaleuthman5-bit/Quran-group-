-- ============================================================
-- Quran Recitation and Lectures Group — Database Schema
-- Run this in Supabase SQL Editor (or via `supabase db push`)
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- profiles: one row per authenticated admin, links to auth.users
-- ------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('super_admin', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- quran_posts
-- ------------------------------------------------------------
create table if not exists quran_posts (
  id uuid primary key default gen_random_uuid(),
  surah_name text not null,
  surah_number int,
  verse_number text not null,
  arabic_text text not null,
  translation text not null,
  translation_source text not null,
  tafsir text,
  reference text not null,
  source_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- hadith_posts
-- ------------------------------------------------------------
create table if not exists hadith_posts (
  id uuid primary key default gen_random_uuid(),
  arabic_text text,
  translation text not null,
  collection text not null,
  hadith_number text,
  grade text not null check (grade in ('Sahih', 'Hasan', 'Da''if', 'Other')),
  grader text,
  reference text not null,
  source_url text,
  explanation text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hadith_requires_reference check (reference is not null and length(trim(reference)) > 0)
);

-- ------------------------------------------------------------
-- adhkar
-- ------------------------------------------------------------
create table if not exists adhkar (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('morning', 'evening')),
  arabic_text text not null,
  transliteration text,
  translation text not null,
  repetitions int default 1,
  reference text not null,
  explanation text,
  audio_url text,
  display_order int default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- lectures
-- ------------------------------------------------------------
create table if not exists lectures (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  speaker text not null,
  speaker_info text,
  lecture_date date,
  lecture_time text,
  description text,
  recording_url text,
  poster_url text,
  test_info text,
  lecture_status text not null default 'upcoming' check (lecture_status in ('upcoming', 'completed')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- islamic_questions (public submissions)
-- ------------------------------------------------------------
create table if not exists islamic_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  submitter_name text,
  submitter_contact text,
  category text,
  status text not null default 'pending' check (status in ('pending', 'under_review', 'answered', 'published', 'rejected')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- question_answers (admin-authored, linked 1:1 to a question)
-- ------------------------------------------------------------
create table if not exists question_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references islamic_questions(id) on delete cascade,
  answer text not null,
  quran_references text,
  hadith_references text,
  scholarly_references text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  answered_by uuid references profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id)
);

-- ------------------------------------------------------------
-- executives
-- ------------------------------------------------------------
create table if not exists executives (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  photo_url text,
  biography text,
  contact_link text,
  display_order int default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- founder (single row, but modeled as a table for flexibility)
-- ------------------------------------------------------------
create table if not exists founder (
  id uuid primary key default gen_random_uuid(),
  name text,
  photo_url text,
  position text,
  biography text,
  contact_link text,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- group_information (goal, mission, vision, objectives, history — single row)
-- ------------------------------------------------------------
create table if not exists group_information (
  id uuid primary key default gen_random_uuid(),
  goal text,
  mission text,
  vision text,
  objectives text,
  history text,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- group_rules
-- ------------------------------------------------------------
create table if not exists group_rules (
  id uuid primary key default gen_random_uuid(),
  rule_text text not null,
  display_order int default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- social_links (single row: whatsapp links + socials)
-- ------------------------------------------------------------
create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  whatsapp_general text,
  whatsapp_executive text,
  tiktok text,
  facebook text,
  instagram text,
  email text,
  phone text,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- site_settings (single row: site-wide editable text)
-- ------------------------------------------------------------
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'Quran Recitation and Lectures Group',
  intro_text text,
  about_text text,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Seed singleton rows so admin pages always have a row to edit
-- ============================================================
insert into group_information (goal, mission, history)
select
  'Our goal is to create a beneficial platform that encourages Qur''an recitation, authentic Islamic learning, beneficial lectures, remembrance of Allah, and respectful interaction among Muslims. Through regular Qur''an recitation, Hadith sharing, Adhkar, lectures, tests and Islamic discussions, the group seeks to encourage members to increase their knowledge, strengthen their relationship with Allah, remind one another of good deeds, and practice Islam according to authentic Islamic sources.',
  'To spread beneficial Islamic knowledge through Qur''an recitation, authentic Hadith, and lectures grounded in reliable sources.',
  'The Quran Recitation and Lectures Group was established to bring Muslims together around the recitation of the Qur''an, the sharing of authentic Hadith, daily Adhkar, and beneficial Islamic lectures. The group encourages consistent learning, reminds members of their Salah, and fosters respectful Islamic interaction among its members.'
where not exists (select 1 from group_information);

insert into social_links (whatsapp_general, whatsapp_executive)
select
  'https://chat.whatsapp.com/EKO4jZdVeJB2Lg0cxjr8qu?s=cl&p=a&mlu=4',
  'https://chat.whatsapp.com/LbOLAD8DnbOBo6FSit9ZWW?s=cl&p=a&mlu=4'
where not exists (select 1 from social_links);

insert into site_settings (site_name, intro_text, about_text)
select
  'Quran Recitation and Lectures Group',
  'A community for Qur''an recitation, authentic Islamic learning, and beneficial lectures.',
  'The Quran Recitation and Lectures Group brings Muslims together for Qur''an recitation, Hadith sharing, daily Adhkar, and beneficial Islamic lectures, grounded in authentic sources.'
where not exists (select 1 from site_settings);

insert into founder (name)
select null
where not exists (select 1 from founder);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table quran_posts enable row level security;
alter table hadith_posts enable row level security;
alter table adhkar enable row level security;
alter table lectures enable row level security;
alter table islamic_questions enable row level security;
alter table question_answers enable row level security;
alter table executives enable row level security;
alter table founder enable row level security;
alter table group_information enable row level security;
alter table group_rules enable row level security;
alter table social_links enable row level security;
alter table site_settings enable row level security;

-- Helper: is the current user an admin (any role)?
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid()
  );
$$;

-- profiles: admins can read all profiles; a user can read their own row.
-- Only managed by Super Admin via Supabase dashboard / service role for inserts.
create policy "profiles_select_own_or_admin" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- quran_posts: public can read published; admins can do everything
create policy "quran_public_read_published" on quran_posts
  for select using (status = 'published');
create policy "quran_admin_read_all" on quran_posts
  for select using (is_admin());
create policy "quran_admin_write" on quran_posts
  for insert with check (is_admin());
create policy "quran_admin_update" on quran_posts
  for update using (is_admin());
create policy "quran_admin_delete" on quran_posts
  for delete using (is_admin());

-- hadith_posts
create policy "hadith_public_read_published" on hadith_posts
  for select using (status = 'published');
create policy "hadith_admin_read_all" on hadith_posts
  for select using (is_admin());
create policy "hadith_admin_write" on hadith_posts
  for insert with check (is_admin());
create policy "hadith_admin_update" on hadith_posts
  for update using (is_admin());
create policy "hadith_admin_delete" on hadith_posts
  for delete using (is_admin());

-- adhkar
create policy "adhkar_public_read_published" on adhkar
  for select using (status = 'published');
create policy "adhkar_admin_read_all" on adhkar
  for select using (is_admin());
create policy "adhkar_admin_write" on adhkar
  for insert with check (is_admin());
create policy "adhkar_admin_update" on adhkar
  for update using (is_admin());
create policy "adhkar_admin_delete" on adhkar
  for delete using (is_admin());

-- lectures
create policy "lectures_public_read_published" on lectures
  for select using (status = 'published');
create policy "lectures_admin_read_all" on lectures
  for select using (is_admin());
create policy "lectures_admin_write" on lectures
  for insert with check (is_admin());
create policy "lectures_admin_update" on lectures
  for update using (is_admin());
create policy "lectures_admin_delete" on lectures
  for delete using (is_admin());

-- islamic_questions: anyone can submit (insert); only admins can read/manage.
-- Submitters cannot read back questions (protects contact info of all submitters).
create policy "questions_public_insert" on islamic_questions
  for insert with check (true);
create policy "questions_admin_read" on islamic_questions
  for select using (is_admin());
create policy "questions_admin_update" on islamic_questions
  for update using (is_admin());
create policy "questions_admin_delete" on islamic_questions
  for delete using (is_admin());

-- question_answers: public can read only answers whose status is published
-- (and only alongside a question, via the app query); admins manage all.
create policy "answers_public_read_published" on question_answers
  for select using (status = 'published');
create policy "answers_admin_read_all" on question_answers
  for select using (is_admin());
create policy "answers_admin_write" on question_answers
  for insert with check (is_admin());
create policy "answers_admin_update" on question_answers
  for update using (is_admin());
create policy "answers_admin_delete" on question_answers
  for delete using (is_admin());

-- executives: public can read active; admins manage all
create policy "executives_public_read_active" on executives
  for select using (active = true);
create policy "executives_admin_read_all" on executives
  for select using (is_admin());
create policy "executives_admin_write" on executives
  for insert with check (is_admin());
create policy "executives_admin_update" on executives
  for update using (is_admin());
create policy "executives_admin_delete" on executives
  for delete using (is_admin());

-- founder: public read, admin write
create policy "founder_public_read" on founder
  for select using (true);
create policy "founder_admin_update" on founder
  for update using (is_admin());
create policy "founder_admin_insert" on founder
  for insert with check (is_admin());

-- group_information: public read, admin write
create policy "group_info_public_read" on group_information
  for select using (true);
create policy "group_info_admin_update" on group_information
  for update using (is_admin());

-- group_rules: public read active, admin manages all
create policy "rules_public_read_active" on group_rules
  for select using (active = true);
create policy "rules_admin_read_all" on group_rules
  for select using (is_admin());
create policy "rules_admin_write" on group_rules
  for insert with check (is_admin());
create policy "rules_admin_update" on group_rules
  for update using (is_admin());
create policy "rules_admin_delete" on group_rules
  for delete using (is_admin());

-- social_links: public read, only super_admin updates (checked in app layer too)
create policy "social_public_read" on social_links
  for select using (true);
create policy "social_admin_update" on social_links
  for update using (is_admin());

-- site_settings: public read, admin write
create policy "settings_public_read" on site_settings
  for select using (true);
create policy "settings_admin_update" on site_settings
  for update using (is_admin());

-- ============================================================
-- Storage buckets (run once — safe to re-run)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

create policy "site_media_public_read" on storage.objects
  for select using (bucket_id = 'site-media');
create policy "site_media_admin_write" on storage.objects
  for insert with check (bucket_id = 'site-media' and is_admin());
create policy "site_media_admin_update" on storage.objects
  for update using (bucket_id = 'site-media' and is_admin());
create policy "site_media_admin_delete" on storage.objects
  for delete using (bucket_id = 'site-media' and is_admin());
