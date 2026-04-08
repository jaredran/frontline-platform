-- Invite links table
CREATE TABLE IF NOT EXISTS invite_links (
  id text PRIMARY KEY,
  location_id text NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_by text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '30 days'
);
ALTER TABLE invite_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invite_links_all" ON invite_links FOR ALL USING (true);

-- Results fees table (for dynamically created fees from new locations)
CREATE TABLE IF NOT EXISTS results_fees (
  id serial PRIMARY KEY,
  intervention_id text NOT NULL,
  metric_name text NOT NULL,
  improvement_points numeric NOT NULL DEFAULT 0,
  rate_per_point numeric NOT NULL DEFAULT 0,
  fee numeric NOT NULL DEFAULT 0,
  estimated_value numeric NOT NULL DEFAULT 0
);
ALTER TABLE results_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "results_fees_all" ON results_fees FOR ALL USING (true);
