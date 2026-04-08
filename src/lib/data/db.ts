// Async Supabase data layer
// Mirrors store.ts function signatures but all async

import { createClient } from '@/lib/supabase/client'
import type {
  Profile, Location, Shift, Task, Playbook, PulseMetric,
  Intervention, PlaybookCompletion, Role,
  MetricTimeSeries, RelevantPlaybook, AIActionType, OrgCredits, ResultsFee,
  LMProgressStep,
} from '../types'
import { AI_CREDIT_COSTS } from '../types'

export const ORG = {
  id: 'org-1',
  name: 'Crisp & Green',
  industry: 'Quick Service Restaurant',
}

export const TASK_PLAYBOOK_MAP: Record<string, string> = {
  'Food Prep': 'pb-food-safety',
  'Food Safety': 'pb-food-safety',
  'Cleaning': 'pb-food-safety',
  'Service': 'pb-customer-service',
}

// ─── Profiles ────────────────────────────────────────────────

export async function getProfile(id: string): Promise<Profile | undefined> {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
  return data ?? undefined
}

export async function getProfilesByLocation(locationId: string): Promise<Profile[]> {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('*').eq('location_id', locationId)
  return data ?? []
}

export async function getProfilesByRole(role: Role): Promise<Profile[]> {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('*').eq('role', role)
  return data ?? []
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('*')
  return data ?? []
}

// ─── Locations ────────────────────────────────────────────────

export async function getLocation(id: string): Promise<Location | undefined> {
  const supabase = createClient()
  const { data: loc } = await supabase.from('locations').select('*').eq('id', id).single()
  if (!loc) return undefined
  const [{ data: manager }, { data: metrics }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', loc.manager_id ?? '').single(),
    supabase.from('pulse_metrics').select('*').eq('location_id', id),
  ])
  return {
    ...loc,
    manager: manager ?? undefined,
    pulse_metrics: metrics ?? [],
  }
}

export async function getAllLocations(): Promise<Location[]> {
  const supabase = createClient()
  const { data: locs } = await supabase.from('locations').select('*')
  if (!locs) return []

  const [{ data: allProfiles }, { data: allMetrics }] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('pulse_metrics').select('*'),
  ])

  const profiles = allProfiles ?? []
  const metrics = allMetrics ?? []

  return locs.map(loc => ({
    ...loc,
    manager: profiles.find((p: Profile) => p.id === loc.manager_id),
    pulse_metrics: metrics.filter((m: PulseMetric) => m.location_id === loc.id),
  }))
}

// ─── Shifts ────────────────────────────────────────────────

async function enrichShift(shift: Shift): Promise<Shift> {
  const supabase = createClient()
  const [{ data: assignments }, { data: tasks }, { data: location }] = await Promise.all([
    supabase.from('shift_assignments').select('*').eq('shift_id', shift.id),
    supabase.from('tasks').select('*').eq('shift_id', shift.id),
    supabase.from('locations').select('*').eq('id', shift.location_id).single(),
  ])

  const allProfileIds = (assignments ?? []).map((a: { profile_id: string }) => a.profile_id)
  let profileMap: Record<string, Profile> = {}
  if (allProfileIds.length > 0) {
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', allProfileIds)
    for (const p of (profiles ?? [])) profileMap[p.id] = p
  }

  const assignedToIds = (tasks ?? []).filter((t: Task) => t.assigned_to).map((t: Task) => t.assigned_to as string)
  if (assignedToIds.length > 0) {
    const { data: assignees } = await supabase.from('profiles').select('*').in('id', assignedToIds)
    for (const p of (assignees ?? [])) profileMap[p.id] = p
  }

  return {
    ...shift,
    assignments: (assignments ?? []).map((a: { id: string; shift_id: string; profile_id: string; role_in_shift: string; created_at: string }) => ({
      ...a,
      profile: profileMap[a.profile_id],
    })),
    tasks: (tasks ?? []).map((t: Task) => ({
      ...t,
      assignee: t.assigned_to ? profileMap[t.assigned_to] : undefined,
    })),
    location: location ?? undefined,
  }
}

export async function getShift(id: string): Promise<Shift | undefined> {
  const supabase = createClient()
  const { data } = await supabase.from('shifts').select('*').eq('id', id).single()
  if (!data) return undefined
  return enrichShift(data)
}

