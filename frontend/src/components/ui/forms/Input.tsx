import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  error,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-slate-400 pointer-events-none" style={{ height: '20px', width: '20px' }}>
          {leftIcon}
        </div>
      )}
      <input
        ref={ref}
        className={`
          w-full px-4 py-3 border rounded-xl transition-all duration-200
          ${leftIcon ? 'pl-12' : ''}
          ${rightIcon ? 'pr-12' : ''}
          ${error 
            ? 'border-red-500 focus:ring-red-500 bg-red-50' 
            : 'border-slate-200 focus:border-cyan-500 focus:ring-cyan-500 bg-white'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-1
          disabled:bg-slate-100 disabled:cursor-not-allowed
          hover:border-slate-300
          placeholder:text-slate-400
          ${className}
        `}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-slate-400" style={{ height: '20px', width: '20px' }}>
          {rightIcon}
        </div>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';