import React from 'react';

interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: number | string;
  className?: string;
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  justify = 'start',
  align = 'stretch',
  gap,
  className = '',
  wrap = 'nowrap',
}) => {
  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };

  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
  };

  const gapClass = gap ? ` gap-${gap}` : '';

  return (
    <div
      className={`flex ${directionClasses[direction]} ${justifyClasses[justify]} ${alignClasses[align]} flex-${wrap}${gapClass} ${className}`}
    >
      {children}
    </div>
  );
};