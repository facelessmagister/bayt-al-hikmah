-- 003: Add prize_structure + payment_instructions to competitions
-- Apply in Supabase SQL Editor

ALTER TABLE competitions ADD COLUMN IF NOT EXISTS prize_structure JSONB DEFAULT '[]';
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS payment_instructions TEXT;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS rules JSONB DEFAULT '[]';
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS related_course_slug TEXT;

-- Add submission_data time fields as proper columns for easier leaderboard queries
ALTER TABLE competition_submissions ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE competition_submissions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE competition_submissions ADD COLUMN IF NOT EXISTS duration_ms BIGINT;

-- Admin policies: allow admin role to manage competitions and verify payments
-- Service role key bypasses RLS, but for admin UI using anon key we need policies
CREATE POLICY "Admins can manage competitions" ON competitions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage registrations" ON competition_registrations FOR ALL USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage submissions" ON competition_submissions FOR ALL USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);