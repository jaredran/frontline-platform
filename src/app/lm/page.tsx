'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getPulseMetrics, getLocation, getProfilesByLocation, getShiftsByLocation, getPlaybookCompletions } from '@/lib/data/store'
import { AIBriefing } from '@/components/shared/ai-briefing'
import { PulseGrid } from '@/components/shared/pulse-card'
import { InlineAI } from '@/components/shared/inline-ai'

import { Loader2, Sparkles, TrendingUp, X, Check } from 'lucide-react'
import { PULSE_METRICS } from '@/lib/types'
import type { PulseMetric, RecommendedAction } from '@/lib/types'

const cardShadow = 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px'

const IMPACT_BG: Record<string, string> = {
  high: 'bg-[#008a05] text-white',
  medium: 'bg-[#f7f7f7] text-[#222222]',
  low: 'bg-[#f7f7f7] text-[#6a6a6a]',
}

export default function PulseDashboard() {
  const { user } = useAuth()
  const [selectedMetric, setSelectedMetric] = useState<PulseMetric | null>(null)
  const [diagnosisText, setDiagnosisText] = useState('')
  const [diagnosisActions, setDiagnosisActions] = useState<RecommendedAction[]>([])
  const [isDiagnosing, setIsDiagnosing] = useState(false)
  const [approvedActions, setApprovedActions] = useState<Set<number>>(new Set())
  const [dismissedActions, setDismissedActions] = useState<Set<number>>(new Set())

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
      setDiagnosisText('')
      setDiagnosisActions([])
    }
  }

  async function handleDiagnose() {
    if (!selectedMetric) return
    setIsDiagnosing(true)
    setDiagnosisText('')
    setDiagnosisActions([])

    try {
      const meta = PULSE_METRICS[selectedMetric.metric_name as keyof typeof PULSE_METRICS]
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric_name: meta?.label ?? selectedMetric.metric_name,
          actual: selectedMetric.actual,
          target: selectedMetric.target,
          trend: selectedMetric.trend,
          location_name: location?.name ?? 'this location',
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
      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
        setDiagnosisText(fullText)
      }
    } catch {
      setDiagnosisText('Unable to generate diagnosis. Please try again.')
    } finally {
      setIsDiagnosing(false)
    }
  }

  const selectedMeta = selectedMetric
    ? PULSE_METRICS[selectedMetric.metric_name as keyof typeof PULSE_METRICS]
    : null

  return (
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
                <p className="text-sm text-[#222222] leading-relaxed whitespace-pre-wrap">
                  {diagnosisText}
                </p>
                {isDiagnosing && (
                  <Loader2 className="h-3 w-3 text-[#6a6a6a] animate-spin mt-2" />
                )}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-[13px] text-[#6a6a6a] mb-3">No diagnosis available.</p>
                <button
                  onClick={handleDiagnose}
                  disabled={isDiagnosing}
                  className="inline-flex items-center gap-2 bg-[#ff385c] text-white rounded-[8px] px-6 py-2.5 font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                  {isDiagnosing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {isDiagnosing ? 'Diagnosing...' : 'Diagnose'}
                </button>
              </div>
            )}

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
  )
}
