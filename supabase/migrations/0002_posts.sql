-- ============================================================
-- Migration 0002: Replace Qur'an / Hadith / Adhkar with a single
-- flexible "posts" table, with a title, body, and optional image.
-- Run this AFTER 0001_init.sql, in the Supabase SQL Editor.
-- ============================================================

-- Drop the old, now-unused tables and their policies (cascade removes policies too)
drop table if exists quran_posts cascade;
drop table if exists hadith_posts cascade;
drop table if exists adhkar cascade;

-- ------------------------------------------------------------
-- posts: one flexible content type covering everything that used
-- to be split across Qur'an / Hadith / Adhkar. No reference fields.
-- ------------------------------------------------------------
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table posts enable row level security;

create policy "posts_public_read_published" on posts
  for select using (status = 'published');
create policy "posts_admin_read_all" on posts
  for select using (is_admin());
create policy "posts_admin_write" on posts
  for insert with check (is_admin());
create policy "posts_admin_update" on posts
  for update using (is_admin());
create policy "posts_admin_delete" on posts
  for delete using (is_admin());

-- Post images reuse the existing public "site-media" storage bucket
-- and its existing admin-only write / public-read policies from 0001_init.sql.
-- No new storage policies are needed.
