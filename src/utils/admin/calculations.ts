interface Handpump {
  H_id?: number;
  HandpumpStatus: string;
  DistrictName: string;
  BlockName: string;
  GrampanchayatName: string;
  VillegeName?: string;
  WaterQuality?: string;
  SoakpitConnected?: number;
  DrainageConnected?: number;
  PlateformBuild?: number;
}

interface Requisition {
  RequisitionId: number;
  HPId?: number;
  RequisitionTypeId: number;
  RequisitionStatus: number;
  CompletionDateStr?: string;
  SanctionAmount?: string;
}

export const calculateHandpumpStats = (
  filteredHandpumps: Handpump[],
  filteredRequisitions: Requisition[],
  allHandpumps: Handpump[]
) => {
  return {
    totalHandpumps: filteredHandpumps.length,
    activeHandpumps: filteredHandpumps.filter((hp) => hp.HandpumpStatus === 'Active').length,
    inactiveHandpumps: filteredHandpumps.filter((hp) => hp.HandpumpStatus !== 'Active').length,
    totalRequisitions: filteredRequisitions.length,
    repairRequisitions: filteredRequisitions.filter((req) => req.RequisitionTypeId === 1).length,
    reboreRequisitions: filteredRequisitions.filter((req) => req.RequisitionTypeId === 2).length,
    pendingRequisitions: filteredRequisitions.filter((req) => req.RequisitionStatus === 1).length,
    approvedRequisitions: filteredRequisitions.filter((req) => req.RequisitionStatus === 2).length,
    completedRequisitions: filteredRequisitions.filter((req) => req.CompletionDateStr).length,
    totalSanctionAmount: filteredRequisitions
      .filter((req) => req.SanctionAmount)
      .reduce((sum, req) => sum + (parseFloat(req.SanctionAmount!) || 0), 0),
    totalDistricts: new Set(filteredHandpumps.map((hp) => hp.DistrictName).filter(Boolean)).size,
    totalBlocks: new Set(filteredHandpumps.map((hp) => hp.BlockName).filter(Boolean)).size,
    totalGPs: new Set(filteredHandpumps.map((hp) => hp.GrampanchayatName).filter(Boolean)).size,
    activeUsers: 0,
  };
};

export const calculateDistrictPerformance = (filteredHandpumps: Handpump[]) => {
  const districtMap: Record<string, { total: number; active: number }> = {};

  filteredHandpumps.forEach((hp) => {
    const district = hp.DistrictName || 'Unknown';
    if (!districtMap[district]) {
      districtMap[district] = { total: 0, active: 0 };
    }
    districtMap[district].total++;
    if (hp.HandpumpStatus === 'Active') {
      districtMap[district].active++;
    }
  });

  return Object.entries(districtMap)
    .map(([district, data]) => ({
      district,
      performance: data.total > 0 ? Math.round((data.active / data.total) * 100) : 0,
      total: data.total,
      active: data.active,
    }))
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 8);
};

export const calculateRankings = (allHandpumps: Handpump[], filteredHandpumps: Handpump[]) => {
  // Use allHandpumps (not filteredHandpumps) to show complete rankings for everyone
  // District rankings
  const districtMap: Record<string, { name: string; handpumps: number; active: number }> = {};
  allHandpumps.forEach((hp) => {
    const district = hp.DistrictName || 'Unknown';
    if (!districtMap[district]) {
      districtMap[district] = { name: district, handpumps: 0, active: 0 };
    }
    districtMap[district].handpumps++;
    if (hp.HandpumpStatus === 'Active') districtMap[district].active++;
  });

  const allDistrictsData = Object.values(districtMap).map((d) => ({
    ...d,
    performance: d.handpumps > 0 ? (d.active / d.handpumps) * 100 : 0,
  }));

  // Block rankings
  const blockMap: Record<string, { name: string; handpumps: number; active: number }> = {};
  allHandpumps.forEach((hp) => {
    const block = `${hp.BlockName} (${hp.DistrictName})` || 'Unknown';
    if (!blockMap[block]) {
      blockMap[block] = { name: block, handpumps: 0, active: 0 };
    }
    blockMap[block].handpumps++;
    if (hp.HandpumpStatus === 'Active') blockMap[block].active++;
  });

  const allBlocksData = Object.values(blockMap).map((b) => ({
    ...b,
    performance: b.handpumps > 0 ? (b.active / b.handpumps) * 100 : 0,
  }));

  // GP rankings
  const gpMap: Record<string, { name: string; handpumps: number; active: number }> = {};
  allHandpumps.forEach((hp) => {
    const gp = `${hp.GrampanchayatName} (${hp.BlockName})` || 'Unknown';
    if (!gpMap[gp]) {
      gpMap[gp] = { name: gp, handpumps: 0, active: 0 };
    }
    gpMap[gp].handpumps++;
    if (hp.HandpumpStatus === 'Active') gpMap[gp].active++;
  });

  const allGPsData = Object.values(gpMap).map((g) => ({
    ...g,
    performance: g.handpumps > 0 ? (g.active / g.handpumps) * 100 : 0,
  }));

  return {
    topDistricts: [...allDistrictsData].sort((a, b) => b.performance - a.performance).slice(0, 10),
    bottomDistricts: [...allDistrictsData].sort((a, b) => a.performance - b.performance).slice(0, 10),
    topBlocks: [...allBlocksData].sort((a, b) => b.performance - a.performance).slice(0, 10),
    bottomBlocks: [...allBlocksData].sort((a, b) => a.performance - b.performance).slice(0, 10),
    topGPs: [...allGPsData].sort((a, b) => b.performance - a.performance).slice(0, 10),
    bottomGPs: [...allGPsData].sort((a, b) => a.performance - b.performance).slice(0, 10),
  };
};