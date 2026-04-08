'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getPulseMetrics, getLocation, getProfilesByLocation, getShiftsByLocation, getPlaybookCompletions, getResultsFeesForLocation, getInterventionTimeline, getTotalResultsFee, addLocation, addPulseMetric, addTask, setLMProgress } from '@/lib/data/store'
import { RoleShell } from '@/components/shared/role-shell'
import { AIBriefing } from '@/components/shared/ai-briefing'
import { PulseGrid } from '@/components/shared/pulse-card'
import { InlineAI } from '@/components/shared/inline-ai'
import { NextStepCard } from '@/components/shared/next-step-card'
import { AttributionChart } from '@/components/shared/attribution-chart'

import { Loader2, TrendingUp, X, Check, Info } from 'lucide-react'
import { PULSE_METRICS } from '@/lib/types'
import type { PulseMetric, RecommendedAction, GeneratedLocationSetup, Profile, Location } from '@/lib/types'

const cardShadow = 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px'

const IMPACT_BG: Record<string, string> = {
  high: 'bg-[#008a05] text-white',
  medium: 'bg-[#f7f7f7] text-[#222222]',
  low: 'bg-[#f7f7f7] text-[#6a6a6a]',
}

export default function PulseDashboard() {
  const { user, loginWithNewProfile } = useAuth()
  const [, forceUpdate] = useState(0)
  const [setupHydrated, setSetupHydrated] = useState(false)

  useEffect(() => {
    if (setupHydrated) return
    const pendingRaw = localStorage.getItem('frontline_pending_setup')
    if (!pendingRaw) {
      setSetupHydrated(true)
      return
    }

    try {
      const { setup } = JSON.parse(pendingRaw) as { setup: GeneratedLocationSetup }
      const now = Date.now()
      const locationId = `loc-new-${now}`
      const userId = `user-new-${now}`
      const today = new Date().toISOString().split('T')[0]

      // Create profile
      const profile: Profile = {
        id: userId,
        org_id: 'org-1',
        role: 'lm',
        full_name: 'You',
        email: 'you@frontline.app',
        location_id: locationId,
        avatar_url: null,
        skills: [],
        certifications: [],
        hire_date: today,
        created_at: new Date().toISOString(),
      }

      // Create location
      const location: Location = {
        id: locationId,
        org_id: 'org-1',
        name: setup.location_name,
        type: setup.industry,
        address: '',
        manager_id: userId,
        timezone: 'America/Chicago',
        created_at: new Date().toISOString(),
      }

      addLocation(location)

      // Add pulse metrics
      for (const pm of setup.diagnosis.estimated_pulse) {
        addPulseMetric({
          id: `pm-new-${pm.metric_name}-${now}`,
          location_id: locationId,
          date: today,
          metric_name: pm.metric_name,
          actual: pm.estimated_value,
          target: pm.target,
          trend: pm.estimated_value < pm.target ? 'down' : 'up',
          period: 'daily',
          created_at: new Date().toISOString(),
        })
      }

      // Add tasks
      setup.task_templates.forEach((tmpl, i) => {
        addTask({
          id: `task-new-${i}-${now}`,
          shift_id: null,
          location_id: locationId,
          title: tmpl.title,
          description: tmpl.description,
          standard: null,
          category: tmpl.category,
          priority: tmpl.priority,
          assigned_to: null,
          status: 'pending',
          quality_score: null,
          completed_at: null,
          due_by: null,
          created_at: new Date().toISOString(),
        })
      })

      setLMProgress('invite_team')
      loginWithNewProfile(profile)

      // Save the hero diagnosis as the initial briefing
      const briefingFromDiagnosis = setup.diagnosis.root_causes
        .map((rc, i) => `${i + 1}. ${rc.cause}: ${rc.reasoning}`)
        .join('\n\n')
      const actionsText = setup.diagnosis.recommended_actions
        .map(a => `• ${a.action} (${a.expected_impact}, ${a.timeline})`)
        .join('\n')
      const initialBriefing = `Here's your initial diagnosis for ${setup.location_name}:\n\n${briefingFromDiagnosis}\n\nRecommended first actions:\n${actionsText}`
      localStorage.setItem('frontline_initial_briefing', initialBriefing)

      // Clear the pending setup
      localStorage.removeItem('frontline_pending_setup')
    } catch (e) {
      console.error('Failed to hydrate setup:', e)
      localStorage.removeItem('frontline_pending_setup')
    }

    setSetupHydrated(true)
  }, [setupHydrated, loginWithNewProfile])
  const [selectedMetric, setSelectedMetric] = useState<PulseMetric | null>(null)
  const [diagnosisText, setDiagnosisText] = useState('')
  const [diagnosisActions, setDiagnosisActions] = useState<RecommendedAction[]>([])
  const [isDiagnosing, setIsDiagnosing] = useState(false)
  const [approvedActions, setApprovedActions] = useState<Set<number>>(new Set())
  const [dismissedActions, setDismissedActions] = useState<Set<number>>(new Set())

  if (!setupHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#ff385c] mx-auto" />
          <p className="text-[13px] text-[#6a6a6a] mt-2">Setting up your location...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const locationId = user.location_id
  if (!locationId) return null

  const location = getLocation(locationId)
  const metrics = getPulseMetrics(locationId)

  // Team strip data
  const today = new Date().toISOString().split('T')[0]
  const todayShifts = getShiftsByLocation(locationId, today)
  const onShiftIds = new Set(
    todayShifts.flatMap(s => s.assignments?.map(a => a.profile_id) ?? [])
  )
  const locationProfiles = getProfilesByLocation(locationId).filter(p => p.role === 'fe')
  const onShiftProfiles = locationProfiles.filter(p => onShiftIds.has(p.id))
  const avgQuality = (() => {
    const scores = todayShifts
      .flatMap(s => s.tasks ?? [])
      .filter(t => t.status === 'completed' && t.quality_score !== null)
      .map(t => t.quality_score as number)
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  })()

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  function handleMetricClick(metric: PulseMetric) {
    if (selectedMetric?.id === metric.id) {
      setSelectedMetric(null)
      return
    }
    setSelectedMetric(metric)
    setApprovedActions(new Set())
    setDismissedActions(new Set())

    if (metric.diagnosis) {
      setDiagnosisText(metric.diagnosis.diagnosis)
      setDiagnosisActions(metric.diagnosis.recommended_actions)
    } else {
      // Auto-diagnose instead of waiting for button click
      setDiagnosisText('')
      setDiagnosisActions([])
      setTimeout(() => {
        handleDiagnoseForMetric(metric)
      }, 0)
    }
  }

  async function handleDiagnoseForMetric(metric: PulseMetric) {
    setIsDiagnosing(true)
    setDiagnosisText('')
    setDiagnosisActions([])

    try {
      const meta = PULSE_METRICS[metric.metric_name as keyof typeof PULSE_METRICS]
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric_name: meta?.label ?? metric.metric_name,
          actual: metric.actual,
          target: metric.target,
          trend: metric.trend,
          location_name: location?.name ?? 'this location',
          location_id: locationId,
        }),
      })

      if (!response.ok) {
        setDiagnosisText('Unable to generate diagnosis. Please try again.')
        setIsDiagnosing(false)
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        setDiagnosisText('Unable to read response.')
        setIsDiagnosing(false)
        return
      }

      const decoder = new TextDecoder()
      let accumulated = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        // DON'T set diagnosisText during streaming — buffer it
      }

      // Now format the response before displaying
      try {
        const jsonMatch = accumulated.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])

          // Build formatted diagnosis text
          let formattedText = ''
          if (parsed.diagnosis) {
            formattedText = parsed.diagnosis
          }
          if (parsed.causes && Array.isArray(parsed.causes)) {
            const causesText = parsed.causes.map((c: { cause: string; evidence?: string; severity?: string }, i: number) =>
              `${i + 1}. ${c.cause}${c.evidence ? '\n   ' + c.evidence : ''}`
            ).join('\n\n')
            formattedText = formattedText ? formattedText + '\n\n' + causesText : causesText
          }

          setDiagnosisText(formattedText || accumulated)

          if (parsed.recommended_actions && Array.isArray(parsed.recommended_actions)) {
            setDiagnosisActions(parsed.recommended_actions)
          }
        } else {
          // Not JSON — display as-is (it's already plain text)
          setDiagnosisText(accumulated)
        }
      } catch {
        // JSON parse failed — display as-is
        setDiagnosisText(accumulated)
      }
    } catch {
      setDiagnosisText('Unable to generate diagnosis. Please try again.')
    } finally {
      setIsDiagnosing(false)
    }
  }

  const isEstimatedData = locationId.startsWith('loc-new-')
  const isDemoData = !isEstimatedData && ['loc-downtown', 'loc-mall', 'loc-airport'].includes(locationId)

  const selectedMeta = selectedMetric
    ? PULSE_METRICS[selectedMetric.metric_name as keyof typeof PULSE_METRICS]
    : null

  return (
    <RoleShell role="lm">
    <div className="bg-white min-h-full">
        <AIBriefing
          role="lm"
          contextData={{
            locationName: location?.name,
            metrics: metrics.map(m => {
              const meta = PULSE_METRICS[m.metric_name as keyof typeof PULSE_METRICS]
              return { name: meta?.label, actual: m.actual, target: m.target, trend: m.trend }
            }),
            teamSize: locationProfiles.length,
            onShiftCount: onShiftProfiles.length,
            avgQuality,
            trainingGaps: locationProfiles.map(p => {
              const completions = getPlaybookCompletions(undefined, p.id)
              const completedIds = completions.map(c => c.playbook_id)
              return { name: p.full_name, missingPlaybooks: ['pb-food-safety', 'pb-customer-service'].filter(id => !completedIds.includes(id)).length, avgScore: completions.length > 0 ? Math.round(completions.reduce((s, c) => s + c.score, 0) / completions.length) : null }
            }).filter(g => g.missingPlaybooks > 0 || (g.avgScore !== null && g.avgScore < 80)),
          }}
          accentColor="#ff385c"
        />
        <NextStepCard onAdvance={() => forceUpdate(n => n + 1)} locationId={locationId} isDemoMode={isDemoData} />
        {/* Location header */}
        <div className="px-5 py-4 border-b border-[#ebebeb]">
          <h1
            className="text-[22px] font-bold text-[#222222]"
            style={{ letterSpacing: '-0.44px' }}
          >
            {location?.name ?? 'My Location'}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[13px] text-[#6a6a6a]">{todayFormatted}</span>
            <span className="flex items-center gap-1">
              {metrics.map(m => {
                const isInverse = m.metric_name === 'labor_cost_percent'
                const ratio = isInverse ? m.target / m.actual : m.actual / m.target
                const color = ratio >= 0.95 ? 'bg-[#008a05]' : ratio >= 0.80 ? 'bg-[#c13515]' : 'bg-[#c13515]'
                return <span key={m.id} className={`inline-block h-2 w-2 rounded-full ${color}`} />
              })}
            </span>
          </div>
        </div>

        {/* Pulse Grid */}
        <div className="px-5 py-4">
          <PulseGrid
            metrics={metrics}
            onMetricClick={handleMetricClick}
            selectedId={selectedMetric?.id}
          />
        </div>

        {/* Data source indicator */}
        {isEstimatedData && (
          <div className="bg-[#fff8e1] rounded-[14px] mx-5 mt-2 px-4 py-3 flex gap-3">
            <Info className="h-4 w-4 text-[#b8860b] shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] text-[#222222] font-medium">These metrics are estimated based on your description. To get real data:</p>
              <ul className="text-[13px] text-[#6a6a6a] mt-1.5 space-y-1 list-disc ml-4">
                <li>Invite your team and assign tasks -- task completions update your Pulse automatically</li>
                <li>Connect your POS system for sales and customer satisfaction data</li>
                <li>Connect your scheduling system for schedule adherence data</li>
              </ul>
            </div>
          </div>
        )}
        {isDemoData && (
          <div className="bg-[#f0f4ff] rounded-[14px] mx-5 mt-2 px-4 py-3 flex gap-3">
            <Info className="h-4 w-4 text-[#4a6fa5] shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#6a6a6a]">
              You&apos;re exploring demo data for {location?.name ?? 'this location'}.{' '}
              <a href="/" className="text-[#ff385c] underline font-medium">Create your own location &rarr;</a> to see your real performance.
            </p>
          </div>
        )}

        {/* Diagnosis panel */}
        {selectedMetric && selectedMeta && (
          <div
            className="bg-[#f7f7f7] rounded-[20px] mx-5 p-5 space-y-4"
            style={{ boxShadow: cardShadow }}
          >
            {/* Metric header */}
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="text-[20px] font-semibold text-[#222222]"
                  style={{ letterSpacing: '-0.2px' }}
                >
                  {selectedMeta.label}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-2xl font-bold tabular-nums ${
                    (() => {
                      const isInverse = selectedMetric.metric_name === 'labor_cost_percent'
                      const ratio = isInverse
                        ? selectedMetric.target / selectedMetric.actual
                        : selectedMetric.actual / selectedMetric.target
                      return ratio >= 0.95 ? 'text-[#008a05]' : 'text-[#c13515]'
                    })()
                  }`}>
                    {selectedMeta.format === 'score'
                      ? selectedMetric.actual.toFixed(1)
                      : Math.round(selectedMetric.actual)}
                    {selectedMeta.unit}
                  </span>
                  <span className="text-sm text-[#6a6a6a]">
                    target {selectedMeta.format === 'score'
                      ? selectedMetric.target.toFixed(1)
                      : Math.round(selectedMetric.target)}
                    {selectedMeta.unit}
                  </span>
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${
                    selectedMetric.trend === 'up' ? 'text-[#008a05]' :
                    selectedMetric.trend === 'down' ? 'text-[#c13515]' : 'text-[#6a6a6a]'
                  }`}>
                    <TrendingUp className={`h-3 w-3 ${selectedMetric.trend === 'down' ? 'rotate-180' : ''}`} />
                    {selectedMetric.trend}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMetric(null)}
                className="p-1 text-[#6a6a6a] hover:text-[#222222] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Diagnosis content */}
            {diagnosisText ? (
              <div>
                <div className="space-y-2">
                  {diagnosisText.split('\n').filter(Boolean).map((line, i) => (
                    <p key={i} className="text-sm text-[#222222] leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
                {isDiagnosing && (
                  <Loader2 className="h-3 w-3 text-[#6a6a6a] animate-spin mt-2" />
                )}
              </div>
            ) : isDiagnosing ? (
              <div className="py-4 flex items-center gap-2 justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-[#ff385c]" />
                <span className="text-[13px] text-[#6a6a6a]">Analyzing this metric...</span>
              </div>
            ) : null}

            {/* Recommended actions */}
            {diagnosisActions.length > 0 && (
              <div className="space-y-3">
                <p className="text-[13px] text-[#6a6a6a] font-semibold uppercase tracking-wider">
                  Recommended Actions
                </p>
                {diagnosisActions.map((action, idx) => {
                  const isApproved = approvedActions.has(idx)
                  const isDismissed = dismissedActions.has(idx)
                  if (isDismissed) return null

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-[14px] p-4"
                      style={{ boxShadow: cardShadow }}
                    >
                      <p className={`font-medium text-sm ${isApproved ? 'text-[#008a05]' : 'text-[#222222]'}`}>
                        {isApproved && <Check className="h-3.5 w-3.5 inline mr-1" />}
                        {action.action}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${IMPACT_BG[action.impact]}`}>
                          {action.impact} impact
                        </span>
                        {action.owner && (
                          <span className="text-[11px] text-[#6a6a6a]">{action.owner}</span>
                        )}
                        {action.timeline && (
                          <span className="text-[11px] text-[#6a6a6a]">{action.timeline}</span>
                        )}
                      </div>
                      {!isApproved && (
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => setApprovedActions(prev => new Set([...prev, idx]))}
                            className="bg-[#222222] text-white rounded-[8px] px-4 py-2 text-sm font-medium hover:bg-[#ff385c] transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setDismissedActions(prev => new Set([...prev, idx]))}
                            className="text-[#6a6a6a] underline text-sm hover:text-[#222222] transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* InlineAI */}
            <InlineAI
              placeholder="Ask about this metric..."
              endpoint="/api/ai/ask"
              buildPayload={(message) => ({
                message,
                metric_name: selectedMeta.label,
                actual: selectedMetric.actual,
                target: selectedMetric.target,
                trend: selectedMetric.trend,
                location_name: location?.name ?? '',
              })}
              compact
            />
          </div>
        )}

        {/* Results & Impact */}
        {(() => {
          const resultsFees = getResultsFeesForLocation(locationId)
          const timeline = getInterventionTimeline(locationId)
          const totalFee = getTotalResultsFee()
          if (resultsFees.length === 0) return null
          return (
            <div className="mx-5 mt-4 bg-[#f7f7f7] rounded-[20px] px-5 py-4" style={{ boxShadow: cardShadow }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-[#ff385c]" />
                <h2 className="text-[15px] font-bold text-[#222222]">Results &amp; Impact</h2>
              </div>
              <div className="space-y-4">
                {timeline.map(({ intervention, metricHistories }) => {
                  const fee = resultsFees.find(r => r.intervention_id === intervention.id)
                  if (!fee) return null
                  const metricMeta = PULSE_METRICS[fee.metric_name as keyof typeof PULSE_METRICS]
                  const ts = metricHistories[fee.metric_name]
                  return (
                    <div key={intervention.id} className="bg-white rounded-[14px] p-4" style={{ boxShadow: cardShadow }}>
                      <p className="text-[13px] font-semibold text-[#222222]">{intervention.description}</p>
                      {ts && metricMeta && (
                        <AttributionChart
                          timeSeries={ts}
                          interventionDate={intervention.started_at}
                          metricLabel={metricMeta.label}
                          unit={metricMeta.unit}
                        />
                      )}
                      <p className="text-[12px] text-[#6a6a6a] mt-2">
                        {metricMeta?.label ?? fee.metric_name} +{fee.improvement_points} points{' '}
                        <span className="mx-1">&rarr;</span> Est. value: ${fee.estimated_value.toLocaleString()}/month{' '}
                        <span className="mx-1">&rarr;</span> Results fee: <span className="font-semibold text-[#222222]">${fee.fee.toLocaleString()}/month</span>
                      </p>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-[#ebebeb] text-right">
                <span className="text-[13px] text-[#6a6a6a]">Your total results fee this month: </span>
                <span className="text-[15px] font-bold text-[#222222]">${totalFee.toLocaleString()}</span>
              </div>
            </div>
          )
        })()}

        {/* Team strip */}
        <div className="border-t border-[#ebebeb] px-5 py-3 mt-4">
          <p className="text-[13px] text-[#6a6a6a]">
            Today&apos;s crew:{' '}
            <span className="text-[#222222] font-medium">
              {onShiftProfiles.length > 0
                ? onShiftProfiles.map(p => p.full_name.split(' ')[0]).join(', ')
                : 'None scheduled'}
            </span>
            {onShiftProfiles.length > 0 && avgQuality > 0 && (
              <> &middot; Avg quality: <span className="text-[#008a05] font-semibold">{avgQuality}%</span></>
            )}
          </p>
        </div>
      </div>
    </RoleShell>
  )
}
