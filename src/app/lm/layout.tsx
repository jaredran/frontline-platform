'use client'

import { RoleShell } from '@/components/shared/role-shell'

export default function LMLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell role="lm">{children}</RoleShell>
}
