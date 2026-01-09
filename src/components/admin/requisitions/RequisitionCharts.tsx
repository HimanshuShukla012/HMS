import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Activity } from 'lucide-react';

interface RequisitionChartsProps {
  stats: {
    repairRequisitions: number;
    reboreRequisitions: number;
    pendingRequisitions: number;
    approvedRequisitions: number;
    completedRequisitions: number;
    totalRequisitions: number;
  };
}

export const RequisitionCharts: React.FC<RequisitionChartsProps> = ({ stats }) => {
  const typeData = [
    { name: 'Repair', value: stats.repairRequisitions, color: '#3B82F6' },
    { name: 'Rebore', value: stats.reboreRequisitions, color: '#10B981' },
  ];

  const statusData = [
    { name: 'Pending', value: stats.pendingRequisitions, fill: '#F59E0B' },
    { name: 'Approved', value: stats.approvedRequisitions, fill: '#3B82F6' },
    { name: 'Completed', value: stats.completedRequisitions, fill: '#10B981' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Type Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-purple-600" />
          Requisition Type Distribution
        </h3>
        {stats.totalRequisitions > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No requisition data available
          </div>
        )}
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-blue-600" />
          Status Overview
        </h3>
        {stats.totalRequisitions > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No status data available
          </div>
        )}
      </div>
    </div>
  );
};