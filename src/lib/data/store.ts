// In-memory data store for the prototype
// Mirrors what Supabase would provide, with query helpers

import {
  profiles, locations, shifts, shiftAssignments, tasks,
  playbooks, playbookCompletions, pulseMetrics, pulseDiagnoses,
  interventions, ORG, metricHistory, TASK_PLAYBOOK_MAP,
} from './seed'
import type {
  Profile, Location, Shift, Task, Playbook, PulseMetric,
  PulseDiagnosis, Intervention, PlaybookCompletion, ShiftAssignment, Role,
  MetricTimeSeries, RelevantPlaybook,
} from '../types'

// --- Profiles ---
export function getProfile(id: string): Profile | undefined {
  return profiles.find(p => p.id === id)
}

export function getProfilesByLocation(locationId: string): Profile[] {
  return profiles.filter(p => p.location_id === locationId)
}

export function getProfilesByRole(role: Role): Profile[] {
  return profiles.filter(p => p.role === role)
}

export function getAllProfiles(): Profile[] {
  return profiles
}

// --- Locations ---
export function getLocation(id: string): Location | undefined {
  const loc = locations.find(l => l.id === id)
  if (!loc) return undefined
  return {
    ...loc,
    manager: profiles.find(p => p.id === loc.manager_id),
    pulse_metrics: pulseMetrics.filter(pm => pm.location_id === loc.id),
  }
}

export function getAllLocations(): Location[] {
  return locations.map(loc => ({
    ...loc,
    manager: profiles.find(p => p.id === loc.manager_id),
    pulse_metrics: pulseMetrics.filter(pm => pm.location_id === loc.id),
  }))
}

// --- Shifts ---
export function getShift(id: string): Shift | undefined {
  const shift = shifts.find(s => s.id === id)
  if (!shift) return undefined
  return enrichShift(shift)
}

export function getShiftsByLocation(locationId: string, date?: string): Shift[] {
  return shifts
    .filter(s => s.location_id === locationId && (!date || s.date === date))
    .map(enrichShift)
}

export function getShiftsForEmployee(profileId: string, date?: string): Shift[] {
  const assignedShiftIds = shiftAssignments
    .filter(sa => sa.profile_id === profileId)
    .map(sa => sa.shift_id)
  return shifts
    .filter(s => assignedShiftIds.includes(s.id) && (!date || s.date === date))
    .map(enrichShift)
}

function enrichShift(shift: Shift): Shift {
  return {
    ...shift,
    assignments: shiftAssignments
      .filter(sa => sa.shift_id === shift.id)
      .map(sa => ({ ...sa, profile: profiles.find(p => p.id === sa.profile_id) })),
    tasks: tasks.filter(t => t.shift_id === shift.id).map(enrichTask),
    location: locations.find(l => l.id === shift.location_id),
  }
}

// --- Tasks ---
function enrichTask(task: Task): Task {
  return {
    ...task,
    assignee: profiles.find(p => p.id === task.assigned_to),
  }
}

export function getTask(id: string): Task | undefined {
  const task = tasks.find(t => t.id === id)
  return task ? enrichTask(task) : undefined
}

export function getTasksForEmployee(profileId: string): Task[] {
  return tasks.filter(t => t.assigned_to === profileId).map(enrichTask)
}

export function getTasksByShift(shiftId: string): Task[] {
  return tasks.filter(t => t.shift_id === shiftId).map(enrichTask)
}

export function getTasksByLocation(locationId: string): Task[] {
  return tasks.filter(t => t.location_id === locationId).map(enrichTask)
}

export function updateTaskStatus(taskId: string, status: Task['status'], qualityScore?: number): Task | undefined {
  const idx = tasks.findIndex(t => t.id === taskId)
  if (idx === -1) return undefined
  tasks[idx] = {
    ...tasks[idx],
    status,
    quality_score: qualityScore ?? tasks[idx].quality_score,
    completed_at: status === 'completed' ? new Date().toISOString() : tasks[idx].completed_at,
  }
  return enrichTask(tasks[idx])
}

// --- Playbooks ---
export function getPlaybook(id: string): Playbook | undefined {
  return playbooks.find(p => p.id === id)
}

export function getAllPlaybooks(): Playbook[] {
  return playbooks
}

