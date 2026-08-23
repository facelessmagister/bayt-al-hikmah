# Bayt al-Hikmah (بيت الحكمة) — House of Wisdom

## Vision

A unified, multi-language digital Islamic library. One beautiful website where readers can access Islamic books, Quran, tafsir, hadith, and scholarly concepts — in Arabic, English, and eventually Malay/Indonesian/French.

> "Whoever travels a path in search of knowledge, Allah makes easy for him a path to Paradise." — Sahih Muslim 2699

---

## Project Definition

| Field | Value |
|-------|-------|
| **Name** | Bayt al-Hikmah (بيت الحكمة) |
| **Type** | Next.js static site, Vercel-deployed |
| **Location** | `/root/projects/bayt-al-hikmah/` |
| **Git** | New GitHub repo (`bayt-al-hikmah`) |
| **Deploy** | Vercel — see AGENTS.md for credentials and workflow |
| **Access** | Public (free reading). Architecture supports future member tier |
| **Design** | Solaris aesthetic: #f8f6f2 warm paper, #0a2540 deep navy, #c45c3e terracotta. DM Serif Display + Source Sans 3 + Amiri (Arabic) |
| **Status** | Content phase COMPLETE. Auth + Database migration planned — see `DEVELOPMENT_PLAN.md` |

---

## Initial Launch Scope

**BOOKS ONLY** — publish every book we already have, in ALL available languages (original Arabic + English translation).

### Book Inventory at Launch

#### Shelf 1: Contemporary Revivalist Literature (Ikhwan/MB authors)

| # | Title | Author | Chapters | Languages Available | Source |
|---|-------|--------|----------|---------------------|--------|
| 1 | What My Belonging to Islam Means | Fathi Yakan | 16 | EN (full) + AR (full) | Ikhwan Library + tarbiyyah |
| 2 | Our Spiritual Education | Said Hawwa | 18 | EN (full) + AR (full) | Ikhwan Library _work/ |
| 3 | How to Call to Islam | Fathi Yakan | 5 | AR only | Ikhwan Library _work/ |
| 4 | The Promised Generation | Majdi al-Hilali | 6 | AR (full) + EN (partial ch1-3) | Jeel Mawoud Wiki |

#### Shelf 2: Qaradawi Collection

| # | Title | Chapters | Languages | Source |
|---|-------|----------|-----------|--------|
| 5 | The Lawful and the Prohibited in Islam | 5 | EN | Qaradawi-pub |
| 6 | Fiqh al-Zakah (2 Volumes) | 10 | EN | Qaradawi-pub |
| 7 | Approaching the Sunnah | 3 | EN | Qaradawi-pub |
| 8 | Economic Security in Islam | 7 | EN | Qaradawi-pub |
| 9 | Ethics in Islam | 4 | EN | Qaradawi-pub |
| 10 | Education and Economy in the Sunnah | 2 | EN | Qaradawi-pub |
| 11 | Diversion and Arts in Islam | 7 | EN | Qaradawi-pub |
| 12 | Faith and Life | 4 | EN | Qaradawi-pub |
| 13 | Auspices of the Ultimate Victory of Islam | 8 | EN | Qaradawi-pub |

**Total at launch: 13 books, ~410K+ words of content, in AR + EN**

---

## Content Architecture

### Unified Book Model

Every book follows the same structure regardless of source:

```
content/books/[book-slug]/
├── metadata.json          # Author, title (all languages), source, status, domains
├── cover.jpg              # Book cover (if available)
├── en/                    # English chapters
│   ├── 001-introduction.md
│   ├── 002-chapter-name.md
│   └── ...
├── ar/                    # Arabic chapters (if available)
│   ├── 001-مقدمة.md
│   ├── 002-اسم-الفصل.md
│   └── ...
└── ms/                    # Malay chapters (future)
```

### metadata.json Schema