export async function getShiftsByLocation(locationId: string, date?: string): Promise<Shift[]> {
  const supabase = createClient()
  let query = supabase.from('shifts').select('*').eq('location_id', locationId)
  if (date) query = query.eq('date', date)
  const { data } = await query
  if (!data) return []
  return Promise.all(data.map(enrichShift))
}

export async function getShiftsForEmployee(profileId: string, date?: string): Promise<Shift[]> {
  const supabase = createClient()
  const { data: assignments } = await supabase
    .from('shift_assignments')
    .select('shift_id')
    .eq('profile_id', profileId)
  if (!assignments || assignments.length === 0) return []

  const shiftIds = assignments.map((a: { shift_id: string }) => a.shift_id)
  let query = supabase.from('shifts').select('*').in('id', shiftIds)
  if (date) query = query.eq('date', date)
  const { data } = await query
  if (!data) return []
  return Promise.all(data.map(enrichShift))
}

// ─── Tasks ────────────────────────────────────────────────

async function enrichTask(task: Task): Promise<Task> {
  if (!task.assigned_to) return task
  const supabase = createClient()
  const { data: assignee } = await supabase.from('profiles').select('*').eq('id', task.assigned_to).single()
  return { ...task, assignee: assignee ?? undefined }
}

export async function getTask(id: string): Promise<Task | undefined> {
  const supabase = createClient()
  const { data } = await supabase.from('tasks').select('*').eq('id', id).single()
  if (!data) return undefined
  return enrichTask(data)
}

export async function getTasksForEmployee(profileId: string): Promise<Task[]> {
  const supabase = createClient()
  const { data } = await supabase.from('tasks').select('*').eq('assigned_to', profileId)
  if (!data) return []
  return Promise.all(data.map(enrichTask))
}

export async function getTasksByShift(shiftId: string): Promise<Task[]> {
  const supabase = createClient()
  const { data } = await supabase.from('tasks').select('*').eq('shift_id', shiftId)
  if (!data) return []
  return Promise.all(data.map(enrichTask))
}

export async function getTasksByLocation(locationId: string): Promise<Task[]> {
  const supabase = createClient()
  const { data } = await supabase.from('tasks').select('*').eq('location_id', locationId)
  if (!data) return []
  return Promise.all(data.map(enrichTask))
}

export async function updateTaskStatus(
  taskId: string,
  status: Task['status'],
  qualityScore?: number
): Promise<Task | undefined> {
  const supabase = createClient()
  const updates: Partial<Task> = {
    status,
    quality_score: qualityScore,
    completed_at: status === 'completed' ? new Date().toISOString() : undefined,
  }
  const { data } = await supabase.from('tasks').update(updates).eq('id', taskId).select().single()
  if (!data) return undefined
  return enrichTask(data)
}

// ─── Playbooks ────────────────────────────────────────────────

export async function getPlaybook(id: string): Promise<Playbook | undefined> {
  const supabase = createClient()
  const { data } = await supabase.from('playbooks').select('*').eq('id', id).single()
  return data ?? undefined
}

export async function getAllPlaybooks(): Promise<Playbook[]> {
  const supabase = createClient()
  const { data } = await supabase.from('playbooks').select('*')
  return data ?? []
}

export async function getPlaybookCompletions(
  playbookId?: string,
  profileId?: string
): Promise<PlaybookCompletion[]> {
  const supabase = createClient()
  let query = supabase.from('playbook_completions').select('*')
  if (playbookId) query = query.eq('playbook_id', playbookId)
  if (profileId) query = query.eq('profile_id', profileId)
  const { data: completions } = await query
  if (!completions || completions.length === 0) return []

  const profileIds = [...new Set(completions.map((c: PlaybookCompletion) => c.profile_id))]
  const playbookIds = [...new Set(completions.map((c: PlaybookCompletion) => c.playbook_id))]

  const [{ data: profiles }, { data: playbooks }] = await Promise.all([
    supabase.from('profiles').select('*').in('id', profileIds),
    supabase.from('playbooks').select('*').in('id', playbookIds),
  ])

  const profileMap: Record<string, Profile> = {}
  for (const p of (profiles ?? [])) profileMap[p.id] = p
  const playbookMap: Record<string, Playbook> = {}
  for (const p of (playbooks ?? [])) playbookMap[p.id] = p

  return completions.map((c: PlaybookCompletion) => ({
    ...c,
    profile: profileMap[c.profile_id],
    playbook: playbookMap[c.playbook_id],
  }))
}

