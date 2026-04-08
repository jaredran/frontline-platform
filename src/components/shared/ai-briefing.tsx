'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'

interface AIBriefingProps {
  role: string
  contextData: Record<string, unknown>
  accentColor?: string
}

export function AIBriefing({ role, contextData, accentColor = '#ff385c' }: AIBriefingProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const hasFetched = useRef(false)

  async function fetchBriefing() {
    setText('')
    setLoading(true)
    setError(false)

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
        setText(accumulated)
      }
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

  if (error && !text) return null

  return (
    <div
      className="mx-5 mt-4 rounded-[20px] bg-[#f7f7f7] px-5 py-4"
      style={{
        borderLeft: `4px solid ${accentColor}`,
        boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
      }}
    >
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
            className="p-1 rounded-full hover:bg-[#ebebeb] transition-colors"
            title="Refresh briefing"
          >
            <RefreshCw className="h-3 w-3 text-[#6a6a6a]" />
          </button>
        )}
      </div>
      <div className="text-[15px] font-medium text-[#222222] leading-relaxed">
        {text || (
          <span className="flex items-center gap-2 text-[#6a6a6a]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Preparing your briefing...
          </span>
        )}
        {loading && text && (
          <Loader2 className="inline h-3 w-3 animate-spin text-[#6a6a6a] ml-1" />
        )}
      </div>
    </div>
  )
}
