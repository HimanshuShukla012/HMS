import React from 'react';
import { StatsCard } from '../dashboard/StatsCard';
import { Droplets, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';

interface Stats {
  totalHandpumps: number;
  activeHandpumps: number;
  inactiveHandpumps: number;
  totalDistricts: number;
  totalBlocks: number;
}

interface MainStatsGridProps {
  stats: Stats;
}

export const MainStatsGrid: React.FC<MainStatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard
        title="Total Handpumps"
        value={stats.totalHandpumps}
        subtitle="System-wide"
        icon={Droplets}
        gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
      />

      <StatsCard
        title="Active Handpumps"
        value={stats.activeHandpumps}
        subtitle={`${stats.totalHandpumps > 0 ? Math.round((stats.activeHandpumps / stats.totalHandpumps) * 100) : 0}% operational`}
        icon={CheckCircle}
        gradient="bg-gradient-to-br from-green-600 to-emerald-600"
      />

      <StatsCard
        title="Inactive Handpumps"
        value={stats.inactiveHandpumps}
        subtitle="Needs attention"
        icon={AlertTriangle}
        gradient="bg-gradient-to-br from-orange-600 to-red-600"
      />
    </div>
  );
};