// ─── Pulse Metrics ────────────────────────────────────────────────

export async function getPulseMetrics(locationId: string): Promise<PulseMetric[]> {
  const supabase = createClient()
  const { data: metrics } = await supabase
    .from('pulse_metrics')
    .select('*')
    .eq('location_id', locationId)
  if (!metrics || metrics.length === 0) return []

  const metricIds = metrics.map((m: PulseMetric) => m.id)
  const [{ data: diagnoses }, { data: location }] = await Promise.all([
    supabase.from('pulse_diagnoses').select('*').in('pulse_metric_id', metricIds),
    supabase.from('locations').select('*').eq('id', locationId).single(),
  ])

  const diagMap: Record<string, unknown> = {}
  for (const d of (diagnoses ?? [])) diagMap[d.pulse_metric_id] = d

  return metrics.map((m: PulseMetric) => ({
    ...m,
    diagnosis: (diagMap[m.id] as PulseMetric['diagnosis']) ?? null,
    location: location ?? undefined,
  }))
}

export async function getPulseMetric(id: string): Promise<PulseMetric | undefined> {
  const supabase = createClient()
  const { data: pm } = await supabase.from('pulse_metrics').select('*').eq('id', id).single()
  if (!pm) return undefined

  const [{ data: diagnosis }, { data: location }] = await Promise.all([
    supabase.from('pulse_diagnoses').select('*').eq('pulse_metric_id', id).single(),
    supabase.from('locations').select('*').eq('id', pm.location_id).single(),
  ])

  return { ...pm, diagnosis: diagnosis ?? null, location: location ?? undefined }
}

export async function getAllPulseMetrics(): Promise<PulseMetric[]> {
  const supabase = createClient()
  const { data: metrics } = await supabase.from('pulse_metrics').select('*')
  if (!metrics || metrics.length === 0) return []

  const metricIds = metrics.map((m: PulseMetric) => m.id)
  const locationIds = [...new Set(metrics.map((m: PulseMetric) => m.location_id))]

  const [{ data: diagnoses }, { data: locations }] = await Promise.all([
    supabase.from('pulse_diagnoses').select('*').in('pulse_metric_id', metricIds),
    supabase.from('locations').select('*').in('id', locationIds),
  ])

  const diagMap: Record<string, unknown> = {}
  for (const d of (diagnoses ?? [])) diagMap[d.pulse_metric_id] = d
  const locMap: Record<string, Location> = {}
  for (const l of (locations ?? [])) locMap[l.id] = l

  return metrics.map((m: PulseMetric) => ({
    ...m,
    diagnosis: (diagMap[m.id] as PulseMetric['diagnosis']) ?? null,
    location: locMap[m.location_id],
  }))
}

// ─── Interventions ────────────────────────────────────────────────

export async function getInterventions(locationId?: string): Promise<Intervention[]> {
  const supabase = createClient()
  let query = supabase.from('interventions').select('*')
  // filter: where location_id matches OR location_id is null
  if (locationId) {
    query = query.or(`location_id.eq.${locationId},location_id.is.null`)
  }
  const { data: interventions } = await query
  if (!interventions) return []

  const locIds = interventions
    .filter((i: Intervention) => i.location_id)
    .map((i: Intervention) => i.location_id as string)

  let locMap: Record<string, Location> = {}
  if (locIds.length > 0) {
    const { data: locs } = await supabase.from('locations').select('*').in('id', locIds)
    for (const l of (locs ?? [])) locMap[l.id] = l
  }

  return interventions.map((i: Intervention) => ({
    ...i,
    location: i.location_id ? locMap[i.location_id] : undefined,
  }))
}

export async function getAllInterventions(): Promise<Intervention[]> {
  const supabase = createClient()
  const { data: interventions } = await supabase.from('interventions').select('*')
  if (!interventions) return []

  const locIds = interventions
    .filter((i: Intervention) => i.location_id)
    .map((i: Intervention) => i.location_id as string)

  let locMap: Record<string, Location> = {}
  if (locIds.length > 0) {
    const { data: locs } = await supabase.from('locations').select('*').in('id', locIds)
    for (const l of (locs ?? [])) locMap[l.id] = l
  }

  return interventions.map((i: Intervention) => ({
    ...i,
    location: i.location_id ? locMap[i.location_id] : undefined,
  }))
}

