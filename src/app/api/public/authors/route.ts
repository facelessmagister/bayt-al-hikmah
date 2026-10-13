import { NextResponse } from "next/server";
import { getAllAuthors } from "@/lib/catalog";

export const dynamic = "force-static";

/** Public read-only scholars list (powers the Bayt al-Hikmah MCP server). */
export async function GET() {
  const authors = getAllAuthors();
  return NextResponse.json({ count: authors.length, authors });
}
