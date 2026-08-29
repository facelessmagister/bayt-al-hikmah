# Bayt al-Hikmah — Content Growth Plan

> **For Hermes:** This is the canonical CONTENT plan (distinct from DEVELOPMENT_PLAN.md, which covered the platform and is now complete). Execute phases in order. Each phase has checkboxes — update them as tasks complete, commit, and re-deploy. Sessions may be interrupted; this file is the resume point.

**Goal:** Grow Bayt al-Hikmah from 13 books into a full House of Wisdom — completing the Quran, bilingual library, untranslated revivalist works, and education content, using assets already on this server plus a translation pipeline.

**Created:** 2026-08-29 (Asia/Kuala_Lumpur)
**Strategy (user-approved):** (1) publish content already on server, (2) translate original Arabic works → English (then other languages), (3) acquire/add new content.

**Deploy/verify basics (applies to every task):**
- Build: `cd /root/projects/bayt-al-hikmah && npm run build` — must compile clean
- Deploy: `source ~/.hermes/.env && npx vercel deploy --token "$VERCEL_TOKEN" --yes --prod` (USE `VERCEL_TOKEN`, never `VERCEL_TOKEN_NETFLYPS`; add `--force` if caching suspected)
- Verify: `curl -sL -o /dev/null -w "%{http_code}" https://bayt-al-hikmah-nine.vercel.app/<path>` → 200
- Commit locally after each task (never push to GitHub unless user says so)
- Auth rules: see AGENTS.md "Authentication (WORKING — do not break)" — do not touch auth/middleware in content tasks

---

## Phase 1 — Complete The Promised Generation (English) ✅ PRIORITY: immediate win

**Why:** Only "partial" book in the library. Converts it to complete; familiarizes pipeline with the translation workflow before the big phases.

**Current state (verified):**
- Catalog has 7 chapters (`ch-00-introduction` … `ch-06-conclusion`), `languages: [ar, en]`
- Site `content/books/the-promised-generation/ar/` has ALL 7 chapters
- Site `content/books/the-promised-generation/en/` has only 4 (ch-00 → ch-03)
- **Missing EN: `ch-04-al-jil-al-awwal` (AR pp. 146–175), `ch-05-ayna-nahnu` (pp. 175–191), `ch-06-conclusion` (pp. 192–193)**
- Wiki translations at `/root/tarbiyyah/jeel-mawoud-wiki/english-translation/` cover only ch01–ch03 → new translation work required from Arabic

**Sources:**
- Arabic original (site): `content/books/the-promised-generation/ar/ch-04-al-jil-al-awwal.md`, `ch-05-ayna-nahnu.md`, `ch-06-conclusion.md`
- Raw text: `/root/tarbiyyah/jeel-mawoud-wiki/raw/extracted/jeel-mawoud-full-raw.txt` (166,687 chars)
- Book structure/page map: `/root/tarbiyyah/jeel-mawoud-wiki/AGENTS.md`

**Tasks:**
- [ ] 1.1 Translate ch-04 (الجيل الأول وأدوات التغيير, ~30 pp) — use `islamic-text-translation` skill; verify Quran citations against Al Quran Cloud API; store chunks at `/root/tarbiyyah/jeel-mawoud-wiki/english-translation/ch04-first-generation-and-tools/`
- [ ] 1.2 Translate ch-05 (أين نحن من الجيل الموعود؟, ~17 pp) — same pattern, `ch05-where-are-we/`
- [ ] 1.3 Translate ch-06 (الخاتمة, ~2 pp) — same pattern, `ch06-conclusion/`
- [ ] 1.4 Publish to site: copy final EN into `content/books/the-promised-generation/en/` with slugs `ch-04-al-jil-al-awwal.md`, `ch-05-ayna-nahnu.md`, `ch-06-conclusion.md`; update `catalog.yaml` status (en: published, full); Translation Center DB record (translation_projects: completed 7/7, via Supabase REST PATCH, slug `the-promised-generation`)
- [ ] 1.5 Build, deploy, verify: `/book/the-promised-generation` 200; `/chapter/the-promised-generation/5/en`, `/6/en`, `/7/en` all 200; commit

**Done when:** EN reader shows all 7 chapters; catalog + translation_projects say 7/7; build clean; deployed; committed.

---

## Phase 2 — Quran Integration (114 surahs) ★ identity-changing, largest

**Why:** Homepage promises "books, tafsir, and hadith" but delivers only books. The Quran corpus is fully extracted and verified on server — no research risk, pure pipeline. This converts the site from bookshelf → House of Wisdom.

