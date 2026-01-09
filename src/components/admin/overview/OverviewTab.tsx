import React from 'react';
import { MainStatsGrid } from './MainStatsGrid';
import { StatusDistributionChart } from './StatusDistributionChart';
import { DistrictPerformanceChart } from './DistrictPerformanceChart';
import { RankingsSection } from './RankingsSection';

interface Stats {
  totalHandpumps: number;
  activeHandpumps: number;
  inactiveHandpumps: number;
  totalDistricts: number;
  totalBlocks: number;
  totalGPs: number;
}

interface DistrictPerformance {
  district: string;
  performance: number;
  total: number;
  active: number;
}

interface Rankings {
  topDistricts: any[];
  bottomDistricts: any[];
  topBlocks: any[];
  bottomBlocks: any[];
  topGPs: any[];
  bottomGPs: any[];
}

interface OverviewTabProps {
  stats: Stats;
  districtPerformanceData: DistrictPerformance[];
  rankings: Rankings;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  districtPerformanceData,
  rankings,
}) => {
  return (
    <div className="space-y-6">
      <MainStatsGrid stats={stats} />

      <div className="grid grid-cols-1 gap-6">
        <StatusDistributionChart
          activeHandpumps={stats.activeHandpumps}
          inactiveHandpumps={stats.inactiveHandpumps}
        />
        <DistrictPerformanceChart data={districtPerformanceData} />
      </div>

      <RankingsSection rankings={rankings} />
    </div>
  );
};