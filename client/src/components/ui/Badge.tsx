import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'purple'
    | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variants = {
    default: 'bg-stone-100 text-stone-800 border-stone-200',
    primary: 'bg-[#F5EFE1] text-[#172554] border-[#EADFC9] font-semibold',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    purple: 'bg-[#F5EFE1] text-[#172554] border-[#EADFC9] font-semibold',
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded',
    md: 'text-xs px-2.5 py-1 rounded-md font-medium',
  };

  return (
    <span
      className={`inline-flex items-center border font-medium tracking-tight ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export function getStatusBadge(status: string) {
  switch (status) {
    case 'PUBLISHED':
    case 'ACTIVE':
    case 'COMPLETED':
    case 'OFFERED':
    case 'ELIGIBLE':
    case 'PLACED':
      return <Badge variant="success">{status.replace('_', ' ')}</Badge>;
    case 'SHORTLISTED':
    case 'ASSESSMENT':
    case 'TECHNICAL_INTERVIEW':
    case 'HR_INTERVIEW':
      return <Badge variant="purple">{status.replace('_', ' ')}</Badge>;
    case 'APPLIED':
    case 'PENDING':
      return <Badge variant="info">{status.replace('_', ' ')}</Badge>;
    case 'DRAFT':
    case 'UNKNOWN':
      return <Badge variant="warning">{status.replace('_', ' ')}</Badge>;
    case 'REJECTED':
    case 'CLOSED':
    case 'SUSPENDED':
    case 'INELIGIBLE':
    case 'CANCELLED':
      return <Badge variant="danger">{status.replace('_', ' ')}</Badge>;
    case 'WITHDRAWN':
    case 'OPTED_OUT':
      return <Badge variant="neutral">{status.replace('_', ' ')}</Badge>;
    default:
      return <Badge>{status.replace('_', ' ')}</Badge>;
  }
}
