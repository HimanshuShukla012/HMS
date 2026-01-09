import React from 'react';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  filters: {
    district: string;
    block: string;
    gramPanchayat: string;
    village: string;
    financialYear: string;
    month: string;
  };
  filterOptions: {
    districts: string[];
    blocks: string[];
    gramPanchayats: string[];
    villages: string[];
    financialYears: string[];
    months: string[];
  };
  onFilterChange: (filterName: string, value: string) => void;
  onResetFilters: () => void;
}

export const UniversalFilterBar: React.FC<FilterBarProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  onResetFilters,
}) => {
  const hasActiveFilters = filters.district || filters.block || filters.gramPanchayat || filters.village;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Filter size={20} className="text-blue-600" />
          Universal Filters
        </h3>
        <button
          onClick={onResetFilters}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <X size={16} />
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* District Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
          <select
            value={filters.district}
            onChange={(e) => onFilterChange('district', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            <option value="">All Districts</option>
            {filterOptions.districts.slice(1).map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        {/* Block Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
          <select
            value={filters.block}
            onChange={(e) => onFilterChange('block', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            <option value="">All Blocks</option>
            {filterOptions.blocks.slice(1).map((block) => (
              <option key={block} value={block}>
                {block}
              </option>
            ))}
          </select>
        </div>

        {/* Gram Panchayat Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gram Panchayat</label>
          <select
            value={filters.gramPanchayat}
            onChange={(e) => onFilterChange('gramPanchayat', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            <option value="">All GPs</option>
            {filterOptions.gramPanchayats.slice(1).map((gp) => (
              <option key={gp} value={gp}>
                {gp}
              </option>
            ))}
          </select>
        </div>

        {/* Village Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
          <select
            value={filters.village}
            onChange={(e) => onFilterChange('village', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            <option value="">All Villages</option>
            {filterOptions.villages.slice(1).map((village) => (
              <option key={village} value={village}>
                {village}
              </option>
            ))}
          </select>
        </div>

        {/* Financial Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Financial Year</label>
          <select
            value={filters.financialYear}
            onChange={(e) => onFilterChange('financialYear', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            {filterOptions.financialYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
          <select
            value={filters.month}
            onChange={(e) => onFilterChange('month', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            {filterOptions.months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600">Active Filters:</span>
            {filters.district && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                District: {filters.district}
                <button onClick={() => onFilterChange('district', '')} className="hover:text-blue-900">
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.block && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                Block: {filters.block}
                <button onClick={() => onFilterChange('block', '')} className="hover:text-green-900">
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.gramPanchayat && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                GP: {filters.gramPanchayat}
                <button onClick={() => onFilterChange('gramPanchayat', '')} className="hover:text-purple-900">
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.village && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                Village: {filters.village}
                <button onClick={() => onFilterChange('village', '')} className="hover:text-orange-900">
                  <X size={14} />
                </button>
              </span>
            )}
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              FY: {filters.financialYear} | {filters.month}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};