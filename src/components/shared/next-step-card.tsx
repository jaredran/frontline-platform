'use client'

import { useState, useEffect } from 'react'
import { Users, BookOpen, Activity, Zap, TrendingUp, ChevronDown, Copy, Check, Loader2 } from 'lucide-react'
import { getLMProgress, advanceLMProgress, getProfilesByLocation } from '@/lib/data/store'
import type { LMProgressStep, Profile } from '@/lib/types'

interface NextStepCardProps {
  onAdvance?: () => void
  locationId?: string | null
  isDemoMode?: boolean
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
    body: 'Share this link with your team. When they join, you\u2019ll see them here and can assign tasks from your task templates.',
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

export function NextStepCard({ onAdvance, locationId, isDemoMode }: NextStepCardProps) {
  const [step, setStep] = useState<LMProgressStep>('invite_team')
  const [stepLoaded, setStepLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [playbookTopic, setPlaybookTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [playbookSuccess, setPlaybookSuccess] = useState(false)
  const [teamMembers, setTeamMembers] = useState<Profile[]>([])
  const [inviteCode, setInviteCode] = useState<string | null>(null)

  // Load step and team members
  useEffect(() => {
    if (!locationId) return
    Promise.all([
      getLMProgress(locationId),
      getProfilesByLocation(locationId),
    ]).then(([currentStep, profiles]) => {
      setStep(currentStep)
      setTeamMembers(profiles.filter((p: Profile) => p.role === 'fe'))
      setStepLoaded(true)
    })
  }, [locationId])

  // Generate invite link when on invite_team step
  useEffect(() => {
    if (!locationId || step !== 'invite_team') return
    fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.code) setInviteCode(data.code)
      })
      .catch(() => { /* ignore — will show fallback */ })
  }, [locationId, step])

  if (!stepLoaded || step === 'complete') return null

  const config = STEP_CONFIG[step]
  const Icon = config.icon

  async function handleSkip() {
    if (!locationId) return
    const next = await advanceLMProgress(locationId)
    setStep(next)
    onAdvance?.()
  }

  function handleCopyLink() {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = inviteCode ? `${origin}/join/${inviteCode}` : `${origin}/join/...`
    navigator.clipboard.writeText(url)
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
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[12px] text-[#6a6a6a] font-mono truncate">
                  {inviteCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${inviteCode}` : 'Generating invite link...'}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="h-8 px-3 flex items-center gap-1.5 bg-[#222222] text-white rounded-[8px] text-[12px] font-medium hover:bg-[#ff385c] transition-colors shrink-0"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              {/* Team status */}
              <div className="bg-white border border-[#ebebeb] rounded-[8px] px-3 py-2">
                {isDemoMode ? (
                  <p className="text-[12px] text-[#6a6a6a]">In the demo, team members are pre-configured. In a real location, your team joins via this link.</p>
                ) : (
                  <>
                    <p className="text-[12px] text-[#6a6a6a] font-medium">{teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''} joined</p>
                    <p className="text-[11px] text-[#6a6a6a] mt-1">Once your first team member joins, we&apos;ll help you assign tasks so your Pulse starts filling with real data.</p>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 'create_playbook' && (
            <div className="mt-3 space-y-2">
              {playbookSuccess ? (
                <div className="bg-white border border-[#ebebeb] rounded-[8px] px-3 py-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#008a05]" />
                  <p className="text-[13px] text-[#222222] font-medium">Playbook created! Your team will see it when they start tasks.</p>
                </div>
              ) : (
                <>
                  <textarea
                    placeholder="Describe a procedure..."
                    value={playbookTopic}
                    onChange={e => setPlaybookTopic(e.target.value)}
                    className="w-full bg-white border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[13px] text-[#222222] placeholder-[#6a6a6a] focus:outline-none focus:border-[#222222] resize-none font-medium"
                    rows={2}
                  />
                  <button
                    onClick={async () => {
                      if (!playbookTopic.trim() || !locationId) return
                      setIsGenerating(true)
                      try {
                        const res = await fetch('/api/ai/content', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ topic: playbookTopic }),
                        })
                        if (res.ok) {
                          const next = await advanceLMProgress(locationId)
                          setStep(next)
                          setPlaybookSuccess(true)
                          onAdvance?.()
                        }
                      } catch { /* ignore */ } finally {
                        setIsGenerating(false)
                      }
                    }}
                    disabled={isGenerating || !playbookTopic.trim()}
                    className="bg-[#222222] text-white rounded-[8px] px-4 py-2 text-[13px] font-medium hover:bg-[#ff385c] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isGenerating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </button>
                </>
              )}
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
