import { Handpump } from '../hooks/admin/useAdminData';

export interface AggregatedData {
  districtName?: string;
  blockName?: string;
  gpName?: string;
  villageName?: string;
  totalGeotagged: number;
  active: number;
  inactive: number;
  badWaterQuality: number;
  goodWaterQuality: number;
  soakpitConnected: number;
  drainageConnected: number;
}

export const getDistrictAggregatedData = (handpumps: Handpump[]): AggregatedData[] => {
  const districtMap: Record<string, AggregatedData> = {};
  
  handpumps.forEach(hp => {
    const district = hp.DistrictName || 'Unknown';
    if (!districtMap[district]) {
      districtMap[district] = {
        districtName: district,
        totalGeotagged: 0,
        active: 0,
        inactive: 0,
        badWaterQuality: 0,
        goodWaterQuality: 0,
        soakpitConnected: 0,
        drainageConnected: 0
      };
    }
    
    districtMap[district].totalGeotagged++;
    if (hp.HandpumpStatus === 'Active') districtMap[district].active++;
    if (hp.HandpumpStatus === 'Inactive') districtMap[district].inactive++;
    if (hp.WaterQuality === 'Bad') districtMap[district].badWaterQuality++;
    if (hp.WaterQuality === 'Good') districtMap[district].goodWaterQuality++;
    if (hp.SoakpitConnected === 1) districtMap[district].soakpitConnected++;
    if (hp.DrainageConnected === 1) districtMap[district].drainageConnected++;
  });
  
  return Object.values(districtMap).sort((a, b) => 
    (a.districtName || '').localeCompare(b.districtName || '')
  );
};

export const getBlockAggregatedData = (handpumps: Handpump[], districtName: string): AggregatedData[] => {
  const blockMap: Record<string, AggregatedData> = {};
  
  handpumps
    .filter(hp => hp.DistrictName === districtName)
    .forEach(hp => {
      const block = hp.BlockName || 'Unknown';
      if (!blockMap[block]) {
        blockMap[block] = {
          blockName: block,
          totalGeotagged: 0,
          active: 0,
          inactive: 0,
          badWaterQuality: 0,
          goodWaterQuality: 0,
          soakpitConnected: 0,
          drainageConnected: 0
        };
      }
      
      blockMap[block].totalGeotagged++;
      if (hp.HandpumpStatus === 'Active') blockMap[block].active++;
      if (hp.HandpumpStatus === 'Inactive') blockMap[block].inactive++;
      if (hp.WaterQuality === 'Bad') blockMap[block].badWaterQuality++;
      if (hp.WaterQuality === 'Good') blockMap[block].goodWaterQuality++;
      if (hp.SoakpitConnected === 1) blockMap[block].soakpitConnected++;
      if (hp.DrainageConnected === 1) blockMap[block].drainageConnected++;
    });
  
  return Object.values(blockMap).sort((a, b) => 
    (a.blockName || '').localeCompare(b.blockName || '')
  );
};

export const getGPAggregatedData = (
  handpumps: Handpump[], 
  districtName: string, 
  blockName: string
): AggregatedData[] => {
  const gpMap: Record<string, AggregatedData> = {};
  
  handpumps
    .filter(hp => hp.DistrictName === districtName && hp.BlockName === blockName)
    .forEach(hp => {
      const gp = hp.GrampanchayatName || 'Unknown';
      if (!gpMap[gp]) {
        gpMap[gp] = {
          gpName: gp,
          totalGeotagged: 0,
          active: 0,
          inactive: 0,
          badWaterQuality: 0,
          goodWaterQuality: 0,
          soakpitConnected: 0,
          drainageConnected: 0
        };
      }
      
      gpMap[gp].totalGeotagged++;
      if (hp.HandpumpStatus === 'Active') gpMap[gp].active++;
      if (hp.HandpumpStatus === 'Inactive') gpMap[gp].inactive++;
      if (hp.WaterQuality === 'Bad') gpMap[gp].badWaterQuality++;
      if (hp.WaterQuality === 'Good') gpMap[gp].goodWaterQuality++;
      if (hp.SoakpitConnected === 1) gpMap[gp].soakpitConnected++;
      if (hp.DrainageConnected === 1) gpMap[gp].drainageConnected++;
    });
  
  return Object.values(gpMap).sort((a, b) => 
    (a.gpName || '').localeCompare(b.gpName || '')
  );
};

export const getVillageAggregatedData = (
  handpumps: Handpump[], 
  districtName: string, 
  blockName: string, 
  gpName: string
): AggregatedData[] => {
  const villageMap: Record<string, AggregatedData> = {};
  
  handpumps
    .filter(hp => 
      hp.DistrictName === districtName && 
      hp.BlockName === blockName && 
      hp.GrampanchayatName === gpName
    )
    .forEach(hp => {
      const village = hp.VillegeName || 'Unknown';
      if (!villageMap[village]) {
        villageMap[village] = {
          villageName: village,
          totalGeotagged: 0,
          active: 0,
          inactive: 0,
          badWaterQuality: 0,
          goodWaterQuality: 0,
          soakpitConnected: 0,
          drainageConnected: 0
        };
      }
      
      villageMap[village].totalGeotagged++;
      if (hp.HandpumpStatus === 'Active') villageMap[village].active++;
      if (hp.HandpumpStatus === 'Inactive') villageMap[village].inactive++;
      if (hp.WaterQuality === 'Bad') villageMap[village].badWaterQuality++;
      if (hp.WaterQuality === 'Good') villageMap[village].goodWaterQuality++;
      if (hp.SoakpitConnected === 1) villageMap[village].soakpitConnected++;
      if (hp.DrainageConnected === 1) villageMap[village].drainageConnected++;
    });
  
  return Object.values(villageMap).sort((a, b) => 
    (a.villageName || '').localeCompare(b.villageName || '')
  );
};