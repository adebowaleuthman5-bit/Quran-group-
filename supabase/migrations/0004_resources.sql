-- ============================================================
-- Migration 0004: Islamic Resource Library
-- Admins upload a file (PDF, audio, doc, etc.); visitors can view/download it.
-- Run this AFTER 0001, 0002, and 0003.
-- ============================================================

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_url text not null,
  file_name text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table resources enable row level security;

create policy "resources_public_read_published" on resources
  for select using (status = 'published');
create policy "resources_admin_read_all" on resources
  for select using (is_admin());
create policy "resources_admin_write" on resources
  for insert with check (is_admin());
create policy "resources_admin_update" on resources
  for update using (is_admin());
create policy "resources_admin_delete" on resources
  for delete using (is_admin());

-- Resource files reuse the existing public "site-media" storage bucket
-- and its existing admin-only write / public-read policies from 0001_init.sql.
-- No new storage policies are needed.
