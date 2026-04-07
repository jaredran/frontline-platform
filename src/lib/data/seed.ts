import {
  Profile,
  Location,
  Shift,
  Task,
  Playbook,
  PulseMetric,
  PulseDiagnosis,
  Intervention,
  ShiftAssignment,
  PlaybookCompletion,
  PlaybookContent,
  Role,
} from '../types'

// =============================================
// ORGANIZATION
// =============================================
export const ORG = {
  id: 'org-1',
  name: 'Crisp & Green',
  industry: 'Quick Service Restaurant',
}

// =============================================
// LOCATIONS
// =============================================
export const locations: Location[] = [
  {
    id: 'loc-downtown',
    org_id: ORG.id,
    name: 'Downtown',
    type: 'QSR',
    address: '100 Main St, Minneapolis, MN',
    manager_id: 'user-mgr-downtown',
    timezone: 'America/Chicago',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'loc-mall',
    org_id: ORG.id,
    name: 'Mall of America',
    type: 'QSR',
    address: '300 Mall of America Blvd, Bloomington, MN',
    manager_id: 'user-mgr-mall',
    timezone: 'America/Chicago',
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'loc-airport',
    org_id: ORG.id,
    name: 'Airport Terminal 2',
    type: 'QSR',
    address: 'MSP Airport Terminal 2, Minneapolis, MN',
    manager_id: 'user-mgr-airport',
    timezone: 'America/Chicago',
    created_at: '2024-06-01T00:00:00Z',
  },
]

