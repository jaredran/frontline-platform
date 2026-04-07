'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ROLE_NAV } from '@/lib/constants'
import { LogOut } from 'lucide-react'
import type { Role } from '@/lib/types'

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
          <svg viewBox="0 0 32 32" className="h-8 w-8 text-[#ff385c]" fill="currentColor">
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415c0 1.456-.463 2.648-1.408 3.563-1.05 1.02-2.324 1.413-3.87 1.413-.872 0-1.872-.178-2.943-.534-1.255-.414-2.604-1.16-3.814-2.105-.497-.39-.983-.819-1.464-1.287-.48.468-.967.897-1.464 1.287-1.21.944-2.559 1.691-3.814 2.105-1.07.356-2.07.534-2.943.534-1.547 0-2.82-.394-3.87-1.413C2.463 26.77 2 25.578 2 24.122l.01-.415c.05-.924.293-1.805.96-3.396l.145-.353c.986-2.296 5.146-11.005 7.1-14.836l.533-1.025C12.037 1.963 13.492 1 15.5 1h.5z"/>
          </svg>
          <div>
            <p className="text-base font-semibold text-[#222222]" style={{ letterSpacing: '-0.2px' }}>{nav.label}</p>
            <p className="text-xs text-[#6a6a6a] font-medium">{user.full_name}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); router.push('/') }}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-[#f7f7f7] text-[#222222] hover:shadow-[rgba(0,0,0,0.08)_0px_4px_12px] transition-all"
          title="Switch user"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
