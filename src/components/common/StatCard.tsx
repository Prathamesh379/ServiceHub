import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  growth: string;
  icon: React.ElementType;
  iconBgColor?: string;
  iconColor?: string;
  sparklineData?: number[];
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  growth,
  icon: Icon,
  iconBgColor = 'bg-purple-50',
  iconColor = 'text-purple-600',
  sparklineData = [35, 45, 40, 55, 60, 52, 68, 75, 82],
}) => {
  const isPositive = !growth.startsWith('-');

  // Generate SVG mini sparkline path
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const width = 80;
  const height = 28;

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between transition hover:shadow-md">
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="p-1.5 bg-purple-50 text-[#7C3AED] rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </span>
        <div className="flex items-center gap-2">
          {/* Mini Sparkline */}
          <div className="hidden sm:block opacity-60">
            <svg width={50} height={20} className="overflow-visible">
              <polyline
                fill="none"
                stroke="#7C3AED"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}
          >
            {growth}
          </span>
        </div>
      </div>
    </div>
  );
};
