-- Axonify Frontline Platform Seed Data
-- Run AFTER schema.sql. Safe to re-run (ON CONFLICT DO NOTHING).

-- ============================================================
-- ORG
-- ============================================================
INSERT INTO orgs (id, name, industry) VALUES
  ('org-1', 'Crisp & Green', 'Quick Service Restaurant')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PROFILES (must come before locations so manager_id FK works
--           after we insert locations we re-reference them)
-- Note: location_id FK from profiles → locations, so we insert
--       profiles with location_id NULL first, then update.
--       Actually we use DEFERRABLE or just insert locations first
--       with manager_id NULL, then profiles, then update locations.
-- Strategy: insert locations with manager_id NULL, insert profiles,
--           then update location manager_ids.
-- ============================================================

-- Step 1: locations without manager_id
INSERT INTO locations (id, org_id, name, type, address, manager_id, timezone, created_at) VALUES
  ('loc-downtown', 'org-1', 'Downtown',           'QSR', '100 Main St, Minneapolis, MN',                  NULL, 'America/Chicago', '2024-01-15T00:00:00Z'),
  ('loc-mall',     'org-1', 'Mall of America',     'QSR', '300 Mall of America Blvd, Bloomington, MN',     NULL, 'America/Chicago', '2024-03-01T00:00:00Z'),
  ('loc-airport',  'org-1', 'Airport Terminal 2',  'QSR', 'MSP Airport Terminal 2, Minneapolis, MN',       NULL, 'America/Chicago', '2024-06-01T00:00:00Z')
ON CONFLICT DO NOTHING;

-- Step 2: profiles
INSERT INTO profiles (id, org_id, role, full_name, email, location_id, avatar_url, skills, certifications, hire_date, created_at) VALUES
  ('user-ld',  'org-1', 'ld',  'Sarah Chen',      'sarah@crispgreen.com',  NULL,           NULL,
   '[{"name":"Instructional Design","level":95,"category":"L&D"},{"name":"Content Strategy","level":90,"category":"L&D"}]',
   '[{"name":"CPTD","status":"active","expires_at":"2027-06-01","completed_at":"2023-06-01"}]',
   '2022-01-15', '2022-01-15T00:00:00Z'),

  ('user-ops', 'org-1', 'ops', 'Marcus Johnson',  'marcus@crispgreen.com', NULL,           NULL,
   '[{"name":"Operations Management","level":92,"category":"Operations"},{"name":"Data Analysis","level":85,"category":"Analytics"}]',
   '[{"name":"Six Sigma Black Belt","status":"active","expires_at":null,"completed_at":"2021-03-15"}]',
   '2021-06-01', '2021-06-01T00:00:00Z'),

  ('user-mgr-downtown', 'org-1', 'lm', 'Elena Rodriguez', 'elena@crispgreen.com', 'loc-downtown', NULL,
   '[{"name":"Team Leadership","level":90,"category":"Management"},{"name":"Food Safety","level":95,"category":"Compliance"}]',
   '[{"name":"ServSafe Manager","status":"active","expires_at":"2027-01-15","completed_at":"2024-01-15"}]',
   '2022-06-01', '2022-06-01T00:00:00Z'),

  ('user-mgr-airport', 'org-1', 'lm', 'David Kim',      'david@crispgreen.com',  'loc-airport', NULL,
   '[{"name":"Team Leadership","level":70,"category":"Management"},{"name":"Food Safety","level":80,"category":"Compliance"}]',
   '[{"name":"ServSafe Manager","status":"active","expires_at":"2026-08-01","completed_at":"2024-08-01"}]',
   '2024-03-01', '2024-03-01T00:00:00Z'),

  ('user-mgr-mall', 'org-1', 'lm', 'Priya Patel',    'priya@crispgreen.com',  'loc-mall',    NULL,
   '[{"name":"Team Leadership","level":82,"category":"Management"},{"name":"Food Safety","level":88,"category":"Compliance"}]',
   '[{"name":"ServSafe Manager","status":"active","expires_at":"2027-03-01","completed_at":"2024-03-01"}]',
   '2023-01-15', '2023-01-15T00:00:00Z'),

  ('user-fe-1', 'org-1', 'fe', 'Alex Thompson',   'alex@crispgreen.com',   'loc-downtown', NULL,
   '[{"name":"Food Prep","level":92,"category":"Operations"},{"name":"Customer Service","level":88,"category":"Service"},{"name":"Inventory Management","level":75,"category":"Operations"}]',
   '[{"name":"ServSafe Food Handler","status":"active","expires_at":"2027-03-01","completed_at":"2024-03-01"},{"name":"Allergen Awareness","status":"active","expires_at":"2026-09-01","completed_at":"2024-09-01"}]',
   '2023-08-15', '2023-08-15T00:00:00Z'),

  ('user-fe-2', 'org-1', 'fe', 'Maria Santos',    'maria@crispgreen.com',  'loc-downtown', NULL,
   '[{"name":"Food Prep","level":95,"category":"Operations"},{"name":"Customer Service","level":90,"category":"Service"},{"name":"Training Others","level":80,"category":"Leadership"}]',
   '[{"name":"ServSafe Food Handler","status":"active","expires_at":"2027-05-01","completed_at":"2024-05-01"}]',
   '2023-02-01', '2023-02-01T00:00:00Z'),

  ('user-fe-3', 'org-1', 'fe', 'Jordan Lee',      'jordan@crispgreen.com', 'loc-airport',  NULL,
   '[{"name":"Food Prep","level":55,"category":"Operations"},{"name":"Customer Service","level":60,"category":"Service"}]',
   '[{"name":"ServSafe Food Handler","status":"expiring","expires_at":"2026-05-01","completed_at":"2024-05-01"}]',
   '2025-11-01', '2025-11-01T00:00:00Z'),

  ('user-fe-4', 'org-1', 'fe', 'Sam Rivera',      'sam@crispgreen.com',    'loc-airport',  NULL,
   '[{"name":"Food Prep","level":45,"category":"Operations"},{"name":"Customer Service","level":50,"category":"Service"}]',
   '[{"name":"ServSafe Food Handler","status":"expired","expires_at":"2026-02-01","completed_at":"2023-02-01"}]',
   '2026-01-15', '2026-01-15T00:00:00Z'),

  ('user-fe-5', 'org-1', 'fe', 'Casey Morgan',    'casey@crispgreen.com',  'loc-airport',  NULL,
   '[{"name":"Food Prep","level":62,"category":"Operations"},{"name":"Customer Service","level":70,"category":"Service"},{"name":"Inventory Management","level":40,"category":"Operations"}]',
   '[{"name":"ServSafe Food Handler","status":"active","expires_at":"2027-01-01","completed_at":"2025-01-01"}]',
   '2025-08-01', '2025-08-01T00:00:00Z'),

  ('user-fe-6', 'org-1', 'fe', 'Taylor Williams', 'taylor@crispgreen.com', 'loc-mall',     NULL,
   '[{"name":"Food Prep","level":78,"category":"Operations"},{"name":"Customer Service","level":82,"category":"Service"}]',
   '[{"name":"ServSafe Food Handler","status":"active","expires_at":"2027-06-01","completed_at":"2024-06-01"}]',
   '2024-04-01', '2024-04-01T00:00:00Z'),

  ('user-fe-7', 'org-1', 'fe', 'Riley Jackson',   'riley@crispgreen.com',  'loc-mall',     NULL,
   '[{"name":"Food Prep","level":80,"category":"Operations"},{"name":"Customer Service","level":75,"category":"Service"},{"name":"Inventory Management","level":65,"category":"Operations"}]',
   '[{"name":"ServSafe Food Handler","status":"active","expires_at":"2027-08-01","completed_at":"2024-08-01"}]',
   '2024-02-15', '2024-02-15T00:00:00Z')
