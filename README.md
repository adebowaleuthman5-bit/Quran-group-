# Quran Recitation and Lectures Group — Website

A lightweight, mobile-first, app-like website for the Quran Recitation and Lectures Group,
with a secure Supabase-backed admin dashboard. The public site is organized around four
sections reachable from a single menu — **Home**, **Daily Prayer**, **Q&A**, and **About** —
plus a few unlisted, shareable detail pages for individual lectures, quizzes, and answered
questions. Admins manage everything from `/admin`.

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
2. Open the **SQL Editor** and run every file in `supabase/migrations/` **in order** (0001
   through 0005). Together they create every table, enable Row Level Security, add the
   read/write policies, seed the singleton settings rows, and add the Quizzes, Resources,
   post-category, donation-text, and push-notification tables.
3. Confirm in **Table Editor** that all tables listed below were created.

### Database tables

`profiles`, `posts`, `quizzes`, `quiz_questions`, `lectures`, `resources`,
`islamic_questions`, `question_answers`, `executives`, `founder`, `group_information`,
`group_rules`, `social_links`, `site_settings`, `push_subscriptions`, `lecture_reminders`.

### Security model (Row Level Security)

- Public visitors can only **read** content where `status = 'published'` (or `active = true`
  for executives/rules). They can also **insert** into `islamic_questions` and
  `push_subscriptions` (submitting a question / enabling reminders) but can never read those
  back — protecting everyone's submitted contact info and device data.
- Only authenticated users with a row in `profiles` can create, edit, delete, publish, or
  unpublish anything.
- A post requires only a title, category, and content — nothing else is mandatory.

## 4. Authentication & the three admin accounts

The brief calls for exactly three administrators: one **Super Admin** and two **Admins**.
Supabase Auth stores the login credentials; the `profiles` table stores each person's role.

For each of the three admins:

1. **Supabase Dashboard → Authentication → Users → Add User**. Enter their email and set a
   temporary password.
2. Copy the new user's UUID.
3. In **Table Editor → profiles**, insert a row:
   - `id`: the UUID you copied
   - `full_name`: their name
   - `role`: `super_admin` for the one Super Admin, `admin` for the other two

They sign in at `/admin/login` — not linked anywhere in the public navigation, reached only
by going directly to that address.

## 5. Storage (images & files)

The migration creates a public `site-media` bucket for the logo, executive photos, founder
photo, lecture posters, post images, and resource-library files. Post images and lecture
posters upload directly from the admin dashboard (choose a file — it uploads automatically).
Other images (executive photos, etc.) are uploaded manually via **Storage → site-media →
Upload file**, then paste the resulting public URL into the relevant admin form.

## 6. Run locally

```bash
npm run dev
```

Visit `http://localhost:5173`. Sign in at `/admin/login` with an account you created in step 4.

## 7. Site structure

### Public navigation (hamburger menu, all screen sizes)

- **Home** — Today's Verse, Daily Dua, Daily Adhkar, the Daily Post feed, a Lectures Update
  section (with a live countdown to the next upcoming lecture), and a Quizzes section. Every
  item has a Share button. Tapping a lecture or quiz expands a short preview right there on
  the page, with a link through to its own full, shareable page.
- **Daily Prayer** — today's five prayer times plus sunrise, calculated entirely in the
  visitor's browser from their device location (the `adhan` library, Muslim World League
  method — no API, no admin setup). Shows today's date in both Gregorian and Hijri. Each
  prayer has a "Remind Me" reminder.
- **Q&A** — the "Ask an Islamic Question" form, previously answered questions, and the
  Resource Library (admin-uploaded files: PDFs, audio, documents) all on one page.
- **About** — Goal, Mission, Vision, Objectives, History, Group Rules, Founder, Executives,
  Donation & Support (admin-editable bank/payment text, hidden if left blank), and Contact
  (WhatsApp button, social icons, email/phone).

### Unlisted pages (not in the menu, but directly linkable/shareable)

- `/lectures/:id` — full detail for one lecture
- `/quizzes/:id` — take a specific quiz (score shown instantly; nothing is stored per
  visitor, since the site has no visitor accounts)
- `/questions/:id` — one published question-and-answer page

### Admin dashboard (`/admin`)

Unchanged in structure from before — Posts (now with a category picker: Post / Verse / Dua
/ Adhkar), Quizzes, Lectures, Resource Library, Islamic Questions, Executives, Founder,
Group Information, Rules, Social Links, and Settings (now including the Donation/Support
text field).

## 8. Dark mode & visual identity

A sun/moon toggle (navbar and admin sidebar) switches the whole site between light and dark
instantly and remembers the choice. A subtle, hand-built Islamic geometric pattern (an
eight-point star lattice, scattered stars, and a crescent moon — not an image) sits behind
the page content and recolors itself automatically with the theme. The group name renders in
a bold gradient display font. A floating WhatsApp button sits on every public page.

## 9. Reminders — current state and what's next

Every "Remind Me" button today uses the browser's built-in Notification API: it only fires
while that browser tab stays open, since there's no server sending it. The database and a
client-side helper (`src/lib/push.ts`) for **real, device-level push notifications** already
exist as groundwork — but turning that on requires a genuinely bigger step: generating VAPID
keys, deploying a Supabase Edge Function (with the Supabase CLI) that runs on a schedule via
`pg_cron`, and adding a service worker file. That's intentionally being done as its own
dedicated follow-up rather than bundled in here, so it can be built and explained carefully
rather than shipped untested.

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
  context/           AuthContext, ThemeContext
  lib/                supabaseClient, shared TypeScript types, data hooks, push.ts (groundwork)
  pages/public/      Home, DailyPrayer, QA, About, LectureDetail, QuizTake, QuestionDetail
  pages/admin/        Login, Dashboard, and one management page per content type
supabase/
  migrations/         0001 base schema → 0005 web-app restructure (category, donation, push)
```

## Notes

- No user accounts, comments, or social features exist for visitors by design — only
  reading, viewing, taking quizzes, checking prayer times, and the two forms (Ask a
  Question, WhatsApp join).
- Posts are one flexible table with a category tag (Post/Verse/Dua/Adhkar) — admins use the
  same simple form for all of them.
- Nothing in this codebase invents Islamic content — every post, quiz, lecture, resource,
  and Q&A answer is entered by your admins through the dashboard.
