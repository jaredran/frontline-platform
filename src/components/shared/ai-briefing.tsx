'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Loader2, RefreshCw, Send, Check } from 'lucide-react'
import { canAffordAction, consumeCredits } from '@/lib/data/store'
import { UpgradePrompt } from './upgrade-prompt'
import type { RecommendedAction } from '@/lib/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIBriefingProps {
  role: string
  contextData: Record<string, unknown>
  accentColor?: string
}

const cardShadow = 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px'

const IMPACT_BG: Record<string, string> = {
  high: 'bg-[#008a05] text-white',
  medium: 'bg-[#f7f7f7] text-[#222222]',
  low: 'bg-[#f7f7f7] text-[#6a6a6a]',
}

function parseBriefingResponse(raw: string): {
  text: string
  actions: RecommendedAction[]
} {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])

      let formattedText = ''
      if (parsed.briefing) {
        formattedText = parsed.briefing
      } else if (parsed.diagnosis) {
        formattedText = parsed.diagnosis
      }
      if (parsed.causes && Array.isArray(parsed.causes)) {
        const causesText = parsed.causes.map(
          (c: { cause: string; evidence?: string; severity?: string }, i: number) =>
            `${i + 1}. ${c.cause}${c.evidence ? '\n   ' + c.evidence : ''}`
        ).join('\n\n')
        formattedText = formattedText ? formattedText + '\n\n' + causesText : causesText
      }

      const actions: RecommendedAction[] = parsed.recommended_actions && Array.isArray(parsed.recommended_actions)
        ? parsed.recommended_actions
        : []

      return { text: formattedText || raw, actions }
    }
  } catch {
    // Fall through to raw text
  }
  return { text: raw, actions: [] }
}