// ─── Metric History ────────────────────────────────────────────────

export async function getMetricHistory(
  locationId: string,
  metricName: string
): Promise<MetricTimeSeries | undefined> {
  const supabase = createClient()
  const { data } = await supabase
    .from('metric_history')
    .select('date, value')
    .eq('location_id', locationId)
    .eq('metric_name', metricName)
    .order('date', { ascending: true })
  if (!data || data.length === 0) return undefined
  return {
    locationId,
    metricName,
    points: data.map((r: { date: string; value: number }) => ({ date: r.date, value: r.value })),
  }
}

export async function getInterventionTimeline(locationId: string): Promise<
  { intervention: Intervention; metricHistories: Record<string, MetricTimeSeries | undefined> }[]
> {
  const interventions = await getInterventions(locationId)

  return Promise.all(
    interventions.map(async (intervention) => {
      const metricKeys = Object.keys(intervention.metrics_before || {})
      const entries = await Promise.all(
        metricKeys.map(async (key) => {
          const ts = await getMetricHistory(intervention.location_id || locationId, key)
          return [key, ts] as [string, MetricTimeSeries | undefined]
        })
      )
      return {
        intervention,
        metricHistories: Object.fromEntries(entries),
      }
    })
  )
}

// ─── Knowledge Surfacing ────────────────────────────────────────────────

export async function getRelevantPlaybook(
  taskCategory: string,
  profileId: string
): Promise<RelevantPlaybook | null> {
  const playbookId = TASK_PLAYBOOK_MAP[taskCategory]
  if (!playbookId) return null

  const supabase = createClient()
  const [{ data: playbook }, { data: completion }] = await Promise.all([
    supabase.from('playbooks').select('*').eq('id', playbookId).single(),
    supabase
      .from('playbook_completions')
      .select('*')
      .eq('playbook_id', playbookId)
      .eq('profile_id', profileId)
      .single(),
  ])

  if (!playbook) return null

  const completed = !!completion
  const score = completion?.score ?? null
  const needsReinforcement = !completed || (score !== null && score < 80)

  return { playbook, score, completed, needsReinforcement }
}

// ─── Credits ────────────────────────────────────────────────

export async function getCredits(): Promise<OrgCredits> {
  const supabase = createClient()
  const { data } = await supabase.from('org_credits').select('*').eq('org_id', ORG.id).single()
  return data ?? { org_id: ORG.id, plan: 'free', credits_total: 50, credits_used: 8, credits_reset_at: new Date().toISOString() }
}

export async function getCreditsRemaining(): Promise<number> {
  const credits = await getCredits()
  return credits.credits_total - credits.credits_used
}

export async function canAffordAction(action: AIActionType): Promise<boolean> {
  const cost = AI_CREDIT_COSTS[action]
  if (cost === 0) return true
  const remaining = await getCreditsRemaining()
  return remaining >= cost
}

export async function consumeCredits(action: AIActionType): Promise<boolean> {
  const cost = AI_CREDIT_COSTS[action]
  if (cost === 0) return true
  const supabase = createClient()
  const credits = await getCredits()
  const remaining = credits.credits_total - credits.credits_used
  if (remaining < cost) return false
  await supabase
    .from('org_credits')
    .update({ credits_used: credits.credits_used + cost })
    .eq('org_id', ORG.id)
  return true
}

// ─── Results Fees (computed from interventions — kept local) ────────────

const RESULTS_FEES: ResultsFee[] = [
  { intervention_id: 'int-1', metric_name: 'quality_score',        improvement_points: 4, rate_per_point: 30, fee: 120, estimated_value: 1200 },
  { intervention_id: 'int-1', metric_name: 'compliance_rate',      improvement_points: 4, rate_per_point: 40, fee: 160, estimated_value: 1600 },
  { intervention_id: 'int-2', metric_name: 'task_completion_rate', improvement_points: 4, rate_per_point: 25, fee: 100, estimated_value: 1000 },
]