// =============================================
// PROFILES (People)
// =============================================
export const profiles: Profile[] = [
  // --- Executives ---
  {
    id: 'user-ld',
    org_id: ORG.id,
    role: 'ld',
    full_name: 'Sarah Chen',
    email: 'sarah@crispgreen.com',
    location_id: null,
    avatar_url: null,
    skills: [{ name: 'Instructional Design', level: 95, category: 'L&D' }, { name: 'Content Strategy', level: 90, category: 'L&D' }],
    certifications: [{ name: 'CPTD', status: 'active', expires_at: '2027-06-01', completed_at: '2023-06-01' }],
    hire_date: '2022-01-15',
    created_at: '2022-01-15T00:00:00Z',
  },
  {
    id: 'user-ops',
    org_id: ORG.id,
    role: 'ops',
    full_name: 'Marcus Johnson',
    email: 'marcus@crispgreen.com',
    location_id: null,
    avatar_url: null,
    skills: [{ name: 'Operations Management', level: 92, category: 'Operations' }, { name: 'Data Analysis', level: 85, category: 'Analytics' }],
    certifications: [{ name: 'Six Sigma Black Belt', status: 'active', expires_at: null, completed_at: '2021-03-15' }],
    hire_date: '2021-06-01',
    created_at: '2021-06-01T00:00:00Z',
  },
  // --- Location Managers ---
  {
    id: 'user-mgr-downtown',
    org_id: ORG.id,
    role: 'lm',
    full_name: 'Elena Rodriguez',
    email: 'elena@crispgreen.com',
    location_id: 'loc-downtown',
    avatar_url: null,
    skills: [{ name: 'Team Leadership', level: 90, category: 'Management' }, { name: 'Food Safety', level: 95, category: 'Compliance' }],
    certifications: [{ name: 'ServSafe Manager', status: 'active', expires_at: '2027-01-15', completed_at: '2024-01-15' }],
    hire_date: '2022-06-01',
    created_at: '2022-06-01T00:00:00Z',
  },
  {
    id: 'user-mgr-airport',
    org_id: ORG.id,
    role: 'lm',
    full_name: 'David Kim',
    email: 'david@crispgreen.com',
    location_id: 'loc-airport',
    avatar_url: null,
    skills: [{ name: 'Team Leadership', level: 70, category: 'Management' }, { name: 'Food Safety', level: 80, category: 'Compliance' }],
    certifications: [{ name: 'ServSafe Manager', status: 'active', expires_at: '2026-08-01', completed_at: '2024-08-01' }],
    hire_date: '2024-03-01',
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'user-mgr-mall',
    org_id: ORG.id,
    role: 'lm',
    full_name: 'Priya Patel',
    email: 'priya@crispgreen.com',
    location_id: 'loc-mall',
    avatar_url: null,
    skills: [{ name: 'Team Leadership', level: 82, category: 'Management' }, { name: 'Food Safety', level: 88, category: 'Compliance' }],
    certifications: [{ name: 'ServSafe Manager', status: 'active', expires_at: '2027-03-01', completed_at: '2024-03-01' }],
    hire_date: '2023-01-15',
    created_at: '2023-01-15T00:00:00Z',
  },
  // --- Frontline Employees (Downtown - high performing) ---
  {
    id: 'user-fe-1',
    org_id: ORG.id,
    role: 'fe',
    full_name: 'Alex Thompson',
    email: 'alex@crispgreen.com',
    location_id: 'loc-downtown',
    avatar_url: null,
    skills: [
      { name: 'Food Prep', level: 92, category: 'Operations' },
      { name: 'Customer Service', level: 88, category: 'Service' },
      { name: 'Inventory Management', level: 75, category: 'Operations' },
    ],
    certifications: [
      { name: 'ServSafe Food Handler', status: 'active', expires_at: '2027-03-01', completed_at: '2024-03-01' },
      { name: 'Allergen Awareness', status: 'active', expires_at: '2026-09-01', completed_at: '2024-09-01' },
    ],
    hire_date: '2023-08-15',
    created_at: '2023-08-15T00:00:00Z',
  },
  {
    id: 'user-fe-2',
    org_id: ORG.id,
    role: 'fe',
    full_name: 'Maria Santos',
    email: 'maria@crispgreen.com',
    location_id: 'loc-downtown',
    avatar_url: null,
    skills: [
      { name: 'Food Prep', level: 95, category: 'Operations' },
      { name: 'Customer Service', level: 90, category: 'Service' },
      { name: 'Training Others', level: 80, category: 'Leadership' },
    ],
    certifications: [
      { name: 'ServSafe Food Handler', status: 'active', expires_at: '2027-05-01', completed_at: '2024-05-01' },
    ],
    hire_date: '2023-02-01',
    created_at: '2023-02-01T00:00:00Z',
  },
  // --- Frontline Employees (Airport - underperforming, newer hires) ---
  {
    id: 'user-fe-3',
    org_id: ORG.id,
    role: 'fe',
    full_name: 'Jordan Lee',
    email: 'jordan@crispgreen.com',
    location_id: 'loc-airport',
    avatar_url: null,
    skills: [
      { name: 'Food Prep', level: 55, category: 'Operations' },
      { name: 'Customer Service', level: 60, category: 'Service' },
    ],
    certifications: [
      { name: 'ServSafe Food Handler', status: 'expiring', expires_at: '2026-05-01', completed_at: '2024-05-01' },
    ],
    hire_date: '2025-11-01',
    created_at: '2025-11-01T00:00:00Z',
  },
  {
    id: 'user-fe-4',
    org_id: ORG.id,
    role: 'fe',
    full_name: 'Sam Rivera',
    email: 'sam@crispgreen.com',
    location_id: 'loc-airport',
    avatar_url: null,
    skills: [
      { name: 'Food Prep', level: 45, category: 'Operations' },
      { name: 'Customer Service', level: 50, category: 'Service' },
    ],
    certifications: [
      { name: 'ServSafe Food Handler', status: 'expired', expires_at: '2026-02-01', completed_at: '2023-02-01' },
    ],
    hire_date: '2026-01-15',
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'user-fe-5',
    org_id: ORG.id,
    role: 'fe',
    full_name: 'Casey Morgan',
    email: 'casey@crispgreen.com',
    location_id: 'loc-airport',
    avatar_url: null,
    skills: [
      { name: 'Food Prep', level: 62, category: 'Operations' },
      { name: 'Customer Service', level: 70, category: 'Service' },
      { name: 'Inventory Management', level: 40, category: 'Operations' },
    ],
    certifications: [
      { name: 'ServSafe Food Handler', status: 'active', expires_at: '2027-01-01', completed_at: '2025-01-01' },
    ],
    hire_date: '2025-08-01',
    created_at: '2025-08-01T00:00:00Z',
  },
  // --- Frontline Employees (Mall - average) ---
  {
    id: 'user-fe-6',
    org_id: ORG.id,
    role: 'fe',
    full_name: 'Taylor Williams',
    email: 'taylor@crispgreen.com',
    location_id: 'loc-mall',
    avatar_url: null,
    skills: [
      { name: 'Food Prep', level: 78, category: 'Operations' },
      { name: 'Customer Service', level: 82, category: 'Service' },
    ],
    certifications: [
      { name: 'ServSafe Food Handler', status: 'active', expires_at: '2027-06-01', completed_at: '2024-06-01' },
    ],
    hire_date: '2024-04-01',
    created_at: '2024-04-01T00:00:00Z',
  },
  {
    id: 'user-fe-7',
    org_id: ORG.id,
    role: 'fe',
    full_name: 'Riley Jackson',
    email: 'riley@crispgreen.com',
    location_id: 'loc-mall',
    avatar_url: null,
    skills: [
      { name: 'Food Prep', level: 80, category: 'Operations' },
      { name: 'Customer Service', level: 75, category: 'Service' },
      { name: 'Inventory Management', level: 65, category: 'Operations' },
    ],
    certifications: [
      { name: 'ServSafe Food Handler', status: 'active', expires_at: '2027-08-01', completed_at: '2024-08-01' },
    ],
    hire_date: '2024-02-15',
    created_at: '2024-02-15T00:00:00Z',
  },
]

