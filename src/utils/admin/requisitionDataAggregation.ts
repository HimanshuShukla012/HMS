import { Requisition } from '../../hooks/admin/useAdminData';

export interface RequisitionAggregatedData {
  districtName?: string;
  blockName?: string;
  gpName?: string;
  villageName?: string;
  totalRequisitions: number;
  repairPending: number;
  repairCompleted: number;
  reborePending: number;
  reboreCompleted: number;
  totalSanctionAmount: number;
  pendingRequisitions: number;
  approvedRequisitions: number;
  completedRequisitions: number;
}

export const getDistrictRequisitionData = (requisitions: Requisition[]): RequisitionAggregatedData[] => {
  const districtMap: Record<string, RequisitionAggregatedData> = {};
  
  requisitions.forEach(req => {
    const district = req.DistrictName || 'Unknown';
    if (!districtMap[district]) {
      districtMap[district] = {
        districtName: district,
        totalRequisitions: 0,
        repairPending: 0,
        repairCompleted: 0,
        reborePending: 0,
        reboreCompleted: 0,
        totalSanctionAmount: 0,
        pendingRequisitions: 0,
        approvedRequisitions: 0,
        completedRequisitions: 0,
      };
    }
    
    const data = districtMap[district];
    data.totalRequisitions++;
    
    // Parse sanction amount
    const amount = req.SanctionAmount ? parseFloat(req.SanctionAmount.toString()) : 0;
    if (!isNaN(amount)) {
      data.totalSanctionAmount += amount;
    }
    
    // Count by status
    if (req.RequisitionStatus === 1) data.pendingRequisitions++;
    else if (req.RequisitionStatus === 2) data.approvedRequisitions++;
    else if (req.RequisitionStatus === 3) data.completedRequisitions++;
    
    // Count by type and status
    const isRepair = req.RequisitionTypeId === 1;
    const isRebore = req.RequisitionTypeId === 2;
    const isPending = req.RequisitionStatus === 1;
    const isCompleted = req.RequisitionStatus === 3;
    
    if (isRepair && isPending) data.repairPending++;
    if (isRepair && isCompleted) data.repairCompleted++;
    if (isRebore && isPending) data.reborePending++;
    if (isRebore && isCompleted) data.reboreCompleted++;
  });
  
  return Object.values(districtMap).sort((a, b) => 
    (a.districtName || '').localeCompare(b.districtName || '')
  );
};

export const getBlockRequisitionData = (
  requisitions: Requisition[], 
  districtName: string
): RequisitionAggregatedData[] => {
  const blockMap: Record<string, RequisitionAggregatedData> = {};
  
  requisitions
    .filter(req => req.DistrictName === districtName)
    .forEach(req => {
      const block = req.BlockName || 'Unknown';
      if (!blockMap[block]) {
        blockMap[block] = {
          blockName: block,
          totalRequisitions: 0,
          repairPending: 0,
          repairCompleted: 0,
          reborePending: 0,
          reboreCompleted: 0,
          totalSanctionAmount: 0,
          pendingRequisitions: 0,
          approvedRequisitions: 0,
          completedRequisitions: 0,
        };
      }
      
      const data = blockMap[block];
      data.totalRequisitions++;
      
      const amount = req.SanctionAmount ? parseFloat(req.SanctionAmount.toString()) : 0;
      if (!isNaN(amount)) {
        data.totalSanctionAmount += amount;
      }
      
      if (req.RequisitionStatus === 1) data.pendingRequisitions++;
      else if (req.RequisitionStatus === 2) data.approvedRequisitions++;
      else if (req.RequisitionStatus === 3) data.completedRequisitions++;
      
      const isRepair = req.RequisitionTypeId === 1;
      const isRebore = req.RequisitionTypeId === 2;
      const isPending = req.RequisitionStatus === 1;
      const isCompleted = req.RequisitionStatus === 3;
      
      if (isRepair && isPending) data.repairPending++;
      if (isRepair && isCompleted) data.repairCompleted++;
      if (isRebore && isPending) data.reborePending++;
      if (isRebore && isCompleted) data.reboreCompleted++;
    });
  
  return Object.values(blockMap).sort((a, b) => 
    (a.blockName || '').localeCompare(b.blockName || '')
  );
};

