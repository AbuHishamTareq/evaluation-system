import { LayoutDashboard, Users, AlertTriangle, Pill, ClipboardCheck,
  AlertCircle, Home, Globe, Stethoscope,
  GraduationCap, Award, ShieldCheck, UserCircle, Map, Building2 } from 'lucide-react'

interface NavItem {
  key: string
  icon: React.ElementType
  path?: string
}

interface NavGroup {
  title: string
  items: NavItem[]
  icon: React.ElementType
}

const navGroups: (NavGroup | NavItem)[] = [
  { key: 'dashboard', icon: LayoutDashboard, path: '/' },
  {
    title: 'Human Resource',
    icon: Users,
    items: [
      { key: 'staff', icon: Users, path: '/staff' },
      { key: 'roles', icon: ShieldCheck, path: '/roles' },
      { key: 'users', icon: UserCircle, path: '/users' },
      { key: 'medical-fields', icon: Stethoscope, path: '/medical-fields' },
      { key: 'specialties', icon: GraduationCap, path: '/specialties' },
      { key: 'ranks', icon: Award, path: '/ranks' },
      { key: 'shc-categories', icon: ShieldCheck, path: '/shc-categories' },
      { key: 'nationalities', icon: Globe, path: '/nationalities' },
    ],
  },
  {
    title: 'Primary Health Care',
    icon: Home,
    items: [
      { key: 'zones', icon: Map, path: '/zones' },
      { key: 'phc-centers', icon: Home, path: '/phc-centers' },
      { key: 'departments', icon: Building2, path: '/departments' },
    ],
  },
  { key: 'incidents', icon: AlertTriangle, path: '/incidents' },
  { key: 'medications', icon: Pill, path: '/medications' },
  { key: 'evaluations', icon: ClipboardCheck, path: '/evaluations' },
  { key: 'issues', icon: AlertCircle, path: '/issues' },
]

export type { NavItem, NavGroup }
export { navGroups }