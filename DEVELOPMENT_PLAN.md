# Bayt al-Hikmah — Development Plan: Authentication, Database & User Accounts

> **Status:** IN PROGRESS — Phase 1  
> **Created:** 2026-08-23 (UTC+8)  
> **Updated:** 2026-08-23 (stack revised to Supabase-only)  
> **Scope:** Convert static content library into full-featured educational platform  
> **Approach:** Supabase Auth + Supabase PostgreSQL database + Next.js SSR

---

## Table of Contents

1. [Goals & Non-Goals](#1-goals--non-goals)
2. [Technology Stack](#2-technology-stack)
3. [Database Schema](#3-database-schema)
4. [Phase-by-Phase Implementation Plan](#4-phase-by-phase-implementation-plan)
5. [Deployment Architecture](#5-deployment-architecture)
6. [Content Expansion Roadmap](#6-content-expansion-roadmap)
7. [Current Project State](#7-current-project-state)
8. [Environment Variables](#8-environment-variables)

---

## 1. Goals & Non-Goals

### Goals
- Add user authentication (OAuth + email/password)
- Add user profiles with role-based access (student, instructor, admin)
- Enable reading progress tracking (bookmark where users left off)
- Enable course system (enrollment, lesson tracking, progress)
- Enable competition system (registration, manual payment tracking, submissions)
- Add admin dashboard for course/competition management
- Maintain all existing content and design
- Deploy to Vercel with server-side capabilities (SSR + API routes)

### Non-Goals
- Automated payment processing (manual payment tracking only)
- Real-time chat or messaging
- Video hosting (embed or link only)
- Machine translation of content

---

## 2. Technology Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| **Auth** | Supabase Auth | Built-in OAuth (Google, GitHub), email/password, no OAuth app creation needed |
| **Database** | Supabase PostgreSQL | Managed PostgreSQL with real-time subscriptions, row-level security |
| **Database Client** | `@supabase/supabase-js` | Official client, handles auth sessions + database queries |
| **SSR/Server Components** | `@supabase/ssr` | Cookie-based session management for Next.js App Router |
| **Framework** | Next.js 14 App Router | Already in use; upgrade from static export to SSR + API routes |
| **Deployment** | Vercel | Current platform; handles SSR, API routes natively |

### Why Supabase (revised decision)
- **Zero OAuth setup** — Google/GitHub auth works out of the box via Supabase proxy
- **Single service** — auth and database in one place, one set of credentials
- **No email confirmation required** — configured in dashboard, users sign up instantly
- **RLS policies** — handled in Supabase dashboard; acceptable trade-off for zero setup friction
- **Production ready** — auto-scaling, backups, real-time subscriptions available

---

## 3. Database Schema

All tables created in Supabase PostgreSQL. Managed via Supabase SQL Editor or migrations.

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== PROFILES (extends Supabase auth.users) =====
-- This table is automatically linked to auth.users via a trigger
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger: auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'avatar_url', 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== READING PROGRESS =====
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('book', 'quran', 'hadith', 'tafsir')),
  content_slug TEXT NOT NULL,
  chapter_num INTEGER,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_percent INTEGER NOT NULL DEFAULT 0 CHECK (completion_percent BETWEEN 0 AND 100),
  language TEXT NOT NULL DEFAULT 'en',
  UNIQUE(user_id, content_slug, language)
);

-- ===== COURSES =====
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  content_slug TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  UNIQUE(user_id, course_id)
);

CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, lesson_id)
);

-- ===== COMPETITIONS =====
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  registration_open TIMESTAMP WITH TIME ZONE,
  registration_close TIMESTAMP WITH TIME ZONE,
  competition_date TIMESTAMP WITH TIME ZONE,
  entry_fee TEXT,
  prize_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE competition_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'waived')),
  payment_verified_by UUID REFERENCES auth.users(id),
  payment_verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(user_id, competition_id)
);

CREATE TABLE competition_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  scored_by UUID REFERENCES auth.users(id),
  scored_at TIMESTAMP WITH TIME ZONE,
  feedback TEXT
);

-- ===== ROW LEVEL SECURITY (RLS) POLICIES =====
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Reading progress: users can CRUD only their own
CREATE POLICY "Users can CRUD own reading progress" ON reading_progress FOR ALL USING (auth.uid() = user_id);