```json
{
  "slug": "what-my-belonging-to-islam-means",
  "title": {
    "en": "What My Belonging to Islam Means",
    "ar": "ماذا يعني انتمائي للإسلام"
  },
  "author": {
    "slug": "fathi-yakan",
    "name": "Fathi Yakan",
    "arabic_name": "فتحي يكن",
    "birth": 1933,
    "death": 2009
  },
  "languages": ["en", "ar"],
  "original_language": "ar",
  "source": {
    "archive_id": "1076ZPdf",
    "archive_url": "https://archive.org/details/1076ZPdf"
  },
  "domains": ["aqeedah", "islamic-identity", "haraki"],
  "tags": ["belonging", "islamic-movement", "tarbiyyah"],
  "chapters": [
    { "num": 1, "title": { "en": "Introduction", "ar": "المقدمة" }, "slug": "001-introduction" },
    ...
  ],
  "status": {
    "en": "published",
    "ar": "published"
  },
  "translated_by": "Tarbiyyah Translation Team",
  "translated_at": "2026-08-02"
}
```

### Author Registry (`content/authors.yaml`)

Unified from Ikhwan Library + Qaradawi-pub. One file, all authors.

### Catalog (`content/catalog.yaml`)

Master registry of every text in the library — books, Quran sections, hadith collections, concept pages. Used to generate the homepage and browse pages.

---

## Site Architecture

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Homepage — library entrance with shelves/categories |
| `/library` | Browse all books (filter by shelf, author, language, domain) |
| `/book/[slug]` | Book landing — metadata, chapter list, language toggle |
| `/chapter/[slug]/[num]` | Chapter reader — clean reading view with RTL/LTR support |
| `/scholars` | Browse by scholar/author |
| `/scholar/[slug]` | Scholar page — bio, books, era |
| `/about` | About Bayt al-Hikmah |
| `/search` | Full-text search (future) |

### Future Routes (not at launch)

| Route | Purpose | Phase |
|-------|---------|-------|
| `/quran/[surah]` | Quran reader | Phase 2 |
| `/tafsir/[surah]` | Tafsir reader | Phase 2 |
| `/hadith/[collection]` | Hadith browser | Phase 3 |
| `/concepts/[slug]` | Concept wiki pages | Phase 4 |

### Components

| Component | Description |
|-----------|-------------|
| `Layout.tsx` | Shared header + footer |
| `BookCard.tsx` | Book preview card (cover, title, author, languages badge) |
| `ChapterReader.tsx` | Reading view with font size, RTL/LTR, language toggle |
| `LanguageToggle.tsx` | Switch between AR/EN for bilingual books |
| `ShelfNav.tsx` | Category/shelf navigation |
| `ScholarCard.tsx` | Author preview card |

### Design System

```
Colors:
  --paper:     #f8f6f2    (warm paper background)
  --navy:      #0a2540    (deep navy — headers, text)
  --terracotta:#c45c3e    (accents, links, highlights)
  --gold:      #c4a35a    (subtle gold for Arabic script accents)
  --ink:       #1a1a1a    (body text)
  --muted:     #6b6b6b    (secondary text)

Fonts:
  --serif:     "DM Serif Display" (headings)
  --sans:      "Source Sans 3" (body, UI)
  --arabic:    "Amiri" (Arabic text — serif, beautiful for Quranic/hadith)

Typography:
  Body: 1.1rem, line-height 1.8
  Arabic body: 1.25rem, line-height 2.0
  Headings: DM Serif Display
  Arabic headings: Amiri, weighted
```

---

## Migration Plan

### Phase 1 — Project Scaffold (Day 1)

1. Create `/root/projects/bayt-al-hikmah/` Next.js project
2. Set up Tailwind CSS + design system
3. Build core layout (header, footer, homepage)
4. Create unified content model (metadata.json schema)
5. Build book landing page + chapter reader component
6. Implement language toggle (EN/AR)
7. Create GitHub repo + Vercel project
8. Deploy skeleton

### Phase 2 — Book Migration (Day 2-3)

**Batch A — Ikhwan Library books (EN + AR):**
1. Migrate "What My Belonging to Islam Means" — EN (16 chapters from ikhwan-library) + AR (from tarbiyyah/fathi-yakan-intimai/ocr_text/)
2. Migrate "Our Spiritual Education" — EN (18 chapters from ikhwan-library) + AR (from ikhwan-library/_work/our-spiritual-education/chapters-arabic/)
3. Migrate "How to Call to Islam" — AR only (5 chapters from ikhwan-library/_work/how-to-call-to-islam/chapters-arabic/)