// =============================================
// TODAY'S DATE (for seed consistency)
// =============================================
const TODAY = new Date().toISOString().split('T')[0]

// =============================================
// SHIFTS
// =============================================
export const shifts: Shift[] = [
  // Downtown - Morning
  {
    id: 'shift-dt-am',
    location_id: 'loc-downtown',
    date: TODAY,
    start_time: '06:00',
    end_time: '14:00',
    status: 'active',
    notes: null,
    created_at: '2026-04-01T00:00:00Z',
  },
  // Downtown - Evening
  {
    id: 'shift-dt-pm',
    location_id: 'loc-downtown',
    date: TODAY,
    start_time: '14:00',
    end_time: '22:00',
    status: 'scheduled',
    notes: null,
    created_at: '2026-04-01T00:00:00Z',
  },
  // Airport - Morning
  {
    id: 'shift-ap-am',
    location_id: 'loc-airport',
    date: TODAY,
    start_time: '05:00',
    end_time: '13:00',
    status: 'active',
    notes: null,
    created_at: '2026-04-01T00:00:00Z',
  },
  // Airport - Evening
  {
    id: 'shift-ap-pm',
    location_id: 'loc-airport',
    date: TODAY,
    start_time: '13:00',
    end_time: '21:00',
    status: 'scheduled',
    notes: null,
    created_at: '2026-04-01T00:00:00Z',
  },
  // Mall - Full day
  {
    id: 'shift-ml-am',
    location_id: 'loc-mall',
    date: TODAY,
    start_time: '10:00',
    end_time: '18:00',
    status: 'active',
    notes: null,
    created_at: '2026-04-01T00:00:00Z',
  },
]

// =============================================
// SHIFT ASSIGNMENTS
// =============================================
export const shiftAssignments: ShiftAssignment[] = [
  { id: 'sa-1', shift_id: 'shift-dt-am', profile_id: 'user-fe-1', role_in_shift: 'Line Cook', created_at: '2026-04-01T00:00:00Z' },
  { id: 'sa-2', shift_id: 'shift-dt-am', profile_id: 'user-fe-2', role_in_shift: 'Lead / Trainer', created_at: '2026-04-01T00:00:00Z' },
  { id: 'sa-3', shift_id: 'shift-ap-am', profile_id: 'user-fe-3', role_in_shift: 'Line Cook', created_at: '2026-04-01T00:00:00Z' },
  { id: 'sa-4', shift_id: 'shift-ap-am', profile_id: 'user-fe-4', role_in_shift: 'Counter Service', created_at: '2026-04-01T00:00:00Z' },
  { id: 'sa-5', shift_id: 'shift-ap-am', profile_id: 'user-fe-5', role_in_shift: 'Prep Cook', created_at: '2026-04-01T00:00:00Z' },
  { id: 'sa-6', shift_id: 'shift-ml-am', profile_id: 'user-fe-6', role_in_shift: 'Line Cook', created_at: '2026-04-01T00:00:00Z' },
  { id: 'sa-7', shift_id: 'shift-ml-am', profile_id: 'user-fe-7', role_in_shift: 'Counter Service', created_at: '2026-04-01T00:00:00Z' },
]

