import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface RankingItem {
  name: string;
  handpumps: number;
  active: number;
  performance: number;
}

interface Rankings {
  topDistricts: RankingItem[];
  bottomDistricts: RankingItem[];
  topBlocks: RankingItem[];
  bottomBlocks: RankingItem[];
  topGPs: RankingItem[];
  bottomGPs: RankingItem[];
}

interface RankingsSectionProps {
  rankings: Rankings;
}

const RankingCard: React.FC<{
  title: string;
  data: RankingItem[];
  type: 'top' | 'bottom';
  color: string;
}> = ({ title, data, type, color }) => {
  const bgGradient = type === 'top' 
    ? `bg-gradient-to-r from-${color}-50 to-${color.split('-')[0]}-50`
    : `bg-gradient-to-r from-${color}-50 to-${color.split('-')[0]}-50`;
  
  const bgColor = type === 'top' ? `bg-${color}-100` : `bg-${color}-100`;
  const textColor = type === 'top' ? `text-${color}-700` : `text-${color}-700`;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className={`p-6 border-b border-gray-200 ${bgGradient}`}>
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          {type === 'top' ? <ArrowUp size={20} className={textColor} /> : <ArrowDown size={20} className={textColor} />}
          {title}
        </h3>
      </div>
      <div className="p-6">
        {data.length > 0 ? (
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${bgColor} ${textColor} rounded-full flex items-center justify-center font-bold text-sm`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.handpumps} handpumps</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${textColor}`}>{item.performance.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">{item.active} active</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No data available</div>
        )}
      </div>
    </div>
  );
};

export const RankingsSection: React.FC<RankingsSectionProps> = ({ rankings }) => {
  return (
    <div className="space-y-6">
      {/* Districts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingCard title="Top 10 Districts (Active Handpumps)" data={rankings.topDistricts} type="top" color="green-600" />
        <RankingCard title="Bottom 10 Districts (Active Handpumps)" data={rankings.bottomDistricts} type="bottom" color="red-600" />
      </div>

      {/* Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingCard title="Top 10 Blocks (Active Handpumps)" data={rankings.topBlocks} type="top" color="blue-600" />
        <RankingCard title="Bottom 10 Blocks (Active Handpumps)" data={rankings.bottomBlocks} type="bottom" color="orange-600" />
      </div>

      {/* Gram Panchayats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingCard title="Top 10 Gram Panchayats (Active Handpumps)" data={rankings.topGPs} type="top" color="purple-600" />
        <RankingCard title="Bottom 10 Gram Panchayats (Active Handpumps)" data={rankings.bottomGPs} type="bottom" color="yellow-600" />
      </div>
    </div>
  );
};