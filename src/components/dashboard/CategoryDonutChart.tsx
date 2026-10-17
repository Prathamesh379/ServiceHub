import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface CategoryPoint {
  name: string;
  value: number;
  color: string;
}

interface CategoryDonutChartProps {
  data: CategoryPoint[];
  loading?: boolean;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ data, loading }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value, payload: item } = payload[0];
      const pct = total > 0 ? Math.round((value / total) * 100) : 0;
      return (
        <div className="bg-[#0d0f17] text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-semibold text-slate-200">{name}:</span>
            <span className="font-bold text-white">{value} ({pct}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#7C3AED] rounded-3xl shadow-lg p-6 flex flex-col justify-between text-white">
      <div className="flex items-center justify-between pb-2 border-b border-white/20">
        <div>
          <h3 className="font-bold text-sm tracking-tight text-white">Service Distribution</h3>
          <p className="text-[11px] text-purple-200">Category volume allocation</p>
        </div>
        <span className="text-xs font-bold text-purple-900 bg-white/90 px-2.5 py-0.5 rounded-full shadow-xs">
          Live
        </span>
      </div>

      {/* Donut Chart with Total in Center */}
      <div className="relative w-full h-44 flex items-center justify-center my-2">
        {loading ? (
          <div className="text-xs text-purple-200 animate-pulse">Loading categories...</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#7C3AED" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Total Center Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white tracking-tight leading-none">
                {total}
              </span>
              <span className="text-[9px] uppercase font-bold text-purple-200 tracking-wider mt-0.5">
                Total
              </span>
            </div>
          </>
        )}
      </div>

      {/* Category Legend matching design */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.slice(0, 4).map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.name} className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <p className="text-[10px] text-purple-100 truncate">{item.name}</p>
              </div>
              <p className="text-xs font-bold text-white mt-0.5">{pct}% <span className="font-normal opacity-80">({item.value})</span></p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
