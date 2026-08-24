import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const contentDir = join(process.cwd(), 'content', 'young-learners');

export interface AgeGroup {
  id: string;
  label: string;
  subtitle: string;
  cefr: string;
  wordRange: string;
  fleschEase: string;
  color: string;
}

export interface ArticleMeta {
  slug: string;
  title: string;
  topic: string;
  wordCount: number;
  fleschEase: number;
  newWords: number;
  date: string;
}

export interface Manifest {
  title: string;
  description: string;
  version: string;
  updated: string;
  ageGroups: AgeGroup[];
  articles: Record<string, ArticleMeta[]>;
}

export function getManifest(): Manifest {
  const file = readFileSync(join(contentDir, 'manifest.json'), 'utf-8');
  return JSON.parse(file);
}

export function getAgeGroup(ageId: string): AgeGroup | undefined {
  const manifest = getManifest();
  return manifest.ageGroups.find(g => g.id === ageId);
}

export function getArticlesForAge(ageId: string): ArticleMeta[] {
  const manifest = getManifest();
  return manifest.articles[ageId] || [];
}

export function getAllSlugs(ageId: string): string[] {
  const dir = join(contentDir, ageId);
  try {
    const files = readdirSync(dir).filter(f => f.endsWith('.md'));
    return files.map(f => f.replace(/\.md$/, ''));
  } catch {
    return [];
  }
}

export function getArticleContent(ageId: string, slug: string): string {
  const filePath = join(contentDir, ageId, `${slug}.md`);
  return readFileSync(filePath, 'utf-8');
}