// =============================================
// TASKS
// =============================================
export const tasks: Task[] = [
  // --- Downtown Morning Tasks (Alex Thompson - user-fe-1) ---
  {
    id: 'task-1', shift_id: 'shift-dt-am', location_id: 'loc-downtown',
    title: 'Morning prep: chop vegetables', description: 'Prep all vegetables for lunch service per the daily prep sheet',
    standard: 'All items within 2mm variance of spec. Completed by 8:00 AM.',
    category: 'Food Prep', priority: 'high', assigned_to: 'user-fe-1',
    status: 'completed', quality_score: 95, completed_at: new Date(Date.now() - 3600000).toISOString(), due_by: '08:00',
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'task-2', shift_id: 'shift-dt-am', location_id: 'loc-downtown',
    title: 'Check cooler temperatures', description: 'Record all cooler and freezer temperatures on the food safety log',
    standard: 'All units within safe range (cooler: 33-40°F, freezer: 0°F or below).',
    category: 'Food Safety', priority: 'critical', assigned_to: 'user-fe-1',
    status: 'completed', quality_score: 100, completed_at: new Date(Date.now() - 5400000).toISOString(), due_by: '06:30',
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'task-3', shift_id: 'shift-dt-am', location_id: 'loc-downtown',
    title: 'Restock front-of-house supplies', description: 'Restock napkins, utensils, condiments, and cups',
    standard: 'All stations fully stocked before 11:00 AM rush.',
    category: 'Operations', priority: 'medium', assigned_to: 'user-fe-1',
    status: 'completed', quality_score: 90, completed_at: new Date(Date.now() - 1800000).toISOString(), due_by: '11:00',
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'task-4', shift_id: 'shift-dt-am', location_id: 'loc-downtown',
    title: 'Lunch service: salad station', description: 'Run the salad assembly station during lunch rush',
    standard: 'Orders assembled within 3 minutes. Accuracy 98%+.',
    category: 'Service', priority: 'high', assigned_to: 'user-fe-1',
    status: 'in_progress', quality_score: null, completed_at: null, due_by: '13:00',
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'task-5', shift_id: 'shift-dt-am', location_id: 'loc-downtown',
    title: 'Clean and sanitize prep area', description: 'Full clean and sanitize of all prep surfaces and equipment',
    standard: 'All surfaces sanitized per health code. Checklist completed.',
    category: 'Cleaning', priority: 'high', assigned_to: 'user-fe-1',
    status: 'pending', quality_score: null, completed_at: null, due_by: '13:30',
    created_at: '2026-04-01T00:00:00Z',
  },
  // --- Airport Morning Tasks (Jordan Lee - user-fe-3) - more issues ---
  {
    id: 'task-6', shift_id: 'shift-ap-am', location_id: 'loc-airport',
    title: 'Morning prep: chop vegetables', description: 'Prep all vegetables for service per the daily prep sheet',
    standard: 'All items within 2mm variance of spec. Completed by 7:00 AM.',
    category: 'Food Prep', priority: 'high', assigned_to: 'user-fe-3',
    status: 'completed', quality_score: 62, completed_at: new Date(Date.now() - 2700000).toISOString(), due_by: '07:00',
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'task-7', shift_id: 'shift-ap-am', location_id: 'loc-airport',
    title: 'Check cooler temperatures', description: 'Record all cooler and freezer temperatures on the food safety log',
    standard: 'All units within safe range.',
    category: 'Food Safety', priority: 'critical', assigned_to: 'user-fe-3',
    status: 'flagged', quality_score: 40, completed_at: null, due_by: '05:30',
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'task-8', shift_id: 'shift-ap-am', location_id: 'loc-airport',
    title: 'Restock front-of-house supplies', description: 'Restock napkins, utensils, condiments, and cups',
    standard: 'All stations fully stocked before morning rush.',
    category: 'Operations', priority: 'medium', assigned_to: 'user-fe-4',
    status: 'pending', quality_score: null, completed_at: null, due_by: '07:00',
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'task-9', shift_id: 'shift-ap-am', location_id: 'loc-airport',
    title: 'Service: salad station', description: 'Run the salad assembly station during morning rush',
    standard: 'Orders assembled within 3 minutes. Accuracy 98%+.',
    category: 'Service', priority: 'high', assigned_to: 'user-fe-3',
    status: 'pending', quality_score: null, completed_at: null, due_by: '12:00',
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'task-10', shift_id: 'shift-ap-am', location_id: 'loc-airport',
    title: 'Inventory count: dry goods', description: 'Count all dry goods and update inventory system',
    standard: 'Counts accurate within 2%. Submitted before end of shift.',
    category: 'Inventory', priority: 'medium', assigned_to: 'user-fe-5',
    status: 'pending', quality_score: null, completed_at: null, due_by: '12:30',
    created_at: '2026-04-01T00:00:00Z',
  },
  // --- Mall Tasks ---
  {
    id: 'task-11', shift_id: 'shift-ml-am', location_id: 'loc-mall',
    title: 'Morning prep: grain bowls', description: 'Prep all grain bowl components',
    standard: 'All components ready by 11:00 AM. Portions within spec.',
    category: 'Food Prep', priority: 'high', assigned_to: 'user-fe-6',
    status: 'completed', quality_score: 85, completed_at: new Date(Date.now() - 3600000).toISOString(), due_by: '11:00',
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'task-12', shift_id: 'shift-ml-am', location_id: 'loc-mall',
    title: 'Lunch service: counter', description: 'Handle counter orders and payments during lunch',
    standard: 'Average order time under 4 minutes. Accuracy 95%+.',
    category: 'Service', priority: 'high', assigned_to: 'user-fe-7',
    status: 'in_progress', quality_score: null, completed_at: null, due_by: '15:00',
    created_at: '2026-04-01T00:00:00Z',
  },
]

