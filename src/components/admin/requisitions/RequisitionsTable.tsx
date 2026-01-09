import React from 'react';
import { Eye, Download } from 'lucide-react';
import { Requisition } from '../../../hooks/admin/useAdminData';

interface RequisitionsTableProps {
  requisitions: Requisition[];
  onViewRequisition: (requisition: Requisition) => void;
  onExport: () => void;
}

export const RequisitionsTable: React.FC<RequisitionsTableProps> = ({
  requisitions,
  onViewRequisition,
  onExport,
}) => {
  const displayRequisitions = requisitions.slice(0, 10);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Requisition Registry</h3>
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Req. ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Handpump</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Village</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayRequisitions.length > 0 ? (
              displayRequisitions.map((req) => (
                <tr key={req.RequisitionId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-semibold text-purple-600">
                    REQ-{req.RequisitionId.toString().padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{req.HandpumpId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{req.VillageName}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        req.RequisitionTypeId === 1
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {req.RequisitionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(req.RequisitionDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        req.RequisitionStatus === 1
                          ? 'bg-amber-100 text-amber-700'
                          : req.RequisitionStatus === 2
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {req.RequisitionStatus === 1
                        ? 'Pending'
                        : req.RequisitionStatus === 2
                        ? 'Approved'
                        : 'Completed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">
                    {req.SanctionAmount
                      ? `₹${parseFloat(req.SanctionAmount).toLocaleString('en-IN')}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onViewRequisition(req)}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  No requisitions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {requisitions.length > 10 && (
        <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-600">
          Showing 10 of {requisitions.length} requisitions
        </div>
      )}
    </div>
  );
};