import { Role } from './types'
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  User,
  Activity,
  Calendar,
  Users,
  FileText,
  Target,
  BarChart3,
  MapPin,
  Zap,
  TrendingUp,
  FileBarChart,
  LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const ROLE_NAV: Record<Role, { label: string; home: string; items: NavItem[] }> = {
  fe: {
    label: 'Frontline Employee',
    home: '/fe',
    items: [
      { label: 'My Shift', href: '/fe', icon: LayoutDashboard },
      { label: 'Tasks', href: '/fe/tasks', icon: ClipboardList },
      { label: 'Learn', href: '/fe/learn', icon: BookOpen },
      { label: 'Profile', href: '/fe/profile', icon: User },
    ],
  },
  lm: {
    label: 'Location Manager',
    home: '/lm',
    items: [
      { label: 'Pulse', href: '/lm', icon: Activity },
      { label: 'Shifts', href: '/lm/shifts', icon: Calendar },
      { label: 'Team', href: '/lm/team', icon: Users },
      { label: 'Playbooks', href: '/lm/playbooks', icon: FileText },
    ],
  },
  ld: {
    label: 'L&D Executive',
    home: '/ld',
    items: [
      { label: 'Playbooks', href: '/ld', icon: BookOpen },
      { label: 'Audiences', href: '/ld/audiences', icon: Target },
      { label: 'Impact', href: '/ld/impact', icon: BarChart3 },
      { label: 'Content', href: '/ld/content', icon: FileText },
    ],
  },
  ops: {
    label: 'Operations Executive',
    home: '/ops',
    items: [
      { label: 'All Locations', href: '/ops', icon: MapPin },
      { label: 'Interventions', href: '/ops/interventions', icon: Zap },
      { label: 'Trends', href: '/ops/trends', icon: TrendingUp },
      { label: 'Reports', href: '/ops/reports', icon: FileBarChart },
    ],
  },
}

export const ROLE_LABELS: Record<Role, string> = {
  fe: 'Frontline Employee',
  lm: 'Location Manager',
  ld: 'L&D Executive',
  ops: 'Operations Executive',
}

export const ROLE_COLORS: Record<Role, string> = {
  fe: 'bg-blue-500',
  lm: 'bg-emerald-500',
  ld: 'bg-violet-500',
  ops: 'bg-amber-500',
}

export const METRIC_THRESHOLDS = {
  good: 90,
  warning: 75,
  critical: 0,
} as const

export function getMetricColor(actual: number, target: number): string {
  const ratio = actual / target
  if (ratio >= 0.95) return 'text-emerald-600'
  if (ratio >= 0.80) return 'text-amber-600'
  return 'text-red-600'
}

export function getMetricBg(actual: number, target: number): string {
  const ratio = actual / target
  if (ratio >= 0.95) return 'bg-emerald-50 border-emerald-200'
  if (ratio >= 0.80) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

export function getTrendIcon(trend: 'up' | 'down' | 'flat'): string {
  if (trend === 'up') return '↑'
  if (trend === 'down') return '↓'
  return '→'
}