export const getGPRequisitionData = (
  requisitions: Requisition[], 
  districtName: string, 
  blockName: string
): RequisitionAggregatedData[] => {
  const gpMap: Record<string, RequisitionAggregatedData> = {};
  
  requisitions
    .filter(req => req.DistrictName === districtName && req.BlockName === blockName)
    .forEach(req => {
      const gp = req.GrampanchayatName || 'Unknown';
      if (!gpMap[gp]) {
        gpMap[gp] = {
          gpName: gp,
          totalRequisitions: 0,
          repairPending: 0,
          repairCompleted: 0,
          reborePending: 0,
          reboreCompleted: 0,
          totalSanctionAmount: 0,
          pendingRequisitions: 0,
          approvedRequisitions: 0,
          completedRequisitions: 0,
        };
      }
      
      const data = gpMap[gp];
      data.totalRequisitions++;
      
      const amount = req.SanctionAmount ? parseFloat(req.SanctionAmount.toString()) : 0;
      if (!isNaN(amount)) {
        data.totalSanctionAmount += amount;
      }
      
      if (req.RequisitionStatus === 1) data.pendingRequisitions++;
      else if (req.RequisitionStatus === 2) data.approvedRequisitions++;
      else if (req.RequisitionStatus === 3) data.completedRequisitions++;
      
      const isRepair = req.RequisitionTypeId === 1;
      const isRebore = req.RequisitionTypeId === 2;
      const isPending = req.RequisitionStatus === 1;
      const isCompleted = req.RequisitionStatus === 3;
      
      if (isRepair && isPending) data.repairPending++;
      if (isRepair && isCompleted) data.repairCompleted++;
      if (isRebore && isPending) data.reborePending++;
      if (isRebore && isCompleted) data.reboreCompleted++;
    });
  
  return Object.values(gpMap).sort((a, b) => 
    (a.gpName || '').localeCompare(b.gpName || '')
  );
};

export const getVillageRequisitionData = (
  requisitions: Requisition[], 
  districtName: string, 
  blockName: string, 
  gpName: string
): RequisitionAggregatedData[] => {
  const villageMap: Record<string, RequisitionAggregatedData> = {};
  
  requisitions
    .filter(req => 
      req.DistrictName === districtName && 
      req.BlockName === blockName && 
      req.GrampanchayatName === gpName
    )
    .forEach(req => {
      const village = req.VillageName || 'Unknown';
      if (!villageMap[village]) {
        villageMap[village] = {
          villageName: village,
          totalRequisitions: 0,
          repairPending: 0,
          repairCompleted: 0,
          reborePending: 0,
          reboreCompleted: 0,
          totalSanctionAmount: 0,
          pendingRequisitions: 0,
          approvedRequisitions: 0,
          completedRequisitions: 0,
        };
      }
      
      const data = villageMap[village];
      data.totalRequisitions++;
      
      const amount = req.SanctionAmount ? parseFloat(req.SanctionAmount.toString()) : 0;
      if (!isNaN(amount)) {
        data.totalSanctionAmount += amount;
      }
      
      if (req.RequisitionStatus === 1) data.pendingRequisitions++;
      else if (req.RequisitionStatus === 2) data.approvedRequisitions++;
      else if (req.RequisitionStatus === 3) data.completedRequisitions++;
      
      const isRepair = req.RequisitionTypeId === 1;
      const isRebore = req.RequisitionTypeId === 2;
      const isPending = req.RequisitionStatus === 1;
      const isCompleted = req.RequisitionStatus === 3;
      
      if (isRepair && isPending) data.repairPending++;
      if (isRepair && isCompleted) data.repairCompleted++;
      if (isRebore && isPending) data.reborePending++;
      if (isRebore && isCompleted) data.reboreCompleted++;
    });
  
  return Object.values(villageMap).sort((a, b) => 
    (a.villageName || '').localeCompare(b.villageName || '')
  );
};