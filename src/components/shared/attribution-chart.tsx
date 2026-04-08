'use client'

import type { MetricTimeSeries } from '@/lib/types'

interface AttributionChartProps {
  timeSeries: MetricTimeSeries
  interventionDate: string
  metricLabel: string
  unit?: string
}

export function AttributionChart({ timeSeries, interventionDate, metricLabel, unit = '%' }: AttributionChartProps) {
  const { points } = timeSeries
  if (points.length < 3) return null

  // Find the split index
  const splitIdx = points.findIndex(p => p.date >= interventionDate)
  const effectiveSplit = splitIdx <= 0 ? Math.floor(points.length / 2) : splitIdx

  // Compute before/after averages
  const beforePoints = points.slice(0, effectiveSplit)
  const afterPoints = points.slice(effectiveSplit)
  const beforeAvg = beforePoints.reduce((s, p) => s + p.value, 0) / beforePoints.length
  const afterAvg = afterPoints.reduce((s, p) => s + p.value, 0) / afterPoints.length
  const delta = afterAvg - beforeAvg
  const isPositive = delta > 0

  // SVG dimensions
  const W = 240
  const H = 48
  const PAD = 4
  const plotW = W - PAD * 2
  const plotH = H - PAD * 2

  const values = points.map(p => p.value)
  const minV = Math.min(...values) - 2
  const maxV = Math.max(...values) + 2
  const rangeV = maxV - minV || 1

  const toX = (i: number) => PAD + (i / (points.length - 1)) * plotW
  const toY = (v: number) => PAD + plotH - ((v - minV) / rangeV) * plotH

  // Intervention line X position
  const interventionX = toX(effectiveSplit)

  // Build path segments
  const beforePath = beforePoints.map((p, i) => {
    const x = toX(i)
    const y = toY(p.value)
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')

  const afterPath = afterPoints.map((p, i) => {
    const x = toX(effectiveSplit + i)
    const y = toY(p.value)
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')

  // Connect before to after
  const bridgePath = `M ${toX(effectiveSplit - 1)} ${toY(beforePoints[beforePoints.length - 1].value)} L ${toX(effectiveSplit)} ${toY(afterPoints[0].value)}`

  return (
    <div className="mt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-wider">{metricLabel}</span>
        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <span className="text-[#6a6a6a]">Before: {beforeAvg.toFixed(1)}{unit}</span>
          <span className="text-[#6a6a6a]">After: {afterAvg.toFixed(1)}{unit}</span>
          <span className={isPositive ? 'text-[#008a05]' : 'text-[#c13515]'}>
            {isPositive ? '+' : ''}{delta.toFixed(1)}{unit}
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={48} className="overflow-visible">
        {/* Before line */}
        <path d={beforePath} fill="none" stroke="#d1d1d1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Bridge */}
        <path d={bridgePath} fill="none" stroke="#d1d1d1" strokeWidth="1" strokeDasharray="2,2" />
        {/* After line */}
        <path d={afterPath} fill="none" stroke="#008a05" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Intervention line */}
        <line x1={interventionX} y1={0} x2={interventionX} y2={H} stroke="#ff385c" strokeWidth="1.5" strokeDasharray="3,3" />

        {/* Before dots */}
        {beforePoints.map((p, i) => (
          <circle key={`b-${i}`} cx={toX(i)} cy={toY(p.value)} r="2.5" fill="#d1d1d1" />
        ))}
        {/* After dots */}
        {afterPoints.map((p, i) => (
          <circle key={`a-${i}`} cx={toX(effectiveSplit + i)} cy={toY(p.value)} r="3" fill="#008a05" />
        ))}
      </svg>

      {/* Date labels */}
      <div className="flex items-center justify-between mt-0.5">
        <span className="text-[9px] text-[#6a6a6a]">{points[0].date.slice(5)}</span>
        <span className="text-[9px] font-semibold text-[#ff385c]">Intervention</span>
        <span className="text-[9px] text-[#6a6a6a]">{points[points.length - 1].date.slice(5)}</span>
      </div>
    </div>
  )
}
