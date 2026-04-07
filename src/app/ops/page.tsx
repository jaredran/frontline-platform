'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  getAllLocations,
  getPulseMetrics,
  getProfilesByLocation,
  getAllInterventions,
  getAllPulseMetrics,
} from '@/lib/data/store'
import { PulseGrid } from '@/components/shared/pulse-card'
import { InlineAI } from '@/components/shared/inline-ai'
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { PULSE_METRICS, type PulseMetric, type Intervention } from '@/lib/types'

const CARD_SHADOW = 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px'

const TYPE_BADGE_COLORS: Record<string, string> = {
  training: 'bg-[#f0e6f6] text-[#460479]',
  process: 'bg-[#e8f4fd] text-[#222222]',
  schedule: 'bg-[#fff8e1] text-[#222222]',
  coaching: 'bg-[#e8f5e9] text-[#008a05]',
}

function getMetricStatus(actual: number, target: number, metricName: string): 'good' | 'warn' | 'bad' {
  const isInverse = metricName === 'labor_cost_percent'
  const ratio = isInverse ? target / actual : actual / target
  if (ratio >= 0.95) return 'good'
  if (ratio >= 0.80) return 'warn'
  return 'bad'
}

function getLocationHealthScore(metrics: PulseMetric[]): number {
  if (metrics.length === 0) return 1
  let good = 0
  for (const m of metrics) {
    if (getMetricStatus(m.actual, m.target, m.metric_name) === 'good') good++
  }
  return good / metrics.length
}

function getHealthDots(metrics: PulseMetric[]) {
  let onTarget = 0, offTarget = 0
  for (const m of metrics) {
    const s = getMetricStatus(m.actual, m.target, m.metric_name)
    if (s === 'good') onTarget++
    else offTarget++
  }
  return { onTarget, offTarget }
}

function getInterventionStatus(intervention: Intervention): { label: string; color: string } {
  if (!intervention.metrics_before || !intervention.metrics_after) {
    return { label: 'Pending', color: 'text-[#6a6a6a]' }
  }
  const beforeValues = Object.values(intervention.metrics_before)
  const afterValues = Object.values(intervention.metrics_after)
  const avgBefore = beforeValues.reduce((a, b) => a + b, 0) / beforeValues.length
  const avgAfter = afterValues.reduce((a, b) => a + b, 0) / afterValues.length
  const delta = avgAfter - avgBefore
  if (delta > 2) return { label: 'Improving', color: 'text-[#008a05]' }
  if (delta < -2) return { label: 'Declining', color: 'text-[#c13515]' }
  return { label: 'Stalled', color: 'text-[#6a6a6a]' }
}

