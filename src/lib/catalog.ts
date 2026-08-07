import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import YAML from 'yaml';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const BOOKS_DIR = path.join(CONTENT_DIR, 'books');

// --- Types ---

export interface Author {
  slug: string;
  name: string;
  native_name: string;
  birth_year?: number;
  death_year?: number | null;
  nationality: string;
  role: string;
  movement: string;
  bio: string;
  priority: number;
}

export interface BookChapter {
  num: number;
  title: { en: string; ar: string };
  slug: string;
}

export interface Book {
  slug: string;
  title: { en: string; ar: string };
  author: string;
  shelf: string;
  original_language: string;
  languages: string[];
  domains: string[];
  tags: string[];
  source: { archive_id: string; archive_url: string };
  chapters: BookChapter[];
  status: Record<string, string>;
  translated_by?: string;
  translated_at?: string;
  notes?: string;
}

export interface ChapterContent {
  number: number;
  title: string;
  content: string;
  frontmatter: Record<string, any>;
  lang: string;
}

// --- Authors ---

export function getAllAuthors(): Author[] {
  const file = fs.readFileSync(path.join(CONTENT_DIR, 'authors.yaml'), 'utf-8');
  const data = YAML.parse(file);
  const authors = data.authors || {};
  return Object.entries(authors).map(([slug, a]) => ({ slug, ...(a as any) }));
}

export function getAuthorBySlug(slug: string): Author | null {
  return getAllAuthors().find((a) => a.slug === slug) || null;
}

// --- Books ---

export function getAllBooks(): Book[] {
  const file = fs.readFileSync(path.join(CONTENT_DIR, 'catalog.yaml'), 'utf-8');
  const data = YAML.parse(file);
  const books = data.books || {};
  return Object.entries(books).map(([slug, b]) => ({ slug, ...(b as any) }));
}

export function getBookBySlug(slug: string): Book | null {
  return getAllBooks().find((b) => b.slug === slug) || null;
}

export function getBooksByShelf(shelf: string): Book[] {
  return getAllBooks().filter((b) => b.shelf === shelf);
}

export function getBooksByAuthor(authorSlug: string): Book[] {
  return getAllBooks().filter((b) => b.author === authorSlug);
}

export function getBooksByLanguage(lang: string): Book[] {
  return getAllBooks().filter((b) => b.languages.includes(lang));
}

// --- Chapters ---

export function getBookChapters(bookSlug: string, lang: string = 'en'): ChapterContent[] {
  const chaptersDir = path.join(BOOKS_DIR, bookSlug, lang);
  if (!fs.existsSync(chaptersDir)) return [];

  const files = fs
    .readdirSync(chaptersDir)
    .filter((f) => f.endsWith('.md'))
    .sort();

  return files.map((file, idx) => {
    const raw = fs.readFileSync(path.join(chaptersDir, file), 'utf-8');
    const parsed = matter(raw);
    const title =
      parsed.data.title ||
      parsed.content.match(/^#+\s*(.+)/m)?.[1] ||
      `Chapter ${idx + 1}`;
    return {
      number: idx + 1,
      title,
      content: parsed.content,
      frontmatter: parsed.data,
      lang,
    };
  });
}

export function getChapter(
  bookSlug: string,
  chapterNum: number,
  lang: string = 'en'
): ChapterContent | null {
  const chapters = getBookChapters(bookSlug, lang);
  return chapters[chapterNum - 1] || null;
}

export function getAdjacentChapters(
  bookSlug: string,
  chapterNum: number,
  lang: string = 'en'
) {
  const chapters = getBookChapters(bookSlug, lang);
  return {
    prev: chapterNum > 1 ? chapters[chapterNum - 2] : null,
    next: chapterNum < chapters.length ? chapters[chapterNum] : null,
    total: chapters.length,
  };
}

// --- Derived data for static generation ---

export function getAllBookSlugs(): { slug: string }[] {
  return getAllBooks().map((b) => ({ slug: b.slug }));
}

export function getAllChapterSlugs(): { bookSlug: string; chapterNum: string; lang: string }[] {
  const params: { bookSlug: string; chapterNum: string; lang: string }[] = [];
  for (const book of getAllBooks()) {
    for (const lang of book.languages) {
      const chapters = getBookChapters(book.slug, lang);
      for (const ch of chapters) {
        params.push({
          bookSlug: book.slug,
          chapterNum: String(ch.number),
          lang,
        });
      }
    }
  }
  return params;
}

// --- Shelf metadata ---

export const SHELVES: Record<string, { name: string; arabic: string; description: string }> = {
  revivalist: {
    name: 'Revivalist Literature',
    arabic: 'أدب النهضة',
    description:
      'Foundational works of the modern Islamic revivalist movement — Muslim Brotherhood thinkers, spiritual educators, and movement pioneers.',
  },
  qaradawi: {
    name: 'Qaradawi Collection',
    arabic: 'مجموعة القرضاوي',
    description:
      'The fiqh, ethics, and spiritual writings of Dr. Yusuf al-Qaradawi (1926–2022) — one of the most prominent contemporary Islamic scholars.',
  },
};