# Quran Recitation and Lectures Group — Website

A lightweight, mobile-first website for the Quran Recitation and Lectures Group, with a secure
Supabase-backed admin dashboard. Visitors read Qur'an verses, Hadith, daily Adhkar, lecture
updates, and Islamic Q&A; admins manage all of it from `/admin`.

**Stack:** React + TypeScript + Vite + Tailwind CSS + Supabase (Postgres, Auth, Storage, RLS)

---

## 1. Install

```bash
npm install
```

## 2. Environment variables

```bash
cp .env.example .env
```

Fill in `.env` with your Supabase project's URL and anon (public) key, found in
**Supabase Dashboard → Project Settings → API**:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Never put your `service_role` key in this file or anywhere in frontend code.

## 3. Supabase project setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run the contents of `supabase/migrations/0001_init.sql`.
   This creates every table, enables Row Level Security, adds the read/write policies,
   and seeds the `group_information`, `social_links`, and `site_settings` singleton rows
   (including the WhatsApp links supplied by the group).
3. Confirm in **Table Editor** that all tables listed below were created.

### Database tables

`profiles`, `quran_posts`, `hadith_posts`, `adhkar`, `lectures`, `islamic_questions`,
`question_answers`, `executives`, `founder`, `group_information`, `group_rules`,
`social_links`, `site_settings`.

### Security model (Row Level Security)

- Public visitors can only **read** content where `status = 'published'` (or `active = true`
  for executives/rules). They can also **insert** into `islamic_questions` (submitting a
  question) but can never read questions back — protecting everyone's submitted contact info.
- Only authenticated users with a row in `profiles` can create, edit, delete, publish, or
  unpublish anything.
- A Hadith cannot be published without a `reference` — this is enforced by a database
  constraint and by the admin form.

## 4. Authentication & the three admin accounts

The brief calls for exactly three administrators: one **Super Admin** and two **Admins**.
Supabase Auth stores the login credentials; the `profiles` table stores each person's role.

For each of the three admins:

1. Go to **Supabase Dashboard → Authentication → Users → Add User**. Enter their email and
   set a temporary password (or use "send invite" if you've configured email).
2. Copy the new user's UUID.
3. In **Table Editor → profiles**, insert a row:
   - `id`: the UUID you copied
   - `full_name`: their name
   - `role`: `super_admin` for the one Super Admin, `admin` for the other two

They can then sign in at `/admin/login` with the email and password you set. Encourage them
to change their password after first login (Supabase Auth → Users → Send password reset, or
add a "change password" flow later if needed).

Visiting `/admin` or `/admin/dashboard` while signed out redirects to `/admin/login`
automatically.

## 5. Storage (images)

The migration creates a public `site-media` bucket for the logo, executive photos, founder
photo, and lecture posters. To upload an image:

1. **Supabase Dashboard → Storage → site-media → Upload file.**
2. Click the uploaded file → **Get URL** (public URL).
3. Paste that URL into the relevant admin form (e.g. Executives → Photo URL).

Only signed-in admins can upload, update, or delete files in this bucket; anyone can view them.

## 6. Run locally

```bash
npm run dev
```

Visit `http://localhost:5173`. The public site works immediately once your `.env` is set and
the migration has run. Sign in at `/admin/login` with an account you created in step 4.

## 7. How the content workflow works

```
Admin signs in → creates/edits content → Save Draft or Publish → Supabase database
   → public pages query only published/active rows → visitors see the update
```

Every content type (Qur'an, Hadith, Adhkar, Lectures) has a **Draft** and **Published**
state. Drafts are only visible in the admin dashboard; publishing makes them appear on the
public site immediately (no rebuild needed, since content is fetched live from Supabase).

**Islamic Questions** follow a stricter path: a visitor's submission starts as `pending`.
Opening it in the dashboard moves it to `under_review`. An admin writes an answer with
references and can **Save Draft** (status `answered`, not public) or **Publish Answer**
(status `published`, appears at `/questions/:id` and in the public list). Nothing
AI-generated is ever published automatically — every answer is written by a human admin.

## 8. GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## 9. Deploy to Netlify

1. **New site from Git** → pick your repository. `netlify.toml` already sets the build
   command (`npm run build`) and publish directory (`dist`), plus the SPA redirect rule
   needed for React Router.
2. In **Site settings → Environment variables**, add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` with the same values as your local `.env`.
3. Deploy. Every push to `main` redeploys automatically.

## 10. Using the admin dashboard day-to-day

- **Dashboard**: quick counts of content and pending questions.
- **Qur'an / Hadith / Adhkar / Lectures**: create, edit, publish/unpublish, delete. Required
  fields are marked with `*`; the form won't let you publish a Hadith without a reference.
- **Islamic Questions**: filter by status, click "Review & Answer," write the answer plus
  Qur'an/Hadith/scholarly references, then Save Draft or Publish.
- **Executives / Founder**: add profiles with photo, bio, and contact link; toggle
  active/inactive instead of deleting when someone steps down.
- **Group Information**: edit the Goal, Mission, Vision, Objectives, and History shown on
  the About page.
- **Rules**: add, reorder (▲▼), edit, hide, or delete group rules.
- **Social Links**: update the WhatsApp (general + executive), Facebook, Instagram, and
  TikTok links — the executive WhatsApp link is never shown on the public site.
- **Settings**: site name and the short intro/about text shown on the homepage.

## Project structure

```
src/
  components/       shared UI, layout, and admin components
  context/           AuthContext (Supabase session + profile/role)
  lib/                supabaseClient, shared TypeScript types, small data hooks
  pages/public/      Home, Qur'an, Hadith, Adhkar, Lectures, Questions, About, Contact
  pages/admin/        Login, Dashboard, and one management page per content type
supabase/
  migrations/0001_init.sql   full schema, RLS policies, storage bucket, seed rows
```

## Notes

- No user accounts, comments, or social features exist for visitors by design — only
  reading, viewing, and the two forms (Ask a Question, WhatsApp join).
- Content requiring a source (Hadith reference; Qur'an translation source and reference) is
  enforced at both the form and database level.
- Nothing in this codebase invents Qur'an verses, Hadith, or Islamic rulings — all content
  is entered by your admins through the dashboard.
