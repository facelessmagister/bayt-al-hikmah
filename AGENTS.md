# Bayt al-Hikmah — Agent Operations Guide

## Project Overview

Unified Islamic digital library. Next.js 14 static export, Vercel-deployed.

| Field | Value |
|-------|-------|
| **Location** | `/root/projects/bayt-al-hikmah/` |
| **Git** | `https://github.com/facelessmagister/bayt-al-hikmah.git` (branch: `master`) |
| **Live URL** | https://bayt-al-hikmah-nine.vercel.app |
| **Framework** | Next.js 14 App Router, `output: 'export'`, `trailingSlash: true` |
| **Content** | `content/catalog.yaml` (book registry) + `content/authors.yaml` (scholars) + `content/books/[slug]/{en,ar}/*.md` |
| **Design** | Solaris: #f8f6f2 paper, #0a2540 navy, #c45c3e terracotta. DM Serif Display + Source Sans 3 + Amiri |

## Current Status

- **Phase 0 (CONTENT):** COMPLETE — 13 books, 104 chapters, bilingual AR+EN reader, Solaris design.
- **Phase 1 (AUTH + DATABASE):** PENDING — See `DEVELOPMENT_PLAN.md` for full migration plan.
- **Framework change:** Next.js static export → SSR + API routes (pending Phase 1).

## Development Plan

**Current active plan:** `DEVELOPMENT_PLAN.md` — Authentication, Database, User Accounts, Courses, Competitions, Content Expansion.

This is the canonical plan. All agent work on this project should reference it.

---

## Deployment Credentials (CRITICAL)

This project is deployed under the **facelessmagister-9996s-projects** Vercel team.

| Credential | Value | Source |
|------------|-------|--------|
| **Vercel Token** | `VERCEL_TOKEN` env var | `source ~/.hermes/.env` |
| **Vercel Project ID** | `prj_WQZTlieCHsbFvQueFO8pGaGSDnEg` | `.vercel/project.json` |
| **Vercel Org ID** | `team_qnXasLsdOXvgG6Q9ZzwYqtbR` | `.vercel/project.json` |
| **Vercel Team** | `facelessmagister-9996s-projects` | — |
| **Vercel Project Name** | `bayt-al-hikmah` | — |

### ⚠️ DO NOT USE `VERCEL_TOKEN_NETFLYPS`

There are two Vercel tokens in the environment:
- **`VERCEL_TOKEN`** → facelessmagister-9996s-projects team → **USE THIS ONE**
- **`VERCEL_TOKEN_NETFLYPS`** → netflyps-projects team → **WRONG ACCOUNT — do not use for this project**

Using the wrong token creates a stray Vercel project under a different account and deploys to a different URL.

## Publishing Workflow

### Adding a New Book

1. **Translate the book** (if not already translated) following the `islamic-text-translation` skill pipeline.

2. **Create content directory:**
   ```
   content/books/[book-slug]/
   ├── en/          # English translation chapters (00-introduction.md, 01-*.md, ...)
   └── ar/          # Arabic original chapters (if available)
   ```

3. **Register in catalog:** Add the book entry to `content/catalog.yaml`:
   ```yaml
   [book-slug]:
     title:
       en: "English Title"
       ar: "Arabic Title"
     author: [author-slug]          # must exist in authors.yaml
     shelf: revivalist|qaradawi     # shelf slug
     original_language: ar
     languages: [ar, en]            # list all available languages
     domains: [dawah, haraki, ...]  # content domains
     tags: [tag1, tag2, ...]
     source:
       archive_id: "ARCHIVE_ORG_ID"
       archive_url: "https://archive.org/details/ARCHIVE_ORG_ID"
     chapters:
       - { num: 1, title: { en: "Introduction", ar: "المقدمة" }, slug: "00-introduction" }
       - { num: 2, title: { en: "...", ar: "..." }, slug: "01-..." }
       # ... one entry per chapter, slug must match filename in en/ or ar/
     status:
       en: published
       ar: published                # or: not-translated, partial
     translated_by: "Tarbiyyah Translation Team"
     translated_at: "YYYY-MM-DD"
     notes: "Optional notes"
   ```

4. **Add author** (if new) to `content/authors.yaml`:
   ```yaml
   authors:
     [author-slug]:
       name: Full Name
       native_name: Arabic Name
       birth_year: YYYY
       death_year: YYYY or null
       nationality: Country
       role: Description
       movement: Movement affiliation
       bio: >
         Biographical paragraph.
       priority: 1    # 1=high, 2=medium
   ```

5. **Build locally to verify:**
   ```bash
   cd /root/projects/bayt-al-hikmah
   npm run build
   ```
   Check the build output shows the new book's pages (book page + chapter pages).

