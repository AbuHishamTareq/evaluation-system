import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { Search, Bell, Menu, X, MapPin, Key, LogOut, ChevronDown } from 'lucide-react'

interface HeaderProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (v: boolean) => void
}

export function Header({ isMobileMenuOpen, setIsMobileMenuOpen }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const { locale, setLocale } = useAppStore()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    setIsUserMenuOpen(false)
    await logout()
    window.location.href = '/login'
  }

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en'
    setLocale(newLocale)
  }

  return (
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

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-primary/5 transition-colors duration-300"
              >
                <div className="w-9 h-9 bg-linear-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-color-lg">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute end-0 top-full mt-2 w-64 bg-surface border border-primary/10 rounded-xl shadow-lg z-20 overflow-hidden">
                    <div className="p-4 border-b border-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text truncate">{user?.name}</p>
                          <p className="text-xs text-muted truncate">{user?.email}</p>
                        </div>
                      </div>
                      {user?.phc_center && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate">{user.phc_center.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <Link
                        to="/profile/password"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:bg-primary/10 hover:text-primary transition-colors duration-300"
                      >
                        <Key className="w-4 h-4" />
                        {locale === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-secondary hover:bg-red-50 hover:text-red-600 transition-colors duration-300"
                      >
                        <LogOut className="w-4 h-4" />
                        {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}