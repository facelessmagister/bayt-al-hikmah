import { NextRequest, NextResponse } from "next/server";
import { getBookBySlug, getBookChapters } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/** GET /api/public/book/?slug=xyz&lang=en → book meta + chapter list */
export async function GET(request: NextRequest) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  const book = getBookBySlug(slug);
  if (!book) return NextResponse.json({ error: "book not found" }, { status: 404 });
  const lang = new URL(request.url).searchParams.get("lang") === "ar" ? "ar" : "en";
  const chapters = getBookChapters(slug, lang).map((c) => ({ number: c.number, title: c.title }));
  return NextResponse.json({ book, chapters });
}
