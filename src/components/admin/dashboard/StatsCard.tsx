import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
  iconBg?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconBg = 'bg-white/20',
}) => {
  return (
    <div
      className={`group ${gradient} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {subtitle && <p className="text-xs mt-1 opacity-80">{subtitle}</p>}
        </div>
        <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
};