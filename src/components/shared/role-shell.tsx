'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ROLE_NAV } from '@/lib/constants'
import { UserButton } from '@clerk/nextjs'
import type { Role } from '@/lib/types'
import { CreditDisplay } from './credit-display'
import { Logo } from './logo'

export function RoleShell({
  role,
  children,
}: {
  role: Role
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const nav = ROLE_NAV[role]

  useEffect(() => {
    if (!user) {
      router.push('/')
    } else if (user.role !== role) {
      router.push(`/${user.role}`)
    }
  }, [user, role, router])

  if (!user || user.role !== role) return null

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Airbnb-style sticky header */}
      <header className="border-b border-[#ebebeb] px-5 py-3 flex items-center justify-between shrink-0 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <div>
            <p className="text-base font-semibold text-[#222222]" style={{ letterSpacing: '-0.2px' }}>{nav.label}</p>
            <p className="text-xs text-[#6a6a6a] font-medium">{user.full_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CreditDisplay />
          <UserButton />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
