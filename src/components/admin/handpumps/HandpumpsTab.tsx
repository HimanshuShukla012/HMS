import React from 'react';
import { StatsCard } from '../dashboard/StatsCard';
import { Droplets, CheckCircle, AlertCircle } from 'lucide-react';
import { DrillDownReport } from './DrillDownReport';
import {
  getDistrictAggregatedData,
  getBlockAggregatedData,
  getGPAggregatedData,
  getVillageAggregatedData,
  AggregatedData,
} from '../../../utils/admin/dataAggregation';
import { Handpump } from '../../../hooks/admin/useAdminData';

interface HandpumpsTabProps {
  stats: {
    totalHandpumps: number;
    activeHandpumps: number;
    inactiveHandpumps: number;
  };
  filteredHandpumps: Handpump[];
  drillDownLevel: 'district' | 'block' | 'gp' | 'village';
  selectedDrillDistrict: string;
  selectedDrillBlock: string;
  selectedDrillGP: string;
  onNavigateBack: () => void;
  onDrillToBlock: (district: string) => void;
  onDrillToGP: (block: string) => void;
  onDrillToVillage: (gp: string) => void;
  onExportDistrictReport: () => void;
  onExportBlockReport: () => void;
  onExportGPReport: () => void;
  onExportVillageReport: () => void;
}

export const HandpumpsTab: React.FC<HandpumpsTabProps> = ({
  stats,
  filteredHandpumps,
  drillDownLevel,
  selectedDrillDistrict,
  selectedDrillBlock,
  selectedDrillGP,
  onNavigateBack,
  onDrillToBlock,
  onDrillToGP,
  onDrillToVillage,
  onExportDistrictReport,
  onExportBlockReport,
  onExportGPReport,
  onExportVillageReport,
}) => {
  const getData = (): AggregatedData[] => {
    switch (drillDownLevel) {
      case 'district':
        return getDistrictAggregatedData(filteredHandpumps);
      case 'block':
        return getBlockAggregatedData(filteredHandpumps, selectedDrillDistrict);
      case 'gp':
        return getGPAggregatedData(filteredHandpumps, selectedDrillDistrict, selectedDrillBlock);
      case 'village':
        return getVillageAggregatedData(filteredHandpumps, selectedDrillDistrict, selectedDrillBlock, selectedDrillGP);
      default:
        return [];
    }
  };

  const handleDrillDown = (item: AggregatedData) => {
    switch (drillDownLevel) {
      case 'district':
        onDrillToBlock(item.districtName || '');
        break;
      case 'block':
        onDrillToGP(item.blockName || '');
        break;
      case 'gp':
        onDrillToVillage(item.gpName || '');
        break;
    }
  };

  const handleExport = () => {
    switch (drillDownLevel) {
      case 'district':
        onExportDistrictReport();
        break;
      case 'block':
        onExportBlockReport();
        break;
      case 'gp':
        onExportGPReport();
        break;
      case 'village':
        onExportVillageReport();
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Handpumps"
          value={stats.totalHandpumps}
          icon={Droplets}
          gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
        />
        <StatsCard
          title="Active"
          value={stats.activeHandpumps}
          icon={CheckCircle}
          gradient="bg-gradient-to-br from-green-600 to-emerald-600"
        />
        <StatsCard
          title="Inactive"
          value={stats.inactiveHandpumps}
          icon={AlertCircle}
          gradient="bg-gradient-to-br from-red-600 to-rose-600"
        />
      </div>

      {/* Drill-down Report */}
      <DrillDownReport
        drillDownLevel={drillDownLevel}
        data={getData()}
        selectedDrillDistrict={selectedDrillDistrict}
        selectedDrillBlock={selectedDrillBlock}
        selectedDrillGP={selectedDrillGP}
        onNavigateBack={onNavigateBack}
        onDrillDown={handleDrillDown}
        onExport={handleExport}
      />
    </div>
  );
};