import React from 'react';
import { StatsCard } from '../dashboard/StatsCard';
import { FileText, Activity, TrendingUp } from 'lucide-react';
import { RequisitionCharts } from './RequisitionCharts';
import { FinancialOverview } from './FinancialOverview';
import { RequisitionDrillDownReport } from './RequisitionDrillDownReport';
import {
  getDistrictRequisitionData,
  getBlockRequisitionData,
  getGPRequisitionData,
  getVillageRequisitionData,
  RequisitionAggregatedData,
} from '../../../utils/admin/requisitionDataAggregation';
import { Requisition } from '../../../hooks/admin/useAdminData';

interface RequisitionsTabProps {
  stats: {
    totalRequisitions: number;
    repairRequisitions: number;
    reboreRequisitions: number;
    pendingRequisitions: number;
    approvedRequisitions: number;
    completedRequisitions: number;
    totalSanctionAmount: number;
  };
  requisitions: Requisition[];
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
  onViewRequisition: (requisition: Requisition) => void;
  onExportRequisitions: () => void;
}

export const RequisitionsTab: React.FC<RequisitionsTabProps> = ({
  stats,
  requisitions,
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
  const getData = (): RequisitionAggregatedData[] => {
    switch (drillDownLevel) {
      case 'district':
        return getDistrictRequisitionData(requisitions);
      case 'block':
        return getBlockRequisitionData(requisitions, selectedDrillDistrict);
      case 'gp':
        return getGPRequisitionData(requisitions, selectedDrillDistrict, selectedDrillBlock);
      case 'village':
        return getVillageRequisitionData(requisitions, selectedDrillDistrict, selectedDrillBlock, selectedDrillGP);
      default:
        return [];
    }
  };

  const handleDrillDown = (item: RequisitionAggregatedData) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Requisitions"
          value={stats.totalRequisitions}
          icon={FileText}
          gradient="bg-gradient-to-br from-purple-600 to-pink-600"
        />
        <StatsCard
          title="Repair"
          value={stats.repairRequisitions}
          icon={Activity}
          gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
        />
        <StatsCard
          title="Rebore"
          value={stats.reboreRequisitions}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-green-600 to-emerald-600"
        />
      </div>

      {/* Charts */}
      <RequisitionCharts stats={stats} />

      {/* Financial Overview */}
      <FinancialOverview requisitions={requisitions} />

      {/* Drill-down Report */}
      <RequisitionDrillDownReport
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