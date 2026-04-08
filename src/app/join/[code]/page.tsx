'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, MapPin, Users } from 'lucide-react'
import { Logo } from '@/components/shared/logo'

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [locationName, setLocationName] = useState('')
  const [locationId, setLocationId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function validate() {
      try {
        const res = await fetch(`/api/invite?code=${code}`)
        if (!res.ok) {
          setError('This invite link is invalid or has expired.')
          setLoading(false)
          return
        }
        const data = await res.json()
        setLocationName(data.locationName)
        setLocationId(data.locationId)
      } catch {
        setError('Unable to validate invite link.')
      } finally {
        setLoading(false)
      }
    }
    validate()
  }, [code])

  function handleJoin() {
    // Save invite info to localStorage so the LM page can create the profile
    localStorage.setItem('frontline_pending_invite', JSON.stringify({
      locationId,
      inviteCode: code,
      locationName,
      timestamp: Date.now(),
    }))
    router.push('/sign-up')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Logo size={40} />
          <span className="ml-2 text-[22px] font-bold text-[#222222]" style={{ letterSpacing: '-0.5px' }}>
            Frontline
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#ff385c]" />
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="bg-[#fff1f3] rounded-[20px] p-6 mb-4">
              <p className="text-[15px] text-[#c13515] font-medium">{error}</p>
            </div>
            <a href="/" className="text-[#ff385c] text-[15px] font-medium underline">
              Go to homepage
            </a>
          </div>
        ) : (
          <div
            className="bg-white rounded-[20px] p-6 text-center"
            style={{
              boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
            }}
          >
            <div className="h-12 w-12 rounded-full bg-[#fff1f3] flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-[#ff385c]" />
            </div>

            <h1 className="text-[22px] font-bold text-[#222222] mb-2" style={{ letterSpacing: '-0.5px' }}>
              You&apos;ve been invited to join
            </h1>

            <div className="flex items-center justify-center gap-2 mb-6">
              <MapPin className="h-4 w-4 text-[#6a6a6a]" />
              <span className="text-[17px] font-semibold text-[#222222]">{locationName}</span>
            </div>

            <p className="text-[15px] text-[#6a6a6a] leading-relaxed mb-6">
              Join your team on Frontline to receive tasks, complete training, and help improve your location&apos;s performance.
            </p>

            <button
              onClick={handleJoin}
              className="w-full bg-[#ff385c] text-white rounded-[12px] py-3.5 text-[16px] font-semibold hover:bg-[#e00b41] transition-colors"
              style={{ boxShadow: 'rgba(0,0,0,0.08) 0px 4px 12px' }}
            >
              Join {locationName}
            </button>

            <p className="text-[12px] text-[#6a6a6a] mt-4">
              You&apos;ll create a free account to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
