'use client'

export function UpgradePrompt() {
  return (
    <div className="rounded-[14px] bg-[#f7f7f7] border border-[#ebebeb] px-4 py-3 text-center">
      <p className="text-[13px] font-semibold text-[#222222]">You&apos;ve used all your AI credits this month</p>
      <p className="text-[12px] text-[#6a6a6a] mt-1">Upgrade to Location Pro for 300 credits/month</p>
      <a href="/pricing" className="inline-block mt-2 text-[12px] font-semibold text-[#ff385c] hover:underline">View plans &rarr;</a>
    </div>
  )
}
