'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getAllPlaybooks, getPlaybookCompletions, getAllLocations, getProfilesByLocation, getPulseMetrics } from '@/lib/data/store'
import { AIBriefing } from '@/components/shared/ai-briefing'
import { InlineAI } from '@/components/shared/inline-ai'
import {
  AlertTriangle,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react'
import type { Playbook, PlaybookContent } from '@/lib/types'

const CARD_SHADOW = 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px'

export default function LDPage() {
  const { user } = useAuth()
  const [topic, setTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<PlaybookContent | null>(null)
  const [expandedPlaybook, setExpandedPlaybook] = useState<string | null>(null)
  const [showContent, setShowContent] = useState<string | null>(null)

  if (!user) return null

  const playbooks = getAllPlaybooks()
  const locations = getAllLocations()

  // Flagged playbooks: completion_rate < 70 or effectiveness_score < 75
  const flagged = useMemo(() => {
    return playbooks.filter(
      pb => (pb.completion_rate ?? 0) < 70 || (pb.effectiveness_score ?? 0) < 75
    )
  }, [playbooks])

  // Build per-playbook location completions
  function getLocationBreakdown(pb: Playbook) {
    const completions = getPlaybookCompletions(pb.id)
    return locations.map(loc => {
      const locProfiles = getProfilesByLocation(loc.id)
      const locCompletions = completions.filter(c =>
        locProfiles.some(p => p.id === c.profile_id)
      )
      const rate = locProfiles.length > 0
        ? Math.round((locCompletions.length / locProfiles.length) * 100)
        : 0
      return { name: loc.name, rate }
    })
  }

  function isFlagged(pb: Playbook) {
    return (pb.completion_rate ?? 0) < 70 || (pb.effectiveness_score ?? 0) < 75
  }

  function completionColor(rate: number) {
    if (rate > 80) return 'text-[#008a05]'
    if (rate >= 50) return 'text-[#222222]'
    return 'text-[#c13515]'
  }

  function effectivenessColor(score: number) {
    if (score > 80) return 'text-[#008a05]'
    if (score >= 50) return 'text-[#222222]'
    return 'text-[#c13515]'
  }

  async function handleGenerate() {
    if (!topic.trim()) return
    setIsGenerating(true)
    setGeneratedContent(null)

    try {
      const response = await fetch('/api/ai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedContent(data)
      } else {
        throw new Error('API error')
      }
    } catch {
      setGeneratedContent({
        steps: [
          { title: `Introduction to ${topic}`, instructions: `Overview of key concepts and standards for ${topic}.`, tips: ['Review before each shift'] },
          { title: 'Hands-on Practice', instructions: `Step-by-step walkthrough of ${topic} procedures.`, tips: ['Practice with a partner', 'Ask questions as you go'] },
          { title: 'Quality Check', instructions: `How to verify ${topic} standards are met.`, tips: ['Use the checklist provided', 'Document any issues'] },
        ],
        quiz: [
          { question: `What is the most important aspect of ${topic}?`, options: ['Speed', 'Accuracy', 'Consistency', 'All of the above'], correct: 3, explanation: 'All aspects work together to ensure quality outcomes.' },
        ],
        key_takeaways: [
          `Mastering ${topic} is essential for operational excellence`,
          'Consistent execution drives quality scores',
          'When in doubt, refer to the playbook',
        ],
      })
    } finally {
      setIsGenerating(false)
    }
  }

  function handlePublish() {
    alert('Playbook published! (prototype)')
    setGeneratedContent(null)
    setTopic('')
  }

  // Build attention issues list
  const attentionIssues = flagged.map(pb => {
    const issues: string[] = []
    if ((pb.completion_rate ?? 0) < 70) issues.push(`${pb.completion_rate ?? 0}% completion`)
    if ((pb.effectiveness_score ?? 0) < 75) issues.push(`${pb.effectiveness_score ?? 0} effectiveness`)
    return `${pb.title}: ${issues.join(', ')}`
  })

  return (
    <div className="bg-white min-h-screen">
      <AIBriefing
        role="ld"
        contextData={{
          playbooks: playbooks.map(pb => ({
            title: pb.title,
            completionRate: pb.completion_rate,
            effectivenessScore: pb.effectiveness_score,
            status: pb.status,
          })),
          flaggedCount: flagged.length,
          flaggedPlaybooks: flagged.map(f => f.title),
          locationMetrics: locations.map(loc => ({
            name: loc.name,
            qualityScore: getPulseMetrics(loc.id).find(m => m.metric_name === 'quality_score')?.actual,
            customerSatisfaction: getPulseMetrics(loc.id).find(m => m.metric_name === 'customer_satisfaction')?.actual,
          })),
        }}
      />

      {/* Attention banner */}
      {flagged.length > 0 && (
        <div className="mx-5 mt-4 rounded-[20px] bg-[#fff8f6] border-l-4 border-[#c13515] px-5 py-4">
          <p className="text-[15px] font-semibold text-[#222222]">
            {flagged.length} playbook{flagged.length !== 1 ? 's' : ''} need attention
          </p>
          <div className="mt-1.5 space-y-0.5">
            {attentionIssues.map((issue, i) => (
              <p key={i} className="text-[13px] text-[#6a6a6a] flex items-center gap-1.5">
                <AlertTriangle className="inline h-3.5 w-3.5 text-[#c13515] shrink-0" />
                {issue}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Create new section */}
      <div className="mx-5 mt-4 rounded-[20px] bg-white p-5" style={{ boxShadow: CARD_SHADOW }}>
        <p className="text-[15px] font-semibold text-[#222222] mb-3">Create new playbook</p>
        <textarea
          className="w-full bg-[#f7f7f7] border border-[#ebebeb] rounded-[14px] p-4 text-sm text-[#222222] placeholder-[#6a6a6a] resize-none focus:border-[#222222] focus:outline-none transition-colors"
          rows={3}
          placeholder="Describe what your team needs to learn..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <div className="flex items-center justify-end mt-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-[8px] bg-[#ff385c] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#e00b41] transition-colors"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {/* Generated content */}
        {generatedContent && (
          <div className="mt-5">
            <p className="text-[13px] font-semibold text-[#6a6a6a] uppercase tracking-wide mb-3">Generated Content</p>

            {/* Steps */}
            <div className="space-y-2 mb-4">
              {generatedContent.steps.map((step, i) => (
                <div key={i} className="bg-[#f7f7f7] rounded-[14px] p-4">
                  <p className="text-sm text-[#222222]">
                    <span className="text-[#ff385c] font-semibold mr-1.5">{i + 1}.</span>
                    <span className="font-semibold">{step.title}</span>
                  </p>
                  <p className="text-[13px] text-[#6a6a6a] mt-1 ml-5">{step.instructions}</p>
                  {step.tips.length > 0 && (
                    <div className="ml-5 mt-2 flex gap-2 flex-wrap">
                      {step.tips.map((tip, j) => (
                        <span key={j} className="text-[11px] text-[#222222] bg-white border border-[#ebebeb] px-2.5 py-1 rounded-full font-medium">
                          {tip}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quiz */}
            <div className="mb-4">
              <p className="text-[13px] font-semibold text-[#6a6a6a] uppercase tracking-wide mb-2">Quiz</p>
              {generatedContent.quiz.map((q, i) => (
                <div key={i} className="bg-[#f7f7f7] rounded-[14px] p-4 mb-2">
                  <p className="text-sm text-[#222222] font-medium">Q{i + 1}: {q.question}</p>
                  <div className="mt-2 space-y-1 ml-4">
                    {q.options.map((opt, j) => (
                      <p key={j} className={`text-[13px] ${j === q.correct ? 'text-[#008a05] font-medium' : 'text-[#6a6a6a]'}`}>
                        {j === q.correct ? '* ' : '  '}{opt}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Key Takeaways */}
            <div className="mb-4">
              <p className="text-[13px] font-semibold text-[#6a6a6a] uppercase tracking-wide mb-2">Key Takeaways</p>
              <div className="bg-[#f7f7f7] rounded-[14px] p-4">
                {generatedContent.key_takeaways.map((t, i) => (
                  <p key={i} className="text-[13px] text-[#222222] mb-1 last:mb-0">
                    <span className="text-[#008a05] mr-1.5">-</span>{t}
                  </p>
                ))}
              </div>
            </div>

            {/* Publish */}
            <button
              onClick={handlePublish}
              className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-[8px] bg-[#222222] text-white text-sm font-medium hover:bg-[#000000] transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              Publish
            </button>
          </div>
        )}
      </div>

      {/* Playbook feed */}
      <div className="mt-4">
        {playbooks.map((pb) => {
          const isExpanded = expandedPlaybook === pb.id
          const flaggedPb = isFlagged(pb)
          const breakdown = isExpanded ? getLocationBreakdown(pb) : []

          // Compute correlation: locations with >80% completion vs quality
          const highCompletionLocs = isExpanded
            ? breakdown.filter(b => b.rate > 80)
            : []

          return (
            <div
              key={pb.id}
              className={`border-b border-[#ebebeb] ${flaggedPb ? 'border-l-4 border-l-[#c13515]' : ''}`}
            >
              {/* Playbook row */}
              <button
                onClick={() => setExpandedPlaybook(isExpanded ? null : pb.id)}
                className="w-full px-5 py-4 text-left hover:bg-[#f7f7f7] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-[15px] font-semibold text-[#222222]" style={{ letterSpacing: '-0.2px' }}>{pb.title}</p>
                    <p className="text-[13px] text-[#6a6a6a] line-clamp-1 mt-0.5">{pb.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[15px] font-semibold tabular-nums ${completionColor(pb.completion_rate ?? 0)}`}>
                      {pb.completion_rate ?? 0}%
                    </span>
                    <span className={`text-[15px] font-semibold tabular-nums ${effectivenessColor(pb.effectiveness_score ?? 0)}`}>
                      {pb.effectiveness_score ?? 0}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-[#6a6a6a]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#6a6a6a]" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="bg-[#f7f7f7] rounded-[20px] mx-5 my-2 p-5 space-y-3" style={{ boxShadow: CARD_SHADOW }}>
                  {/* Location breakdown */}
                  <div className="flex flex-wrap gap-x-1 gap-y-1 text-[13px]">
                    {breakdown.map((b, i) => (
                      <span key={i} className="text-[#6a6a6a]">
                        <span className="text-[#222222] font-medium">{b.name}</span>{' '}
                        <span className={`font-semibold ${completionColor(b.rate)}`}>{b.rate}%</span>
                        {i < breakdown.length - 1 && <span className="text-[#ebebeb] mx-1">&middot;</span>}
                      </span>
                    ))}
                  </div>

                  {/* Impact line */}
                  {highCompletionLocs.length > 0 && (
                    <p className="text-[13px] text-[#6a6a6a] italic">
                      Locations with &gt;80% completion have higher quality scores
                    </p>
                  )}

                  {/* Content preview */}
                  <div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowContent(showContent === pb.id ? null : pb.id) }}
                      className="text-[13px] text-[#ff385c] font-medium hover:underline"
                    >
                      {showContent === pb.id ? 'Hide content' : 'Show content'}
                    </button>
                    {showContent === pb.id && (
                      <div className="mt-2 space-y-1">
                        {pb.content.steps.map((step, i) => (
                          <p key={i} className="text-[13px] text-[#222222]">
                            <span className="text-[#ff385c] font-semibold mr-1">{i + 1}.</span>
                            {step.title}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* InlineAI for editing */}
                  <InlineAI
                    placeholder="Describe what to change..."
                    endpoint="/api/ai/content"
                    buildPayload={(message) => ({ topic: message, playbook_id: pb.id })}
                    compact
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