// =============================================
// PLAYBOOKS
// =============================================
const foodSafetyContent: PlaybookContent = {
  steps: [
    { title: 'Check hand washing station', instructions: 'Verify soap, hot water, and paper towels are stocked at all hand washing stations.', tips: ['Check every 2 hours during service'] },
    { title: 'Record cooler temperatures', instructions: 'Use calibrated thermometer. Record on the food safety log. Coolers must be 33-40°F. Freezers must be 0°F or below.', tips: ['If out of range, notify manager immediately', 'Do not store food in out-of-range units'] },
    { title: 'Check food date labels', instructions: 'Verify all prepped food has date labels. Discard anything past its use-by date.', tips: ['FIFO: First In, First Out', 'When in doubt, throw it out'] },
    { title: 'Sanitize prep surfaces', instructions: 'Use approved sanitizer solution at correct concentration. Wipe all surfaces. Air dry.', tips: ['Test sanitizer concentration with test strips', 'Change sanitizer solution every 2 hours'] },
    { title: 'Verify cooking temperatures', instructions: 'Use probe thermometer to verify internal temperatures meet minimum requirements for each protein.', tips: ['Chicken: 165°F', 'Ground beef: 155°F', 'Fish: 145°F'] },
  ],
  quiz: [
    { question: 'What is the safe temperature range for a walk-in cooler?', options: ['25-32°F', '33-40°F', '41-50°F', '28-35°F'], correct: 1, explanation: 'Walk-in coolers must maintain 33-40°F to prevent bacterial growth while avoiding freezing.' },
    { question: 'How often should sanitizer solution be changed during service?', options: ['Every hour', 'Every 2 hours', 'Every 4 hours', 'Once per shift'], correct: 1, explanation: 'Sanitizer concentration drops over time. Replace every 2 hours to maintain effectiveness.' },
    { question: 'What is the minimum internal temperature for cooked chicken?', options: ['145°F', '155°F', '165°F', '175°F'], correct: 2, explanation: 'Chicken must reach 165°F internal temperature to kill harmful bacteria like Salmonella.' },
  ],
  key_takeaways: [
    'Temperature control is the #1 food safety defense',
    'When in doubt, throw it out — never serve questionable food',
    'Hand washing prevents 80% of foodborne illness transmission',
  ],
}

const customerServiceContent: PlaybookContent = {
  steps: [
    { title: 'Greet every customer', instructions: 'Make eye contact and greet within 5 seconds of approach. Use a warm, genuine tone.', tips: ['Smile first, speak second', 'Use their name if you know it'] },
    { title: 'Clarify the order', instructions: 'Repeat the order back to the customer. Confirm any modifications or allergies.', tips: ['Ask about allergies proactively', 'Never assume — always confirm'] },
    { title: 'Assemble with care', instructions: 'Follow the build spec exactly. Present the order neatly.', tips: ['Portion accuracy matters for food cost AND customer satisfaction'] },
    { title: 'Handle complaints gracefully', instructions: 'Listen fully. Apologize sincerely. Fix the issue immediately. Offer something extra if appropriate.', tips: ['Never argue', 'Empower yourself: you can remake any order without manager approval'] },
  ],
  quiz: [
    { question: 'Within how many seconds should you greet a customer?', options: ['3 seconds', '5 seconds', '10 seconds', '15 seconds'], correct: 1, explanation: 'Greeting within 5 seconds shows the customer they are noticed and valued.' },
    { question: 'What should you do first when a customer complains?', options: ['Apologize', 'Listen fully', 'Get a manager', 'Offer a refund'], correct: 1, explanation: 'Listening fully shows respect and helps you understand the real issue before responding.' },
  ],
  key_takeaways: [
    'Every interaction is a chance to create a repeat customer',
    'Speed matters, but accuracy matters more',
    'You have the power to fix problems — use it',
  ],
}

const newHireContent: PlaybookContent = {
  steps: [
    { title: 'Welcome and orientation', instructions: 'Tour the location. Introduce the team. Show locker room, break area, and emergency exits.', tips: ['Pair new hires with a buddy for their first week'] },
    { title: 'Safety basics', instructions: 'Review fire exits, first aid kit location, injury reporting process, and key safety protocols.', tips: ['Have them locate all safety equipment themselves'] },
    { title: 'Systems training', instructions: 'Show how to clock in/out, view schedule, submit time-off requests, and access the task list.', tips: ['Let them practice on their own device'] },
    { title: 'Station shadowing', instructions: 'New hire shadows an experienced team member at each station for at least 30 minutes.', tips: ['Rotate through all stations in the first week'] },
    { title: 'First solo tasks', instructions: 'Assign simple, low-risk tasks and provide immediate feedback.', tips: ['Start with prep and cleaning before service tasks', 'Celebrate early wins'] },
  ],
  quiz: [
    { question: 'What should a new hire do on their first day?', options: ['Jump into service immediately', 'Shadow experienced team members', 'Study the menu alone', 'Watch training videos all day'], correct: 1, explanation: 'Shadowing provides context and builds confidence before solo work.' },
  ],
  key_takeaways: [
    'First impressions matter — a great first week reduces turnover by 50%',
    'Hands-on learning beats passive training every time',
    'Check in with new hires daily for the first two weeks',
  ],
}

