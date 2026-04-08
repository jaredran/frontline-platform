'use client'

import { useState } from 'react'
import { Users, BookOpen, Activity, Zap, TrendingUp, ChevronDown, Copy, Check } from 'lucide-react'
import { getLMProgress, advanceLMProgress } from '@/lib/data/store'
import type { LMProgressStep } from '@/lib/types'

interface NextStepCardProps {
  onAdvance?: () => void
}

const cardShadow = 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px'

const STEP_CONFIG: Record<Exclude<LMProgressStep, 'complete'>, {
  icon: typeof Users
  headline: string
  body: string
}> = {
  invite_team: {
    icon: Users,
    headline: 'Your Pulse needs real data',
    body: 'Invite your team so they can track tasks and generate performance data.',
  },
  create_playbook: {
    icon: BookOpen,
    headline: 'Set your team up for success',
    body: 'Create a training playbook so your team knows the right way to do things.',
  },
  review_pulse: {
    icon: Activity,
    headline: 'Your Pulse is live',
    body: 'Tap any red metric below to see AI diagnosis of what\u2019s wrong and how to fix it.',
  },
  take_action: {
    icon: Zap,
    headline: 'Approve a recommended action',
    body: 'You\u2019ve seen the diagnosis. Approve an action to start an intervention and track its impact.',
  },
  track_results: {
    icon: TrendingUp,
    headline: 'Your intervention is running',
    body: 'We\u2019re tracking the impact. Check back in a few days to see your results.',
  },
}

export function NextStepCard({ onAdvance }: NextStepCardProps) {
  const [step, setStep] = useState<LMProgressStep>(getLMProgress())
  const [copied, setCopied] = useState(false)

  if (step === 'complete') return null

  const config = STEP_CONFIG[step]
  const Icon = config.icon

  function handleSkip() {
    const next = advanceLMProgress()
    setStep(next)
    onAdvance?.()
  }

  function handleCopyLink() {
    navigator.clipboard.writeText('https://frontline.app/join/abc123')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="mx-5 mt-4 rounded-[20px] bg-[#fff8f6] border-l-4 border-[#ff385c] px-5 py-4"
      style={{ boxShadow: cardShadow }}
    >
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-[#fff1f3] flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-[#ff385c]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="text-[15px] font-semibold text-[#222222]">{config.headline}</h3>
            {step !== 'track_results' && (
              <button onClick={handleSkip} className="text-[12px] text-[#6a6a6a] underline shrink-0 ml-2">
                Skip
              </button>
            )}
          </div>
          <p className="text-[13px] text-[#6a6a6a] mt-0.5 leading-relaxed">{config.body}</p>

          {/* Step-specific content */}
          {step === 'invite_team' && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-white border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[12px] text-[#6a6a6a] font-mono truncate">
                https://frontline.app/join/abc123
              </div>
              <button
                onClick={handleCopyLink}
                className="h-8 px-3 flex items-center gap-1.5 bg-[#222222] text-white rounded-[8px] text-[12px] font-medium hover:bg-[#ff385c] transition-colors shrink-0"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}

          {step === 'create_playbook' && (
            <div className="mt-3 space-y-2">
              <textarea
                placeholder="Describe a procedure..."
                className="w-full bg-white border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[13px] text-[#222222] placeholder-[#6a6a6a] focus:outline-none focus:border-[#222222] resize-none font-medium"
                rows={2}
              />
              <button
                onClick={handleSkip}
                className="bg-[#222222] text-white rounded-[8px] px-4 py-2 text-[13px] font-medium hover:bg-[#ff385c] transition-colors"
              >
                Generate
              </button>
            </div>
          )}

          {step === 'review_pulse' && (
            <div className="mt-2 flex justify-center">
              <ChevronDown className="h-5 w-5 text-[#ff385c] animate-bounce" />
            </div>
          )}

          {step === 'track_results' && (
            <p className="text-[11px] text-[#6a6a6a] mt-2">Scroll down to see your Results &amp; Impact section</p>
          )}
        </div>
      </div>
    </div>
  )
}