**Batch B — Qaradawi books (EN):**
4-12. Migrate 9 Qaradawi books from qaradawi-pub (EN chapters only; AR originals not yet downloaded)

**Batch C — Jeel Mawoud:**
13. Migrate "The Promised Generation" — AR (full, from jeel-mawoud-wiki/raw/) + EN (partial, ch1-3 from english-translation/)

**Batch D — Unified registries:**
14. Merge author registries from ikhwan-library + qaradawi-pub into unified authors.yaml
15. Build catalog.yaml with all 13 books
16. Generate book covers (if not available, create text-based covers)

### Phase 3 — Launch (Day 3-4)

1. Build homepage with library shelves
2. Build library browse page (filter by shelf, author, language)
3. Build scholar pages
4. Final design pass
5. Test all 13 books render correctly in both languages
6. Deploy to Vercel
7. Share URL

### Phase 4 — Future Expansion (Ongoing)

| Milestone | Content | Priority |
|-----------|---------|----------|
| Quran Integration | 114 surahs, 5 translations, Ibn Kathir + Fi Zilal tafsir | High |
| Hadith Local Archive | Download Bukhari, Muslim, 4 Sunan, Muwatta, Nawawi 40 from API | High |
| More Book Translations | 17 pending Ikhwan Library books | Medium |
| More Qaradawi Books | 7 pending Qaradawi books | Medium |
| Classical Texts | Ihya Ulum al-Din, Riyad as-Salihin, Bulugh al-Maram | Medium |
| Concept Wiki | Merge 80+ concept pages from all wikis | Medium |
| Search | Full-text search across all content | Medium |
| Malay/Indonesian | Add translations in MS/ID | Low |
| Member Tier | Premium features (bookmarks, reading plans, notes) | Low |

---

## Source Migrations Map

| Source Directory | What to Migrate | Destination |
|-----------------|----------------|-------------|
| `/root/projects/ikhwan-library/content/books/what-my-belonging-to-islam-means/chapters/` | EN chapters (16) | `content/books/what-my-belonging-to-islam-means/en/` |
| `/root/tarbiyyah/fathi-yakan-intimai/translation/` | EN translation (14 chapters) | (already in ikhwan-library, verify match) |
| `/root/tarbiyyah/fathi-yakan-intimai/ocr_text/` or `pages/` | AR original text | `content/books/what-my-belonging-to-islam-means/ar/` |
| `/root/projects/ikhwan-library/content/books/our-spiritual-education/chapters/` | EN chapters (18) | `content/books/our-spiritual-education/en/` |
| `/root/projects/ikhwan-library/_work/our-spiritual-education/chapters-arabic/` | AR original chapters | `content/books/our-spiritual-education/ar/` |
| `/root/projects/ikhwan-library/_work/how-to-call-to-islam/chapters-arabic/` | AR chapters (5) | `content/books/how-to-call-to-islam/ar/` |
| `/root/projects/qaradawi-pub/content/raw/` | 9 Qaradawi EN texts | `content/books/[slug]/en/` (need to convert to chapter MD) |
| `/root/tarbiyyah/jeel-mawoud-wiki/raw/extracted/` | AR full text | `content/books/the-promised-generation/ar/` |
| `/root/tarbiyyah/jeel-mawoud-wiki/english-translation/` | EN partial (ch1-3) | `content/books/the-promised-generation/en/` |

---

## Technical Stack

- **Framework:** Next.js 14 (App Router) with static export
- **Content:** YAML registry + Markdown chapters (gray-matter frontmatter)
- **Styling:** Tailwind CSS + custom CSS variables for design system
- **Fonts:** Google Fonts (DM Serif Display, Source Sans 3, Amiri)
- **Deploy:** Vercel — see `AGENTS.md` for the correct token, project ID, and publishing workflow
- **Languages:** TypeScript

## Governance

- **Zone:** Personal project (`/root/projects/bayt-al-hikmah/`)
- **Never mix with Genesis business contexts**
- **Source authenticity:** Follow Tarbiyyah CLAUDE.md source tiers
- **Git:** Main branch deploys to production
- **Backup:** Git + Vercel deployment history