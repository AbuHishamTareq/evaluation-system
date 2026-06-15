import React from 'react';

interface BoxProps {
  children: React.ReactNode;
  className?: string;
  padding?: number | string;
  margin?: number | string;
  backgroundColor?: string;
  borderRadius?: string;
}

export const Box: React.FC<BoxProps> = ({
  children,
  className = '',
  padding,
  margin,
  backgroundColor,
  borderRadius,
}) => {
  const paddingClass = padding ? `p-${padding}` : '';
  const marginClass = margin ? `m-${margin}` : '';
  const bgClass = backgroundColor ? `bg-${backgroundColor}` : '';
  const radiusClass = borderRadius ? `rounded-${borderRadius}` : '';

  return (
    <div className={`${paddingClass} ${marginClass} ${bgClass} ${radiusClass} ${className}`}>
      {children}
    </div>
  );
};