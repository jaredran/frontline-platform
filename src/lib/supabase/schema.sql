-- Axonify Frontline Platform Schema
-- Run this in the Supabase SQL editor to set up all tables

-- ============================================================
-- ORGS
-- ============================================================
CREATE TABLE IF NOT EXISTS orgs (
  id           text PRIMARY KEY,
  name         text NOT NULL,
  industry     text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orgs_all" ON orgs FOR ALL USING (true);

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id              text PRIMARY KEY,
  org_id          text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('fe', 'lm', 'ld', 'ops')),
  full_name       text NOT NULL,
  email           text NOT NULL,
  location_id     text,
  avatar_url      text,
  skills          jsonb NOT NULL DEFAULT '[]',
  certifications  jsonb NOT NULL DEFAULT '[]',
  hire_date       date NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_all" ON profiles FOR ALL USING (true);

-- ============================================================
-- LOCATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS locations (
  id          text PRIMARY KEY,
  org_id      text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name        text NOT NULL,
  type        text NOT NULL,
  address     text NOT NULL,
  manager_id  text REFERENCES profiles(id),
  timezone    text NOT NULL DEFAULT 'America/Chicago',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locations_all" ON locations FOR ALL USING (true);

-- ============================================================
-- SHIFTS
-- ============================================================
CREATE TABLE IF NOT EXISTS shifts (
  id          text PRIMARY KEY,
  location_id text NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  date        date NOT NULL,
  start_time  text NOT NULL,
  end_time    text NOT NULL,
  status      text NOT NULL CHECK (status IN ('scheduled', 'active', 'completed')),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shifts_all" ON shifts FOR ALL USING (true);

-- ============================================================
-- SHIFT ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS shift_assignments (
  id           text PRIMARY KEY,
  shift_id     text NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  profile_id   text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_in_shift text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shift_assignments_all" ON shift_assignments FOR ALL USING (true);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id            text PRIMARY KEY,
  shift_id      text REFERENCES shifts(id) ON DELETE SET NULL,
  location_id   text NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  standard      text,
  category      text NOT NULL,
  priority      text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to   text REFERENCES profiles(id) ON DELETE SET NULL,
  status        text NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'flagged')),
  quality_score numeric,
  completed_at  timestamptz,
  due_by        text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_all" ON tasks FOR ALL USING (true);

-- ============================================================
-- PLAYBOOKS
-- ============================================================
CREATE TABLE IF NOT EXISTS playbooks (
  id                 text PRIMARY KEY,
  org_id             text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  title              text NOT NULL,
  description        text,
  scope              text NOT NULL CHECK (scope IN ('role', 'location', 'org')),
  target_roles       jsonb NOT NULL DEFAULT '[]',
  content            jsonb NOT NULL DEFAULT '{}',
  version            integer NOT NULL DEFAULT 1,
  status             text NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  created_by         text REFERENCES profiles(id) ON DELETE SET NULL,
  completion_rate    numeric,
  avg_score          numeric,
  effectiveness_score numeric,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "playbooks_all" ON playbooks FOR ALL USING (true);

-- ============================================================
-- PLAYBOOK COMPLETIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS playbook_completions (
  id                  text PRIMARY KEY,
  playbook_id         text NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  profile_id          text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score               numeric NOT NULL,
  completed_at        timestamptz NOT NULL DEFAULT now(),
  time_spent_seconds  integer NOT NULL DEFAULT 0
);

ALTER TABLE playbook_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "playbook_completions_all" ON playbook_completions FOR ALL USING (true);

-- ============================================================
-- PULSE METRICS
-- ============================================================
CREATE TABLE IF NOT EXISTS pulse_metrics (
  id          text PRIMARY KEY,
  location_id text NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  date        date NOT NULL,
  metric_name text NOT NULL,
  actual      numeric NOT NULL,
  target      numeric NOT NULL,
  trend       text NOT NULL CHECK (trend IN ('up', 'down', 'flat')),
  period      text NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pulse_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pulse_metrics_all" ON pulse_metrics FOR ALL USING (true);

-- ============================================================
-- PULSE DIAGNOSES
-- ============================================================
CREATE TABLE IF NOT EXISTS pulse_diagnoses (
  id                 text PRIMARY KEY,
  pulse_metric_id    text NOT NULL REFERENCES pulse_metrics(id) ON DELETE CASCADE,
  diagnosis          text NOT NULL,
  recommended_actions jsonb NOT NULL DEFAULT '[]',
  confidence         numeric NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pulse_diagnoses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pulse_diagnoses_all" ON pulse_diagnoses FOR ALL USING (true);

-- ============================================================
-- INTERVENTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS interventions (
  id                text PRIMARY KEY,
  org_id            text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id       text REFERENCES locations(id) ON DELETE SET NULL,
  type              text NOT NULL CHECK (type IN ('training', 'process', 'schedule', 'coaching')),
  description       text NOT NULL,
  target_population jsonb NOT NULL DEFAULT '{}',
  expected_outcome  text,
  started_at        timestamptz NOT NULL DEFAULT now(),
  created_by        text REFERENCES profiles(id) ON DELETE SET NULL,
  metrics_before    jsonb,
  metrics_after     jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interventions_all" ON interventions FOR ALL USING (true);

-- ============================================================
-- METRIC HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS metric_history (
  id           text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  location_id  text NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  metric_name  text NOT NULL,
  date         date NOT NULL,
  value        numeric NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (location_id, metric_name, date)
);

ALTER TABLE metric_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "metric_history_all" ON metric_history FOR ALL USING (true);

-- ============================================================
-- ORG CREDITS
-- ============================================================
CREATE TABLE IF NOT EXISTS org_credits (
  org_id          text PRIMARY KEY REFERENCES orgs(id) ON DELETE CASCADE,
  plan            text NOT NULL CHECK (plan IN ('free', 'location_pro', 'multi_location', 'enterprise')),
  credits_total   integer NOT NULL DEFAULT 50,
  credits_used    integer NOT NULL DEFAULT 0,
  credits_reset_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE org_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_credits_all" ON org_credits FOR ALL USING (true);

-- ============================================================
-- LM PROGRESS (per location)
-- ============================================================
CREATE TABLE IF NOT EXISTS lm_progress (
  location_id text PRIMARY KEY REFERENCES locations(id) ON DELETE CASCADE,
  step        text NOT NULL DEFAULT 'invite_team',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lm_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lm_progress_all" ON lm_progress FOR ALL USING (true);
