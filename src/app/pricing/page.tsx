'use client'

import Link from 'next/link'
import PricingSection from '@/components/landing/pricing-section'
import { Logo } from '@/components/shared/logo'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#ebebeb]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
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
              className="text-sm font-semibold text-[#ff385c]"
            >
              Pricing
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="py-16 px-5">
        <div className="text-center mb-12">
          <h1
            className="text-[36px] font-bold text-[#222222]"
            style={{ letterSpacing: '-0.44px' }}
          >
            Simple, transparent pricing
          </h1>
          <p className="text-[18px] text-[#6a6a6a] mt-3">
            Start free. Upgrade when you see results.
          </p>
        </div>
        <PricingSection />
      </section>

      {/* Footer */}
      <footer className="py-8 px-5 border-t border-[#ebebeb] text-center">
        <div className="flex items-center justify-center gap-6 mb-3">
          <Link
            href="/"
            className="text-sm font-medium text-[#6a6a6a] hover:text-[#222222] transition-colors"
          >
            Home
          </Link>
          <Link
            href="/demo"
            className="text-sm font-medium text-[#6a6a6a] hover:text-[#222222] transition-colors"
          >
            Demo
          </Link>
        </div>
        <p className="text-xs text-[#6a6a6a]">Built with Claude</p>
      </footer>
    </div>
  )
}
