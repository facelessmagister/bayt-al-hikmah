import { NextRequest, NextResponse } from "next/server";
import { getBookChapters } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/** GET /api/public/chapter/?slug=xyz&chapter=1&lang=en → chapter content */
export async function GET(request: NextRequest) {
  const sp = new URL(request.url).searchParams;
  const slug = sp.get("slug");
  const num = parseInt(sp.get("chapter") || "", 10);
  if (!slug || !num) return NextResponse.json({ error: "slug and chapter required" }, { status: 400 });
  const lang = sp.get("lang") === "ar" ? "ar" : "en";
  const ch = getBookChapters(slug, lang).find((c) => c.number === num) || null;
  if (!ch) return NextResponse.json({ error: "chapter not found" }, { status: 404 });
  return NextResponse.json({ slug, lang, chapter: ch });
}
