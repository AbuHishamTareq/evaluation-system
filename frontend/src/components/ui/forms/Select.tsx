import React, { forwardRef } from 'react';

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  error?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options,
  error,
  placeholder,
  className = '',
  ...props
}, ref) => {
  return (
    <div>
      <select
        ref={ref}
        className={`
          w-full px-4 py-2 border rounded-lg transition-colors appearance-none
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
          focus:outline-none focus:ring-2 focus:ring-offset-1
          disabled:bg-gray-100 disabled:cursor-not-allowed
          bg-white
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';