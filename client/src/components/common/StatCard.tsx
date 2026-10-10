import React from 'react';

interface StatCardProps {
  icon: React.ReactNode | React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
  subtext?: string;
  trend?: {
    positive?: boolean;
    text: string;
  };
  iconBgColor?: string;
  iconColor?: string;
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  subValue,
  subtext,
  trend,
  iconBgColor,
  iconColor,
  iconBg,
}) => {
  const displaySub = subValue || subtext;
  const containerBg = iconBgColor || `${iconBg || 'bg-brand-50'} ${iconColor || 'text-brand-600'}`;

  const renderIcon = () => {
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComp = icon as React.ComponentType<{ className?: string }>;
      return <IconComp className="w-5 h-5" />;
    }
    return null;
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-stone-300 transition-all">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${containerBg}`}>
          {renderIcon()}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-stone-900 tracking-tight">{value}</span>
        {displaySub && <span className="text-xs text-stone-400 font-medium">{displaySub}</span>}
      </div>
      {trend && (
        <div className="mt-2 text-[11px] font-medium flex items-center gap-1">
          <span className={trend.positive ? 'text-emerald-600' : 'text-slate-500'}>
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
};
