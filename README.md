# Quran Recitation and Lectures Group — Website

A lightweight, mobile-first website for the Quran Recitation and Lectures Group, with a secure
Supabase-backed admin dashboard. Visitors read posts (Qur'an, Hadith, Adhkar, reminders —
anything the admins share), take Islamic quizzes, see lecture updates with a countdown timer,
browse a resource library, check today's prayer times, search the site, and ask Islamic
questions; admins manage all of it from `/admin`.

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
2. Open the **SQL Editor** and run these four files **in order**:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_posts.sql`
   - `supabase/migrations/0003_phase1.sql`
   - `supabase/migrations/0004_resources.sql`
   Together they create every table, enable Row Level Security, add the read/write policies,
   seed the `group_information`, `social_links`, and `site_settings` singleton rows, add the
   Quizzes tables, the lecture countdown datetime column, and the Resource Library table.
3. Confirm in **Table Editor** that all tables listed below were created.

### Database tables

`profiles`, `posts`, `quizzes`, `quiz_questions`, `lectures`, `resources`, `islamic_questions`,
`question_answers`, `executives`, `founder`, `group_information`, `group_rules`,
`social_links`, `site_settings`.

### Security model (Row Level Security)

- Public visitors can only **read** content where `status = 'published'` (or `active = true`
  for executives/rules). They can also **insert** into `islamic_questions` (submitting a
  question) but can never read questions back — protecting everyone's submitted contact info.
- Only authenticated users with a row in `profiles` can create, edit, delete, publish, or
  unpublish anything.
- A post requires only a title and content to be created — nothing else is mandatory, since
  posts are meant to be flexible (Qur'an, Hadith, Adhkar, or any other reminder).

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

They can then sign in at `/admin/login` with the email and password you set. The Admin Login
page is not linked anywhere in the public navigation — it's reached only by going directly to
`/admin/login`.

## 5. Storage (images)

The migration creates a public `site-media` bucket for the logo, executive photos, founder
photo, lecture posters, and post images. Post images upload directly from the admin dashboard
(Posts → New Post → choose an image file). Other images (executive photos, etc.) are uploaded
manually:

1. **Supabase Dashboard → Storage → site-media → Upload file.**
2. Click the uploaded file → **Get URL** (public URL).
3. Paste that URL into the relevant admin form.

Only signed-in admins can upload, update, or delete files in this bucket; anyone can view them.

## 6. Run locally

```bash
npm run dev
```

Visit `http://localhost:5173`. Sign in at `/admin/login` with an account you created in step 4.

## 7. How the content workflow works

```
Admin signs in → creates/edits content → Save Draft or Publish → Supabase database
   → public pages query only published/active rows → visitors see the update
```

## 8. Phase 1 features

- **Posts** — one flexible content type (title, body, optional image) replacing separate
  Qur'an/Hadith/Adhkar sections.
- **Islamic Quizzes** — admins build multiple-choice quizzes (any number of questions, 4
  options each, one correct answer). Visitors take a quiz and see their score instantly;
  nothing is stored per-visitor since the site has no visitor accounts.
- **Lecture Countdown** — set an exact date/time on a lecture (LecturesAdmin → "Exact Date &
  Time") and a live countdown appears on the homepage and Lectures page. The "Remind Me"
  button requests browser notification permission and fires a notification when the time
  arrives — **this only works while the tab stays open**, since there's no server-side
  scheduler yet. That's flagged in the UI itself.
- **Simple Search** — `/search` searches published Posts and published Islamic Q&A by
  keyword.
- **Admin Login is hidden from public navigation** — it's still reachable directly at
  `/admin/login`, just not linked in the header or footer.

## 9. Phase 2 features

- **Islamic Resource Library** (`/resources`) — admins upload any file (PDF, audio, Word
  doc, slides) from the dashboard; it's stored in Supabase Storage and shown publicly with
  a title, optional description, and a file-type badge. Visitors click to open/download.
- **Prayer Times** (`/prayer-times`) — calculated entirely in the visitor's browser from
  their device location, using the `adhan` library (Muslim World League method) — no API
  key, no server, no admin work needed. An optional "Remind Me" per prayer works the same
  way as the lecture reminder: a browser notification that only fires while the tab stays
  open, since there's no server-side scheduler yet.

## 10. GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## 11. Deploy to Netlify or Vercel

Both `netlify.toml` and `vercel.json` are included, with the SPA redirect rule needed for
React Router. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables
in your hosting provider's settings (same values as your local `.env`), for all environments.

## Project structure

```
src/
  components/       shared UI, layout, and admin components
  context/           AuthContext (Supabase session + profile/role)
  lib/                supabaseClient, shared TypeScript types, small data hooks
  pages/public/      Home, Posts, Quizzes, Lectures, Resources, Prayer Times, Search,
                       Questions, About, Contact
  pages/admin/        Login, Dashboard, and one management page per content type
supabase/
  migrations/0001_init.sql   base schema, RLS policies, storage bucket, seed rows
  migrations/0002_posts.sql  replaces Qur'an/Hadith/Adhkar tables with a single posts table
  migrations/0003_phase1.sql quizzes tables + lecture countdown datetime column
  migrations/0004_resources.sql  resource library table
```

## Notes

- No user accounts, comments, or social features exist for visitors by design — only
  reading, viewing, taking quizzes, searching, browsing resources, checking prayer times,
  and the two forms (Ask a Question, WhatsApp join).
- Posts are intentionally flexible: a title, body content, and an optional image (uploaded
  to Supabase Storage) — no reference fields required.
- Prayer times are a live calculation (not stored data) — nothing to keep in sync, and
  they're accurate anywhere in the world the visitor is browsing from.
- Nothing in this codebase invents Islamic content — every post, quiz, lecture, resource,
  and Q&A answer is entered by your admins through the dashboard.
- **Still not built**: real server-side push notifications for lecture/prayer reminders
  (would need a scheduled server function and stored subscriptions) — the current "Remind
  Me" buttons use browser notifications that only fire while the tab stays open. That's a
  reasonable future upgrade if it becomes worth the added infrastructure.
