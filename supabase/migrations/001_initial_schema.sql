-- Bayt al-Hikmah Database Schema
-- Apply this in Supabase SQL Editor: https://supabase.com/dashboard/project/sblzlpjxwlthilppmyyd/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== PROFILES (extends Supabase auth.users) =====
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger: auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'avatar_url', 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== READING PROGRESS =====
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('book', 'quran', 'hadith', 'tafsir')),
  content_slug TEXT NOT NULL,
  chapter_num INTEGER,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_percent INTEGER NOT NULL DEFAULT 0 CHECK (completion_percent BETWEEN 0 AND 100),
  language TEXT NOT NULL DEFAULT 'en',
  UNIQUE(user_id, content_slug, language)
);

-- ===== COURSES =====
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  content_slug TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  UNIQUE(user_id, course_id)
);

CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, lesson_id)
);

-- ===== COMPETITIONS =====
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  registration_open TIMESTAMP WITH TIME ZONE,
  registration_close TIMESTAMP WITH TIME ZONE,
  competition_date TIMESTAMP WITH TIME ZONE,
  entry_fee TEXT,
  prize_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE competition_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'waived')),
  payment_verified_by UUID REFERENCES auth.users(id),
  payment_verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(user_id, competition_id)
);

CREATE TABLE competition_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  scored_by UUID REFERENCES auth.users(id),
  scored_at TIMESTAMP WITH TIME ZONE,
  feedback TEXT
);

-- ===== ROW LEVEL SECURITY (RLS) =====
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Reading progress
CREATE POLICY "Users can CRUD own reading progress" ON reading_progress FOR ALL USING (auth.uid() = user_id);

-- Courses (public read)
CREATE POLICY "Courses are viewable by everyone" ON courses FOR SELECT USING (true);

-- Course lessons (public read)
CREATE POLICY "Course lessons are viewable by everyone" ON course_lessons FOR SELECT USING (true);

-- Enrollments
CREATE POLICY "Users can CRUD own enrollments" ON course_enrollments FOR ALL USING (auth.uid() = user_id);

-- Course progress
CREATE POLICY "Users can CRUD own course progress" ON course_progress FOR ALL USING (auth.uid() = user_id);

-- Competitions (public read)
CREATE POLICY "Competitions are viewable by everyone" ON competitions FOR SELECT USING (true);

-- Competition registrations
CREATE POLICY "Users can CRUD own registrations" ON competition_registrations FOR ALL USING (auth.uid() = user_id);

-- Competition submissions
CREATE POLICY "Users can CRUD own submissions" ON competition_submissions FOR ALL USING (auth.uid() = user_id);

-- Admin bypass policies (service role key bypasses RLS, but for future admin UI):
-- Note: Service role key bypasses RLS automatically.
-- For authenticated admin users via anon key, add specific policies later.
