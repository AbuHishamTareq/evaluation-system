import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

interface HeaderProps {
  isOpen: boolean;
  isRtl: boolean;
  language: 'en' | 'ar';
  onToggleSidebar: () => void;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOpen,
  isRtl,
  language,
  onToggleSidebar,
  onToggleLanguage,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const headerMargin = isRtl
    ? isOpen ? 'lg:mr-72' : 'lg:mr-20'
    : isOpen ? 'lg:ml-72' : 'lg:ml-20';

  // Compute initials from user name (first letter of first + last name)
  const getInitials = useCallback((name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }, []);

  const initials = user?.name ? getInitials(user.name) : '?';

  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    staff: 'Staff',
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    // Use mousedown for more responsive feel
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [dropdownOpen]);

  const handleToggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    setDropdownOpen(false);
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  }, [logout, navigate]);

  const handleChangePassword = useCallback(() => {
    setDropdownOpen(false);
    navigate('/change-password');
  }, [navigate]);

  // Direction-aware dropdown positioning
  const dropdownPositionClasses = isRtl ? 'left-0 origin-top-left' : 'right-0 origin-top-right';

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 h-16 transition-all duration-300 ${headerMargin}`}>
      <div className="h-full glass border-b border-white/20 shadow-soft">
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center">
              <button
                onClick={onToggleSidebar}
                className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="p-2.5 rounded-xl bg-white/50 text-slate-600 hover:bg-white hover:text-cyan-600 transition-all duration-200 border border-slate-200/50 shadow-sm hover:shadow-md relative"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <button
                onClick={onToggleLanguage}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/50 text-slate-600 hover:bg-white hover:text-cyan-600 transition-all duration-200 border border-slate-200/50 shadow-sm hover:shadow-md font-semibold text-sm"
                aria-label={`Switch to ${language === 'en' ? 'Arabic' : 'English'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className={language === 'ar' ? 'text-cyan-600' : ''}>{language.toUpperCase()}</span>
              </button>

              {/* User Avatar & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleToggleDropdown}
                  className="flex items-center p-1.5 rounded-xl bg-white/50 hover:bg-white text-slate-700 hover:text-cyan-600 transition-all duration-200 border border-slate-200/50 shadow-sm hover:shadow-md"
                  aria-label="User menu"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="text-white font-medium text-sm">{initials}</span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className={`absolute top-full mt-2 w-72 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl shadow-slate-900/10 overflow-hidden animate-dropdown-in ${dropdownPositionClasses}`}
                    role="menu"
                    aria-label="User menu"
                  >
                    {/* User Info Header */}
                    <div className="p-5 bg-gradient-to-r from-violet-50/50 to-purple-50/50 border-b border-slate-200/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20 flex-shrink-0">
                          <span className="text-white font-bold text-lg">{initials}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {user?.email || ''}
                          </p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-violet-100 text-violet-700">
                            {roleLabels[user?.role || 'staff']}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleChangePassword}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors duration-150"
                        role="menuitem"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <span>Change Password</span>
                      </button>

                      <div className="my-1 border-t border-slate-200/60" role="separator" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                        role="menuitem"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};