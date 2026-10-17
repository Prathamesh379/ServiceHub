import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Calendar, Filter } from 'lucide-react';

interface RevenuePoint {
  month: string;
  revenue: number;
  bookings: number;
}

interface RevenueChartProps {
  data: RevenuePoint[];
  loading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, loading }) => {
  const [filterMode, setFilterMode] = useState<'Year' | 'Quarter' | 'Month'>('Year');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Filter data according to user selection
  let displayData = data;
  if (filterMode === 'Quarter') {
    displayData = [
      {
        month: 'Q1 (Jan-Mar)',
        revenue: (data[0]?.revenue || 0) + (data[1]?.revenue || 0) + (data[2]?.revenue || 0),
        bookings: (data[0]?.bookings || 0) + (data[1]?.bookings || 0) + (data[2]?.bookings || 0),
      },
      {
        month: 'Q2 (Apr-Jun)',
        revenue: (data[3]?.revenue || 0) + (data[4]?.revenue || 0) + (data[5]?.revenue || 0),
        bookings: (data[3]?.bookings || 0) + (data[4]?.bookings || 0) + (data[5]?.bookings || 0),
      },
      {
        month: 'Q3 (Jul-Sep)',
        revenue: (data[6]?.revenue || 0) + (data[7]?.revenue || 0) + (data[8]?.revenue || 0),
        bookings: (data[6]?.bookings || 0) + (data[7]?.bookings || 0) + (data[8]?.bookings || 0),
      },
      {
        month: 'Q4 (Oct-Dec)',
        revenue: (data[9]?.revenue || 0) + (data[10]?.revenue || 0) + (data[11]?.revenue || 0),
        bookings: (data[9]?.bookings || 0) + (data[10]?.bookings || 0) + (data[11]?.bookings || 0),
      },
    ];
  } else if (filterMode === 'Month') {
    displayData = data.slice(5, 9); // Last 4 active months
  }

  const totalFilteredRevenue = displayData.reduce((sum, item) => sum + item.revenue, 0);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0d0f17] text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
          <p className="font-semibold text-slate-300 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-slate-400">Revenue:</span>
            <span className="font-bold text-white">₹{payload[0].value.toLocaleString('en-IN')}</span>
          </div>
          {payload[0].payload.bookings && (
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-slate-400">Bookings:</span>
              <span className="font-semibold text-slate-200">{payload[0].payload.bookings}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between h-full">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Revenue Analytics</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7C3AED] text-[10px] font-bold">
              Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total Revenue: <span className="font-bold text-slate-800">₹{totalFilteredRevenue.toLocaleString('en-IN')}</span> across tracked billing periods
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100/90 p-1 rounded-full text-xs font-semibold text-slate-600">
            {(['Month', 'Quarter', 'Year'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setFilterMode(m)}
                className={`px-3 py-1 rounded-full transition ${
                  filterMode === m
                    ? 'bg-white text-purple-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-slate-100/90 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-full border-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      {/* Smooth Purple Area & Line Chart */}
      <div className="w-full h-72 pt-4">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 animate-pulse">
            Loading revenue trends...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#7c3aed"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#purpleGradient)"
                activeDot={{ r: 6, fill: '#6d28d9', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
