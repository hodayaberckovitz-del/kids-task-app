-- ============================================================
-- Kids Task App — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  family_id   UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Families
CREATE TABLE IF NOT EXISTS families (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name           TEXT NOT NULL,
  family_code           TEXT UNIQUE NOT NULL,
  primary_parent_email  TEXT NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Child profiles
CREATE TABLE IF NOT EXISTS child_profiles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  age                INTEGER,
  gender             TEXT,
  favorite_character TEXT,
  color_theme        TEXT DEFAULT 'rainbow',
  task_display_mode  TEXT DEFAULT 'standard',
  is_adult           BOOLEAN DEFAULT FALSE,
  parent_name        TEXT,
  parent_email       TEXT,
  language           TEXT DEFAULT 'he',
  family_id          UUID REFERENCES families(id) ON DELETE CASCADE,
  total_tokens       INTEGER DEFAULT 0,
  current_streak     INTEGER DEFAULT 0,
  best_streak        INTEGER DEFAULT 0,
  last_completion_date TEXT,
  created_by         TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  icon             TEXT,
  color            TEXT,
  type             TEXT DEFAULT 'morning',
  base_tokens      INTEGER DEFAULT 1,
  star_tokens      INTEGER DEFAULT 1,
  duration_minutes INTEGER,
  timed_tokens     INTEGER DEFAULT 1,
  input_type       TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  language         TEXT DEFAULT 'he',
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  family_id        UUID REFERENCES families(id) ON DELETE CASCADE,
  "order"          INTEGER DEFAULT 0,
  created_by       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Task completions
CREATE TABLE IF NOT EXISTS task_completions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id          UUID REFERENCES tasks(id) ON DELETE CASCADE,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  completed_date   TEXT NOT NULL,
  completed_at     TIMESTAMPTZ,
  input_value      TEXT,
  tokens_earned    INTEGER DEFAULT 0,
  family_id        UUID REFERENCES families(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  teacher            TEXT,
  color              TEXT,
  icon               TEXT,
  required_materials TEXT,
  child_profile_id   UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  family_id          UUID REFERENCES families(id) ON DELETE CASCADE,
  is_active          BOOLEAN DEFAULT TRUE,
  created_by         TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Homework tasks
CREATE TABLE IF NOT EXISTS homework_tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  subject_id       UUID REFERENCES subjects(id) ON DELETE SET NULL,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  family_id        UUID REFERENCES families(id) ON DELETE CASCADE,
  assigned_date    TEXT,
  due_date         TEXT,
  is_completed     BOOLEAN DEFAULT FALSE,
  tokens_earned    INTEGER DEFAULT 0,
  source           TEXT,
  webtop_lesson_id TEXT,
  created_by       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules
CREATE TABLE IF NOT EXISTS schedules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id       UUID REFERENCES subjects(id) ON DELETE CASCADE,
  day_of_week      INTEGER,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  family_id        UUID REFERENCES families(id) ON DELETE CASCADE,
  created_by       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards
CREATE TABLE IF NOT EXISTS rewards (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  cost             INTEGER DEFAULT 0,
  image_url        TEXT,
  is_claimed       BOOLEAN DEFAULT FALSE,
  language         TEXT,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  family_id        UUID REFERENCES families(id) ON DELETE CASCADE,
  created_by       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist items
CREATE TABLE IF NOT EXISTS wishlist_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  priority         TEXT DEFAULT 'medium',
  image_url        TEXT,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  family_id        UUID REFERENCES families(id) ON DELETE CASCADE,
  status           TEXT DEFAULT 'pending',
  created_by       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  token_bonus      INTEGER DEFAULT 0,
  type             TEXT,
  tracking_type    TEXT,
  tracking_unit    TEXT,
  target_value     INTEGER,
  current_progress INTEGER DEFAULT 0,
  expires_at       TIMESTAMPTZ,
  is_active        BOOLEAN DEFAULT TRUE,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  family_id        UUID REFERENCES families(id) ON DELETE CASCADE,
  created_by       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge completions
CREATE TABLE IF NOT EXISTS challenge_completions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id     UUID REFERENCES challenges(id) ON DELETE CASCADE,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  completed_at     TIMESTAMPTZ,
  family_id        UUID REFERENCES families(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge progress
CREATE TABLE IF NOT EXISTS challenge_progress (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id     UUID REFERENCES challenges(id) ON DELETE CASCADE,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  family_id        UUID REFERENCES families(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Bonus activities
CREATE TABLE IF NOT EXISTS bonus_activities (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  reward_cost      INTEGER DEFAULT 0,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  family_id        UUID REFERENCES families(id) ON DELETE CASCADE,
  is_active        BOOLEAN DEFAULT TRUE,
  is_claimed       BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Household tasks
CREATE TABLE IF NOT EXISTS household_tasks (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT NOT NULL,
  description        TEXT,
  assigned_to        TEXT,
  due_date           TEXT,
  category           TEXT DEFAULT 'other',
  priority           TEXT DEFAULT 'medium',
  recurrence_pattern TEXT DEFAULT 'none',
  month_year         TEXT,
  family_id          UUID REFERENCES families(id) ON DELETE CASCADE,
  is_completed       BOOLEAN DEFAULT FALSE,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Mini games
CREATE TABLE IF NOT EXISTS mini_games (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type        TEXT,
  score            INTEGER,
  tokens_earned    INTEGER DEFAULT 0,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  family_id        UUID REFERENCES families(id) ON DELETE CASCADE,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Parent special notes
CREATE TABLE IF NOT EXISTS parent_special_notes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  family_id        UUID REFERENCES families(id) ON DELETE CASCADE,
  content          TEXT,
  is_read          BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Events (calendar)
CREATE TABLE IF NOT EXISTS events (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT NOT NULL,
  description        TEXT,
  event_date         TIMESTAMPTZ,
  location           TEXT,
  is_recurring       BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT,
  family_id          UUID REFERENCES families(id) ON DELETE CASCADE,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Auto-create user_profile on signup trigger
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Row Level Security (RLS) — disable for simplicity,
-- data is filtered by family_id in the app
-- ============================================================
ALTER TABLE user_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE families            ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_tasks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules           ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards             ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges          ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_activities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_tasks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE mini_games          ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_special_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events              ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access to all tables
CREATE POLICY "allow_all_authenticated" ON user_profiles        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON families             FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON child_profiles       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON tasks                FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON task_completions     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON subjects             FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON homework_tasks       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON schedules            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON rewards              FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON wishlist_items       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON challenges           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON challenge_completions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON challenge_progress   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON bonus_activities     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON household_tasks      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON mini_games           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON parent_special_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON events               FOR ALL TO authenticated USING (true) WITH CHECK (true);
