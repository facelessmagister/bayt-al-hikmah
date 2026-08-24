-- 004: Translation Center tables
-- Apply in Supabase SQL Editor

-- ===== TRANSLATION PROJECTS =====
CREATE TABLE translation_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  source_language TEXT NOT NULL DEFAULT 'ar',
  target_language TEXT NOT NULL DEFAULT 'en',
  author TEXT,
  source_description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'review', 'published', 'archived')),
  total_chapters INTEGER DEFAULT 0,
  completed_chapters INTEGER DEFAULT 0,
  translator_id UUID REFERENCES auth.users(id),
  translator_name TEXT,
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TRANSLATION CHAPTERS (progress tracking) =====
CREATE TABLE translation_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES translation_projects(id) ON DELETE CASCADE,
  chapter_num INTEGER NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'translating', 'review', 'completed')),
  translator_id UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(project_id, chapter_num)
);

-- ===== RLS =====
ALTER TABLE translation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_chapters ENABLE ROW LEVEL SECURITY;

-- Public can read published/in-progress projects
CREATE POLICY "Translation projects viewable by everyone" ON translation_projects FOR SELECT USING (true);
CREATE POLICY "Translation chapters viewable by everyone" ON translation_chapters FOR SELECT USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage translation projects" ON translation_projects FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage translation chapters" ON translation_chapters FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);