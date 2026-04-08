'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { DEMO_USERS } from '@/lib/data/seed'
import { ROLE_LABELS } from '@/lib/constants'
import type { Role } from '@/lib/types'
import Link from 'next/link'
import { Logo } from '@/components/shared/logo'

export default function DemoPage() {
  const { login, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push(`/${user.role}`)
    }
  }, [user, router])

  function handleLogin(userId: string, role: Role) {
    login(userId)
    router.push(`/${role}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#6a6a6a] hover:text-[#222222] transition-colors mb-6"
        >
          &larr; Back to home
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-fit"><Logo size={48} /></div>
          <h1 className="text-[28px] font-bold text-[#222222]" style={{ letterSpacing: '-0.44px' }}>Frontline</h1>
          <p className="text-sm text-[#6a6a6a] mt-1 font-medium">Select an account to explore</p>
        </div>

        {/* User list */}
        <div className="rounded-[20px] overflow-hidden" style={{ boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px' }}>
          {DEMO_USERS.map((demoUser, i) => (
            <button
              key={demoUser.id}
              onClick={() => handleLogin(demoUser.id, demoUser.role as Role)}
              className={`w-full flex items-center gap-3 px-5 py-4 hover:bg-[#f7f7f7] transition-colors text-left ${
                i > 0 ? 'border-t border-[#ebebeb]' : ''
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-[#f7f7f7] flex items-center justify-center text-sm font-bold text-[#222222] shrink-0">
                {demoUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-[#222222]">{demoUser.name}</p>
                <p className="text-[13px] text-[#6a6a6a]">
                  {ROLE_LABELS[demoUser.role as Role]} &middot; {demoUser.location}
                </p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-[#6a6a6a] text-center mt-8 font-medium">
          Crisp &amp; Green &middot; 3 locations &middot; AI by Claude
        </p>
      </div>
    </div>
  )
}