export const playbooks: Playbook[] = [
  {
    id: 'pb-food-safety',
    org_id: ORG.id,
    title: 'Food Safety Essentials',
    description: 'Daily food safety procedures every team member must follow',
    scope: 'org',
    target_roles: ['fe'],
    content: foodSafetyContent,
    version: 3,
    status: 'published',
    created_by: 'user-ld',
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
    completion_rate: 78,
    avg_score: 82,
    effectiveness_score: 75,
  },
  {
    id: 'pb-customer-service',
    org_id: ORG.id,
    title: 'Customer Service Excellence',
    description: 'How to deliver exceptional customer experiences at every touchpoint',
    scope: 'org',
    target_roles: ['fe'],
    content: customerServiceContent,
    version: 2,
    status: 'published',
    created_by: 'user-ld',
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2025-11-01T00:00:00Z',
    completion_rate: 65,
    avg_score: 79,
    effectiveness_score: 70,
  },
  {
    id: 'pb-new-hire',
    org_id: ORG.id,
    title: 'New Hire Onboarding',
    description: 'First-week onboarding checklist and training for all new team members',
    scope: 'org',
    target_roles: ['fe'],
    content: newHireContent,
    version: 4,
    status: 'published',
    created_by: 'user-ld',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
    completion_rate: 92,
    avg_score: 88,
    effectiveness_score: 82,
  },
]

// =============================================
// PLAYBOOK COMPLETIONS
// =============================================
export const playbookCompletions: PlaybookCompletion[] = [
  // Downtown employees - high scores
  { id: 'pc-1', playbook_id: 'pb-food-safety', profile_id: 'user-fe-1', score: 95, completed_at: '2026-03-15T10:00:00Z', time_spent_seconds: 420 },
  { id: 'pc-2', playbook_id: 'pb-customer-service', profile_id: 'user-fe-1', score: 90, completed_at: '2026-03-20T11:00:00Z', time_spent_seconds: 360 },
  { id: 'pc-3', playbook_id: 'pb-food-safety', profile_id: 'user-fe-2', score: 98, completed_at: '2026-03-14T09:00:00Z', time_spent_seconds: 300 },
  { id: 'pc-4', playbook_id: 'pb-customer-service', profile_id: 'user-fe-2', score: 92, completed_at: '2026-03-18T10:00:00Z', time_spent_seconds: 330 },
  { id: 'pc-5', playbook_id: 'pb-new-hire', profile_id: 'user-fe-1', score: 100, completed_at: '2023-08-20T14:00:00Z', time_spent_seconds: 480 },
  // Airport employees - lower scores, some incomplete
  { id: 'pc-6', playbook_id: 'pb-food-safety', profile_id: 'user-fe-3', score: 60, completed_at: '2026-03-25T09:00:00Z', time_spent_seconds: 600 },
  { id: 'pc-7', playbook_id: 'pb-new-hire', profile_id: 'user-fe-3', score: 72, completed_at: '2025-11-08T10:00:00Z', time_spent_seconds: 540 },
  { id: 'pc-8', playbook_id: 'pb-new-hire', profile_id: 'user-fe-4', score: 65, completed_at: '2026-01-22T11:00:00Z', time_spent_seconds: 660 },
  // Mall employees - average
  { id: 'pc-9', playbook_id: 'pb-food-safety', profile_id: 'user-fe-6', score: 82, completed_at: '2026-03-10T09:00:00Z', time_spent_seconds: 400 },
  { id: 'pc-10', playbook_id: 'pb-customer-service', profile_id: 'user-fe-6', score: 80, completed_at: '2026-03-12T10:00:00Z', time_spent_seconds: 380 },
  { id: 'pc-11', playbook_id: 'pb-food-safety', profile_id: 'user-fe-7', score: 85, completed_at: '2026-03-11T09:30:00Z', time_spent_seconds: 390 },
]

