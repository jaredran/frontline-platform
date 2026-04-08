'use client'

export function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      className={className}
    >
      {/* Background circle */}
      <circle cx="16" cy="16" r="16" fill="#ff385c" />
      {/* Pulse line */}
      <polyline
        points="4,18 10,18 12,10 16,24 20,8 24,18 28,18"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
