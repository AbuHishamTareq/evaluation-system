import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
}) => {
  const variantClasses = {
    default: 'bg-white border border-slate-100',
    elevated: 'bg-white shadow-soft border border-slate-100/50',
    outlined: 'bg-white border-2 border-slate-200',
    glass: 'glass border border-white/20',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={`rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]} ${
        onClick 
          ? 'cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5 transition-all duration-300' 
          : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => {
  return <div className={`px-6 pb-6 ${className}`}>{children}</div>;
};