// =============================================
// PULSE METRICS
// =============================================
export const pulseMetrics: PulseMetric[] = [
  // --- Downtown (high performing) ---
  { id: 'pm-dt-1', location_id: 'loc-downtown', date: TODAY, metric_name: 'task_completion_rate', actual: 94, target: 95, trend: 'up', period: 'daily', created_at: TODAY },
  { id: 'pm-dt-2', location_id: 'loc-downtown', date: TODAY, metric_name: 'labor_cost_percent', actual: 28, target: 30, trend: 'down', period: 'daily', created_at: TODAY },
  { id: 'pm-dt-3', location_id: 'loc-downtown', date: TODAY, metric_name: 'customer_satisfaction', actual: 4.6, target: 4.5, trend: 'up', period: 'daily', created_at: TODAY },
  { id: 'pm-dt-4', location_id: 'loc-downtown', date: TODAY, metric_name: 'quality_score', actual: 92, target: 90, trend: 'up', period: 'daily', created_at: TODAY },
  { id: 'pm-dt-5', location_id: 'loc-downtown', date: TODAY, metric_name: 'schedule_adherence', actual: 96, target: 95, trend: 'flat', period: 'daily', created_at: TODAY },
  { id: 'pm-dt-6', location_id: 'loc-downtown', date: TODAY, metric_name: 'compliance_rate', actual: 98, target: 98, trend: 'flat', period: 'daily', created_at: TODAY },

  // --- Mall (average) ---
  { id: 'pm-ml-1', location_id: 'loc-mall', date: TODAY, metric_name: 'task_completion_rate', actual: 84, target: 95, trend: 'flat', period: 'daily', created_at: TODAY },
  { id: 'pm-ml-2', location_id: 'loc-mall', date: TODAY, metric_name: 'labor_cost_percent', actual: 33, target: 30, trend: 'up', period: 'daily', created_at: TODAY },
  { id: 'pm-ml-3', location_id: 'loc-mall', date: TODAY, metric_name: 'customer_satisfaction', actual: 4.1, target: 4.5, trend: 'flat', period: 'daily', created_at: TODAY },
  { id: 'pm-ml-4', location_id: 'loc-mall', date: TODAY, metric_name: 'quality_score', actual: 81, target: 90, trend: 'down', period: 'daily', created_at: TODAY },
  { id: 'pm-ml-5', location_id: 'loc-mall', date: TODAY, metric_name: 'schedule_adherence', actual: 88, target: 95, trend: 'flat', period: 'daily', created_at: TODAY },
  { id: 'pm-ml-6', location_id: 'loc-mall', date: TODAY, metric_name: 'compliance_rate', actual: 91, target: 98, trend: 'down', period: 'daily', created_at: TODAY },

  // --- Airport (underperforming) ---
  { id: 'pm-ap-1', location_id: 'loc-airport', date: TODAY, metric_name: 'task_completion_rate', actual: 72, target: 95, trend: 'down', period: 'daily', created_at: TODAY },
  { id: 'pm-ap-2', location_id: 'loc-airport', date: TODAY, metric_name: 'labor_cost_percent', actual: 38, target: 30, trend: 'up', period: 'daily', created_at: TODAY },
  { id: 'pm-ap-3', location_id: 'loc-airport', date: TODAY, metric_name: 'customer_satisfaction', actual: 3.4, target: 4.5, trend: 'down', period: 'daily', created_at: TODAY },
  { id: 'pm-ap-4', location_id: 'loc-airport', date: TODAY, metric_name: 'quality_score', actual: 68, target: 90, trend: 'down', period: 'daily', created_at: TODAY },
  { id: 'pm-ap-5', location_id: 'loc-airport', date: TODAY, metric_name: 'schedule_adherence', actual: 76, target: 95, trend: 'down', period: 'daily', created_at: TODAY },
  { id: 'pm-ap-6', location_id: 'loc-airport', date: TODAY, metric_name: 'compliance_rate', actual: 82, target: 98, trend: 'down', period: 'daily', created_at: TODAY },
]

