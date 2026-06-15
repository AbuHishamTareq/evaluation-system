import React from 'react';

interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalContent: React.FC<ModalContentProps> = ({
  children,
  className = '',
}) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};