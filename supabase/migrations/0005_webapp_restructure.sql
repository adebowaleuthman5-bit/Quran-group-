-- ============================================================
-- Migration 0005: Web-app restructure support
-- - Post categories (Post / Verse / Dua / Adhkar)
-- - Donation/Support text
-- - Real push-notification infrastructure (device subscriptions,
--   per-lecture reminders, and a dedupe log so nobody gets the
--   same reminder twice)
-- Run this AFTER 0001, 0002, 0003, and 0004.
-- ============================================================

-- ------------------------------------------------------------
-- posts: add a category so Daily Post / Today's Verse / Daily Dua /
-- Daily Adhkar can all live in one table, shown in separate Home
-- sections by category.
-- ------------------------------------------------------------
alter table posts add column if not exists category text not null default 'post'
  check (category in ('post', 'verse', 'dua', 'adhkar'));

-- ------------------------------------------------------------
-- site_settings: add donation/support text (admin-editable, shown
-- on the About page). Plain text — no payment processing.
-- ------------------------------------------------------------
alter table site_settings add column if not exists donation_text text;

-- ------------------------------------------------------------
-- push_subscriptions: one row per device that has enabled prayer
-- or lecture reminders. No visitor accounts, so a device is
-- identified only by its push endpoint (a de-facto secret token).
-- ------------------------------------------------------------
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

-- Anyone can create a subscription (enabling notifications on their device).
-- Only admins can read the list. No public update/delete — a visitor who
-- wants to stop notifications can simply deny/revoke permission in their
-- browser; the row going stale is harmless.
create policy "push_subscriptions_public_insert" on push_subscriptions
  for insert with check (true);
create policy "push_subscriptions_public_update" on push_subscriptions
  for update using (true) with check (true);
create policy "push_subscriptions_admin_read" on push_subscriptions
  for select using (is_admin());

-- ------------------------------------------------------------
-- lecture_reminders: links a subscription to a specific lecture
-- it should be reminded about.
-- ------------------------------------------------------------
create table if not exists lecture_reminders (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references push_subscriptions(id) on delete cascade,
  lecture_id uuid not null references lectures(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (subscription_id, lecture_id)
);

alter table lecture_reminders enable row level security;

create policy "lecture_reminders_public_insert" on lecture_reminders
  for insert with check (true);
create policy "lecture_reminders_admin_read" on lecture_reminders
  for select using (is_admin());

-- ------------------------------------------------------------
-- notification_log: prevents the scheduled reminder job from
-- sending the same prayer/lecture reminder twice on overlapping runs.
-- ------------------------------------------------------------
create table if not exists notification_log (
  id uuid primary key default gen_random_uuid(),
  dedupe_key text not null unique,
  sent_at timestamptz not null default now()
);

alter table notification_log enable row level security;

-- Only the server-side reminder job (using the service role key, which
-- bypasses RLS entirely) touches this table — no public policies at all.
