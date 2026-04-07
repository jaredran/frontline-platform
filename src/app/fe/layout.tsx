'use client'

import { RoleShell } from '@/components/shared/role-shell'

export default function FELayout({ children }: { children: React.ReactNode }) {
  return <RoleShell role="fe">{children}</RoleShell>
}
