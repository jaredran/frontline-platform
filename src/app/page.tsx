'use client'

import Link from 'next/link'
import { Activity, Sparkles, TrendingUp } from 'lucide-react'
import HeroInput from '@/components/landing/hero-input'
import PricingSection from '@/components/landing/pricing-section'

const cardShadow = 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px'

const valueProps = [
  {
    icon: Activity,
    title: 'See your Pulse',
    description:
      'Know exactly how your location is performing across 6 key metrics, updated in real time.',
  },
  {
    icon: Sparkles,
    title: 'AI Diagnosis',
    description:
      'Tap any metric and AI tells you why it\'s underperforming — with specific actions to fix it.',
  },
  {
    icon: TrendingUp,
    title: 'Prove What Works',
    description:
      'Track interventions and see before/after impact. Only pay when results are proven.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#ebebeb]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2">
            <svg viewBox="0 0 32 32" className="h-8 w-8 text-[#ff385c]" fill="currentColor">
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415c0 1.456-.463 2.648-1.408 3.563-1.05 1.02-2.324 1.413-3.87 1.413-.872 0-1.872-.178-2.943-.534-1.255-.414-2.604-1.16-3.814-2.105-.497-.39-.983-.819-1.464-1.287-.48.468-.967.897-1.464 1.287-1.21.944-2.559 1.691-3.814 2.105-1.07.356-2.07.534-2.943.534-1.547 0-2.82-.394-3.87-1.413C2.463 26.77 2 25.578 2 24.122l.01-.415c.05-.924.293-1.805.96-3.396l.145-.353c.986-2.296 5.146-11.005 7.1-14.836l.533-1.025C12.037 1.963 13.492 1 15.5 1h.5z" />
            </svg>
            <span className="text-[18px] font-bold text-[#222222]" style={{ letterSpacing: '-0.44px' }}>
              Frontline
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/demo"
              className="text-sm font-semibold text-[#6a6a6a] hover:text-[#222222] transition-colors"
            >
              Demo
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-semibold text-[#6a6a6a] hover:text-[#222222] transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-[80vh] flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-xl mx-auto text-center">
          <h1
            className="text-[40px] sm:text-[48px] font-bold text-[#222222]"
            style={{ letterSpacing: '-0.44px', lineHeight: 1.1 }}
          >
            See what&apos;s holding your location back
          </h1>
          <p className="text-[18px] text-[#6a6a6a] max-w-2xl mx-auto mt-4">
            Tell us about your situation and we&apos;ll diagnose what to fix first — in seconds.
          </p>
          <div className="mt-8 text-left">
            <HeroInput />
          </div>
          <p className="mt-6 text-sm text-[#6a6a6a]">
            or{' '}
            <Link href="/demo" className="underline hover:text-[#222222] transition-colors">
              Try the demo with sample data
            </Link>
          </p>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 px-5 max-w-5xl mx-auto">
        <h2
          className="text-[28px] font-bold text-[#222222] text-center"
          style={{ letterSpacing: '-0.44px' }}
        >
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {valueProps.map((prop) => {
            const Icon = prop.icon
            return (
              <div
                key={prop.title}
                className="rounded-[20px] p-6 bg-white"
                style={{ boxShadow: cardShadow }}
              >
                <div className="h-12 w-12 rounded-full bg-[#fff1f3] flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-[#ff385c]" />
                </div>
                <h3 className="text-[15px] font-bold text-[#222222] mb-2">{prop.title}</h3>
                <p className="text-sm text-[#6a6a6a] leading-relaxed">{prop.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-5 bg-[#f7f7f7]">
        <h2
          className="text-[28px] font-bold text-[#222222] text-center mb-10"
          style={{ letterSpacing: '-0.44px' }}
        >
          Pricing
        </h2>
        <PricingSection compact />
      </section>

      {/* Footer */}
      <footer className="py-8 px-5 border-t border-[#ebebeb] text-center">
        <div className="flex items-center justify-center gap-6 mb-3">
          <Link
            href="/demo"
            className="text-sm font-medium text-[#6a6a6a] hover:text-[#222222] transition-colors"
          >
            Demo
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-[#6a6a6a] hover:text-[#222222] transition-colors"
          >
            Pricing
          </Link>
        </div>
        <p className="text-xs text-[#6a6a6a]">Built with Claude</p>
      </footer>
    </div>
  )
}
