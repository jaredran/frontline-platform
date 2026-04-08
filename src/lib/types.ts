// Core domain types mapping to the 6 objects in the conceptual model

export type Role = 'fe' | 'lm' | 'ld' | 'ops'

export type ShiftStatus = 'scheduled' | 'active' | 'completed'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'flagged'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type PlaybookStatus = 'draft' | 'published' | 'archived'
export type Trend = 'up' | 'down' | 'flat'
export type InterventionType = 'training' | 'process' | 'schedule' | 'coaching'

// --- PERSON ---
export interface Profile {
  id: string
  org_id: string
  role: Role
  full_name: string
  email: string
  location_id: string | null
  avatar_url: string | null
  skills: Skill[]
  certifications: Certification[]
  hire_date: string
  created_at: string
}

export interface Skill {
  name: string
  level: number // 0-100
  category: string
}

export interface Certification {
  name: string
  status: 'active' | 'expiring' | 'expired'
  expires_at: string | null
  completed_at: string
}

// --- LOCATION ---
export interface Location {
  id: string
  org_id: string
  name: string
  type: string
  address: string
  manager_id: string | null
  timezone: string
  created_at: string
  // Joined
  manager?: Profile
  pulse_metrics?: PulseMetric[]
}

// --- SHIFT ---
export interface Shift {
  id: string
  location_id: string
  date: string
  start_time: string
  end_time: string
  status: ShiftStatus
  notes: string | null
  created_at: string
  // Joined
  assignments?: ShiftAssignment[]
  tasks?: Task[]
  location?: Location
}

export interface ShiftAssignment {
  id: string
  shift_id: string
  profile_id: string
  role_in_shift: string
  created_at: string
  // Joined
  profile?: Profile
}

// --- TASK ---
export interface Task {
  id: string
  shift_id: string | null
  location_id: string
  title: string
  description: string | null
  standard: string | null
  category: string
  priority: TaskPriority
  assigned_to: string | null
  status: TaskStatus
  quality_score: number | null
  completed_at: string | null
  due_by: string | null
  created_at: string
  // Joined
  assignee?: Profile
  playbook_step?: PlaybookStep | null
}

export interface PlaybookStep {
  title: string
  instructions: string
  tips: string[]
}

// --- PLAYBOOK ---
export interface Playbook {
  id: string
  org_id: string
  title: string
  description: string | null
  scope: 'role' | 'location' | 'org'
  target_roles: string[]
  content: PlaybookContent
  version: number
  status: PlaybookStatus
  created_by: string | null
  created_at: string
  updated_at: string
  // Computed
  completion_rate?: number
  avg_score?: number
  effectiveness_score?: number
}

export interface PlaybookContent {
  steps: {
    title: string
    instructions: string
    tips: string[]
  }[]
  quiz: {
    question: string
    options: string[]
    correct: number
    explanation: string
  }[]
  key_takeaways: string[]
}

export interface PlaybookCompletion {
  id: string
  playbook_id: string
  profile_id: string
  score: number
  completed_at: string
  time_spent_seconds: number
  // Joined
  profile?: Profile
  playbook?: Playbook
}

// --- PULSE ---
export interface PulseMetric {
  id: string
  location_id: string
  date: string
  metric_name: string
  actual: number
  target: number
  trend: Trend
  period: 'daily' | 'weekly' | 'monthly'
  created_at: string
  // Joined
  diagnosis?: PulseDiagnosis | null
  location?: Location
}

export interface PulseDiagnosis {
  id: string
  pulse_metric_id: string
  diagnosis: string
  recommended_actions: RecommendedAction[]
  confidence: number
  created_at: string
}

export interface RecommendedAction {
  action: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  owner: string
  timeline: string
}

// --- INTERVENTION (Attribution) ---
export interface Intervention {
  id: string
  org_id: string
  location_id: string | null
  type: InterventionType
  description: string
  target_population: {
    roles?: string[]
    location_ids?: string[]
    profile_ids?: string[]
  }
  expected_outcome: string | null
  started_at: string
  created_by: string | null
  created_at: string
  // Computed
  actual_outcome?: string
  metrics_before?: Record<string, number>
  metrics_after?: Record<string, number>
  location?: Location
}

// --- METRIC HISTORY (Attribution) ---
export interface MetricHistoryPoint {
  date: string
  value: number
}

export interface MetricTimeSeries {
  locationId: string
  metricName: string
  points: MetricHistoryPoint[]
}

// --- KNOWLEDGE SURFACING ---
export interface RelevantPlaybook {
  playbook: Playbook
  score: number | null
  completed: boolean
  needsReinforcement: boolean
}

// --- AI ---
export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIContext {
  role: Role
  location_id?: string
  shift_id?: string
  task_id?: string
  page: string
}

// --- CREDITS ---
export type PlanTier = 'free' | 'location_pro' | 'multi_location' | 'enterprise'

export interface OrgCredits {
  org_id: string
  plan: PlanTier
  credits_total: number
  credits_used: number
  credits_reset_at: string
}

export type AIActionType = 'briefing' | 'diagnosis' | 'action_plan' | 'playbook_generation' | 'content_revision' | 'task_help' | 'ask' | 'setup'

export const AI_CREDIT_COSTS: Record<AIActionType, number> = {
  briefing: 1,
  diagnosis: 2,
  action_plan: 3,
  playbook_generation: 3,
  content_revision: 2,
  task_help: 0,
  ask: 1,
  setup: 0, // free — it's the hook
}

// --- RESULTS FEE ---
export interface ResultsFee {
  intervention_id: string
  metric_name: string
  improvement_points: number
  rate_per_point: number
  fee: number
  estimated_value: number
}

// --- LM PROGRESS ---
export type LMProgressStep = 'invite_team' | 'create_playbook' | 'review_pulse' | 'take_action' | 'track_results' | 'complete'

// --- ONBOARDING (landing page hero) ---
export interface GeneratedLocationSetup {
  location_name: string
  industry: string
  employee_count: number
  hours: string
  diagnosis: {
    root_causes: { cause: string; reasoning: string; confidence: string }[]
    estimated_pulse: { metric_name: string; estimated_value: number; target: number; status: string }[]
    recommended_actions: { action: string; expected_impact: string; timeline: string }[]
  }
  task_templates: { title: string; category: string; description: string; priority: TaskPriority }[]
  playbook_topics: string[]
}

// --- PULSE METRIC NAMES ---
export const PULSE_METRICS = {
  task_completion_rate: { label: 'Task Completion', unit: '%', format: 'percent' },
  labor_cost_percent: { label: 'Labor Cost', unit: '%', format: 'percent' },
  customer_satisfaction: { label: 'Customer Satisfaction', unit: '/5', format: 'score' },
  quality_score: { label: 'Quality Score', unit: '%', format: 'percent' },
  schedule_adherence: { label: 'Schedule Adherence', unit: '%', format: 'percent' },
  compliance_rate: { label: 'Compliance Rate', unit: '%', format: 'percent' },
} as const

export type PulseMetricName = keyof typeof PULSE_METRICS
