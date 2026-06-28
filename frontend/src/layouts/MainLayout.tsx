import React from 'react';
import { Outlet } from 'react-router-dom';
import { useUIStore } from '../stores';
import { Container, Header, Sidebar } from '../components/ui/layout';
import { useTranslationContext } from '../contexts/TranslationContext';

export const MainLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { language, toggleLanguage } = useTranslationContext();

  const isRtl = language === 'ar';

  const mainContentMargin = isRtl 
    ? (sidebarOpen ? 'lg:mr-72' : 'lg:mr-20')
    : (sidebarOpen ? 'lg:ml-72' : 'lg:ml-20');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-violet-50/30 flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-white focus:text-cyan-600 focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
        Skip to main content
      </a>
      <Header
        isOpen={sidebarOpen}
        isRtl={isRtl}
        language={language}
        onToggleSidebar={toggleSidebar}
        onToggleLanguage={toggleLanguage}
      />

      <Sidebar isOpen={sidebarOpen} isRtl={isRtl} />

      <main id="main-content" className={`pt-20 min-h-screen transition-all duration-300 ${mainContentMargin} flex-1`}>
        <Container>
          <div className="py-6 animate-fade-in">
            <React.Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>}>
              <Outlet />
            </React.Suspense>
          </div>
        </Container>
      </main>

      <footer className={`bg-white/80 backdrop-blur-md border-t border-slate-200/50 mt-auto transition-all duration-300 ${isRtl ? 'lg:pl-72' : 'lg:pr-72'}`}>
        <div className="py-4 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                PHC Evaluation System
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>© 2026 All rights reserved</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Version 1.0.0</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Powered by</span>
              <span className="text-xs font-medium text-cyan-600">Laravel + React</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;