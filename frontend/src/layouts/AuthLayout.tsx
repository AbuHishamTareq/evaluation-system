import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-teal-50 to-violet-50" />
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-full blur-3xl opacity-20 animate-pulse-slow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-violet-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-bold text-lg">PHC</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-slate-500">{subtitle}</p>
          )}
        </div>

        {/* Form Card - Glass Effect */}
        <div className="glass rounded-3xl shadow-2xl p-8 border border-white/30">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-8">
          © {new Date().getFullYear()} PHC Evaluation System. All rights reserved.
        </p>
      </div>
    </div>
  );
};