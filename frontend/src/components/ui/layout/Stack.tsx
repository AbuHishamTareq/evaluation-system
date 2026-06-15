import React from 'react';

interface StackProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  spacing?: number | string;
  className?: string;
  align?: 'start' | 'end' | 'center' | 'stretch';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around';
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'vertical',
  spacing = 4,
  className = '',
  align,
  justify,
}) => {
  const directionClass = direction === 'horizontal' ? 'flex-row' : 'flex-col';
  const spacingClass = typeof spacing === 'number' ? `space-y-${spacing}` : `space-y-${spacing}`;
  const alignClass = align ? `items-${align}` : '';
  const justifyClass = justify ? `justify-${justify}` : '';

  return (
    <div className={`flex ${directionClass} ${spacingClass} ${alignClass} ${justifyClass} ${className}`}>
      {children}
    </div>
  );
};