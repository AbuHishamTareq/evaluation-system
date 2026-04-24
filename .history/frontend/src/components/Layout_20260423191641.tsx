import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { getTranslation } from '@/i18n'
import {
  LayoutDashboard, Users, AlertTriangle, Pill, ClipboardCheck,
  AlertCircle, Bell, Search, Menu, X, LogOut, Building2,
  ChevronLeft, ChevronRight, Map, Home, Globe, Stethoscope,
  GraduationCap, Award, ShieldCheck, UserCircle, ChevronDown
} from 'lucide-react'

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

interface LayoutProps {
  children: ReactNode
}

function NavGroupComponent({ group, isSidebarCollapsed, setIsMobileMenuOpen }: { group: NavGroup; isSidebarCollapsed: boolean; setIsMobileMenuOpen: (v: boolean) => void }) {
  const { locale } = useAppStore()
  const location = useLocation()
  const isGroupActive = group.items.some((item) => location.pathname === item.path)
  const [isExpanded, setIsExpanded] = useState(isGroupActive)
  const title = locale === 'ar' ? group.title : group.title

  useEffect(() => {
    if (isGroupActive) {
      setIsExpanded(true)
    }
  }, [isGroupActive])

  return (
    <div className="relative group">
      <button
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
          isGroupActive
            ? 'bg-linear-to-r from-primary/20 to-secondary/20 text-primary'
            : 'text-muted hover:bg-linear-to-r hover:from-primary/10 hover:to-secondary/10 hover:text-primary'
        }`}
        onClick={() => !isSidebarCollapsed && setIsExpanded(!isExpanded)}
      >
        <group.icon className="w-5 h-5 shrink-0" />
        {!isSidebarCollapsed && (
          <>
            <span className="truncate flex-1 text-start">{title}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>
      {isSidebarCollapsed && (
        <div className="absolute start-full -top-2 py-2 px-0 space-y-1 bg-surface border border-primary/20 rounded-lg shadow-lg p-2 min-w-45 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <div className="text-sm font-medium text-primary px-2 py-1 border-b border-primary/20 mb-1">{title}</div>
          {group.items.map((item) => {
            const Icon = item.icon
            const isItemActive = location.pathname === item.path
            return (
              <Link
                key={item.key}
                to={item.path || '/'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isItemActive
                    ? 'bg-linear-to-r from-primary/20 to-secondary/20 text-primary'
                    : 'text-muted hover:bg-linear-to-r hover:from-primary/10 hover:to-secondary/10 hover:text-primary'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{getTranslation(locale, `nav.${item.key}`)}</span>
              </Link>
            )
          })}
        </div>
      )}
      {!isSidebarCollapsed && isExpanded && (
        <div className="ms-4 mt-1 space-y-1 border-s border-primary/20 ps-3">
          {group.items.map((item) => {
            const Icon = item.icon
            const isItemActive = location.pathname === item.path
            return (
              <Link
                key={item.key}
                to={item.path || '/'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isItemActive
                    ? 'bg-linear-to-r from-primary/20 to-secondary/20 text-primary'
                    : 'text-muted hover:bg-linear-to-r hover:from-primary/10 hover:to-secondary/10 hover:text-primary'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{getTranslation(locale, `nav.${item.key}`)}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
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

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore()
  const { locale, setLocale, direction } = useAppStore()
  const location = useLocation()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed')
      return saved === 'true'
    }
    return false
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const fontClass = locale === 'ar' ? 'font-ar' : 'font-en'

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en'
    setLocale(newLocale)
  }

  const toggleSidebar = () => {
    const newValue = !isSidebarCollapsed
    setIsSidebarCollapsed(newValue)
    localStorage.setItem('sidebarCollapsed', String(newValue))
  }

  const sidebarWidth = isSidebarCollapsed ? 'w-16' : 'w-56'
  const sidebarOffset = isSidebarCollapsed ? 'md:ms-16' : 'md:ms-56'
  const mobileClass = isMobileMenuOpen || direction === 'rtl' ? 'translate-x-0' : '-translate-x-full'

  return (
    <div className={`min-h-screen bg-linear-to-br from-background via-surface to-background ${fontClass}`} dir={direction}>
      <aside className={`fixed top-0 inset-s-0 h-full bg-surface border-e border-primary/10 transition-all duration-300 z-50 flex flex-col ${sidebarWidth} ${mobileClass} md:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-3 border-b border-primary/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-color-lg shrink-0">
              <span className="text-white font-bold text-sm">PHC</span>
            </div>
            {!isSidebarCollapsed && (
              <span className="text-lg font-semibold text-text">
                {getTranslation(locale, 'dashboard.title')}
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-visible p-2 space-y-1">
          {navGroups.map((item) => {
            if ('items' in item) {
              return (
                <NavGroupComponent key={item.title} group={item} isSidebarCollapsed={isSidebarCollapsed} setIsMobileMenuOpen={setIsMobileMenuOpen} />
              )
            }
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.key}
                to={item.path || '/'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-linear-to-r from-primary/20 to-secondary/20 text-primary'
                    : 'text-muted hover:bg-linear-to-r hover:from-primary/10 hover:to-secondary/10 hover:text-primary'
                }`}
                title={isSidebarCollapsed ? getTranslation(locale, `nav.${item.key}`) : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="truncate">{getTranslation(locale, `nav.${item.key}`)}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-2 border-t border-primary/10">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 text-muted hover:text-primary hover:bg-linear-to-r hover:from-primary/10 hover:to-secondary/10 rounded-xl transition-all duration-300"
            title={isSidebarCollapsed ? (locale === 'ar' ? 'توسيع' : 'Expand') : (locale === 'ar' ? 'طي' : 'Collapse')}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${sidebarOffset}`}>
        <header className="bg-surface/80 backdrop-blur-lg shadow-color-lg border-b border-primary/10 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 text-muted hover:text-primary rounded-xl transition-all duration-300 hover:bg-linear-to-r hover:from-primary/10 hover:to-secondary/10 md:hidden"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button className="p-2.5 text-muted hover:text-primary hover:bg-linear-to-r hover:from-primary/10 hover:to-secondary/10 rounded-xl transition-all duration-300 hover:scale-105">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2.5 text-muted hover:text-primary hover:bg-linear-to-r hover:from-primary/10 hover:to-secondary/10 rounded-xl transition-all duration-300 hover:scale-105 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 inset-e-1 w-2.5 h-2.5 bg-secondary rounded-full animate-pulse"></span>
              </button>

              <div className="hidden md:flex items-center gap-3 ps-4 border-s border-primary/20">
                <button
                  onClick={toggleLocale}
                  className="text-sm text-primary hover:text-secondary font-medium transition-colors duration-300"
                >
                  {locale === 'en' ? 'العربية' : 'English'}
                </button>
                <div className="w-9 h-9 bg-linear-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-color-lg">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-secondary hover:text-red-500 transition-colors duration-300"
                  title={getTranslation(locale, 'auth.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}