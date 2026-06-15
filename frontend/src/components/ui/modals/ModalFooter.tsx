import React from 'react';

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-end gap-3 p-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};