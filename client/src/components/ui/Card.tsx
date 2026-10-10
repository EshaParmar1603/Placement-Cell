import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  orientation?: 'vertical' | 'horizontal';
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  padding = 'none',
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all ${
        onClick ? 'cursor-pointer hover:border-stone-300 hover:shadow-md' : ''
      } ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, subtitle, action, className = '', children }) => {
  if (children) {
    return <div className={`p-4 sm:p-5 pb-3 border-b border-stone-100 ${className}`}>{children}</div>;
  }

  return (
    <div className={`p-4 sm:p-5 pb-3 flex items-start justify-between gap-4 border-b border-stone-100 ${className}`}>
      <div>
        {title && <h3 className="font-bold text-stone-900 text-base tracking-tight">{title}</h3>}
        {subtitle && <p className="text-xs text-stone-500 mt-0.5 font-medium">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`px-4 sm:px-5 py-3 bg-[#FAF8F5] rounded-b-xl border-t border-stone-100 ${className}`}>{children}</div>;
};