export function AIBriefing({ role, contextData, accentColor = '#ff385c' }: AIBriefingProps) {
  const [briefingText, setBriefingText] = useState('')
  const [briefingActions, setBriefingActions] = useState<RecommendedAction[]>([])
  const [approvedActions, setApprovedActions] = useState<Set<number>>(new Set())
  const [dismissedActions, setDismissedActions] = useState<Set<number>>(new Set())
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [error, setError] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [input, setInput] = useState('')
  const [streamingReply, setStreamingReply] = useState('')
  const hasFetched = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingReply])

  async function fetchBriefing() {
    setBriefingText('')
    setBriefingActions([])
    setApprovedActions(new Set())
    setDismissedActions(new Set())
    setMessages([])
    setStreamingReply('')
    setInput('')
    setLoading(true)
    setError(false)
    setShowUpgrade(false)

    // Check for pre-loaded briefing (from hero flow)
    const savedBriefing = typeof window !== 'undefined' ? localStorage.getItem('frontline_initial_briefing') : null
    if (savedBriefing) {
      localStorage.removeItem('frontline_initial_briefing')
      const { text, actions } = parseBriefingResponse(savedBriefing)
      setBriefingText(text)
      setBriefingActions(actions)
      setMessages([{ role: 'assistant', content: text }])
      setLoading(false)
      return
    }

    const canAfford = await canAffordAction('briefing')
    if (!canAfford) {
      setShowUpgrade(true)
      setLoading(false)
      return
    }
    await consumeCredits('briefing')

    try {
      const res = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, contextData }),
      })

      if (!res.ok) throw new Error('Failed')

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
      }

      // Parse the complete response
      const { text, actions } = parseBriefingResponse(accumulated)
      setBriefingText(text)
      setBriefingActions(actions)
      setMessages([{ role: 'assistant', content: text }])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchBriefing()
  }, [])

  async function handleSend() {
    if (!input.trim() || chatLoading) return

    const canAfford = await canAffordAction('ask')
    if (!canAfford) {
      setShowUpgrade(true)
      return
    }
    await consumeCredits('ask')

    const userMessage = input.trim()
    setInput('')
    const updatedMessages = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(updatedMessages)
    setChatLoading(true)
    setStreamingReply('')

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: { role, ...contextData, previousBriefing: briefingText },
          history: updatedMessages,
        }),
      })

      if (!res.ok) throw new Error('Failed')

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamingReply(accumulated)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: accumulated }])
      setStreamingReply('')
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Could not get a response. Please try again.' }])
      setStreamingReply('')
    } finally {
      setChatLoading(false)
      inputRef.current?.focus()
    }
  }

  if (showUpgrade) {
    return (
      <div className="mx-5 mt-4">
        <UpgradePrompt />
      </div>
    )
  }

  if (error && !briefingText) return null

  // Follow-up messages (skip the first assistant message which is the briefing)
  const followUpMessages = messages.slice(1)

  return (
    <div
      className="mx-5 mt-4 rounded-[20px] bg-[#f7f7f7] px-5 py-4 transition-all duration-300"
      style={{
        borderLeft: `4px solid ${accentColor}`,
        boxShadow: cardShadow,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" style={{ color: accentColor }} />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6a6a6a]">
            AI Briefing
          </span>
        </div>
        {!loading && (
          <button
            onClick={() => { hasFetched.current = true; fetchBriefing() }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-[#ebebeb] transition-colors text-[11px] text-[#6a6a6a] font-medium"
            title="New briefing"
          >
            <RefreshCw className="h-3 w-3" />
            New briefing
          </button>
        )}
      </div>

      {/* Main briefing text */}
      <div className="text-[15px] font-medium text-[#222222] leading-relaxed">
        {briefingText ? (
          <div className="space-y-2">
            {briefingText.split('\n').filter(Boolean).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        ) : (
          <span className="flex items-center gap-2 text-[#6a6a6a]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Preparing your briefing...
          </span>
        )}
        {loading && briefingText && (
          <Loader2 className="inline h-3 w-3 animate-spin text-[#6a6a6a] ml-1" />
        )}
      </div>

      {/* Recommended actions */}
      {briefingActions.length > 0 && !loading && (
        <div className="mt-4 space-y-3">
          <p className="text-[13px] text-[#6a6a6a] font-semibold uppercase tracking-wider">
            Recommended Actions
          </p>
          {briefingActions.map((action, idx) => {
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
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${IMPACT_BG[action.impact] || IMPACT_BG.medium}`}>
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

      {/* Follow-up conversation */}
      {followUpMessages.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#ebebeb] space-y-2">
          {followUpMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <div className="bg-white rounded-[14px] px-3 py-2 text-[13px] text-[#222222] max-w-[85%]" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 3px' }}>
                  {msg.content}
                </div>
              ) : (
                <div className="text-[13px] text-[#222222] leading-relaxed max-w-[95%] pl-1 whitespace-pre-wrap">
                  {msg.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Streaming reply */}
      {streamingReply && (
        <div className={`${followUpMessages.length === 0 ? 'mt-3 pt-3 border-t border-[#ebebeb]' : ''} flex justify-start mt-2`}>
          <div className="text-[13px] text-[#222222] leading-relaxed max-w-[95%] pl-1 whitespace-pre-wrap">
            {streamingReply}
            <Loader2 className="inline h-3 w-3 animate-spin text-[#6a6a6a] ml-1" />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      {/* Chat input */}
      {!loading && briefingText && (
        <div className="mt-3 pt-3 border-t border-[#ebebeb] flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about this briefing or tell me what to do..."
            disabled={chatLoading}
            className="flex-1 bg-white border border-[#ebebeb] rounded-[32px] px-3.5 py-2 text-[13px] text-[#222222] placeholder-[#6a6a6a] focus:outline-none focus:border-[#222222] focus:shadow-[0_0_0_2px_rgba(34,34,34,0.1)] transition-all font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || chatLoading}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-[#ff385c] text-white disabled:opacity-30 hover:bg-[#e00b41] transition-colors shrink-0 shadow-[rgba(0,0,0,0.08)_0px_4px_12px]"
          >
            {chatLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
    </div>
  )
}