ON CONFLICT DO NOTHING;

-- Step 3: update locations with manager_ids
UPDATE locations SET manager_id = 'user-mgr-downtown' WHERE id = 'loc-downtown' AND manager_id IS NULL;
UPDATE locations SET manager_id = 'user-mgr-mall'     WHERE id = 'loc-mall'     AND manager_id IS NULL;
UPDATE locations SET manager_id = 'user-mgr-airport'  WHERE id = 'loc-airport'  AND manager_id IS NULL;

-- ============================================================
-- SHIFTS (using a fixed date so seed is stable)
-- ============================================================
INSERT INTO shifts (id, location_id, date, start_time, end_time, status, notes, created_at) VALUES
  ('shift-dt-am', 'loc-downtown', CURRENT_DATE, '06:00', '14:00', 'active',    NULL, '2026-04-01T00:00:00Z'),
  ('shift-dt-pm', 'loc-downtown', CURRENT_DATE, '14:00', '22:00', 'scheduled', NULL, '2026-04-01T00:00:00Z'),
  ('shift-ap-am', 'loc-airport',  CURRENT_DATE, '05:00', '13:00', 'active',    NULL, '2026-04-01T00:00:00Z'),
  ('shift-ap-pm', 'loc-airport',  CURRENT_DATE, '13:00', '21:00', 'scheduled', NULL, '2026-04-01T00:00:00Z'),
  ('shift-ml-am', 'loc-mall',     CURRENT_DATE, '10:00', '18:00', 'active',    NULL, '2026-04-01T00:00:00Z')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SHIFT ASSIGNMENTS
-- ============================================================
INSERT INTO shift_assignments (id, shift_id, profile_id, role_in_shift, created_at) VALUES
  ('sa-1', 'shift-dt-am', 'user-fe-1', 'Line Cook',      '2026-04-01T00:00:00Z'),
  ('sa-2', 'shift-dt-am', 'user-fe-2', 'Lead / Trainer', '2026-04-01T00:00:00Z'),
  ('sa-3', 'shift-ap-am', 'user-fe-3', 'Line Cook',      '2026-04-01T00:00:00Z'),
  ('sa-4', 'shift-ap-am', 'user-fe-4', 'Counter Service','2026-04-01T00:00:00Z'),
  ('sa-5', 'shift-ap-am', 'user-fe-5', 'Prep Cook',      '2026-04-01T00:00:00Z'),
  ('sa-6', 'shift-ml-am', 'user-fe-6', 'Line Cook',      '2026-04-01T00:00:00Z'),
  ('sa-7', 'shift-ml-am', 'user-fe-7', 'Counter Service','2026-04-01T00:00:00Z')