// =============================================
// PULSE DIAGNOSES (pre-seeded for Airport)
// =============================================
export const pulseDiagnoses: PulseDiagnosis[] = [
  {
    id: 'pd-1',
    pulse_metric_id: 'pm-ap-1',
    diagnosis: 'Task completion rate at Airport Terminal 2 is 72% vs 95% target. Root causes: (1) 3 of 5 team members hired within the last 6 months with limited training completion — only 1 has completed Food Safety playbook. (2) Morning prep tasks are taking 40% longer than Downtown benchmarks, suggesting skill gaps in food prep procedures. (3) One critical food safety task was flagged (cooler temperature check), indicating process adherence issues.',
    recommended_actions: [
      { action: 'Enroll all Airport staff in Food Safety Essentials playbook with deadline this week', impact: 'high', effort: 'low', owner: 'L&D / Location Manager', timeline: '1 week' },
      { action: 'Pair new hires with experienced Downtown staff for 2-day cross-training', impact: 'high', effort: 'medium', owner: 'Location Manager', timeline: '2 weeks' },
      { action: 'Implement daily 5-minute pre-shift huddle to review task priorities and standards', impact: 'medium', effort: 'low', owner: 'Location Manager', timeline: 'Immediate' },
    ],
    confidence: 0.87,
    created_at: TODAY,
  },
  {
    id: 'pd-2',
    pulse_metric_id: 'pm-ap-4',
    diagnosis: 'Quality score at Airport is 68% vs 90% target. Root causes: (1) Food prep quality scores averaging 51% for the two newest hires (Jordan and Sam) — both have less than 6 months tenure. (2) Customer Service playbook has 0% completion at this location — no employee has been trained. (3) The flagged cooler temperature task suggests food safety protocols are not being followed consistently, which directly impacts food quality.',
    recommended_actions: [
      { action: 'Deploy Customer Service Excellence playbook to all Airport staff immediately', impact: 'high', effort: 'low', owner: 'L&D', timeline: '1 week' },
      { action: 'Schedule bi-weekly quality audits at Airport with results shared in team huddle', impact: 'medium', effort: 'medium', owner: 'Location Manager', timeline: '2 weeks' },
      { action: 'Create a mentorship pairing: assign Maria Santos (Downtown, quality score 95+) as remote mentor for Airport prep team', impact: 'high', effort: 'medium', owner: 'L&D / Ops', timeline: '1 week' },
    ],
    confidence: 0.82,
    created_at: TODAY,
  },
]

// =============================================
// INTERVENTIONS
// =============================================
export const interventions: Intervention[] = [
  {
    id: 'int-1',
    org_id: ORG.id,
    location_id: 'loc-airport',
    type: 'training',
    description: 'Emergency food safety training rollout for Airport team',
    target_population: { location_ids: ['loc-airport'], roles: ['fe'] },
    expected_outcome: 'Increase food safety compliance from 82% to 95% within 4 weeks',
    started_at: '2026-03-25T00:00:00Z',
    created_by: 'user-ld',
    created_at: '2026-03-25T00:00:00Z',
    metrics_before: { compliance_rate: 78, quality_score: 64 },
    metrics_after: { compliance_rate: 82, quality_score: 68 },
  },
  {
    id: 'int-2',
    org_id: ORG.id,
    location_id: 'loc-mall',
    type: 'process',
    description: 'Implemented pre-shift huddle protocol at Mall location',
    target_population: { location_ids: ['loc-mall'], roles: ['fe'] },
    expected_outcome: 'Improve task completion rate from 80% to 90% within 3 weeks',
    started_at: '2026-03-15T00:00:00Z',
    created_by: 'user-mgr-mall',
    created_at: '2026-03-15T00:00:00Z',
    metrics_before: { task_completion_rate: 80 },
    metrics_after: { task_completion_rate: 84 },
  },
  {
    id: 'int-3',
    org_id: ORG.id,
    location_id: null,
    type: 'training',
    description: 'Organization-wide Customer Service Excellence training refresh',
    target_population: { roles: ['fe'] },
    expected_outcome: 'Increase average customer satisfaction from 4.0 to 4.5 across all locations',
    started_at: '2026-02-01T00:00:00Z',
    created_by: 'user-ld',
    created_at: '2026-02-01T00:00:00Z',
    metrics_before: { customer_satisfaction: 4.0 },
    metrics_after: { customer_satisfaction: 4.2 },
  },
]

// =============================================
// DEMO USERS (for login page)
// =============================================
export const DEMO_USERS = [
  { id: 'user-fe-1', name: 'Alex Thompson', role: 'fe' as Role, location: 'Downtown', description: 'Frontline Employee' },
  { id: 'user-fe-3', name: 'Jordan Lee', role: 'fe' as Role, location: 'Airport', description: 'Frontline Employee (new hire)' },
  { id: 'user-mgr-airport', name: 'David Kim', role: 'lm' as Role, location: 'Airport', description: 'Location Manager' },
  { id: 'user-mgr-downtown', name: 'Elena Rodriguez', role: 'lm' as Role, location: 'Downtown', description: 'Location Manager' },
  { id: 'user-ld', name: 'Sarah Chen', role: 'ld' as Role, location: 'All locations', description: 'L&D Executive' },
  { id: 'user-ops', name: 'Marcus Johnson', role: 'ops' as Role, location: 'All locations', description: 'Operations Executive' },
]
