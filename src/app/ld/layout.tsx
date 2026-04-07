'use client'

import { RoleShell } from '@/components/shared/role-shell'

export default function LDLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell role="ld">{children}</RoleShell>
}