export default function OpsPage() {
  const { user } = useAuth()
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null)

  if (!user) return null

  const locations = getAllLocations()
  const allInterventions = getAllInterventions()
  const allMetrics = getAllPulseMetrics()

  // Per-location data, sorted worst-first
  const locationData = useMemo(() => {
    return locations
      .map(loc => {
        const metrics = getPulseMetrics(loc.id)
        const health = getLocationHealthScore(metrics)
        const dots = getHealthDots(metrics)
        const interventions = allInterventions.filter(i => i.location_id === loc.id)
        return { location: loc, metrics, health, dots, interventions }
      })
      .sort((a, b) => a.health - b.health)
  }, [locations, allInterventions])

  // AI insight: find worst location and summarize
  const aiInsight = useMemo(() => {
    if (locationData.length === 0) return ''
    const worst = locationData[0]
    const offTarget = worst.metrics.filter(
      m => getMetricStatus(m.actual, m.target, m.metric_name) !== 'good'
    ).length
    const intCount = worst.interventions.length
    const improving = worst.interventions.filter(
      i => getInterventionStatus(i).label === 'Improving'
    )
    const improvingDetail = improving.length > 0
      ? ` ${intCount} active intervention${intCount !== 1 ? 's' : ''}, ${improving.length} showing improvement.`
      : intCount > 0
        ? ` ${intCount} active intervention${intCount !== 1 ? 's' : ''}, none yet showing improvement.`
        : ' No active interventions.'
    return `${worst.location.name} is underperforming across ${offTarget} of ${worst.metrics.length} metrics.${improvingDetail}`
  }, [locationData])

  // Org averages
  const orgAvg = useMemo(() => {
    const taskMetrics = allMetrics.filter(m => m.metric_name === 'task_completion_rate')
    const qualityMetrics = allMetrics.filter(m => m.metric_name === 'quality_score')
    const complianceMetrics = allMetrics.filter(m => m.metric_name === 'compliance_rate')
    const avg = (arr: PulseMetric[]) =>
      arr.length > 0 ? Math.round(arr.reduce((s, m) => s + m.actual, 0) / arr.length) : 0
    return {
      taskCompletion: avg(taskMetrics),
      qualityScore: avg(qualityMetrics),
      complianceRate: avg(complianceMetrics),
    }
  }, [allMetrics])

  function metricColor(status: 'good' | 'warn' | 'bad') {
    if (status === 'good') return 'text-[#008a05]'
    if (status === 'warn') return 'text-[#222222]'
    return 'text-[#c13515]'
  }

  function gapColor(gap: number) {
    return gap >= 0 ? 'text-[#008a05]' : 'text-[#c13515]'
  }

  return (
    <div className="bg-white min-h-screen">
      {/* AI insight banner */}
      {aiInsight && (
        <div
          className="mx-5 mt-4 rounded-[20px] bg-[#f7f7f7] border-l-4 border-[#ff385c] px-5 py-4"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <p className="text-[15px] font-medium text-[#222222]">{aiInsight}</p>
        </div>
      )}

      {/* Location feed */}
      <div className="mt-4">
        {locationData.map(({ location, metrics, dots, interventions }) => {
          const isExpanded = expandedLocation === location.id

          return (
            <div key={location.id} className="border-b border-[#ebebeb]">
              {/* Location header + compact grid */}
              <div>
                <button
                  onClick={() => setExpandedLocation(isExpanded ? null : location.id)}
                  className="w-full px-5 py-4 text-left hover:bg-[#f7f7f7] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <p className="text-[18px] font-semibold text-[#222222]" style={{ letterSpacing: '-0.2px' }}>{location.name}</p>
                      {/* Health dots */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: dots.onTarget }).map((_, i) => (
                          <span key={`g${i}`} className="h-2.5 w-2.5 rounded-full bg-[#008a05] inline-block" />
                        ))}
                        {Array.from({ length: dots.offTarget }).map((_, i) => (
                          <span key={`r${i}`} className="h-2.5 w-2.5 rounded-full bg-[#c13515] inline-block" />
                        ))}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-[#6a6a6a]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#6a6a6a]" />
                    )}
                  </div>
                </button>

                {/* Compact PulseGrid */}
                <div className="px-5 pb-4">
                  <PulseGrid metrics={metrics} compact />
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="bg-[#f7f7f7] rounded-[20px] mx-5 my-2 p-5 space-y-4" style={{ boxShadow: CARD_SHADOW }}>
                  {/* Full metric detail */}
                  <div>
                    <p className="text-[13px] font-semibold text-[#6a6a6a] uppercase tracking-wide mb-2">Metric Detail</p>
                    <div className="space-y-0">
                      {metrics.map(m => {
                        const meta = PULSE_METRICS[m.metric_name as keyof typeof PULSE_METRICS]
                        if (!meta) return null
                        const status = getMetricStatus(m.actual, m.target, m.metric_name)
                        const isInverse = m.metric_name === 'labor_cost_percent'
                        const gap = isInverse
                          ? m.target - m.actual
                          : m.actual - m.target
                        const displayActual = meta.format === 'score' ? m.actual.toFixed(1) : Math.round(m.actual)
                        const displayTarget = meta.format === 'score' ? m.target.toFixed(1) : Math.round(m.target)
                        const displayGap = meta.format === 'score' ? gap.toFixed(1) : Math.round(gap)

                        return (
                          <div key={m.id} className="flex items-center justify-between py-2.5 border-b border-[#ebebeb] last:border-b-0">
                            <span className="text-[13px] text-[#6a6a6a]">{meta.label}</span>
                            <div className="flex items-center gap-3">
                              <span className={`text-[15px] font-semibold tabular-nums ${metricColor(status)}`}>
                                {displayActual}{meta.unit}
                              </span>
                              <span className="text-[11px] text-[#6a6a6a]">
                                / {displayTarget}{meta.unit}
                              </span>
                              <span className={`text-[13px] font-medium tabular-nums ${gapColor(Number(displayGap))}`}>
                                {Number(displayGap) >= 0 ? '+' : ''}{displayGap}
                              </span>
                              {m.trend === 'up' && !isInverse && <TrendingUp className="h-3.5 w-3.5 text-[#008a05]" />}
                              {m.trend === 'down' && !isInverse && <TrendingDown className="h-3.5 w-3.5 text-[#c13515]" />}
                              {m.trend === 'up' && isInverse && <TrendingUp className="h-3.5 w-3.5 text-[#c13515]" />}
                              {m.trend === 'down' && isInverse && <TrendingDown className="h-3.5 w-3.5 text-[#008a05]" />}
                              {m.trend === 'flat' && <Minus className="h-3.5 w-3.5 text-[#6a6a6a]" />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Interventions */}
                  <div>
                    <p className="text-[13px] font-semibold text-[#6a6a6a] uppercase tracking-wide mb-2">Active Interventions</p>
                    {interventions.length === 0 ? (
                      <p className="text-[13px] text-[#6a6a6a]">No active interventions at this location</p>
                    ) : (
                      <div className="space-y-2">
                        {interventions.map(iv => {
                          const ivStatus = getInterventionStatus(iv)
                          const typeColor = TYPE_BADGE_COLORS[iv.type] || 'bg-[#f7f7f7] text-[#6a6a6a]'

                          // Attribution: before -> after
                          const beforeKeys = iv.metrics_before ? Object.keys(iv.metrics_before) : []
                          const hasBefore = beforeKeys.length > 0 && iv.metrics_after

                          return (
                            <div key={iv.id} className="bg-white rounded-[14px] p-4" style={{ boxShadow: CARD_SHADOW }}>
                              <div className="flex items-center gap-2">
                                <span className={`text-[11px] font-semibold uppercase px-3 py-1 rounded-full ${typeColor}`}>
                                  {iv.type}
                                </span>
                                <span className={`text-[11px] font-semibold ${ivStatus.color}`}>
                                  {ivStatus.label}
                                </span>
                              </div>
                              <p className="text-[13px] text-[#222222] mt-2">{iv.description}</p>
                              {hasBefore && iv.metrics_before && iv.metrics_after && (
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                  {beforeKeys.map(key => {
                                    const before = iv.metrics_before![key]
                                    const after = iv.metrics_after![key]
                                    const delta = after - before
                                    const metaKey = key as keyof typeof PULSE_METRICS
                                    const label = PULSE_METRICS[metaKey]?.label ?? key
                                    return (
                                      <span key={key} className="text-[11px] text-[#6a6a6a]">
                                        {label}: {Math.round(before)} &rarr; {Math.round(after)}{' '}
                                        <span className={delta >= 0 ? 'text-[#008a05] font-semibold' : 'text-[#c13515] font-semibold'}>
                                          {delta >= 0 ? '+' : ''}{Math.round(delta)}
                                        </span>
                                      </span>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* InlineAI */}
                  <InlineAI
                    placeholder="Ask about this location..."
                    endpoint="/api/ai/ask"
                    buildPayload={(message) => ({ question: message, location_id: location.id })}
                    compact
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Org summary */}
      <div className="border-t border-[#ebebeb] px-5 py-4 mt-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#6a6a6a]">Org Averages</span>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#6a6a6a]">
              Task Completion{' '}
              <span className="font-semibold text-[#222222]">{orgAvg.taskCompletion}%</span>
            </span>
            <span className="text-[13px] text-[#6a6a6a]">
              Quality{' '}
              <span className="font-semibold text-[#222222]">{orgAvg.qualityScore}%</span>
            </span>
            <span className="text-[13px] text-[#6a6a6a]">
              Compliance{' '}
              <span className="font-semibold text-[#222222]">{orgAvg.complianceRate}%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