ON CONFLICT DO NOTHING;

-- ============================================================
-- TASKS
-- ============================================================
INSERT INTO tasks (id, shift_id, location_id, title, description, standard, category, priority, assigned_to, status, quality_score, completed_at, due_by, created_at) VALUES
  ('task-1',  'shift-dt-am', 'loc-downtown', 'Morning prep: chop vegetables',
   'Prep all vegetables for lunch service per the daily prep sheet',
   'All items within 2mm variance of spec. Completed by 8:00 AM.',
   'Food Prep', 'high', 'user-fe-1', 'completed', 95, now() - interval '1 hour', '08:00', '2026-04-01T00:00:00Z'),

  ('task-2',  'shift-dt-am', 'loc-downtown', 'Check cooler temperatures',
   'Record all cooler and freezer temperatures on the food safety log',
   'All units within safe range (cooler: 33-40°F, freezer: 0°F or below).',
   'Food Safety', 'critical', 'user-fe-1', 'completed', 100, now() - interval '90 minutes', '06:30', '2026-04-01T00:00:00Z'),

  ('task-3',  'shift-dt-am', 'loc-downtown', 'Restock front-of-house supplies',
   'Restock napkins, utensils, condiments, and cups',
   'All stations fully stocked before 11:00 AM rush.',
   'Operations', 'medium', 'user-fe-1', 'completed', 90, now() - interval '30 minutes', '11:00', '2026-04-01T00:00:00Z'),

  ('task-4',  'shift-dt-am', 'loc-downtown', 'Lunch service: salad station',
   'Run the salad assembly station during lunch rush',
   'Orders assembled within 3 minutes. Accuracy 98%+.',
   'Service', 'high', 'user-fe-1', 'in_progress', NULL, NULL, '13:00', '2026-04-01T00:00:00Z'),

  ('task-5',  'shift-dt-am', 'loc-downtown', 'Clean and sanitize prep area',
   'Full clean and sanitize of all prep surfaces and equipment',
   'All surfaces sanitized per health code. Checklist completed.',
   'Cleaning', 'high', 'user-fe-1', 'pending', NULL, NULL, '13:30', '2026-04-01T00:00:00Z'),

  ('task-6',  'shift-ap-am', 'loc-airport', 'Morning prep: chop vegetables',
   'Prep all vegetables for service per the daily prep sheet',
   'All items within 2mm variance of spec. Completed by 7:00 AM.',
   'Food Prep', 'high', 'user-fe-3', 'completed', 62, now() - interval '45 minutes', '07:00', '2026-04-01T00:00:00Z'),

  ('task-7',  'shift-ap-am', 'loc-airport', 'Check cooler temperatures',
   'Record all cooler and freezer temperatures on the food safety log',
   'All units within safe range.',
   'Food Safety', 'critical', 'user-fe-3', 'flagged', 40, NULL, '05:30', '2026-04-01T00:00:00Z'),

  ('task-8',  'shift-ap-am', 'loc-airport', 'Restock front-of-house supplies',
   'Restock napkins, utensils, condiments, and cups',
   'All stations fully stocked before morning rush.',
   'Operations', 'medium', 'user-fe-4', 'pending', NULL, NULL, '07:00', '2026-04-01T00:00:00Z'),

  ('task-9',  'shift-ap-am', 'loc-airport', 'Service: salad station',
   'Run the salad assembly station during morning rush',
   'Orders assembled within 3 minutes. Accuracy 98%+.',
   'Service', 'high', 'user-fe-3', 'pending', NULL, NULL, '12:00', '2026-04-01T00:00:00Z'),

  ('task-10', 'shift-ap-am', 'loc-airport', 'Inventory count: dry goods',
   'Count all dry goods and update inventory system',
   'Counts accurate within 2%. Submitted before end of shift.',
   'Inventory', 'medium', 'user-fe-5', 'pending', NULL, NULL, '12:30', '2026-04-01T00:00:00Z'),

  ('task-11', 'shift-ml-am', 'loc-mall', 'Morning prep: grain bowls',
   'Prep all grain bowl components',
   'All components ready by 11:00 AM. Portions within spec.',
   'Food Prep', 'high', 'user-fe-6', 'completed', 85, now() - interval '1 hour', '11:00', '2026-04-01T00:00:00Z'),

  ('task-12', 'shift-ml-am', 'loc-mall', 'Lunch service: counter',
   'Handle counter orders and payments during lunch',
   'Average order time under 4 minutes. Accuracy 95%+.',
   'Service', 'high', 'user-fe-7', 'in_progress', NULL, NULL, '15:00', '2026-04-01T00:00:00Z')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PLAYBOOKS
