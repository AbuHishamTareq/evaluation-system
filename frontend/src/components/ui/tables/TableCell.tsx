import React from 'react';

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  as?: 'td' | 'th';
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = '',
  as: Component = 'td',
}) => {
  const baseClass = Component === 'th'
    ? 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
    : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';

  return (
    <Component className={`${baseClass} ${className}`}>
      {children}
    </Component>
  );
};