import { NextRequest, NextResponse } from "next/server";
import { getAllBooks, getBookBySlug, getBookChapters, getAllAuthors } from "@/lib/catalog";

export const dynamic = "force-static";

/**
 * Public read-only API for the Bayt al-Hikmah library catalog.
 * Powers the site's Tulistic MCP server (agent access to the library).
 * GET /api/public/books            → all books (meta) + authors
 * GET /api/public/books?slug=xyz   → one book + chapter list
 * GET /api/public/books?slug=xyz&lang=ar&chapter=1 → chapter content
 * GET /api/public/authors          → all scholars
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const book = getBookBySlug(slug);
    if (!book) return NextResponse.json({ error: "book not found" }, { status: 404 });
    const lang = searchParams.get("lang") === "ar" ? "ar" : "en";
    const chapterParam = searchParams.get("chapter");
    if (chapterParam) {
      const num = parseInt(chapterParam, 10);
      const chapters = getBookChapters(slug, lang);
      const ch = chapters.find((c) => c.number === num) || null;
      if (!ch) return NextResponse.json({ error: "chapter not found" }, { status: 404 });
      return NextResponse.json({ book: book.title, lang, chapter: ch });
    }
    const chapters = getBookChapters(slug, lang).map((c) => ({ number: c.number, title: c.title }));
    return NextResponse.json({ book, chapters });
  }

  const books = getAllBooks().map((b) => ({
    slug: b.slug,
    title: b.title,
    author: b.author,
    shelf: b.shelf,
    original_language: b.original_language,
    languages: b.languages,
    domains: b.domains,
    tags: b.tags.slice(0, 10),
  }));
  const authors = getAllAuthors().map((a) => ({ slug: a.slug, name: a.name }));
  return NextResponse.json({ count: books.length, books, authors });
}
