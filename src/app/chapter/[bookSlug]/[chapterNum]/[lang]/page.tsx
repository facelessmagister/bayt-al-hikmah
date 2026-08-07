import { notFound } from 'next/navigation';
import Layout from '@/components/Layout';
import ChapterReader from '@/components/ChapterReader';
import {
  getBookBySlug,
  getBookChapters,
  getAdjacentChapters,
  getAllAuthors,
  getAllChapterSlugs,
} from '@/lib/catalog';

interface Props {
  params: { bookSlug: string; chapterNum: string; lang: string };
}

export function generateStaticParams() {
  return getAllChapterSlugs().map((p) => ({
    bookSlug: p.bookSlug,
    chapterNum: p.chapterNum,
    lang: p.lang,
  }));
}

export default function ChapterPage({ params }: Props) {
  const book = getBookBySlug(params.bookSlug);
  if (!book) notFound();

  const chapterNum = parseInt(params.chapterNum, 10);
  const lang = params.lang;

  // Verify the language is available for this book
  if (!book.languages.includes(lang)) notFound();

  const chapter = getBookChapters(params.bookSlug, lang)[chapterNum - 1];
  if (!chapter) notFound();

  const adjacent = getAdjacentChapters(params.bookSlug, chapterNum, lang);
  const authors = getAllAuthors();
  const author = authors.find((a) => a.slug === book.author);

  return (
    <Layout>
      <ChapterReader
        book={book}
        author={author}
        chapter={chapter}
        chapterNum={chapterNum}
        totalChapters={adjacent.total}
        prev={adjacent.prev}
        next={adjacent.next}
        availableLangs={book.languages}
        currentLang={lang}
      />
    </Layout>
  );
}