import React from 'react';

interface ProgressBarProps {
  value?: number; // 0 to 100
  progress?: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'brand' | 'indigo' | 'purple' | 'emerald' | 'amber' | 'rose' | 'auto';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  progress,
  max = 100,
  label,
  showPercent = false,
  size = 'md',
  color = 'auto',
  className = '',
}) => {
  const actualValue = value !== undefined ? value : progress !== undefined ? progress : 0;
  const percentage = Math.min(Math.max(Math.round((actualValue / max) * 100), 0), 100);

  let barColor = 'bg-brand-600';
  if (color === 'auto') {
    if (percentage >= 75) barColor = 'bg-emerald-500';
    else if (percentage >= 50) barColor = 'bg-brand-500';
    else if (percentage >= 30) barColor = 'bg-amber-500';
    else barColor = 'bg-rose-500';
  } else if (color === 'emerald') barColor = 'bg-emerald-500';
  else if (color === 'amber') barColor = 'bg-amber-500';
  else if (color === 'rose') barColor = 'bg-rose-500';
  else if (color === 'brand' || color === 'indigo') barColor = 'bg-indigo-600';
  else if (color === 'purple') barColor = 'bg-purple-600';

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-slate-700">
          {label && <span>{label}</span>}
          {showPercent && <span className="text-slate-500">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${heights[size]} ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
