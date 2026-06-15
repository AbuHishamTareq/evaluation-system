import React from 'react';

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  onClick,
  className = '',
}) => {
  return (
    <tr
      className={`
        ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};