6. **Commit and push:**
   ```bash
   git add -A
   git commit -m "Add Book N: [Title] ([Author]) — [description]"
   git push origin master
   ```

7. **Deploy to Vercel:**
   ```bash
   source ~/.hermes/.env
   npx vercel deploy --token "$VERCEL_TOKEN" --yes --prod
   ```
   This deploys to `bayt-al-hikmah-nine.vercel.app`.

8. **Verify deployment:**
   ```bash
   # Book page
   curl -sL -o /dev/null -w "%{http_code}" https://bayt-al-hikmah-nine.vercel.app/book/[book-slug]
   # Chapter pages (check first, middle, last)
   curl -sL -o /dev/null -w "%{http_code}" https://bayt-al-hikmah-nine.vercel.app/chapter/[book-slug]/1/en
   curl -sL -o /dev/null -w "%{http_code}" https://bayt-al-hikmah-nine.vercel.app/chapter/[book-slug]/N/en
   # Library listing
   curl -sL https://bayt-al-hikmah-nine.vercel.app/library | grep -c "[Book Title]"
   ```
   All should return 200.

### Updating an Existing Book

1. Edit chapter files in `content/books/[slug]/{en,ar}/`
2. Update `catalog.yaml` if chapter structure changed
3. Build, commit, push, deploy (same steps 5-8 above)

### Adding Arabic Content to an English-Only Book

1. Create `content/books/[slug]/ar/` directory
2. Add Arabic `.md` files with slugs matching the catalog chapter entries
3. Update `catalog.yaml`: change `languages: [en]` → `languages: [ar, en]` and `status.ar: published`
4. Build, push, deploy

## Common Pitfalls

1. **Wrong Vercel token** — Always use `VERCEL_TOKEN`, never `VERCEL_TOKEN_NETFLYPS`. Source `~/.hermes/.env` first.
2. **Missing `.vercel/project.json`** — If deleted, the CLI creates a new project under whatever token is active. Keep this file in place.
3. **Chapter slug mismatch** — The `slug` field in `catalog.yaml` chapters must match the filename (without `.md`) in `content/books/[slug]/{lang}/`. If they don't match, the chapter won't render.
4. **Build artifacts in git** — `.next/`, `out/`, `node_modules/`, `.vercel/` are in `.gitignore`. Don't commit them.
5. **Arabic file naming** — Arabic chapter files use the same slug convention as English (e.g., `00-introduction.md`, `01-preachers-sidelines.md`). Arabic titles go in the catalog, not the filenames.

## Current Book Inventory (14 books)

| # | Slug | Title | Author | Shelf | Languages |
|---|------|-------|--------|-------|-----------|
| 1 | what-my-belonging-to-islam-means | What My Belonging to Islam Means | Fathi Yakan | revivalist | EN + AR |
| 2 | our-spiritual-education | Our Spiritual Education | Said Hawwa | revivalist | EN + AR |
| 3 | how-to-call-to-islam | How to Call to Islam | Fathi Yakan | revivalist | EN + AR |
| 4 | the-promised-generation | The Promised Generation | Majdi al-Hilali | revivalist | EN (partial) + AR |
| 5 | halal-haram | The Lawful and the Prohibited in Islam | Yusuf al-Qaradawi | qaradawi | EN |
| 6 | fiqh-al-zakah | Fiqh al-Zakah | Yusuf al-Qaradawi | qaradawi | EN |
| 7 | approaching-the-sunnah | Approaching the Sunnah | Yusuf al-Qaradawi | qaradawi | EN |
| 8 | economic-security | Economic Security in Islam | Yusuf al-Qaradawi | qaradawi | EN |
| 9 | ethics-in-islam | Ethics in Islam | Yusuf al-Qaradawi | qaradawi | EN |
| 10 | education-economy-sunnah | Education and Economy in the Sunnah | Yusuf al-Qaradawi | qaradawi | EN |
| 11 | diversion-arts | Diversion and Arts in Islam | Yusuf al-Qaradawi | qaradawi | EN |
| 12 | faith-and-life | Faith and Life | Yusuf al-Qaradawi | qaradawi | EN |
| 13 | auspices-victory | Auspices of the Ultimate Victory of Islam | Yusuf al-Qaradawi | qaradawi | EN |
| 14 | how-to-call-to-islam | (same as #3, updated) | — | — | — |

Note: Book #3 and #14 are the same entry — `how-to-call-to-islam` was updated in place when the English translation was added.

## Zone Rules

- **Personal project** — never mix with Genesis business contexts.
- **Source authenticity** — follow Tarbiyyah CLAUDE.md source tiers for all content.
- **Git** — `master` branch deploys to production. Push is allowed (GitHub repo is the canonical source).
- **No local-only restriction** — unlike Quran Wiki and Tarbiyyah, this project IS pushed to GitHub.