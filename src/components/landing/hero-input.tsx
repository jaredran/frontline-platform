'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GeneratedLocationSetup, TaskPriority } from '@/lib/types'
import { Loader2, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react'

type Stage = 'idle' | 'generating' | 'reviewing' | 'confirming' | 'done'

const TYPE_OPTIONS = ['Quick Service', 'Fast Casual', 'Cafe', 'Convenience', 'Other']
const SIZE_OPTIONS = ['5-10', '10-20', '20-30', '30+']

const FALLBACK_SETUP: GeneratedLocationSetup = {
  location_name: 'My Location',
  industry: 'Quick Service Restaurant',
  employee_count: 15,
  hours: '6am-10pm',
  diagnosis: {
    root_causes: [
      { cause: 'Inconsistent training across new hires', reasoning: 'Without standardized onboarding, each employee learns differently, leading to quality variance.', confidence: 'high' },
      { cause: 'No real-time visibility into daily operations', reasoning: 'Managers rely on end-of-day checks instead of proactive monitoring.', confidence: 'high' },
      { cause: 'Reactive scheduling leading to coverage gaps', reasoning: 'Shifts are planned without factoring in peak demand patterns.', confidence: 'medium' },
    ],
    estimated_pulse: [
      { metric_name: 'task_completion_rate', estimated_value: 72, target: 95, status: 'critical' },
      { metric_name: 'labor_cost_percent', estimated_value: 34, target: 28, status: 'warning' },
      { metric_name: 'customer_satisfaction', estimated_value: 3.6, target: 4.5, status: 'warning' },
      { metric_name: 'quality_score', estimated_value: 68, target: 90, status: 'critical' },
      { metric_name: 'schedule_adherence', estimated_value: 78, target: 95, status: 'warning' },
      { metric_name: 'compliance_rate', estimated_value: 82, target: 95, status: 'warning' },
    ],
    recommended_actions: [
      { action: 'Create standardized onboarding playbook for all new hires', expected_impact: 'Reduce training time by 40% and improve quality scores within 2 weeks', timeline: 'Week 1' },
      { action: 'Set up daily task checklists with quality checkpoints', expected_impact: 'Increase task completion rate from 72% to 90%+', timeline: 'Week 1-2' },
      { action: 'Implement shift-based performance tracking', expected_impact: 'Identify coverage gaps and reduce labor cost by 3-5 points', timeline: 'Week 2-3' },
    ],
  },
  task_templates: [
    { title: 'Morning opening checklist', category: 'operations', description: 'Complete all opening procedures before doors open', priority: 'high' as TaskPriority },
    { title: 'Food safety temperature check', category: 'compliance', description: 'Check and log all holding temperatures', priority: 'critical' as TaskPriority },
    { title: 'Restock front-of-house supplies', category: 'operations', description: 'Ensure all customer-facing supplies are stocked', priority: 'medium' as TaskPriority },
    { title: 'Clean and sanitize prep areas', category: 'compliance', description: 'Full sanitization of all prep surfaces', priority: 'high' as TaskPriority },
    { title: 'Check order accuracy for last 10 orders', category: 'quality', description: 'Review recent orders for accuracy and presentation', priority: 'medium' as TaskPriority },
    { title: 'Team huddle — review daily goals', category: 'coaching', description: 'Quick 5-min huddle to align on shift priorities', priority: 'medium' as TaskPriority },
    { title: 'Inventory count — key items', category: 'operations', description: 'Count and log inventory for high-turnover items', priority: 'medium' as TaskPriority },
    { title: 'Customer feedback review', category: 'quality', description: 'Review latest customer reviews and identify themes', priority: 'low' as TaskPriority },
    { title: 'Equipment maintenance check', category: 'compliance', description: 'Inspect and log equipment condition', priority: 'medium' as TaskPriority },
    { title: 'End-of-day closing checklist', category: 'operations', description: 'Complete all closing procedures', priority: 'high' as TaskPriority },
    { title: 'Train new hire on POS system', category: 'training', description: 'Walk through POS operations with new team member', priority: 'medium' as TaskPriority },
    { title: 'Update schedule for next week', category: 'scheduling', description: 'Finalize and publish next week schedule', priority: 'medium' as TaskPriority },
  ],
  playbook_topics: ['New Hire Onboarding', 'Food Safety Basics', 'Customer Service Excellence'],
}

function getStatusColor(status: string): string {
  if (status === 'critical') return 'bg-red-50 text-[#c13515] border border-red-200'
  if (status === 'warning') return 'bg-amber-50 text-amber-700 border border-amber-200'
  return 'bg-emerald-50 text-[#008a05] border border-emerald-200'
}

export default function HeroInput() {
  const router = useRouter()

  const [stage, setStage] = useState<Stage>('idle')
  const [locationName, setLocationName] = useState('')
  const [locationType, setLocationType] = useState('Quick Service')
  const [teamSize, setTeamSize] = useState('10-20')
  const [challenges, setChallenges] = useState('')
  const [setup, setSetup] = useState<GeneratedLocationSetup | null>(null)
  const [showTasks, setShowTasks] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setStage('generating')
    setError(null)

    try {
      const res = await fetch('/api/ai/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationName, locationType, teamSize, challenges }),
      })

      if (!res.ok) throw new Error('API error')

      const data: GeneratedLocationSetup = await res.json()
      setSetup(data)
      setStage('reviewing')
    } catch {
      // Use fallback data
      const fallback = {
        ...FALLBACK_SETUP,
        location_name: locationName || 'My Location',
      }
      setSetup(fallback)
      setError('AI is unavailable, but we set you up with industry defaults.')
      setStage('reviewing')
    }
  }

  function handleSetupLocation() {
    if (!setup) return
    setStage('confirming')

    // Save setup to localStorage so it survives the auth redirect
    const setupPayload = {
      setup,
      locationName: setup.location_name,
      locationType: setup.industry,
      timestamp: Date.now(),
    }
    localStorage.setItem('frontline_pending_setup', JSON.stringify(setupPayload))

    // Redirect to sign-up — after auth, user lands on /lm where setup is hydrated
    router.push('/sign-up')
  }

  return (
    <div className="w-full">
      {/* Form */}
      <div className={stage === 'generating' ? 'opacity-50 pointer-events-none' : ''}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#222222] mb-1.5">
              What&apos;s your location called?
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g., Downtown, Store #42"
              className="w-full rounded-[8px] border border-[#ebebeb] px-4 py-2.5 text-sm text-[#222222] placeholder-[#b0b0b0] focus:outline-none focus:border-[#222222] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#222222] mb-1.5">Type</label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setLocationType(t)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    locationType === t
                      ? 'bg-[#222222] text-white'
                      : 'bg-[#f7f7f7] text-[#222222] hover:bg-[#ebebeb]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#222222] mb-1.5">Team size</label>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setTeamSize(s)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    teamSize === s
                      ? 'bg-[#222222] text-white'
                      : 'bg-[#f7f7f7] text-[#222222] hover:bg-[#ebebeb]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#222222] mb-1.5">
              What&apos;s not working right now?
            </label>
            <textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              rows={4}
              placeholder="e.g., New hires keep making mistakes on food prep. Turnover is 80%+. My quality scores are dropping but I don't know why..."
              className="w-full rounded-[14px] border border-[#ebebeb] bg-[#f7f7f7] px-4 py-3 text-sm text-[#222222] placeholder-[#b0b0b0] focus:outline-none focus:border-[#222222] transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={stage !== 'idle'}
            className="w-full bg-[#ff385c] text-white rounded-[8px] px-8 py-3 text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Diagnose my location
          </button>
        </div>
      </div>

      {/* Loading state */}
      {stage === 'generating' && (
        <div
          className="mt-6 rounded-[20px] bg-white p-6 flex items-center gap-3"
          style={{
            boxShadow:
              'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
          }}
        >
          <Loader2 className="h-5 w-5 text-[#ff385c] animate-spin" />
          <span className="text-sm font-medium text-[#222222]">Analyzing your situation...</span>
        </div>
      )}

      {/* Error notice */}
      {error && stage === 'reviewing' && (
        <div className="mt-4 rounded-[8px] bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {/* Diagnosis results */}
      {stage === 'reviewing' && setup && (
        <div className="mt-6 space-y-6">
          <div
            className="rounded-[20px] bg-white p-6"
            style={{
              boxShadow:
                'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
            }}
          >
            {/* Root causes */}
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#ff385c]" />
              <h3 className="text-[18px] font-bold text-[#222222]" style={{ letterSpacing: '-0.44px' }}>
                Your Diagnosis
              </h3>
            </div>
            <ol className="space-y-3 mb-6">
              {setup.diagnosis.root_causes.map((rc, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-sm font-bold text-[#ff385c] shrink-0">{i + 1}.</span>
                  <div>
                    <p className="text-sm font-semibold text-[#222222]">{rc.cause}</p>
                    <p className="text-sm text-[#6a6a6a] mt-0.5">{rc.reasoning}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Estimated Pulse */}
            <h4 className="text-[15px] font-bold text-[#222222] mb-3">Estimated Pulse</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {setup.diagnosis.estimated_pulse.map((pm) => {
                const metricLabels: Record<string, string> = {
                  task_completion_rate: 'Task Completion',
                  labor_cost_percent: 'Labor Cost',
                  customer_satisfaction: 'Customer Satisfaction',
                  quality_score: 'Quality Score',
                  schedule_adherence: 'Schedule Adherence',
                  compliance_rate: 'Compliance Rate',
                }
                return (
                  <div
                    key={pm.metric_name}
                    className={`rounded-[14px] p-3 text-center ${getStatusColor(pm.status)}`}
                  >
                    <p className="text-xs font-medium opacity-80">{metricLabels[pm.metric_name] || pm.metric_name}</p>
                    <p className="text-lg font-bold mt-1">
                      {pm.metric_name === 'customer_satisfaction'
                        ? pm.estimated_value.toFixed(1)
                        : pm.estimated_value}
                      {pm.metric_name !== 'customer_satisfaction' ? '%' : '/5'}
                    </p>
                    <p className="text-xs opacity-70">target: {pm.target}{pm.metric_name !== 'customer_satisfaction' ? '%' : '/5'}</p>
                  </div>
                )
              })}
            </div>

            {/* Recommended Actions */}
            <h4 className="text-[15px] font-bold text-[#222222] mb-3">Recommended Actions</h4>
            <div className="space-y-3 mb-6">
              {setup.diagnosis.recommended_actions.map((ra, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#fff1f3] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-[#ff385c]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#222222]">{ra.action}</p>
                    <p className="text-sm text-[#6a6a6a] mt-0.5">{ra.expected_impact}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Task Templates */}
            <div>
              <button
                onClick={() => setShowTasks(!showTasks)}
                className="flex items-center gap-2 text-sm font-semibold text-[#222222] hover:text-[#ff385c] transition-colors"
              >
                <h4>Task Templates</h4>
                <span className="text-[#6a6a6a] font-medium">
                  {setup.task_templates.length} tasks generated
                </span>
                {showTasks ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {showTasks && (
                <ul className="mt-3 space-y-2">
                  {setup.task_templates.map((t, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-[#222222] py-1.5 px-3 rounded-[8px] bg-[#f7f7f7]"
                    >
                      <Check className="h-3.5 w-3.5 text-[#008a05] shrink-0" />
                      <span>{t.title}</span>
                      <span className="ml-auto text-xs text-[#6a6a6a] capitalize">{t.priority}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleSetupLocation}
            className="w-full bg-[#ff385c] text-white rounded-[8px] px-8 py-4 text-base font-semibold hover:opacity-90 transition-opacity"
          >
            Set up my location
          </button>
        </div>
      )}
    </div>
  )
}
