import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface StatusDistributionChartProps {
  activeHandpumps: number;
  inactiveHandpumps: number;
}

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  activeHandpumps,
  inactiveHandpumps,
}) => {
  const data = [
    { name: 'Active', value: activeHandpumps, color: '#10B981' },
    { name: 'Inactive', value: inactiveHandpumps, color: '#EF4444' },
  ];

  const hasData = data.some(d => d.value > 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <BarChart3 size={20} className="text-purple-600" />
        Status Distribution
      </h3>
      {hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      )}
    </div>
  );
};