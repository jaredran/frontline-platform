'use client'

import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { getCreditsRemaining } from '@/lib/data/store'

export function CreditDisplay() {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    getCreditsRemaining().then(setRemaining)
  }, [])

  if (remaining === null) return null

  const isLow = remaining < 10
  const isEmpty = remaining === 0

  return (
    <div className="flex items-center gap-1.5 bg-[#f7f7f7] rounded-full px-3 py-1.5">
      <Sparkles className="h-3 w-3 text-[#ff385c]" />
      <span className={`text-[12px] font-semibold ${isLow ? 'text-[#c13515]' : 'text-[#6a6a6a]'}`}>
        {isEmpty ? 'No credits' : `${remaining} credits`}
      </span>
    </div>
  )
}
