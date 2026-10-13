/**
 * OpenAPI 3.0 spec for the Bayt al-Hikmah public API.
 * Served at /openapi.json — lets Tulistic (and any spec-driven tooling)
 * discover the public read-only library endpoints.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "Bayt al-Hikmah Library API",
      version: "1.1.0",
      description:
        "Public read-only API for the Bayt al-Hikmah Islamic digital library: classical texts, scholars, and bilingual (Arabic/English) chapters. All endpoints are GET-only.",
    },
    servers: [{ url: "/" }],
    paths: {
      "/api/public/books/": {
        get: {
          operationId: "list_library_books",
          summary: "List all books in the library (with authors, shelves, languages). Without params.",
          responses: { "200": { description: "Book catalog" } },
        },
      },
      "/api/public/book/": {
        get: {
          operationId: "get_book",
          summary: "Get one book's metadata and its chapter list",
          parameters: [
            { name: "slug", in: "query", required: true, schema: { type: "string" }, description: "Book slug, e.g. how-to-call-to-islam" },
            { name: "lang", in: "query", schema: { type: "string", enum: ["en", "ar"] }, description: "Chapter language (default en)" },
          ],
          responses: { "200": { description: "Book with chapters" } },
        },
      },
      "/api/public/chapter/": {
        get: {
          operationId: "get_book_chapter",
          summary: "Read one chapter of a book (bilingual)",
          parameters: [
            { name: "slug", in: "query", required: true, schema: { type: "string" }, description: "Book slug" },
            { name: "chapter", in: "query", required: true, schema: { type: "number" }, description: "Chapter number" },
            { name: "lang", in: "query", schema: { type: "string", enum: ["en", "ar"] }, description: "Chapter language (default en)" },
          ],
          responses: { "200": { description: "Chapter content" } },
        },
      },
      "/api/public/authors/": {
        get: {
          operationId: "list_authors",
          summary: "List all scholars in the library",
          responses: { "200": { description: "Authors" } },
        },
      },
    },
  };
  return NextResponse.json(spec);
}
