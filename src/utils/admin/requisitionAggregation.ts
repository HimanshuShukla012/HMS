import { Requisition } from '../../hooks/admin/useAdminData';

export interface RequisitionsByDistrict {
  districtName: string;
  requisitions: Requisition[];
}

export interface RequisitionsByBlock {
  blockName: string;
  requisitions: Requisition[];
}

/**
 * Aggregate requisitions by district
 */
export const aggregateByDistrict = (requisitions: Requisition[]): RequisitionsByDistrict[] => {
  const districtMap = new Map<string, Requisition[]>();

  requisitions.forEach((req) => {
    const district = req.DistrictName || 'Unknown';
    if (!districtMap.has(district)) {
      districtMap.set(district, []);
    }
    districtMap.get(district)!.push(req);
  });

  return Array.from(districtMap.entries())
    .map(([districtName, reqs]) => ({ districtName, requisitions: reqs }))
    .sort((a, b) => a.districtName.localeCompare(b.districtName));
};

/**
 * Aggregate requisitions by block within a district
 */
export const aggregateByBlock = (
  requisitions: Requisition[],
  districtName: string
): RequisitionsByBlock[] => {
  const blockMap = new Map<string, Requisition[]>();

  requisitions
    .filter((req) => req.DistrictName === districtName)
    .forEach((req) => {
      const block = req.BlockName || 'Unknown';
      if (!blockMap.has(block)) {
        blockMap.set(block, []);
      }
      blockMap.get(block)!.push(req);
    });

  return Array.from(blockMap.entries())
    .map(([blockName, reqs]) => ({ blockName, requisitions: reqs }))
    .sort((a, b) => a.blockName.localeCompare(b.blockName));
};

/**
 * Calculate financial statistics from requisitions
 */
export const calculateFinancialStats = (requisitions: Requisition[]) => {
  let totalSanctionAmount = 0;
  let requisitionsWithAmount = 0;
  let approvedCount = 0;
  let completedCount = 0;
  let pendingCount = 0;
  let repairCount = 0;
  let reboreCount = 0;

  requisitions.forEach((req) => {
    // Count by status
    if (req.RequisitionStatus === 1) pendingCount++;
    else if (req.RequisitionStatus === 2) approvedCount++;
    else if (req.RequisitionStatus === 3) completedCount++;

    // Count by type
    if (req.RequisitionTypeId === 1) repairCount++;
    else if (req.RequisitionTypeId === 2) reboreCount++;

    // Calculate total sanction amount
    if (req.SanctionAmount) {
      const amount = parseFloat(req.SanctionAmount.toString());
      if (!isNaN(amount) && amount > 0) {
        totalSanctionAmount += amount;
        requisitionsWithAmount++;
      }
    }
  });

  return {
    totalSanctionAmount,
    requisitionsWithAmount,
    averageSanctionAmount:
      requisitionsWithAmount > 0 ? totalSanctionAmount / requisitionsWithAmount : 0,
    approvedCount,
    completedCount,
    pendingCount,
    repairCount,
    reboreCount,
    totalCount: requisitions.length,
    completionRate:
      requisitions.length > 0 ? (completedCount / requisitions.length) * 100 : 0,
  };
};

/**
 * Export requisitions data to CSV format
 */
export const exportRequisitionsToCSV = (
  requisitions: Requisition[],
  filename: string = 'requisitions'
) => {
  const headers = [
    'Requisition ID',
    'Handpump ID',
    'Village',
    'Gram Panchayat',
    'Block',
    'District',
    'Type',
    'Date',
    'Status',
    'Sanction Amount',
    'Completion Date',
  ];

  const rows = requisitions.map((req) => [
    `REQ-${req.RequisitionId.toString().padStart(4, '0')}`,
    req.HandpumpId,
    req.VillageName,
    req.GrampanchayatName,
    req.BlockName,
    req.DistrictName,
    req.RequisitionType,
    new Date(req.RequisitionDate).toLocaleDateString('en-IN'),
    req.RequisitionStatus === 1 ? 'Pending' : req.RequisitionStatus === 2 ? 'Approved' : 'Completed',
    req.SanctionAmount ? `₹${parseFloat(req.SanctionAmount).toLocaleString('en-IN')}` : '-',
    req.CompletionDateStr || '-',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};