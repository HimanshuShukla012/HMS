import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MapPin } from 'lucide-react';

interface DistrictPerformance {
  district: string;
  performance: number;
  total: number;
  active: number;
}

interface DistrictPerformanceChartProps {
  data: DistrictPerformance[];
}

export const DistrictPerformanceChart: React.FC<DistrictPerformanceChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <MapPin size={20} className="text-green-600" />
        District Performance
      </h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="district" angle={-45} textAnchor="end" height={80} stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="performance" fill="#3B82F6" name="Performance %" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No district data available
        </div>
      )}
    </div>
  );
};