-- ============================================================
INSERT INTO playbooks (id, org_id, title, description, scope, target_roles, content, version, status, created_by, completion_rate, avg_score, effectiveness_score, created_at, updated_at) VALUES
  ('pb-food-safety', 'org-1',
   'Food Safety Essentials',
   'Daily food safety procedures every team member must follow',
   'org', '["fe"]',
   '{
     "steps": [
       {"title": "Check hand washing station", "instructions": "Verify soap, hot water, and paper towels are stocked at all hand washing stations.", "tips": ["Check every 2 hours during service"]},
       {"title": "Record cooler temperatures", "instructions": "Use calibrated thermometer. Record on the food safety log. Coolers must be 33-40°F. Freezers must be 0°F or below.", "tips": ["If out of range, notify manager immediately", "Do not store food in out-of-range units"]},
       {"title": "Check food date labels", "instructions": "Verify all prepped food has date labels. Discard anything past its use-by date.", "tips": ["FIFO: First In, First Out", "When in doubt, throw it out"]},
       {"title": "Sanitize prep surfaces", "instructions": "Use approved sanitizer solution at correct concentration. Wipe all surfaces. Air dry.", "tips": ["Test sanitizer concentration with test strips", "Change sanitizer solution every 2 hours"]},
       {"title": "Verify cooking temperatures", "instructions": "Use probe thermometer to verify internal temperatures meet minimum requirements for each protein.", "tips": ["Chicken: 165°F", "Ground beef: 155°F", "Fish: 145°F"]}
     ],
     "quiz": [
       {"question": "What is the safe temperature range for a walk-in cooler?", "options": ["25-32°F", "33-40°F", "41-50°F", "28-35°F"], "correct": 1, "explanation": "Walk-in coolers must maintain 33-40°F to prevent bacterial growth while avoiding freezing."},
       {"question": "How often should sanitizer solution be changed during service?", "options": ["Every hour", "Every 2 hours", "Every 4 hours", "Once per shift"], "correct": 1, "explanation": "Sanitizer concentration drops over time. Replace every 2 hours to maintain effectiveness."},
       {"question": "What is the minimum internal temperature for cooked chicken?", "options": ["145°F", "155°F", "165°F", "175°F"], "correct": 2, "explanation": "Chicken must reach 165°F internal temperature to kill harmful bacteria like Salmonella."}
     ],
     "key_takeaways": [
       "Temperature control is the #1 food safety defense",
       "When in doubt, throw it out — never serve questionable food",
       "Hand washing prevents 80% of foodborne illness transmission"
     ]
   }',
   3, 'published', 'user-ld', 78, 82, 75, '2024-06-01T00:00:00Z', '2026-01-15T00:00:00Z'),

  ('pb-customer-service', 'org-1',
   'Customer Service Excellence',
   'How to deliver exceptional customer experiences at every touchpoint',
   'org', '["fe"]',
   '{
     "steps": [
       {"title": "Greet every customer", "instructions": "Make eye contact and greet within 5 seconds of approach. Use a warm, genuine tone.", "tips": ["Smile first, speak second", "Use their name if you know it"]},
       {"title": "Clarify the order", "instructions": "Repeat the order back to the customer. Confirm any modifications or allergies.", "tips": ["Ask about allergies proactively", "Never assume — always confirm"]},
       {"title": "Assemble with care", "instructions": "Follow the build spec exactly. Present the order neatly.", "tips": ["Portion accuracy matters for food cost AND customer satisfaction"]},
       {"title": "Handle complaints gracefully", "instructions": "Listen fully. Apologize sincerely. Fix the issue immediately. Offer something extra if appropriate.", "tips": ["Never argue", "Empower yourself: you can remake any order without manager approval"]}
     ],
     "quiz": [
       {"question": "Within how many seconds should you greet a customer?", "options": ["3 seconds", "5 seconds", "10 seconds", "15 seconds"], "correct": 1, "explanation": "Greeting within 5 seconds shows the customer they are noticed and valued."},
       {"question": "What should you do first when a customer complains?", "options": ["Apologize", "Listen fully", "Get a manager", "Offer a refund"], "correct": 1, "explanation": "Listening fully shows respect and helps you understand the real issue before responding."}
     ],
     "key_takeaways": [
       "Every interaction is a chance to create a repeat customer",
       "Speed matters, but accuracy matters more",
       "You have the power to fix problems — use it"
     ]
   }',
   2, 'published', 'user-ld', 65, 79, 70, '2024-08-01T00:00:00Z', '2025-11-01T00:00:00Z'),

  ('pb-new-hire', 'org-1',
   'New Hire Onboarding',
   'First-week onboarding checklist and training for all new team members',
   'org', '["fe"]',
   '{
     "steps": [
       {"title": "Welcome and orientation", "instructions": "Tour the location. Introduce the team. Show locker room, break area, and emergency exits.", "tips": ["Pair new hires with a buddy for their first week"]},
       {"title": "Safety basics", "instructions": "Review fire exits, first aid kit location, injury reporting process, and key safety protocols.", "tips": ["Have them locate all safety equipment themselves"]},
       {"title": "Systems training", "instructions": "Show how to clock in/out, view schedule, submit time-off requests, and access the task list.", "tips": ["Let them practice on their own device"]},
       {"title": "Station shadowing", "instructions": "New hire shadows an experienced team member at each station for at least 30 minutes.", "tips": ["Rotate through all stations in the first week"]},
       {"title": "First solo tasks", "instructions": "Assign simple, low-risk tasks and provide immediate feedback.", "tips": ["Start with prep and cleaning before service tasks", "Celebrate early wins"]}
     ],
     "quiz": [
       {"question": "What should a new hire do on their first day?", "options": ["Jump into service immediately", "Shadow experienced team members", "Study the menu alone", "Watch training videos all day"], "correct": 1, "explanation": "Shadowing provides context and builds confidence before solo work."}
     ],
     "key_takeaways": [
       "First impressions matter — a great first week reduces turnover by 50%",
       "Hands-on learning beats passive training every time",
       "Check in with new hires daily for the first two weeks"
     ]
   }',
   4, 'published', 'user-ld', 92, 88, 82, '2024-01-15T00:00:00Z', '2026-02-01T00:00:00Z')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PLAYBOOK COMPLETIONS
