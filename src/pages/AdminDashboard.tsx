import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearJurisdictionCache } from '../utils/useJurisdiction';

// Hooks
import { useAdminData } from '../hooks/admin/useAdminData';
import { useFilters } from '../hooks/admin/useFilters';
import { useDrillDown } from '../hooks/admin/useDrillDown';
import { useExportData } from '../hooks/admin/useExportData';

// Utilities
import { calculateHandpumpStats, calculateDistrictPerformance, calculateRankings } from '../utils/admin/calculations';
import {
  getDistrictAggregatedData,
  getBlockAggregatedData,
  getGPAggregatedData,
  getVillageAggregatedData,
} from '../utils/admin/dataAggregation';
import {
  getDistrictRequisitionData,
  getBlockRequisitionData,
  getGPRequisitionData,
  getVillageRequisitionData,
} from '../utils/admin/requisitionDataAggregation';

// Components
import { UniversalFilterBar } from '../components/admin/dashboard/UniversalFilterBar';
import { TabNavigation } from '../components/admin/dashboard/TabNavigation';
import { LoadingState, ErrorState } from '../components/admin/dashboard/LoadingState';
import { OverviewTab } from '../components/admin/overview/OverviewTab';
import { HandpumpsTab } from '../components/admin/handpumps/HandpumpsTab';
import { RequisitionsTab } from '../components/admin/requisitions/RequisitionsTab';
import { AnalyticsTab } from '../components/admin/analytics/AnalyticsTab';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch data
  const { handpumps, requisitions, userId, userRole, loading, error } = useAdminData();

  // Filters
  const { filters, filterOptions, handleFilterChange, resetFilters, getFilteredHandpumps } = useFilters(handpumps);

  // Drill down for handpumps
  const {
    drillDownLevel,
    selectedDrillDistrict,
    selectedDrillBlock,
    selectedDrillGP,
    navigateBack,
    drillToBlock,
    drillToGP,
    drillToVillage,
  } = useDrillDown(userRole);

  // Drill down for requisitions (separate state)
  const {
    drillDownLevel: reqDrillDownLevel,
    selectedDrillDistrict: reqSelectedDrillDistrict,
    selectedDrillBlock: reqSelectedDrillBlock,
    selectedDrillGP: reqSelectedDrillGP,
    navigateBack: reqNavigateBack,
    drillToBlock: reqDrillToBlock,
    drillToGP: reqDrillToGP,
    drillToVillage: reqDrillToVillage,
  } = useDrillDown(userRole);

  // Export
  const {
    exportHandpumps,
    exportRequisitions,
    exportDistrictReport,
    exportBlockReport,
    exportGPReport,
    exportVillageReport,
  } = useExportData();

  // Filtered data
  const filteredHandpumps = getFilteredHandpumps(handpumps);

  const filteredRequisitions = requisitions.filter((req) => {
  // Location filters - based on requisition data directly
  const districtMatch = !filters.district || req.DistrictName === filters.district;
  const blockMatch = !filters.block || req.BlockName === filters.block;
  const gpMatch = !filters.gramPanchayat || req.GrampanchayatName === filters.gramPanchayat;
  const villageMatch = !filters.village || req.VillageName === filters.village;

  // Financial year filter - based on requisition raise date (RequisitionDate)
  let yearMatch = true;
  if (req.RequisitionDate) {
    const reqDate = new Date(req.RequisitionDate);
    const reqYear = reqDate.getFullYear();
    const reqMonth = reqDate.getMonth() + 1; // 1-12

    const [startYear, endYear] = filters.financialYear
      .split('-')
      .map((y) => parseInt('20' + y));

    // Financial year: April (startYear) to March (endYear)
    if (reqMonth >= 4) {
      yearMatch = reqYear === startYear;
    } else {
      yearMatch = reqYear === endYear;
    }
  }

  // Month filter - based on requisition raise date
  let monthMatch = true;
  if (filters.month !== 'All' && req.RequisitionDate) {
    const reqDate = new Date(req.RequisitionDate);
    const reqMonthName = reqDate.toLocaleString('en-US', { month: 'long' });
    monthMatch = reqMonthName === filters.month;
  }

  return districtMatch && blockMatch && gpMatch && villageMatch && yearMatch && monthMatch;
});

  // Calculate statistics
  const stats = calculateHandpumpStats(filteredHandpumps, filteredRequisitions, handpumps);
  const districtPerformanceData = calculateDistrictPerformance(filteredHandpumps);
  const rankings = calculateRankings(handpumps);

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    clearJurisdictionCache();
    navigate('/login');
  };

  const handleViewHandpump = (handpump: any) => {
    navigate(`/admin/manage-handpump?id=${handpump.H_id}`);
  };

  const handleViewRequisition = (requisition: any) => {
    navigate(`/admin/manage-beneficiary?id=${requisition.RequisitionId}`);
  };

  // Handpump export handlers
  const handleExportDistrictReport = () => {
    const data = getDistrictAggregatedData(filteredHandpumps);
    exportDistrictReport(data);
  };

  const handleExportBlockReport = () => {
    const data = getBlockAggregatedData(filteredHandpumps, selectedDrillDistrict);
    exportBlockReport(data, selectedDrillDistrict);
  };

  const handleExportGPReport = () => {
    const data = getGPAggregatedData(filteredHandpumps, selectedDrillDistrict, selectedDrillBlock);
    exportGPReport(data, selectedDrillBlock);
  };

  const handleExportVillageReport = () => {
    const data = getVillageAggregatedData(filteredHandpumps, selectedDrillDistrict, selectedDrillBlock, selectedDrillGP);
    exportVillageReport(data, selectedDrillGP);
  };

  // Requisition export handlers
  const handleExportRequisitionDistrictReport = () => {
    const data = getDistrictRequisitionData(filteredRequisitions);
    exportDistrictReport(data, 'requisition_district');
  };

  const handleExportRequisitionBlockReport = () => {
    const data = getBlockRequisitionData(filteredRequisitions, reqSelectedDrillDistrict);
    exportBlockReport(data, reqSelectedDrillDistrict, 'requisition_block');
  };

  const handleExportRequisitionGPReport = () => {
    const data = getGPRequisitionData(filteredRequisitions, reqSelectedDrillDistrict, reqSelectedDrillBlock);
    exportGPReport(data, reqSelectedDrillBlock, 'requisition_gp');
  };

  const handleExportRequisitionVillageReport = () => {
    const data = getVillageRequisitionData(
      filteredRequisitions, 
      reqSelectedDrillDistrict, 
      reqSelectedDrillBlock, 
      reqSelectedDrillGP
    );
    exportVillageReport(data, reqSelectedDrillGP, 'requisition_village');
  };

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Universal Filter Bar */}
        <UniversalFilterBar
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onResetFilters={resetFilters}
        />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            stats={stats}
            districtPerformanceData={districtPerformanceData}
            rankings={rankings}
          />
        )}

        {activeTab === 'handpumps' && (
          <HandpumpsTab
            stats={stats}
            filteredHandpumps={filteredHandpumps}
            drillDownLevel={drillDownLevel}
            selectedDrillDistrict={selectedDrillDistrict}
            selectedDrillBlock={selectedDrillBlock}
            selectedDrillGP={selectedDrillGP}
            onNavigateBack={navigateBack}
            onDrillToBlock={drillToBlock}
            onDrillToGP={drillToGP}
            onDrillToVillage={drillToVillage}
            onExportDistrictReport={handleExportDistrictReport}
            onExportBlockReport={handleExportBlockReport}
            onExportGPReport={handleExportGPReport}
            onExportVillageReport={handleExportVillageReport}
          />
        )}

        {activeTab === 'requisitions' && (
          <RequisitionsTab
            stats={stats}
            requisitions={filteredRequisitions}
            drillDownLevel={reqDrillDownLevel}
            selectedDrillDistrict={reqSelectedDrillDistrict}
            selectedDrillBlock={reqSelectedDrillBlock}
            selectedDrillGP={reqSelectedDrillGP}
            onNavigateBack={reqNavigateBack}
            onDrillToBlock={reqDrillToBlock}
            onDrillToGP={reqDrillToGP}
            onDrillToVillage={reqDrillToVillage}
            onExportDistrictReport={handleExportRequisitionDistrictReport}
            onExportBlockReport={handleExportRequisitionBlockReport}
            onExportGPReport={handleExportRequisitionGPReport}
            onExportVillageReport={handleExportRequisitionVillageReport}
            onViewRequisition={handleViewRequisition}
            onExportRequisitions={() => exportRequisitions(filteredRequisitions)}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsTab stats={stats} handpumps={handpumps} />}
      </div>
    </div>
  );
};

export default AdminDashboard;