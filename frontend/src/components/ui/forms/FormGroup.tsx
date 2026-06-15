import React from 'react';

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  error?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  className = '',
  error,
}) => {
  return (
    <div className={`mb-4 ${error ? 'has-error' : ''} ${className}`}>
      {children}
    </div>
  );
};