-- ============================================================
INSERT INTO playbook_completions (id, playbook_id, profile_id, score, completed_at, time_spent_seconds) VALUES
  ('pc-1',  'pb-food-safety',      'user-fe-1', 95, '2026-03-15T10:00:00Z', 420),
  ('pc-2',  'pb-customer-service', 'user-fe-1', 90, '2026-03-20T11:00:00Z', 360),
  ('pc-3',  'pb-food-safety',      'user-fe-2', 98, '2026-03-14T09:00:00Z', 300),
  ('pc-4',  'pb-customer-service', 'user-fe-2', 92, '2026-03-18T10:00:00Z', 330),
  ('pc-5',  'pb-new-hire',         'user-fe-1',100, '2023-08-20T14:00:00Z', 480),
  ('pc-6',  'pb-food-safety',      'user-fe-3', 60, '2026-03-25T09:00:00Z', 600),
  ('pc-7',  'pb-new-hire',         'user-fe-3', 72, '2025-11-08T10:00:00Z', 540),
  ('pc-8',  'pb-new-hire',         'user-fe-4', 65, '2026-01-22T11:00:00Z', 660),
  ('pc-9',  'pb-food-safety',      'user-fe-6', 82, '2026-03-10T09:00:00Z', 400),
  ('pc-10', 'pb-customer-service', 'user-fe-6', 80, '2026-03-12T10:00:00Z', 380),
  ('pc-11', 'pb-food-safety',      'user-fe-7', 85, '2026-03-11T09:30:00Z', 390)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PULSE METRICS
