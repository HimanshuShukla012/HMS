import React from 'react';
import { Handpump } from '../../../hooks/admin/useAdminData';

interface AnalyticsTabProps {
  stats: {
    totalHandpumps: number;
    activeHandpumps: number;
    totalDistricts: number;
    totalBlocks: number;
    totalGPs: number;
  };
  handpumps: Handpump[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ stats, handpumps }) => {
  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Success Rate</h4>
          <div className="text-center">
            <div className="text-5xl font-bold text-green-600">
              {stats.totalHandpumps > 0
                ? Math.round((stats.activeHandpumps / stats.totalHandpumps) * 100)
                : 0}
              %
            </div>
            <p className="text-sm text-gray-600 mt-2">Handpumps Operational</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Total Coverage</h4>
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600">{stats.totalDistricts}</div>
            <p className="text-sm text-gray-600 mt-2">Districts Covered</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Total Blocks</h4>
          <div className="text-center">
            <div className="text-5xl font-bold text-purple-600">{stats.totalBlocks}</div>
            <p className="text-sm text-gray-600 mt-2">Blocks Monitored</p>
          </div>
        </div>
      </div>

      {/* Infrastructure Overview & Water Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Infrastructure Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Infrastructure Overview</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Soakpit Connected</span>
              <span className="text-xl font-bold text-blue-600">
                {handpumps.filter((hp) => hp.SoakpitConnected === 1).length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Drainage Connected</span>
              <span className="text-xl font-bold text-green-600">
                {handpumps.filter((hp) => hp.DrainageConnected === 1).length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Platform Built</span>
              <span className="text-xl font-bold text-purple-600">
                {handpumps.filter((hp) => hp.PlateformBuild === 1).length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total GPs</span>
              <span className="text-xl font-bold text-orange-600">{stats.totalGPs}</span>
            </div>
          </div>
        </div>

        {/* Water Quality Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Water Quality Distribution</h4>
          <div className="space-y-3">
            {['Good', 'Average', 'Poor', 'Bad'].map((quality) => {
              const count = handpumps.filter((hp) => hp.WaterQuality === quality).length;
              const percentage =
                stats.totalHandpumps > 0 ? ((count / stats.totalHandpumps) * 100).toFixed(1) : '0';
              const color =
                quality === 'Good'
                  ? 'bg-green-500'
                  : quality === 'Average'
                  ? 'bg-yellow-500'
                  : quality === 'Poor'
                  ? 'bg-orange-500'
                  : 'bg-red-500';

              return (
                <div key={quality}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{quality}</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};