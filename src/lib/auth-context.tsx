'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { Profile } from './types'
import { getProfile, addProfile } from './data/store'

interface AuthContextType {
  user: Profile | null
  login: (userId: string) => void
  loginWithNewProfile: (profile: Profile) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  loginWithNewProfile: () => {},
  logout: () => {},
  isAuthenticated: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)

  // On mount, restore session from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('demo_user_id')
    if (saved) {
      getProfile(saved).then((profile) => {
        if (profile) setUser(profile)
      })
    }
  }, [])

  const login = useCallback((userId: string) => {
    getProfile(userId).then((profile) => {
      if (profile) {
        setUser(profile)
        localStorage.setItem('demo_user_id', userId)
      }
    })
  }, [])

  const loginWithNewProfile = useCallback((profile: Profile) => {
    addProfile(profile).then(() => {
      setUser(profile)
      localStorage.setItem('demo_user_id', profile.id)
    })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('demo_user_id')
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, loginWithNewProfile, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