-- ============================================================
INSERT INTO pulse_metrics (id, location_id, date, metric_name, actual, target, trend, period, created_at) VALUES
  -- Downtown
  ('pm-dt-1', 'loc-downtown', CURRENT_DATE, 'task_completion_rate', 94, 95, 'up',   'daily', CURRENT_DATE),
  ('pm-dt-2', 'loc-downtown', CURRENT_DATE, 'labor_cost_percent',   28, 30, 'down', 'daily', CURRENT_DATE),
  ('pm-dt-3', 'loc-downtown', CURRENT_DATE, 'customer_satisfaction',4.6,4.5,'up',   'daily', CURRENT_DATE),
  ('pm-dt-4', 'loc-downtown', CURRENT_DATE, 'quality_score',        92, 90, 'up',   'daily', CURRENT_DATE),
  ('pm-dt-5', 'loc-downtown', CURRENT_DATE, 'schedule_adherence',   96, 95, 'flat', 'daily', CURRENT_DATE),
  ('pm-dt-6', 'loc-downtown', CURRENT_DATE, 'compliance_rate',      98, 98, 'flat', 'daily', CURRENT_DATE),
  -- Mall
  ('pm-ml-1', 'loc-mall',     CURRENT_DATE, 'task_completion_rate', 84, 95, 'flat', 'daily', CURRENT_DATE),
  ('pm-ml-2', 'loc-mall',     CURRENT_DATE, 'labor_cost_percent',   33, 30, 'up',   'daily', CURRENT_DATE),
  ('pm-ml-3', 'loc-mall',     CURRENT_DATE, 'customer_satisfaction',4.1,4.5,'flat', 'daily', CURRENT_DATE),
  ('pm-ml-4', 'loc-mall',     CURRENT_DATE, 'quality_score',        81, 90, 'down', 'daily', CURRENT_DATE),
  ('pm-ml-5', 'loc-mall',     CURRENT_DATE, 'schedule_adherence',   88, 95, 'flat', 'daily', CURRENT_DATE),
  ('pm-ml-6', 'loc-mall',     CURRENT_DATE, 'compliance_rate',      91, 98, 'down', 'daily', CURRENT_DATE),
  -- Airport
  ('pm-ap-1', 'loc-airport',  CURRENT_DATE, 'task_completion_rate', 72, 95, 'down', 'daily', CURRENT_DATE),
  ('pm-ap-2', 'loc-airport',  CURRENT_DATE, 'labor_cost_percent',   38, 30, 'up',   'daily', CURRENT_DATE),
  ('pm-ap-3', 'loc-airport',  CURRENT_DATE, 'customer_satisfaction',3.4,4.5,'down', 'daily', CURRENT_DATE),
  ('pm-ap-4', 'loc-airport',  CURRENT_DATE, 'quality_score',        68, 90, 'down', 'daily', CURRENT_DATE),
  ('pm-ap-5', 'loc-airport',  CURRENT_DATE, 'schedule_adherence',   76, 95, 'down', 'daily', CURRENT_DATE),
  ('pm-ap-6', 'loc-airport',  CURRENT_DATE, 'compliance_rate',      82, 98, 'down', 'daily', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PULSE DIAGNOSES
-- ============================================================
INSERT INTO pulse_diagnoses (id, pulse_metric_id, diagnosis, recommended_actions, confidence, created_at) VALUES
  ('pd-1', 'pm-ap-1',
   'Task completion rate at Airport Terminal 2 is 72% vs 95% target. Root causes: (1) 3 of 5 team members hired within the last 6 months with limited training completion — only 1 has completed Food Safety playbook. (2) Morning prep tasks are taking 40% longer than Downtown benchmarks, suggesting skill gaps in food prep procedures. (3) One critical food safety task was flagged (cooler temperature check), indicating process adherence issues.',
   '[
     {"action": "Enroll all Airport staff in Food Safety Essentials playbook with deadline this week", "impact": "high", "effort": "low", "owner": "L&D / Location Manager", "timeline": "1 week"},
     {"action": "Pair new hires with experienced Downtown staff for 2-day cross-training", "impact": "high", "effort": "medium", "owner": "Location Manager", "timeline": "2 weeks"},
     {"action": "Implement daily 5-minute pre-shift huddle to review task priorities and standards", "impact": "medium", "effort": "low", "owner": "Location Manager", "timeline": "Immediate"}
   ]',
   0.87, CURRENT_DATE),

  ('pd-2', 'pm-ap-4',
   'Quality score at Airport is 68% vs 90% target. Root causes: (1) Food prep quality scores averaging 51% for the two newest hires (Jordan and Sam) — both have less than 6 months tenure. (2) Customer Service playbook has 0% completion at this location — no employee has been trained. (3) The flagged cooler temperature task suggests food safety protocols are not being followed consistently, which directly impacts food quality.',
   '[
     {"action": "Deploy Customer Service Excellence playbook to all Airport staff immediately", "impact": "high", "effort": "low", "owner": "L&D", "timeline": "1 week"},
     {"action": "Schedule bi-weekly quality audits at Airport with results shared in team huddle", "impact": "medium", "effort": "medium", "owner": "Location Manager", "timeline": "2 weeks"},
     {"action": "Create a mentorship pairing: assign Maria Santos (Downtown, quality score 95+) as remote mentor for Airport prep team", "impact": "high", "effort": "medium", "owner": "L&D / Ops", "timeline": "1 week"}
   ]',
   0.82, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- INTERVENTIONS
-- ============================================================
INSERT INTO interventions (id, org_id, location_id, type, description, target_population, expected_outcome, started_at, created_by, metrics_before, metrics_after, created_at) VALUES
  ('int-1', 'org-1', 'loc-airport', 'training',
   'Emergency food safety training rollout for Airport team',
   '{"location_ids":["loc-airport"],"roles":["fe"]}',
   'Increase food safety compliance from 82% to 95% within 4 weeks',
   '2026-03-25T00:00:00Z', 'user-ld',
   '{"compliance_rate":78,"quality_score":64}',
   '{"compliance_rate":82,"quality_score":68}',
   '2026-03-25T00:00:00Z'),

  ('int-2', 'org-1', 'loc-mall', 'process',
   'Implemented pre-shift huddle protocol at Mall location',
   '{"location_ids":["loc-mall"],"roles":["fe"]}',
   'Improve task completion rate from 80% to 90% within 3 weeks',
   '2026-03-15T00:00:00Z', 'user-mgr-mall',
   '{"task_completion_rate":80}',
   '{"task_completion_rate":84}',
   '2026-03-15T00:00:00Z'),

  ('int-3', 'org-1', NULL, 'training',
   'Organization-wide Customer Service Excellence training refresh',
   '{"roles":["fe"]}',
   'Increase average customer satisfaction from 4.0 to 4.5 across all locations',
   '2026-02-01T00:00:00Z', 'user-ld',
   '{"customer_satisfaction":4.0}',
   '{"customer_satisfaction":4.2}',
   '2026-02-01T00:00:00Z')
ON CONFLICT DO NOTHING;

