# Bayt al-Hikmah — Development Plan: Authentication, Database & User Accounts

> **Status:** PENDING APPROVAL  
> **Created:** 2026-08-23 (UTC+8)  
> **Scope:** Convert static content library into full-featured educational platform  
> **Approach:** Auth.js + Drizzle ORM + local libSQL (sqld) / Turso (production)

---

## Table of Contents

1. [Goals & Non-Goals](#1-goals--non-goals)
2. [Technology Stack](#2-technology-stack)
3. [Database Schema](#3-database-schema)
4. [Phase-by-Phase Implementation Plan](#4-phase-by-phase-implementation-plan)
5. [OAuth Provider Configuration](#5-oauth-provider-configuration)
6. [Deployment Architecture](#6-deployment-architecture)
7. [Content Expansion Roadmap](#7-content-expansion-roadmap)
8. [Current Project State](#8-current-project-state)
9. [Next Steps](#9-next-steps)

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
| **Auth** | Auth.js (NextAuth v5) | Config in code (auth.ts), readable cookies, multiple OAuth providers, email/password built-in |
| **Database** | libSQL / Turso | SQLite-compatible, schema in TypeScript via Drizzle, file-based local dev, edge-replicated in production |
| **ORM** | Drizzle ORM | Schema is TypeScript; migrations are SQL files; fully inspectable by agent |
| **Framework** | Next.js 14 App Router | Already in use; upgrade from static export to SSR + API routes |
| **Deployment** | Vercel | Current platform; handles SSR, API routes, and edge functions natively |
| **Local DB Server** | sqld (bundled with Turso CLI) | Runs libSQL HTTP API locally; same protocol as Turso cloud |

### Why Not Clerk + Supabase
- Clerk uses opaque JWT tokens that are masked by security filters — I cannot debug auth issues programmatically
- Supabase RLS policies are invisible SQL in a dashboard — not version-controlled
- This stack is 100% code-driven and debuggable by an AI agent

---

## 3. Database Schema

```typescript
// db/schema.ts — Drizzle ORM schema

import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ===== AUTH (Auth.js managed) =====
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  role: text("role", { enum: ["student", "instructor", "admin"] }).notNull().default("student"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

// ===== READING PROGRESS =====
export const readingProgress = sqliteTable("reading_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentType: text("content_type", { enum: ["book", "quran", "hadith", "tafsir"] }).notNull(),
  contentSlug: text("content_slug").notNull(),
  chapterNum: integer("chapter_num"),
  lastReadAt: integer("last_read_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  completionPercent: integer("completion_percent").notNull().default(0),
  language: text("language").notNull().default("en"),
});

// ===== COURSES =====
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  instructorId: text("instructor_id").references(() => users.id),
  status: text("status", { enum: ["draft", "open", "closed", "archived"] }).notNull().default("draft"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const courseLessons = sqliteTable("course_lessons", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  contentSlug: text("content_slug"), // links to static content (book chapter, etc.)
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
});

export const courseEnrollments = sqliteTable("course_enrollments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  enrolledAt: integer("enrolled_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  status: text("status", { enum: ["active", "completed", "dropped"] }).notNull().default("active"),
});

export const courseProgress = sqliteTable("course_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull().references(() => courseLessons.id, { onDelete: "cascade" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

// ===== COMPETITIONS =====
export const competitions = sqliteTable("competitions", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  registrationOpen: integer("registration_open", { mode: "timestamp" }),
  registrationClose: integer("registration_close", { mode: "timestamp" }),
  competitionDate: integer("competition_date", { mode: "timestamp" }),
  entryFee: text("entry_fee"), // free-form text (e.g., "RM 50", "Free")
  prizeDescription: text("prize_description"),
  status: text("status", { enum: ["draft", "open", "closed", "completed"] }).notNull().default("draft"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const competitionRegistrations = sqliteTable("competition_registrations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  competitionId: text("competition_id").notNull().references(() => competitions.id, { onDelete: "cascade" }),
  registeredAt: integer("registered_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  paymentStatus: text("payment_status", { enum: ["pending", "verified", "waived"] }).notNull().default("pending"),
  paymentVerifiedBy: text("payment_verified_by").references(() => users.id),
  paymentVerifiedAt: integer("payment_verified_at", { mode: "timestamp" }),
  notes: text("notes"),
});

export const competitionSubmissions = sqliteTable("competition_submissions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  competitionId: text("competition_id").notNull().references(() => competitions.id, { onDelete: "cascade" }),
  submissionData: text("submission_data").notNull(), // JSON string: {answers, essay, etc.}
  submittedAt: integer("submitted_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  score: integer("score"),
  scoredBy: text("scored_by").references(() => users.id),
  scoredAt: integer("scored_at", { mode: "timestamp" }),
  feedback: text("feedback"),
});
```

---

## 4. Phase-by-Phase Implementation Plan

### Phase 1: Foundation — Auth + Database + Schema (Week 1)

**Objective:** Migrate from static export to SSR, set up auth and database.

| Step | Task | Files |
|------|------|-------|
| 1.1 | Backup current static site | Git tag `pre-auth-migration` (DONE) |
| 1.2 | Switch `next.config.js` from `output: 'export'` to SSR | `next.config.js` |
| 1.3 | Install dependencies: `next-auth`, `@auth/core`, `drizzle-orm`, `@libsql/client`, `better-sqlite3` (dev) | `package.json` |
| 1.4 | Configure Drizzle with libSQL adapter | `drizzle.config.ts`, `db/client.ts` |
| 1.5 | Define database schema (`db/schema.ts`) | `db/schema.ts` |
| 1.6 | Run initial migration to create tables | `drizzle/migrate.ts` |
| 1.7 | Configure Auth.js with credentials + OAuth providers | `auth.ts`, `middleware.ts` |
| 1.8 | Create sign-in / sign-up UI pages | `app/(auth)/signin/page.tsx`, `app/(auth)/signup/page.tsx` |
| 1.9 | Add session provider to layout | `app/layout.tsx` |
| 1.10 | Add user nav dropdown to header | `components/UserNav.tsx` |
| 1.11 | Test locally: sign up, sign in, sign out | — |
| 1.12 | Deploy to Vercel with environment variables | `.env.local` → Vercel |

**Acceptance Criteria:**
- [ ] `npm run dev` serves SSR pages
- [ ] `/signin` and `/signup` pages work
- [ ] Google OAuth login works in production
- [ ] Email/password registration works
- [ ] Session persists across page reloads

---

### Phase 2: User Profiles + Reading Progress (Week 1-2)

**Objective:** Users can see their profile and track reading progress.

| Step | Task | Files |
|------|------|-------|
| 2.1 | Create user profile page | `app/profile/page.tsx` |
| 2.2 | Add `role` field to user (default: student) | `db/schema.ts` |
| 2.3 | Add progress tracking API: POST `/api/progress` | `app/api/progress/route.ts` |
| 4.4 | Add progress fetch API: GET `/api/progress/[contentSlug]` | `app/api/progress/[slug]/route.ts` |
| 2.5 | Integrate progress save into chapter reader (auto-save on scroll) | `components/ChapterReader.tsx` |
| 2.6 | Show "Continue Reading" section on homepage for logged-in users | `app/page.tsx` |
| 2.7 | Show reading progress bar on book cards | `components/BookCard.tsx` |

**Acceptance Criteria:**
- [ ] Logged-in user sees their profile with joined date
- [ ] Reading a chapter auto-saves progress every 30 seconds
- [ ] Homepage shows "Continue Reading" with last-read books
- [ ] Book cards show a progress bar (% complete)

---

### Phase 3: Course System (Week 2-3)

**Objective:** Admin can create courses; students can enroll and track lessons.

| Step | Task | Files |
|------|------|-------|
| 3.1 | Create course admin pages (list, create, edit, delete) | `app/admin/courses/**` |
| 3.2 | Create course public listing page | `app/courses/page.tsx` |
| 3.3 | Create course detail page with enrollment button | `app/course/[slug]/page.tsx` |
| 3.4 | Add enrollment API | `app/api/courses/[slug]/enroll/route.ts` |
| 3.5 | Add lesson completion API | `app/api/courses/[slug]/progress/route.ts` |
| 3.6 | Create course player (sequential lesson navigation) | `app/course/[slug]/lesson/[lessonId]/page.tsx` |
| 3.7 | Add admin route protection (role = admin or instructor) | `middleware.ts` |

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
| 4.3 | Create competition detail + registration page | `app/competition/[slug]/page.tsx` |
| 4.4 | Add registration API (creates pending record) | `app/api/competitions/[slug]/register/route.ts` |
| 4.5 | Add submission API (for competition entries) | `app/api/competitions/[slug]/submit/route.ts` |
| 4.6 | Create admin payment verification page | `app/admin/competitions/[slug]/payments/page.tsx` |
| 4.7 | Add payment verification API | `app/api/competitions/[slug]/verify-payment/route.ts` |
| 4.8 | Add scoring API (admin assigns scores) | `app/api/competitions/[slug]/score/route.ts` |
| 4.9 | Add public leaderboard page | `app/competition/[slug]/leaderboard/page.tsx` |

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
| 5.1 | Create admin dashboard homepage (stats overview) | `app/admin/page.tsx` |
| 5.2 | Add user management table (list all users, promote/demote roles) | `app/admin/users/page.tsx` |
| 5.3 | Add admin sidebar navigation | `components/AdminSidebar.tsx` |
| 5.4 | Ensure mobile responsiveness for auth pages | CSS review |
| 5.5 | Add loading states and error boundaries | `components/Loading.tsx`, `components/ErrorBoundary.tsx` |
| 5.6 | Performance audit (Lighthouse score > 90) | — |
| 5.7 | Final end-to-end test of all flows | — |

**Acceptance Criteria:**
- [ ] Admin dashboard loads in < 2s
- [ ] Admin can view all users, change roles
- [ ] All pages are mobile-friendly
- [ ] Lighthouse performance score ≥ 90

---

### Phase 6: Content Expansion (Weeks 5-8+)

**Objective:** Integrate existing wiki content into the platform.

| Step | Task | Source |
|------|------|--------|
| 6.1 | Ingest Quran Wiki surah pages as static content | `/root/tarbiyyah/quran-wiki/` |
| 6.2 | Ingest Qaradawi Library entities as static content | `/root/qaradawi-library/` |
| 6.3 | Ingest Fi Zilal Wiki as static content | `/root/tarbiyyah/fi-zilal-wiki/` |
| 6.4 | Add Hadith collections (Bukhari, Muslim, Sunan) | External sources / API |
| 6.5 | Add Malay/Indonesian translations support | `catalog.yaml` extension |
| 6.6 | Add full-text search across all content | `flexsearch` or `fuse.js` |
| 6.7 | Add concept wiki cross-references | `content/concepts/` |

---

## 5. OAuth Provider Configuration

### Configured Providers (no additional API keys needed beyond what we set up):

| Provider | Status | Config Key | Notes |
|----------|--------|-----------|-------|
| **Google** | INCLUDED | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Most common; users already have accounts |
| **GitHub** | INCLUDED | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Easy setup; good for developers |
| **Email/Password** | INCLUDED | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` | Auth.js built-in credentials provider |

### Why Not More Providers
- Facebook: requires business verification, complex app review
- Apple: requires Apple Developer account ($99/year)
- Twitter/X: API approval is slow and unreliable
- Discord: niche audience for this platform

**Decision:** Google + GitHub + Email/Password covers 95%+ of users with minimal friction.

---

## 6. Deployment Architecture

### Development Environment

```
Local Machine (WSL)
├── Next.js dev server (localhost:3000)
│   ├── SSR pages
│   ├── API routes (/api/*)
│   └── Static content (unchanged)
│
└── sqld (localhost:8080)
    └── /root/projects/bayt-al-hikmah/db/bayt-al-hikmah.db
        └── libSQL database file
```

**Start local dev:**
```bash
# Terminal 1: Database
cd /root/projects/bayt-al-hikmah
/root/.turso/sqld -d db/bayt-al-hikmah.db --http-listen-addr 0.0.0.0:8080

# Terminal 2: Next.js
npm run dev
```

### Production Environment (Vercel)

```
Vercel Edge Network
├── Static pages (SSG): /book/*, /chapter/*, /quran/*, /hadith/*
│   → Pre-rendered at build, cached at edge
│
├── Server routes:
│   /api/auth/*      → Auth.js (OAuth callbacks, sessions)
│   /api/progress/*  → Reading progress API
│   /api/courses/*   → Course enrollment/progress
│   /api/compete/*   → Competition registration/submission
│   /dashboard/*     → User dashboard (SSR with auth check)
│   /admin/*         → Admin panel (protected by role)
│
└── Database: Turso (libSQL)
    → Edge-replicated SQLite
    → Connection via @libsql/client
```

### Environment Variables

```bash
# .env.local (development)
TURSO_DATABASE_URL=http://localhost:8080
TURSO_AUTH_TOKEN=local  # not used for local sqld
AUTH_SECRET=<random-32-char-string>
AUTH_TRUST_HOST=http://localhost:3000
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
GITHUB_CLIENT_ID=<from-github-settings>
GITHUB_CLIENT_SECRET=<from-github-settings>
SMTP_HOST=<your-email-provider>
SMTP_USER=<email-address>
SMTP_PASSWORD=<app-password>

# Vercel production:
TURSO_DATABASE_URL=libsql://<db-name>-<user>.turso.io
TURSO_AUTH_TOKEN=<turso-api-token>
AUTH_SECRET=<same-as-dev>
AUTH_TRUST_HOST=https://bayt-al-hikmah-nine.vercel.app
# (same OAuth and SMTP vars)
```

---

## 7. Content Expansion Roadmap

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

## 8. Current Project State

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
| Turso CLI | Installed at `/root/.turso/turso` |
| Local libSQL | Tested and working (`sqld` on port 8080) |

---

## 9. Next Steps

To proceed with implementation:

1. **Approve this plan** — reply "proceed with Phase 1"
2. **Provide OAuth credentials** — Google Cloud Console + GitHub OAuth App
   - Or: I can guide you through creating them
3. **Provide email SMTP credentials** — for password reset emails
   - Or: we can skip email verification in Phase 1 and add it later
4. **Turso production account** — Visit https://api.turso.tech/signup to create account
   - Or: we can use local libSQL indefinitely (no cloud needed)

### Immediate Action Required (User)

| Item | How to Complete | Priority |
|------|-----------------|----------|
| Google OAuth credentials | https://console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client ID | HIGH |
| GitHub OAuth credentials | https://github.com/settings/developers → New OAuth App | HIGH |
| SMTP credentials (email) | Any provider (Gmail, Resend, Mailgun) | MEDIUM |
| Turso cloud account | https://api.turso.tech/signup → GitHub login | MEDIUM |

### Agent Readiness Checklist

| Item | Status |
|------|--------|
| Next.js SSR capability | ✅ Verified (framework supports it) |
| libSQL local server | ✅ Tested (sqld responds on port 8080) |
| Turso CLI installed | ✅ At `/root/.turso/turso` |
| Drizzle ORM knowledge | ✅ Available |
| Auth.js v5 knowledge | ✅ Available |
| Current site backed up | ✅ Git tag `pre-auth-migration` |

---

## File Locations

| File | Purpose |
|------|---------|
| `DEVELOPMENT_PLAN.md` | This document — the master plan |
| `AGENTS.md` | Project operations guide (deployment, content workflow) |
| `PROJECT.md` | Original project overview |
| `next.config.js` | Next.js config (to be changed from static export) |
| `content/catalog.yaml` | Book registry |
| `content/authors.yaml` | Scholar registry |
| `content/books/` | Markdown chapter files |
| `db/` | **NEW** — Database schema, client, migrations |
| `auth.ts` | **NEW** — Auth.js configuration |
| `middleware.ts` | **NEW** — Route protection |
| `app/api/` | **NEW** — API routes |
| `app/admin/` | **NEW** — Admin dashboard pages |

---

*Plan created by Hermes (Nous Research). Review, approve, and store in project memory.*
