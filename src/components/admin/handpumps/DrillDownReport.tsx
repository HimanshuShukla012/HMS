import React from 'react';
import { ArrowLeft, Download, Search } from 'lucide-react';
import { AggregatedData } from '../../../utils/admin/dataAggregation';

interface DrillDownReportProps {
  drillDownLevel: 'district' | 'block' | 'gp' | 'village';
  data: AggregatedData[];
  selectedDrillDistrict: string;
  selectedDrillBlock: string;
  selectedDrillGP: string;
  onNavigateBack: () => void;
  onDrillDown: (item: AggregatedData) => void;
  onExport: () => void;
}

export const DrillDownReport: React.FC<DrillDownReportProps> = ({
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
        return 'District-wise Handpump Registry';
      case 'block':
        return `Block-wise Report - ${selectedDrillDistrict}`;
      case 'gp':
        return `Gram Panchayat Report - ${selectedDrillBlock}`;
      case 'village':
        return `Village Report - ${selectedDrillGP}`;
      default:
        return 'Handpump Registry';
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

  const getName = (item: AggregatedData) => {
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Geotagged</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Active</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Inactive</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bad Water</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Good Water</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Soakpit</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Drainage</th>
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
                <td className="px-6 py-4 text-sm text-gray-800">{item.totalGeotagged}</td>
                <td className="px-6 py-4 text-sm text-green-600 font-semibold">{item.active}</td>
                <td className="px-6 py-4 text-sm text-red-600 font-semibold">{item.inactive}</td>
                <td className="px-6 py-4 text-sm text-orange-600">{item.badWaterQuality}</td>
                <td className="px-6 py-4 text-sm text-emerald-600">{item.goodWaterQuality}</td>
                <td className="px-6 py-4 text-sm text-cyan-600">{item.soakpitConnected}</td>
                <td className="px-6 py-4 text-sm text-indigo-600">{item.drainageConnected}</td>
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
          <p className="text-lg text-gray-500 font-medium">No data available for this selection</p>
        </div>
      )}
    </div>
  );
};