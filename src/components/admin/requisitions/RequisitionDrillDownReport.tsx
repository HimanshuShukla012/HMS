import React from 'react';
import { ArrowLeft, Download, Search } from 'lucide-react';
import { RequisitionAggregatedData } from '../../../utils/admin/requisitionDataAggregation';

interface RequisitionDrillDownReportProps {
  drillDownLevel: 'district' | 'block' | 'gp' | 'village';
  data: RequisitionAggregatedData[];
  selectedDrillDistrict: string;
  selectedDrillBlock: string;
  selectedDrillGP: string;
  onNavigateBack: () => void;
  onDrillDown: (item: RequisitionAggregatedData) => void;
  onExport: () => void;
}

export const RequisitionDrillDownReport: React.FC<RequisitionDrillDownReportProps> = ({
  drillDownLevel,
  data,
  selectedDrillDistrict,
  selectedDrillBlock,
  selectedDrillGP,
  onNavigateBack,
  onDrillDown,
  onExport,
}) => {
  const getTitle = () => {
    switch (drillDownLevel) {
      case 'district':
        return 'District-wise Requisition Registry';
      case 'block':
        return `Block-wise Requisition Report - ${selectedDrillDistrict}`;
      case 'gp':
        return `Gram Panchayat Requisition Report - ${selectedDrillBlock}`;
      case 'village':
        return `Village Requisition Report - ${selectedDrillGP}`;
      default:
        return 'Requisition Registry';
    }
  };

  const getBackLabel = () => {
    switch (drillDownLevel) {
      case 'village':
        return 'GP';
      case 'gp':
        return 'Block';
      case 'block':
        return 'District';
      default:
        return '';
    }
  };

  const getColumnName = () => {
    switch (drillDownLevel) {
      case 'district':
        return 'District Name';
      case 'block':
        return 'Block Name';
      case 'gp':
        return 'Gram Panchayat';
      case 'village':
        return 'Village Name';
      default:
        return 'Name';
    }
  };

  const getName = (item: RequisitionAggregatedData) => {
    return item.districtName || item.blockName || item.gpName || item.villageName || 'Unknown';
  };

  const isClickable = drillDownLevel !== 'village';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{getTitle()}</h3>
            {drillDownLevel !== 'district' && (
              <button
                onClick={onNavigateBack}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mt-2"
              >
                <ArrowLeft size={16} />
                Back to {getBackLabel()} Report
              </button>
            )}
          </div>
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">{getColumnName()}</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total Req.</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Repair Pending</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Repair Done</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rebore Pending</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rebore Done</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total Sanctioned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, index) => (
              <tr
                key={index}
                className={`${isClickable ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-50'} transition-colors`}
                onClick={() => isClickable && onDrillDown(item)}
              >
                <td className="px-6 py-4 text-sm font-semibold text-gray-700">{index + 1}</td>
                <td className={`px-6 py-4 text-sm font-bold ${isClickable ? 'text-blue-600 hover:text-blue-800' : 'text-gray-800'}`}>
                  {getName(item)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 font-semibold">{item.totalRequisitions}</td>
                <td className="px-6 py-4 text-sm text-amber-600 font-semibold">{item.repairPending}</td>
                <td className="px-6 py-4 text-sm text-green-600 font-semibold">{item.repairCompleted}</td>
                <td className="px-6 py-4 text-sm text-orange-600 font-semibold">{item.reborePending}</td>
                <td className="px-6 py-4 text-sm text-emerald-600 font-semibold">{item.reboreCompleted}</td>
                <td className="px-6 py-4 text-sm text-green-700 font-bold">
                  ₹{item.totalSanctionAmount.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Search size={24} className="text-gray-400" />
          </div>
          <p className="text-lg text-gray-500 font-medium">No requisitions available for this selection</p>
        </div>
      )}

      {data.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <span className="text-gray-600">Total Entries:</span>
              <span className="ml-2 font-bold text-gray-800">{data.length}</span>
            </div>
            <div className="text-center">
              <span className="text-gray-600">Total Requisitions:</span>
              <span className="ml-2 font-bold text-gray-800">
                {data.reduce((sum, d) => sum + d.totalRequisitions, 0)}
              </span>
            </div>
            <div className="text-center">
              <span className="text-gray-600">All Pending:</span>
              <span className="ml-2 font-bold text-amber-600">
                {data.reduce((sum, d) => sum + d.repairPending + d.reborePending, 0)}
              </span>
            </div>
            <div className="text-center">
              <span className="text-gray-600">Total Sanctioned:</span>
              <span className="ml-2 font-bold text-green-700">
                ₹{data.reduce((sum, d) => sum + d.totalSanctionAmount, 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};