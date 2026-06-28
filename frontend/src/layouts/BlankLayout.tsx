import React from 'react';
import { Outlet } from 'react-router-dom';

export const BlankLayout: React.FC = () => {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50"><div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <Outlet />
    </React.Suspense>
  );
};