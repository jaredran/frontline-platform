'use client'

import { useState, useRef } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { canAffordAction, consumeCredits } from '@/lib/data/store'
import { UpgradePrompt } from './upgrade-prompt'
import type { AIActionType } from '@/lib/types'

interface InlineAIProps {
  placeholder: string
  endpoint: string
  buildPayload: (message: string) => Record<string, unknown>
  compact?: boolean
  actionType?: AIActionType
  checkCredits?: boolean
}

export function InlineAI({ placeholder, endpoint, buildPayload, compact = false, actionType = 'ask', checkCredits = true }: InlineAIProps) {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSend() {
    if (!input.trim() || loading) return

    if (checkCredits && actionType && !canAffordAction(actionType)) {
      setShowUpgrade(true)
      return
    }
    if (checkCredits && actionType) {
      consumeCredits(actionType)
    }

    const msg = input.trim()
    setInput('')
    setResponse('')
    setShowUpgrade(false)
    setLoading(true)

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(msg)),
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
        setResponse(accumulated)
      }
    } catch {
      setResponse('Could not get a response. Check that ANTHROPIC_API_KEY is set.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={placeholder}
          disabled={loading}
          className={`flex-1 bg-white border border-[#ebebeb] rounded-[32px] px-4 text-[#222222] placeholder-[#6a6a6a] focus:outline-none focus:border-[#222222] focus:shadow-[0_0_0_2px_rgba(34,34,34,0.1)] transition-all font-medium ${compact ? 'py-2 text-xs' : 'py-2.5 text-sm'}`}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-[#ff385c] text-white disabled:opacity-30 hover:bg-[#e00b41] transition-colors shrink-0 shadow-[rgba(0,0,0,0.08)_0px_4px_12px]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
      {showUpgrade && <UpgradePrompt />}
      {!showUpgrade && (response || loading) && (
        <div className="text-sm text-[#222222] leading-relaxed whitespace-pre-wrap bg-[#f7f7f7] rounded-[20px] px-4 py-3" style={{ boxShadow: 'var(--airbnb-shadow-card)' }}>
          {response || (
            <span className="text-[#6a6a6a] flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
            </span>
          )}
        </div>
      )}
    </div>
  )
}
