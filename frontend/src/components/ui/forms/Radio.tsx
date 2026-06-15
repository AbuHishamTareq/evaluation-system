import React, { forwardRef } from 'react';

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  label,
  className = '',
  ...props
}, ref) => {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input
        ref={ref}
        type="radio"
        className={`
          w-4 h-4 text-blue-600 border-gray-300
          focus:ring-blue-500 focus:ring-2 focus:ring-offset-1
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
});

Radio.displayName = 'Radio';