-- ============================================================
-- METRIC HISTORY
-- ============================================================
INSERT INTO metric_history (location_id, metric_name, date, value) VALUES
  -- Downtown
  ('loc-downtown','task_completion_rate','2026-02-09',91),('loc-downtown','task_completion_rate','2026-02-16',92),
  ('loc-downtown','task_completion_rate','2026-02-23',93),('loc-downtown','task_completion_rate','2026-03-02',92),
  ('loc-downtown','task_completion_rate','2026-03-09',93),('loc-downtown','task_completion_rate','2026-03-16',93),
  ('loc-downtown','task_completion_rate','2026-03-23',94),('loc-downtown','task_completion_rate','2026-03-30',94),
  ('loc-downtown','task_completion_rate','2026-04-06',94),

  ('loc-downtown','labor_cost_percent','2026-02-09',29),('loc-downtown','labor_cost_percent','2026-02-16',29),
  ('loc-downtown','labor_cost_percent','2026-02-23',28),('loc-downtown','labor_cost_percent','2026-03-02',29),
  ('loc-downtown','labor_cost_percent','2026-03-09',28),('loc-downtown','labor_cost_percent','2026-03-16',28),
  ('loc-downtown','labor_cost_percent','2026-03-23',28),('loc-downtown','labor_cost_percent','2026-03-30',28),
  ('loc-downtown','labor_cost_percent','2026-04-06',28),

  ('loc-downtown','customer_satisfaction','2026-02-09',4.3),('loc-downtown','customer_satisfaction','2026-02-16',4.3),
  ('loc-downtown','customer_satisfaction','2026-02-23',4.4),('loc-downtown','customer_satisfaction','2026-03-02',4.4),
  ('loc-downtown','customer_satisfaction','2026-03-09',4.5),('loc-downtown','customer_satisfaction','2026-03-16',4.5),
  ('loc-downtown','customer_satisfaction','2026-03-23',4.5),('loc-downtown','customer_satisfaction','2026-03-30',4.6),
  ('loc-downtown','customer_satisfaction','2026-04-06',4.6),

  ('loc-downtown','quality_score','2026-02-09',89),('loc-downtown','quality_score','2026-02-16',90),
  ('loc-downtown','quality_score','2026-02-23',91),('loc-downtown','quality_score','2026-03-02',90),
  ('loc-downtown','quality_score','2026-03-09',91),('loc-downtown','quality_score','2026-03-16',91),
  ('loc-downtown','quality_score','2026-03-23',92),('loc-downtown','quality_score','2026-03-30',92),
  ('loc-downtown','quality_score','2026-04-06',92),

  ('loc-downtown','schedule_adherence','2026-02-09',94),('loc-downtown','schedule_adherence','2026-02-16',95),
  ('loc-downtown','schedule_adherence','2026-02-23',95),('loc-downtown','schedule_adherence','2026-03-02',95),
  ('loc-downtown','schedule_adherence','2026-03-09',96),('loc-downtown','schedule_adherence','2026-03-16',96),
  ('loc-downtown','schedule_adherence','2026-03-23',96),('loc-downtown','schedule_adherence','2026-03-30',96),
  ('loc-downtown','schedule_adherence','2026-04-06',96),

  ('loc-downtown','compliance_rate','2026-02-09',97),('loc-downtown','compliance_rate','2026-02-16',97),
  ('loc-downtown','compliance_rate','2026-02-23',98),('loc-downtown','compliance_rate','2026-03-02',97),
  ('loc-downtown','compliance_rate','2026-03-09',98),('loc-downtown','compliance_rate','2026-03-16',98),
  ('loc-downtown','compliance_rate','2026-03-23',98),('loc-downtown','compliance_rate','2026-03-30',98),
  ('loc-downtown','compliance_rate','2026-04-06',98),

  -- Mall
  ('loc-mall','task_completion_rate','2026-02-09',78),('loc-mall','task_completion_rate','2026-02-16',77),
  ('loc-mall','task_completion_rate','2026-02-23',79),('loc-mall','task_completion_rate','2026-03-02',78),
  ('loc-mall','task_completion_rate','2026-03-09',78),('loc-mall','task_completion_rate','2026-03-16',80),
  ('loc-mall','task_completion_rate','2026-03-23',82),('loc-mall','task_completion_rate','2026-03-30',83),
  ('loc-mall','task_completion_rate','2026-04-06',84),

  ('loc-mall','labor_cost_percent','2026-02-09',35),('loc-mall','labor_cost_percent','2026-02-16',35),
  ('loc-mall','labor_cost_percent','2026-02-23',34),('loc-mall','labor_cost_percent','2026-03-02',35),
  ('loc-mall','labor_cost_percent','2026-03-09',34),('loc-mall','labor_cost_percent','2026-03-16',34),
  ('loc-mall','labor_cost_percent','2026-03-23',33),('loc-mall','labor_cost_percent','2026-03-30',33),
  ('loc-mall','labor_cost_percent','2026-04-06',33),

  ('loc-mall','customer_satisfaction','2026-02-09',3.9),('loc-mall','customer_satisfaction','2026-02-16',3.9),
  ('loc-mall','customer_satisfaction','2026-02-23',4.0),('loc-mall','customer_satisfaction','2026-03-02',4.0),
  ('loc-mall','customer_satisfaction','2026-03-09',4.0),('loc-mall','customer_satisfaction','2026-03-16',4.0),
  ('loc-mall','customer_satisfaction','2026-03-23',4.1),('loc-mall','customer_satisfaction','2026-03-30',4.1),
  ('loc-mall','customer_satisfaction','2026-04-06',4.1),

  ('loc-mall','quality_score','2026-02-09',78),('loc-mall','quality_score','2026-02-16',77),
  ('loc-mall','quality_score','2026-02-23',79),('loc-mall','quality_score','2026-03-02',78),
  ('loc-mall','quality_score','2026-03-09',79),('loc-mall','quality_score','2026-03-16',80),
  ('loc-mall','quality_score','2026-03-23',80),('loc-mall','quality_score','2026-03-30',81),
  ('loc-mall','quality_score','2026-04-06',81),

  ('loc-mall','schedule_adherence','2026-02-09',85),('loc-mall','schedule_adherence','2026-02-16',86),
  ('loc-mall','schedule_adherence','2026-02-23',85),('loc-mall','schedule_adherence','2026-03-02',86),
  ('loc-mall','schedule_adherence','2026-03-09',86),('loc-mall','schedule_adherence','2026-03-16',87),
  ('loc-mall','schedule_adherence','2026-03-23',87),('loc-mall','schedule_adherence','2026-03-30',88),
  ('loc-mall','schedule_adherence','2026-04-06',88),

  ('loc-mall','compliance_rate','2026-02-09',88),('loc-mall','compliance_rate','2026-02-16',89),
  ('loc-mall','compliance_rate','2026-02-23',89),('loc-mall','compliance_rate','2026-03-02',88),
  ('loc-mall','compliance_rate','2026-03-09',89),('loc-mall','compliance_rate','2026-03-16',90),
  ('loc-mall','compliance_rate','2026-03-23',90),('loc-mall','compliance_rate','2026-03-30',91),
  ('loc-mall','compliance_rate','2026-04-06',91),

  -- Airport
  ('loc-airport','task_completion_rate','2026-02-09',79),('loc-airport','task_completion_rate','2026-02-16',77),
  ('loc-airport','task_completion_rate','2026-02-23',75),('loc-airport','task_completion_rate','2026-03-02',74),
  ('loc-airport','task_completion_rate','2026-03-09',72),('loc-airport','task_completion_rate','2026-03-16',71),
  ('loc-airport','task_completion_rate','2026-03-23',70),('loc-airport','task_completion_rate','2026-03-30',71),
  ('loc-airport','task_completion_rate','2026-04-06',72),

  ('loc-airport','labor_cost_percent','2026-02-09',34),('loc-airport','labor_cost_percent','2026-02-16',35),
  ('loc-airport','labor_cost_percent','2026-02-23',36),('loc-airport','labor_cost_percent','2026-03-02',36),
  ('loc-airport','labor_cost_percent','2026-03-09',37),('loc-airport','labor_cost_percent','2026-03-16',37),
  ('loc-airport','labor_cost_percent','2026-03-23',38),('loc-airport','labor_cost_percent','2026-03-30',38),
  ('loc-airport','labor_cost_percent','2026-04-06',38),

  ('loc-airport','customer_satisfaction','2026-02-09',3.8),('loc-airport','customer_satisfaction','2026-02-16',3.7),
  ('loc-airport','customer_satisfaction','2026-02-23',3.6),('loc-airport','customer_satisfaction','2026-03-02',3.5),
  ('loc-airport','customer_satisfaction','2026-03-09',3.5),('loc-airport','customer_satisfaction','2026-03-16',3.4),
  ('loc-airport','customer_satisfaction','2026-03-23',3.4),('loc-airport','customer_satisfaction','2026-03-30',3.4),
  ('loc-airport','customer_satisfaction','2026-04-06',3.4),

  ('loc-airport','quality_score','2026-02-09',63),('loc-airport','quality_score','2026-02-16',61),
  ('loc-airport','quality_score','2026-02-23',60),('loc-airport','quality_score','2026-03-02',62),
  ('loc-airport','quality_score','2026-03-09',59),('loc-airport','quality_score','2026-03-16',61),
  ('loc-airport','quality_score','2026-03-23',63),('loc-airport','quality_score','2026-03-30',66),
  ('loc-airport','quality_score','2026-04-06',68),

  ('loc-airport','schedule_adherence','2026-02-09',82),('loc-airport','schedule_adherence','2026-02-16',80),
  ('loc-airport','schedule_adherence','2026-02-23',79),('loc-airport','schedule_adherence','2026-03-02',78),
  ('loc-airport','schedule_adherence','2026-03-09',77),('loc-airport','schedule_adherence','2026-03-16',76),
  ('loc-airport','schedule_adherence','2026-03-23',76),('loc-airport','schedule_adherence','2026-03-30',76),
  ('loc-airport','schedule_adherence','2026-04-06',76),

  ('loc-airport','compliance_rate','2026-02-09',85),('loc-airport','compliance_rate','2026-02-16',83),
  ('loc-airport','compliance_rate','2026-02-23',82),('loc-airport','compliance_rate','2026-03-02',80),
  ('loc-airport','compliance_rate','2026-03-09',79),('loc-airport','compliance_rate','2026-03-16',78),
  ('loc-airport','compliance_rate','2026-03-23',79),('loc-airport','compliance_rate','2026-03-30',81),
  ('loc-airport','compliance_rate','2026-04-06',82)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ORG CREDITS
-- ============================================================
INSERT INTO org_credits (org_id, plan, credits_total, credits_used, credits_reset_at) VALUES
  ('org-1', 'free', 50, 8, '2026-05-01T00:00:00Z')
ON CONFLICT DO NOTHING;
