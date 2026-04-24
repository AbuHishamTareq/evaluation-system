import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { ComponentType } from 'react'
import { useAppStore } from '@/stores/appStore'
import { getTranslation } from '@/i18n'
import { navGroups, type NavGroup } from '@/config/navigation'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface SidebarProps {
  isSidebarCollapsed: boolean
  setIsSidebarCollapsed: (v: boolean) => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (v: boolean) => void
}

function NavGroupComponent({ group, isSidebarCollapsed, setIsMobileMenuOpen }: { group: NavGroup; isSidebarCollapsed: boolean; setIsMobileMenuOpen: (v: boolean) => void }) {
  const { locale } = useAppStore()
  const location = useLocation()
  const isGroupActive = group.items.some((item) => location.pathname === item.path)
  const [isExpanded, setIsExpanded] = useState(isGroupActive || false)
  const title = group.title

  const toggleExpanded = () => {
    if (!isSidebarCollapsed) {
      setIsExpanded(prev => !prev)
    }
  }

  return (
    <div className="relative group">
      <button
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
          isGroupActive
            ? 'bg-linear-to-r from-primary/20 to-secondary/20 text-primary'
            : 'text-muted hover:bg-linear-to-r hover:from-primary/10 hover:to-secondary/10 hover:text-primary'
        }`}
        onClick={toggleExpanded}
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
            const Icon = item.icon as ComponentType<{ className?: string }>
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
            const Icon = item.icon as ComponentType<{ className?: string }>
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

export function Sidebar({ isSidebarCollapsed, setIsSidebarCollapsed, isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const { locale, direction } = useAppStore()
  const location = useLocation()
  const mobileClass = isMobileMenuOpen || direction === 'rtl' ? 'translate-x-0' : '-translate-x-full'

  const toggleSidebar = () => {
    const newValue = !isSidebarCollapsed
    setIsSidebarCollapsed(newValue)
    localStorage.setItem('sidebarCollapsed', String(newValue))
  }

  const sidebarWidth = isSidebarCollapsed ? 'w-16' : 'w-56'

  return (
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
          const Icon = item.icon as ComponentType<{ className?: string }>
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
  )
}