'use client'

import { RoleShell } from '@/components/shared/role-shell'

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell role="ops">{children}</RoleShell>
}
