'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { DEMO_USERS } from '@/lib/data/seed'
import { ROLE_LABELS } from '@/lib/constants'
import type { Role } from '@/lib/types'

export default function LoginPage() {
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
        {/* Logo */}
        <div className="text-center mb-8">
          <svg viewBox="0 0 32 32" className="h-12 w-12 text-[#ff385c] mx-auto mb-4" fill="currentColor">
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415c0 1.456-.463 2.648-1.408 3.563-1.05 1.02-2.324 1.413-3.87 1.413-.872 0-1.872-.178-2.943-.534-1.255-.414-2.604-1.16-3.814-2.105-.497-.39-.983-.819-1.464-1.287-.48.468-.967.897-1.464 1.287-1.21.944-2.559 1.691-3.814 2.105-1.07.356-2.07.534-2.943.534-1.547 0-2.82-.394-3.87-1.413C2.463 26.77 2 25.578 2 24.122l.01-.415c.05-.924.293-1.805.96-3.396l.145-.353c.986-2.296 5.146-11.005 7.1-14.836l.533-1.025C12.037 1.963 13.492 1 15.5 1h.5z"/>
          </svg>
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