-- Courses: public read when open, admin full access
CREATE POLICY "Courses are viewable by everyone" ON courses FOR SELECT USING (true);

-- Course lessons: public read when parent course is open
CREATE POLICY "Course lessons are viewable by everyone" ON course_lessons FOR SELECT USING (true);

-- Enrollments: users can CRUD only their own
CREATE POLICY "Users can CRUD own enrollments" ON course_enrollments FOR ALL USING (auth.uid() = user_id);

-- Course progress: users can CRUD only their own
CREATE POLICY "Users can CRUD own course progress" ON course_progress FOR ALL USING (auth.uid() = user_id);

-- Competitions: public read when open
CREATE POLICY "Competitions are viewable by everyone" ON competitions FOR SELECT USING (true);

-- Competition registrations: users can CRUD only their own
CREATE POLICY "Users can CRUD own registrations" ON competition_registrations FOR ALL USING (auth.uid() = user_id);

-- Competition submissions: users can CRUD only their own
CREATE POLICY "Users can CRUD own submissions" ON competition_submissions FOR ALL USING (auth.uid() = user_id);
```

---

## 4. Phase-by-Phase Implementation Plan

### Phase 1: Foundation — Supabase Auth + Database + SSR Migration (Week 1)

**Objective:** Migrate from static export to SSR, integrate Supabase auth and database.

| Step | Task | Files |
|------|------|-------|
| 1.1 | Backup current static site | Git tag `pre-auth-migration` (DONE) |
| 1.2 | Switch `next.config.js` from `output: 'export'` to SSR | `next.config.js` |
| 1.3 | Install dependencies: `@supabase/supabase-js`, `@supabase/ssr` | `package.json` |
| 1.4 | Create Supabase client utilities (browser + server) | `utils/supabase/client.ts`, `utils/supabase/server.ts`, `utils/supabase/middleware.ts` |
| 1.5 | Apply database schema to Supabase | Supabase SQL Editor |
| 1.6 | Create auth callback handler for OAuth | `app/auth/callback/route.ts` |
| 1.7 | Create sign-in / sign-up pages | `app/login/page.tsx`, `app/signup/page.tsx` |
| 1.8 | Add middleware for session refresh | `middleware.ts` |
| 1.9 | Add user nav dropdown to header | `components/UserNav.tsx` |
| 1.10 | Test locally: sign up, sign in, sign out | — |
| 1.11 | Deploy to Vercel with environment variables | `.env.local` → Vercel dashboard |

**Acceptance Criteria:**
- [ ] `npm run dev` serves SSR pages
- [ ] `/login` and `/signup` pages work
- [ ] Google OAuth login works in production
- [ ] Email/password registration works (no confirmation required)
- [ ] Session persists across page reloads
- [ ] New users auto-create profile row

---

### Phase 2: User Profiles + Reading Progress (Week 1-2)

**Objective:** Users can see their profile and track reading progress.

| Step | Task | Files |
|------|------|-------|
| 2.1 | Create user profile page | `app/profile/page.tsx` |
| 2.2 | Add role-based route protection (admin only) | `middleware.ts` |
| 2.3 | Add progress tracking API: save progress | `app/api/progress/route.ts` |
| 2.4 | Add progress fetch API: get progress | `app/api/progress/route.ts` (GET) |
| 2.5 | Integrate progress save into chapter reader | `components/ChapterReader.tsx` |
| 2.6 | Show "Continue Reading" section on homepage | `app/page.tsx` |
| 2.7 | Show reading progress bar on book cards | `components/BookCard.tsx` |

**Acceptance Criteria:**
- [ ] Logged-in user sees their profile with joined date
- [ ] Reading a chapter auto-saves progress
- [ ] Homepage shows "Continue Reading" with last-read books
- [ ] Book cards show a progress bar (% complete)

---

### Phase 3: Course System (Week 2-3)

**Objective:** Admin can create courses; students can enroll and track lessons.

| Step | Task | Files |
|------|------|-------|
| 3.1 | Create course admin pages | `app/admin/courses/**` |
| 3.2 | Create course public listing | `app/courses/page.tsx` |
| 3.3 | Create course detail + enrollment | `app/course/[slug]/page.tsx` |
| 3.4 | Add enrollment API | `app/api/courses/[slug]/enroll/route.ts` |
| 3.5 | Add lesson completion API | `app/api/courses/[slug]/progress/route.ts` |
| 3.6 | Create course player | `app/course/[slug]/lesson/[lessonId]/page.tsx` |

**Acceptance Criteria:**
- [ ] Admin can create a course with lessons
- [ ] Student can browse courses and enroll
- [ ] Enrolled student sees course progress
- [ ] Lesson completion advances progress
- [ ] Non-admin cannot access `/admin/**`

---

### Phase 4: Competition System (Week 3-4)

**Objective:** Admin can create competitions; users can register (manual payment).

| Step | Task | Files |
|------|------|-------|
| 4.1 | Create competition admin pages | `app/admin/competitions/**` |
| 4.2 | Create competition public listing | `app/competitions/page.tsx` |
| 4.3 | Create competition detail + registration | `app/competition/[slug]/page.tsx` |
| 4.4 | Add registration API | `app/api/competitions/[slug]/register/route.ts` |
| 4.5 | Add submission API | `app/api/competitions/[slug]/submit/route.ts` |
| 4.6 | Create admin payment verification | `app/admin/competitions/[slug]/payments/page.tsx` |
| 4.7 | Add payment verification API | `app/api/competitions/[slug]/verify-payment/route.ts` |
| 4.8 | Add scoring API | `app/api/competitions/[slug]/score/route.ts` |
| 4.9 | Create public leaderboard | `app/competition/[slug]/leaderboard/page.tsx` |

**Acceptance Criteria:**
- [ ] Admin can create competition with entry fee
- [ ] User can register (status: pending payment)
- [ ] Admin can mark payment as verified
- [ ] Verified user can submit answers/essay
- [ ] Admin can score submissions
- [ ] Leaderboard shows ranked participants

---

### Phase 5: Admin Dashboard + Polish (Week 4)

**Objective:** Unified admin interface; responsive design; performance.

| Step | Task | Files |
|------|------|-------|
| 5.1 | Create admin dashboard | `app/admin/page.tsx` |
| 5.2 | Add user management | `app/admin/users/page.tsx` |
| 5.3 | Add admin sidebar | `components/AdminSidebar.tsx` |
| 5.4 | Mobile responsiveness | CSS review |
| 5.5 | Loading states + error boundaries | `components/Loading.tsx` |
| 5.6 | Performance audit | Lighthouse |
| 5.7 | End-to-end testing | — |

---

### Phase 6: Content Expansion (Weeks 5-8+)

**Objective:** Integrate existing wiki content into the platform.

| Step | Content | Source |
|------|---------|--------|
| 6.1 | Quran Wiki (114 surahs + tafsir + themes) | `/root/tarbiyyah/quran-wiki/` |
| 6.2 | Qaradawi Library (9 books, entities, concepts) | `/root/qaradawi-library/` |
| 6.3 | Fi Zilal Wiki (23+ surahs, thematic) | `/root/tarbiyyah/fi-zilal-wiki/` |
| 6.4 | Hadith collections (Bukhari, Muslim, Sunan) | External sources |
| 6.5 | Malay/Indonesian translations | Translation pipeline |
| 6.6 | Full-text search | `flexsearch` or `fuse.js` |
| 6.7 | Concept wiki cross-references | AI-generated |

---

## 5. Deployment Architecture

### Development Environment

```
Local Machine (WSL)
├── Next.js dev server (localhost:3000)
│   ├── SSR pages
│   ├── API routes (/api/*)
│   └── Static content (unchanged)
│
└── Supabase (cloud)
    ├── Auth (OAuth, email/password)
    └── PostgreSQL database
```

**Start local dev:**
```bash
cd /root/projects/bayt-al-hikmah
npm run dev
# Supabase is cloud — no local server needed
```

### Production Environment (Vercel)

```
Vercel Edge Network
├── Static pages (SSG): /book/*, /chapter/*, /quran/*, /hadith/*
│   → Pre-rendered at build, cached at edge
│
├── Server routes:
│   /api/**          → API routes (Next.js serverless functions)
│   /login           → Login page
│   /signup          → Signup page
│   /profile         → User profile (SSR with auth check)
│   /dashboard/*     → User dashboard
│   /admin/*         → Admin panel (protected by role)
│
└── Supabase (cloud)
    ├── Auth (OAuth, sessions)
    └── PostgreSQL (user data, progress, courses, competitions)
```

---

## 6. Content Expansion Roadmap

After the auth platform is complete, the following content will be integrated gradually:

| Phase | Content | Source | Size |
|-------|---------|--------|------|
| 6.1 | Quran Wiki (114 surahs + tafsir + themes) | `/root/tarbiyyah/quran-wiki/` | 306 MB, 26K files |
| 6.2 | Qaradawi Library (9 books, entities, concepts) | `/root/qaradawi-library/` | 78 MB, 696 files |
| 6.3 | Fi Zilal Wiki (23+ surahs, thematic) | `/root/tarbiyyah/fi-zilal-wiki/` | 8 MB, 263 files |
| 6.4 | Hadith collections (Bukhari, Muslim, Sunan) | External (sunnah.com API or local) | TBD |
| 6.5 | Malay/Indonesian translations | Translation pipeline | — |
| 6.6 | Full-text search | `flexsearch` or `fuse.js` | — |
| 6.7 | Concept wiki cross-references | AI-generated from content | — |

---

## 7. Current Project State

| Metric | Value |
|--------|-------|
| Books | 13 |
| Chapters | 104 |
| Scholars | 4 |
| Shelves | 2 (Revivalist Literature, Qaradawi Collection) |
| Languages | English + Arabic (bilingual for 4 books) |
| Framework | Next.js 14 static export |
| Deployment | Vercel (bayt-al-hikmah-nine.vercel.app) |
| Git remote | https://github.com/facelessmagister/bayt-al-hikmah.git |
| Backup tag | `pre-auth-migration` |
| Supabase project | `sblzlpjxwlthilppmyyd` |
| Email confirmation | Disabled (configured in Supabase dashboard) |
| Environment | `.env.local` configured (gitignored) |

---

## 8. Environment Variables

### `.env.local` (development — already configured)

```bash
SUPABASE_URL=https://sblzlpjxwlthilppmyyd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNibHpscGp4d2x0aGlscHBteXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MzYyMTYsImV4cCI6MjEwMzAxMjIxNn0.g5FIoS4n-LMMpH32foozh4SaNYCFLhZKRojCFPtCl8U
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNibHpscGp4d2x0aGlscHBteXlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzQzNjIxNiwiZXhwIjoyMTAzMDEyMjE2fQ.92ru0PnJIAXIR_8IZSQYZHMMXm5M7LnfZfYlcO2CP20
AUTH_SECRET=09b9d23609936dbf9a4c52b5a0a6f630a465cadb2d4deea276ee432e6152169a
AUTH_TRUST_HOST=http://localhost:3000
```

### Vercel Production Environment Variables

Set in Vercel dashboard (Settings → Environment Variables):
- `SUPABASE_URL` — same as above
- `SUPABASE_ANON_KEY` — same as above
- `SUPABASE_SERVICE_ROLE_KEY` — same as above
- `AUTH_SECRET` — generate new random string
- `AUTH_TRUST_HOST` — `https://bayt-al-hikmah-nine.vercel.app`

---

## File Locations

| File | Purpose |
|------|---------|
| `DEVELOPMENT_PLAN.md` | This document — the master plan |
| `AGENTS.md` | Project operations guide (deployment, content workflow, current status) |
| `PROJECT.md` | Original project overview |
| `next.config.js` | Next.js config (to be changed from static export) |
| `content/catalog.yaml` | Book registry |
| `content/authors.yaml` | Scholar registry |
| `content/books/` | Markdown chapter files |
| `.env.local` | Environment variables (gitignored, Bayt al-Hikmah ONLY) |
| `.env.local.example` | Template for environment variables |
| `utils/supabase/` | **NEW** — Supabase client utilities |
| `middleware.ts` | **NEW** — Session refresh + route protection |
| `app/login/page.tsx` | **NEW** — Login page |
| `app/signup/page.tsx` | **NEW** — Signup page |
| `app/auth/callback/route.ts` | **NEW** — OAuth callback handler |
| `app/api/**` | **NEW** — API routes |
| `app/admin/` | **NEW** — Admin dashboard pages |
| `app/profile/` | **NEW** — User profile pages |
| `app/courses/` | **NEW** — Course pages |
| `app/competitions/` | **NEW** — Competition pages |

---

*Plan created by Hermes (Nous Research). Stack revised to Supabase-only on 2026-08-23.*
