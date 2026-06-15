import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div>
      <textarea
        ref={ref}
        className={`
          w-full px-4 py-2 border rounded-lg transition-colors resize-y
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
          focus:outline-none focus:ring-2 focus:ring-offset-1
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';