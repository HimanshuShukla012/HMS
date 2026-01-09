import React, { useMemo } from 'react';
import { Download, ArrowRight } from 'lucide-react';
import { Requisition } from '../../../hooks/admin/useAdminData';

interface DistrictOverview {
  districtName: string;
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

interface RequisitionsOverviewTableProps {
  requisitions: Requisition[];
  onExport: () => void;
  onDrillDown?: (districtName: string) => void;
}

export const RequisitionsOverviewTable: React.FC<RequisitionsOverviewTableProps> = ({
  requisitions,
  onExport,
  onDrillDown,
}) => {
  const districtOverviews = useMemo(() => {
    const districtMap = new Map<string, DistrictOverview>();

    requisitions.forEach((req) => {
      const district = req.DistrictName || 'Unknown';
      
      if (!districtMap.has(district)) {
        districtMap.set(district, {
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
        });
      }

      const overview = districtMap.get(district)!;
      overview.totalRequisitions++;

      // Parse sanction amount
      const amount = req.SanctionAmount ? parseFloat(req.SanctionAmount) : 0;
      if (!isNaN(amount)) {
        overview.totalSanctionAmount += amount;
      }

      // Count by status
      if (req.RequisitionStatus === 1) {
        overview.pendingRequisitions++;
      } else if (req.RequisitionStatus === 2) {
        overview.approvedRequisitions++;
      } else if (req.RequisitionStatus === 3) {
        overview.completedRequisitions++;
      }

      // Count by type and status
      const isRepair = req.RequisitionTypeId === 1;
      const isRebore = req.RequisitionTypeId === 2;
      const isPending = req.RequisitionStatus === 1;
      const isCompleted = req.RequisitionStatus === 3;

      if (isRepair && isPending) overview.repairPending++;
      if (isRepair && isCompleted) overview.repairCompleted++;
      if (isRebore && isPending) overview.reborePending++;
      if (isRebore && isCompleted) overview.reboreCompleted++;
    });

    return Array.from(districtMap.values()).sort((a, b) => 
      a.districtName.localeCompare(b.districtName)
    );
  }, [requisitions]);

  const handleRowClick = (district: string) => {
    if (onDrillDown) {
      onDrillDown(district);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">District-wise Requisition Overview</h3>
          <button
            onClick={onExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sr. No.</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">District Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total Req.</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Repair Pending</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Repair Done</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rebore Pending</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rebore Done</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total Sanctioned</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {districtOverviews.length > 0 ? (
              districtOverviews.map((overview, index) => (
                <tr
                  key={overview.districtName}
                  className={`${onDrillDown ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-50'} transition-colors`}
                  onClick={() => handleRowClick(overview.districtName)}
                >
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">{index + 1}</td>
                  <td className={`px-6 py-4 text-sm font-bold ${onDrillDown ? 'text-blue-600' : 'text-gray-800'}`}>
                    {overview.districtName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-semibold">{overview.totalRequisitions}</td>
                  <td className="px-6 py-4 text-sm text-amber-600 font-semibold">{overview.repairPending}</td>
                  <td className="px-6 py-4 text-sm text-green-600 font-semibold">{overview.repairCompleted}</td>
                  <td className="px-6 py-4 text-sm text-orange-600 font-semibold">{overview.reborePending}</td>
                  <td className="px-6 py-4 text-sm text-emerald-600 font-semibold">{overview.reboreCompleted}</td>
                  <td className="px-6 py-4 text-sm text-green-700 font-bold">
                    ₹{overview.totalSanctionAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    {onDrillDown && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(overview.districtName);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                  No requisitions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {districtOverviews.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <span className="text-gray-600">Total Districts:</span>
              <span className="ml-2 font-bold text-gray-800">{districtOverviews.length}</span>
            </div>
            <div className="text-center">
              <span className="text-gray-600">Total Requisitions:</span>
              <span className="ml-2 font-bold text-gray-800">
                {districtOverviews.reduce((sum, d) => sum + d.totalRequisitions, 0)}
              </span>
            </div>
            <div className="text-center">
              <span className="text-gray-600">Pending:</span>
              <span className="ml-2 font-bold text-amber-600">
                {districtOverviews.reduce((sum, d) => sum + d.repairPending + d.reborePending, 0)}
              </span>
            </div>
            <div className="text-center">
              <span className="text-gray-600">Total Sanctioned:</span>
              <span className="ml-2 font-bold text-green-700">
                ₹{districtOverviews.reduce((sum, d) => sum + d.totalSanctionAmount, 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};