export function getPlaybookCompletions(playbookId?: string, profileId?: string): PlaybookCompletion[] {
  return playbookCompletions
    .filter(pc =>
      (!playbookId || pc.playbook_id === playbookId) &&
      (!profileId || pc.profile_id === profileId)
    )
    .map(pc => ({
      ...pc,
      profile: profiles.find(p => p.id === pc.profile_id),
      playbook: playbooks.find(p => p.id === pc.playbook_id),
    }))
}

// --- Pulse Metrics ---
export function getPulseMetrics(locationId: string): PulseMetric[] {
  return pulseMetrics
    .filter(pm => pm.location_id === locationId)
    .map(pm => ({
      ...pm,
      diagnosis: pulseDiagnoses.find(pd => pd.pulse_metric_id === pm.id) || null,
      location: locations.find(l => l.id === pm.location_id),
    }))
}

export function getPulseMetric(id: string): PulseMetric | undefined {
  const pm = pulseMetrics.find(p => p.id === id)
  if (!pm) return undefined
  return {
    ...pm,
    diagnosis: pulseDiagnoses.find(pd => pd.pulse_metric_id === pm.id) || null,
    location: locations.find(l => l.id === pm.location_id),
  }
}

export function getAllPulseMetrics(): PulseMetric[] {
  return pulseMetrics.map(pm => ({
    ...pm,
    diagnosis: pulseDiagnoses.find(pd => pd.pulse_metric_id === pm.id) || null,
    location: locations.find(l => l.id === pm.location_id),
  }))
}

// --- Interventions ---
export function getInterventions(locationId?: string): Intervention[] {
  return interventions
    .filter(i => !locationId || i.location_id === locationId || i.location_id === null)
    .map(i => ({
      ...i,
      location: i.location_id ? locations.find(l => l.id === i.location_id) : undefined,
    }))
}

export function getAllInterventions(): Intervention[] {
  return interventions.map(i => ({
    ...i,
    location: i.location_id ? locations.find(l => l.id === i.location_id) : undefined,
  }))
}

// --- Aggregate helpers ---
export function getLocationSummary(locationId: string) {
  const loc = getLocation(locationId)
  const locProfiles = getProfilesByLocation(locationId)
  const today = new Date().toISOString().split('T')[0]
  const locShifts = getShiftsByLocation(locationId, today)
  const locTasks = getTasksByLocation(locationId)
  const metrics = getPulseMetrics(locationId)

  const completedTasks = locTasks.filter(t => t.status === 'completed').length
  const totalTasks = locTasks.length

  return {
    location: loc,
    employeeCount: locProfiles.filter(p => p.role === 'fe').length,
    activeShifts: locShifts.filter(s => s.status === 'active').length,
    taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    metrics,
  }
}

export function getOrgSummary() {
  return {
    org: ORG,
    locations: getAllLocations(),
    totalEmployees: profiles.filter(p => p.role === 'fe').length,
    totalLocations: locations.length,
    interventions: getAllInterventions(),
  }
}

// --- Metric History (Attribution) ---
export function getMetricHistory(locationId: string, metricName: string): MetricTimeSeries | undefined {
  return metricHistory.find(mh => mh.locationId === locationId && mh.metricName === metricName)
}

export function getInterventionTimeline(locationId: string) {
  const locInterventions = interventions.filter(
    i => i.location_id === locationId || i.location_id === null
  )
  return locInterventions.map(intervention => {
    const metricKeys = Object.keys(intervention.metrics_before || {})
    const metricHistories: Record<string, MetricTimeSeries | undefined> = {}
    for (const key of metricKeys) {
      metricHistories[key] = getMetricHistory(
        intervention.location_id || locationId,
        key
      )
    }
    return { intervention, metricHistories }
  })
}

// --- Knowledge Surfacing ---
export function getRelevantPlaybook(taskCategory: string, profileId: string): RelevantPlaybook | null {
  const playbookId = TASK_PLAYBOOK_MAP[taskCategory]
  if (!playbookId) return null

  const playbook = playbooks.find(p => p.id === playbookId)
  if (!playbook) return null

  const completion = playbookCompletions.find(
    pc => pc.playbook_id === playbookId && pc.profile_id === profileId
  )

  const completed = !!completion
  const score = completion?.score ?? null
  const needsReinforcement = !completed || (score !== null && score < 80)

  return { playbook, score, completed, needsReinforcement }
}
