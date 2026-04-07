'use client'

import { PULSE_METRICS, type PulseMetric } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PulseCardProps {
  metric: PulseMetric
  onClick?: () => void
  selected?: boolean
  compact?: boolean
}

function getStatus(actual: number, target: number, metricName: string) {
  const isInverse = metricName === 'labor_cost_percent'
  const ratio = isInverse ? target / actual : actual / target
  if (ratio >= 0.95) return 'good'
  if (ratio >= 0.80) return 'warn'
  return 'bad'
}

const STATUS_COLORS = {
  good: { text: 'text-[#008a05]', dot: 'bg-[#008a05]', bg: 'bg-white' },
  warn: { text: 'text-[#c13515]', dot: 'bg-[#c13515]', bg: 'bg-white' },
  bad: { text: 'text-[#c13515]', dot: 'bg-[#c13515]', bg: 'bg-[#fff8f6]' },
}

export function PulseCard({ metric, onClick, selected = false, compact = false }: PulseCardProps) {
  const meta = PULSE_METRICS[metric.metric_name as keyof typeof PULSE_METRICS]
  if (!meta) return null

  const status = getStatus(metric.actual, metric.target, metric.metric_name)
  const colors = STATUS_COLORS[status]
  const isInverse = metric.metric_name === 'labor_cost_percent'

  const displayActual = meta.format === 'score'
    ? metric.actual.toFixed(1)
    : Math.round(metric.actual)

  const displayTarget = meta.format === 'score'
    ? metric.target.toFixed(1)
    : Math.round(metric.target)

  const trendChar = metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'
  const trendColor =
    metric.trend === 'up' && !isInverse ? 'text-[#008a05]' :
    metric.trend === 'down' && !isInverse ? 'text-[#c13515]' :
    metric.trend === 'up' && isInverse ? 'text-[#c13515]' :
    metric.trend === 'down' && isInverse ? 'text-[#008a05]' :
    'text-[#6a6a6a]'

  return (
    <button
      onClick={onClick}
      className={cn(
        'text-left w-full px-4 py-3 transition-all rounded-[14px]',
        colors.bg,
        selected
          ? 'shadow-[0_0_0_2px_#222222] bg-white'
          : 'hover:shadow-[rgba(0,0,0,0.08)_0px_4px_12px]',
        compact ? 'px-3 py-2' : ''
      )}
      style={!selected && !compact ? { boxShadow: 'var(--airbnb-shadow-card)' } : undefined}
    >
      <div className="flex items-center justify-between">
        <span className={cn('text-xs font-medium text-[#6a6a6a]', compact && 'text-[10px]')}>
          {meta.label}
        </span>
        <span className={cn('text-xs font-semibold', trendColor)}>
          {trendChar}
        </span>
      </div>
      <div className="mt-1">
        <span className={cn('text-2xl font-bold tabular-nums', colors.text, compact && 'text-lg')}>
          {displayActual}
        </span>
        <span className={cn('text-xs text-[#6a6a6a] ml-1 font-medium', compact && 'text-[10px]')}>
          / {displayTarget}{meta.unit}
        </span>
      </div>
    </button>
  )
}

export function PulseGrid({
  metrics,
  onMetricClick,
  selectedId,
  compact = false,
}: {
  metrics: PulseMetric[]
  onMetricClick?: (metric: PulseMetric) => void
  selectedId?: string
  compact?: boolean
}) {
  return (
    <div className={cn(
      'grid gap-3',
      compact ? 'grid-cols-3 gap-2' : 'grid-cols-2 sm:grid-cols-3'
    )}>
      {metrics.map(m => (
        <PulseCard
          key={m.id}
          metric={m}
          onClick={onMetricClick ? () => onMetricClick(m) : undefined}
          selected={selectedId === m.id}
          compact={compact}
        />
      ))}
    </div>
  )
}
