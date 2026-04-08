'use client'

import { Check } from 'lucide-react'

interface PricingSectionProps {
  compact?: boolean
}

const tiers = [
  {
    name: 'Free (My Location)',
    price: '$0',
    period: '/month',
    features: [
      '1 location, 15 employees',
      '3 custom playbooks',
      '50 AI credits/month',
      'Task management + shift planning',
    ],
    cta: 'Get started free',
    ctaStyle: 'bg-[#222222] text-white',
    highlighted: false,
  },
  {
    name: 'Location Pro',
    price: '$99',
    period: '/month',
    features: [
      '30 employees, unlimited playbooks',
      '300 AI credits/month',
      'AI diagnosis + action plans',
      'Team performance view',
    ],
    cta: 'Upgrade',
    ctaStyle: 'bg-[#ff385c] text-white',
    highlighted: true,
    badge: 'Most popular',
  },
  {
    name: 'Multi-Location',
    price: '$399',
    period: '/month',
    features: [
      '10 locations, 100 employees',
      '1,500 AI credits/month',
      'Attribution engine + portfolio pulse',
      'Cross-location benchmarking',
    ],
    cta: 'Upgrade',
    ctaStyle: 'bg-[#ff385c] text-white',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited locations + employees',
      'SSO, integrations, API',
      'Predictive analytics',
      'Dedicated support',
    ],
    cta: 'Contact us',
    ctaStyle: 'border border-[#222222] text-[#222222]',
    highlighted: false,
  },
]

export default function PricingSection({ compact = false }: PricingSectionProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-[20px] bg-white p-6 flex flex-col ${
              tier.highlighted ? 'border-2 border-[#ff385c]' : ''
            }`}
            style={{
              boxShadow:
                'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
            }}
          >
            {tier.badge && (
              <span className="inline-block self-start bg-[#ff385c] text-white text-xs font-semibold px-3 py-1 rounded-[14px] mb-3">
                {tier.badge}
              </span>
            )}
            <h3 className="text-[15px] font-bold text-[#222222]">{tier.name}</h3>
            <div className="mt-3 mb-4">
              <span className="text-[32px] font-bold text-[#222222]" style={{ letterSpacing: '-0.44px' }}>
                {tier.price}
              </span>
              {tier.period && (
                <span className="text-sm text-[#6a6a6a] font-medium">{tier.period}</span>
              )}
            </div>
            <ul className="flex-1 space-y-3 mb-6">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-[#222222]">
                  <Check className="h-4 w-4 text-[#008a05] shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-3 px-4 rounded-[8px] text-sm font-semibold transition-opacity hover:opacity-90 ${tier.ctaStyle}`}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>

      {!compact && (
        <div
          className="mt-12 rounded-[20px] bg-white p-8"
          style={{
            boxShadow:
              'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
          }}
        >
          <h3
            className="text-[24px] font-bold text-[#222222] mb-2"
            style={{ letterSpacing: '-0.44px' }}
          >
            Results Fee
          </h3>
          <p className="text-[15px] font-semibold text-[#222222] mb-4">
            Pay for proven impact
          </p>
          <p className="text-sm text-[#6a6a6a] leading-relaxed mb-6">
            When our AI recommendations improve your metrics, you pay a small results fee
            — typically 10% of the estimated value delivered.
          </p>
          <div className="rounded-[14px] bg-[#f7f7f7] p-5 mb-6">
            <p className="text-sm font-semibold text-[#222222] mb-2">Example</p>
            <ul className="space-y-1 text-sm text-[#6a6a6a]">
              <li>Quality score improves 7 points</li>
              <li>Estimated value: $2,100/month</li>
              <li>Results fee: $210/month</li>
            </ul>
          </div>
          <p className="text-sm text-[#222222] font-medium">
            You only pay when it works. If metrics don&apos;t improve, the fee is $0.
          </p>
        </div>
      )}
    </div>
  )
}
