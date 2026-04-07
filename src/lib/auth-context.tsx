'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Profile, Role } from './types'
import { getProfile } from './data/store'
import { DEMO_USERS } from './data/seed'

interface AuthContextType {
  user: Profile | null
  login: (userId: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('demo_user_id')
    if (saved) {
      return getProfile(saved) || null
    }
    return null
  })

  const login = useCallback((userId: string) => {
    const profile = getProfile(userId)
    if (profile) {
      setUser(profile)
      localStorage.setItem('demo_user_id', userId)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('demo_user_id')
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