**Current state (verified):**
- Raw corpus at `/root/tarbiyyah/quran-wiki/raw/`:
  - `tafsir/NNN.jsonl` — 117 files (Ibn Kathir + Al-Muyassar, HTML in `text` field)
  - `translations/surah_NNN/ayah_VVV.json` — 115 surah dirs, 5 editions per ayah
  - `arabic/NNN-VVV.md` — 6,237 ayah files (first ```text block = Uthmani text)
- Curated Layer 2: `/root/tarbiyyah/quran-wiki/surah-*.md` (119 pages) + `concepts/` (16)
- Extraction code reference: skill `per-tafsir-wiki-building` → `references/quran-wiki-data-extraction.md`

**Design decisions to make in-session at start of phase:**
- Route shape: `/quran/[surah]` listing ayahs; `/quran/[surah]/[ayah]` per-ayah view with translation toggle + tafsir accordions
- Pre-render strategy: 114 surah pages SSG + ~6,236 ayah pages SSG (bilingual) — watch build time; if too slow, surah pages SSG + ayah pages on-demand
- Translation editions: pick default EN edition, others via toggle (5 editions in JSON)

**Tasks:**
- [ ] 2.1 Build `src/lib/quran.ts` — loaders: surah metadata (114), ayah text (arabic/NNN-VVV.md), translations (5 editions), tafsir JSONL parser (Ibn Kathir headings + text, Muyassar). Cache in-memory at build.
- [ ] 2.2 Surah index page `/quran/` — 114 surah cards (name AR+EN, ayah count, revelation place)
- [ ] 2.3 Surah page `/quran/[surah]/` — full mushaf-style page: each ayah AR (Amiri, RTL) + default EN, bismillah handling, link per ayah
- [ ] 2.4 Ayah page `/quran/[surah]/[ayah]/` — AR text, EN translations (5-edition toggle), tafsir sections (Ibn Kathir + Muyassar) rendered from JSONL HTML
- [ ] 2.5 Nav: add "Quran" between Library and Academy; homepage hero copy already mentions tafsir — verify stats block shows 114 surahs
- [ ] 2.6 `reading_progress` support: content_type `quran` already allowed by DB CHECK constraint — wire "continue reading" for Quran
- [ ] 2.7 Performance pass: check build time/pages count; if >4 min build, switch ayah pages to on-demand; lazy-load tafsir JSONL
- [ ] 2.8 Build, deploy, verify spot-checks: `/quran/` 200; `/quran/1/` (Al-Fatihah, shortest) 200 with 7 ayahs; `/quran/2/255/` (Ayat al-Kursi) 200 with tafsir; `/quran/114/` 200; commit

**Done when:** All 114 surahs browsable, ≥1 long surah + 1 short surah verified ayah-by-ayah, tafsir renders, nav + progress work, deployed, committed.

---

## Phase 3 — Bilingual Qaradawi Library (attach Arabic originals)

**Why:** 9 site books are EN-only but their Arabic OCR already exists in `/root/qaradawi-library/raw/extracted/` — mechanical work that doubles the library's bilingual depth overnight.

**Current state (verified):**
- Extracted dirs (10): approaching-the-sunnah, auspices-victory, contemporary-fatwa-1, diversion-arts, economic-security, education-economy-sunnah, ethics-in-islam, faith-and-life, fiqh-al-zakah, halal-haram
- 9 map to existing site books; **`contemporary-fatwa-1` is NOT on the site** (bonus candidate — see 3.5)
- AGENTS.md of qaradawi-library: fiqh/usul/tazkiyah focus; political works excluded — apply the same filter to contemporary-fatwa-1

**Tasks (per book: clean AR text → split chapters by catalog slugs → add to `ar/` → catalog `languages`/`status.ar` → translation_projects notes):**
- [ ] 3.1 `halal-haram` (AR) → verify chapter slugs match 5 EN chapters
- [ ] 3.2 `fiqh-al-zakah` (10 ch)
- [ ] 3.3 `approaching-the-sunnah` (3 ch), `ethics-in-islam` (4 ch), `faith-and-life` (4 ch), `education-economy-sunnah` (2 ch)
- [ ] 3.4 `economic-security` (7 ch), `diversion-arts` (7 ch), `auspices-victory` (8 ch)
- [ ] 3.5 Evaluate `contemporary-fatwa-1`: if content is fiqh (not political), propose as NEW Book 15 (translate first or publish AR-only with status en: not-translated — ask user); if political, skip per domain filter
- [ ] 3.6 Update translation_projects DB for all 9 (languages note, completed counts unchanged)
- [ ] 3.7 Build, deploy, verify: `/chapter/<book>/1/ar` 200 for each book (9 spot-checks, first + last chapter for 2 books); RTL renders; commit

**Done when:** All 9 books bilingual (AR/EN toggle works on each), `contemporary-fatwa-1` decided, deployed, committed.

---

## Phase 4 — Said Hawwa جند الله Trilogy (new translations)

**Why:** Deepest untranslated revivalist organizational doctrine; author already on the site (Our Spiritual Education) so the scholar page grows into a corpus. Uses the full translate→review→publish pipeline.

**Sources (verified in `/root/tarbiyyah/mb-authors-untranslated-books-report.md`):**
- جند الله تخطيطاً (God's Soldiers: Planning) — Archive.org `AAskZad-1142814`
- جند الله تنظيماً (Organization) — `AAskZad-1142891`
- جند الله ثقافة وأخلاقاً (Culture & Ethics) — `AAskZad-1143006`

**Tasks:**
- [ ] 4.1 Download 3 PDFs → `/root/tarbiyyah/said-hawwa-jundullah/raw/pdfs/`; OCR (Tesseract 300 DPI, per Book-14 pipeline)
- [ ] 4.2 Translate vol 1 (تخطيطاً) chapter-by-chapter with `islamic-text-translation` skill; citations verified
- [ ] 4.3 Publish vol 1: `content/books/gods-soldiers-planning/{en,ar}/`, catalog entry (new shelf slot or revivalist shelf), authors.yaml unchanged (said-hawwa exists), translation_projects record (in_progress → published)
- [ ] 4.4 Repeat 4.2–4.3 for vol 2 (تنظيماً) → `gods-soldiers-organization`
- [ ] 4.5 Repeat for vol 3 (ثقافة وأخلاقاً) → `gods-soldiers-culture-ethics`
- [ ] 4.6 Scholars page: Said Hawwa bio gains 3 works; Translation Center shows the trilogy journey
- [ ] 4.7 Build, deploy, verify each book page + first/mid/last chapter 200; commit

**Done when:** 3 new bilingual books live (16 total), scholar page updated, Translation Center reflects them, committed.

**Backlog after this phase (from the untranslated report — pick next with user):** al-Rashid صناعة الحياة (`AAskZad-1130531`), Yakan المسلمون أمام التحدي العالمي (`0604ZPdf`), more Hawwa (الإسلام, العبادات في الإسلام), Malay translations of existing EN books (Malaysian audience).

---

## Phase 5 — Education Content (Young Learners Islamic track + Fiqh al-Zakah course)

**Why:** Fills the family/education audience gap — the current 13 Young Learners articles are general topics; the Islamic studies track planned in the Education Center reframe was never filled. Course system exists (Iron Deficiency Anemia course as template).

**Tasks — Young Learners Islamic track:**
- [ ] 5.1 Author 3 age-05 articles (prophet stories simple, my-first-dua, mosque visit) — children-reading-materials skill specs (word counts, Flesch, word banks, CEFR per age from manifest.json)
- [ ] 5.2 Author 3 age-09 (stories of the Prophets, Islamic manners, wonders of Allah's creation)
- [ ] 5.3 Author 3 age-12 (golden age of Islam science figures — Ibn Sina/al-Khwarizmi ties to House of Wisdom mission, seerah, tafsir-for-young-readers on short surahs)
- [ ] 5.4 Update `content/young-learners/manifest.json` (articles + updated date); images: reuse Wikimedia pattern or self-host (decide per image count)

**Tasks — Fiqh al-Zakah course:**
- [ ] 5.5 Extract lessons from site's EN `fiqh-al-zakah` book (10 ch → 6–8 lessons) into course_lessons (Supabase REST, service key; follow existing course slug pattern `iron-deficiency-anemia-in-women`)
- [ ] 5.6 10-question quiz bank at `content/competitions/<new-slug>/quiz.json` (reuse quiz.json schema: questions/options/correct_answer/explanation)

**Tasks — close-out:**
- [ ] 5.7 Build, deploy, verify: 9 new article pages 200 (one per age group spot-check), course visible on `/courses/`, enroll→lesson→complete flow works on one lesson; commit

**Done when:** Young Learners has an Islamic studies track per age group; Zakah course live end-to-end; deployed; committed.

---

## Phase 6 — Future (not scheduled; decide with user after Phase 5)

- Fi Zilal Wiki integration (57 curated md at `/root/tarbiyyah/fi-zilal-wiki/`) — likely as a tafsir edition/toggle in the Quran reader rather than separate pages
- Hadith archive (Bukhari/Muslim/Sunan — sunnah.com API or local)
- Full-text search (`flexsearch`/`fuse.js`)
- Concept wiki cross-references
- Malay/Indonesian translations of the EN library
- Writing Center (5th pillar — currently only a homepage card)

---

## Relationship to DEVELOPMENT_PLAN.md

DEVELOPMENT_PLAN.md Phases 1–5 (platform: auth, profiles, courses, competitions, admin) are COMPLETE — see git log. Its Phase 6 "Content Expansion" (6.1–6.7) is superseded by THIS file: 6.1→Phase 2, 6.2→Phase 3, 6.3→Phase 6 (Fi Zilal), 6.4→Phase 6 (Hadith), 6.5→Phase 4 backlog (Malay), 6.6→Phase 6 (search), 6.7→Phase 6 (concepts). Promised Generation completion, the جند الله trilogy, and Young Learners Islamic content appear ONLY here.

## Progress log (append one line per completed phase)

- (none yet)