export async function getResultsFees(): Promise<ResultsFee[]> {
  return RESULTS_FEES
}

export async function getResultsFeesForLocation(locationId: string): Promise<ResultsFee[]> {
  const interventions = await getInterventions(locationId)
  const locInterventionIds = interventions
    .filter((i) => i.location_id === locationId)
    .map((i) => i.id)
  return RESULTS_FEES.filter((r) => locInterventionIds.includes(r.intervention_id))
}

export async function getTotalResultsFee(): Promise<number> {
  return RESULTS_FEES.reduce((sum, r) => sum + r.fee, 0)
}

// ─── LM Progress ────────────────────────────────────────────────

const LM_PROGRESSION: LMProgressStep[] = [
  'invite_team', 'create_playbook', 'review_pulse', 'take_action', 'track_results', 'complete',
]

export async function getLMProgress(locationId: string): Promise<LMProgressStep> {
  // Try Supabase first
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('lm_progress')
      .select('step')
      .eq('location_id', locationId)
      .single()
    if (data?.step) return data.step as LMProgressStep
  } catch { /* fall through to localStorage */ }

  // Fallback: localStorage
  if (typeof window !== 'undefined') {
    const val = localStorage.getItem(`lm_progress_${locationId}`)
    if (val) return val as LMProgressStep
  }
  return 'invite_team'
}

export async function setLMProgress(locationId: string, step: LMProgressStep): Promise<void> {
  // Persist to localStorage immediately for UX
  if (typeof window !== 'undefined') {
    localStorage.setItem(`lm_progress_${locationId}`, step)
  }
  // Also persist to Supabase
  try {
    const supabase = createClient()
    await supabase
      .from('lm_progress')
      .upsert({ location_id: locationId, step, updated_at: new Date().toISOString() })
  } catch { /* ignore — localStorage is the fallback */ }
}

export async function advanceLMProgress(locationId: string): Promise<LMProgressStep> {
  const current = await getLMProgress(locationId)
  const idx = LM_PROGRESSION.indexOf(current)
  const next = idx < LM_PROGRESSION.length - 1 ? LM_PROGRESSION[idx + 1] : current
  await setLMProgress(locationId, next)
  return next
}

// ─── Data Mutations ────────────────────────────────────────────────

export async function addLocation(loc: Location): Promise<void> {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { manager: _m, pulse_metrics: _pm, ...row } = loc
  await supabase.from('locations').insert(row)
}

export async function addProfile(p: Profile): Promise<void> {
  const supabase = createClient()
  await supabase.from('profiles').insert(p)
}

export async function addShift(s: Shift): Promise<void> {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { assignments: _a, tasks: _t, location: _l, ...row } = s
  await supabase.from('shifts').insert(row)
}

export async function addTask(t: Task): Promise<void> {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { assignee: _a, playbook_step: _ps, ...row } = t
  await supabase.from('tasks').insert(row)
}

export async function addPulseMetric(pm: PulseMetric): Promise<void> {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { diagnosis: _d, location: _l, ...row } = pm
  await supabase.from('pulse_metrics').insert(row)
}

// ─── Aggregate helpers ────────────────────────────────────────────────

export async function getLocationSummary(locationId: string) {
  const [loc, locProfiles, metrics] = await Promise.all([
    getLocation(locationId),
    getProfilesByLocation(locationId),
    getPulseMetrics(locationId),
  ])

  const today = new Date().toISOString().split('T')[0]
  const [locShifts, locTasks] = await Promise.all([
    getShiftsByLocation(locationId, today),
    getTasksByLocation(locationId),
  ])

  const completedTasks = locTasks.filter((t) => t.status === 'completed').length
  const totalTasks = locTasks.length

  return {
    location: loc,
    employeeCount: locProfiles.filter((p) => p.role === 'fe').length,
    activeShifts: locShifts.filter((s) => s.status === 'active').length,
    taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    metrics,
  }
}

export async function getOrgSummary() {
  const [locs, allProfiles, interventions] = await Promise.all([
    getAllLocations(),
    getAllProfiles(),
    getAllInterventions(),
  ])

  return {
    org: ORG,
    locations: locs,
    totalEmployees: allProfiles.filter((p) => p.role === 'fe').length,
    totalLocations: locs.length,
    interventions,
  }
}
