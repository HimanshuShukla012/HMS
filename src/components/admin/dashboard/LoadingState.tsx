import React from 'react';
import { Loader, Search } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Skeleton for filter bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton for tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6 flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg flex-1"></div>
          ))}
        </div>

        {/* Skeleton for stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading text */}
        <div className="text-center mt-8">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-gray-600 text-base">Loading dashboard data...</p>
        </div>
      </div>
    </div>
  );
};

export const ErrorState: React.FC<{ error: string; onRetry?: () => void }> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
        <Search className="text-red-600 mx-auto mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};