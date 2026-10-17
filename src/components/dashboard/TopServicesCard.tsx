import React from 'react';
import { Layers, ArrowUpRight } from 'lucide-react';

interface TopServiceItem {
  id: string;
  name: string;
  category: string;
  bookings: number;
  revenue: number;
  percentage: number;
}

interface TopServicesCardProps {
  services: TopServiceItem[];
  loading?: boolean;
}

export const TopServicesCard: React.FC<TopServicesCardProps> = ({ services, loading }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">Top Performing Services</h3>
          <p className="text-xs text-slate-500">Ranked by customer bookings and total revenue</p>
        </div>
        <span className="text-xs font-semibold text-[#7C3AED] bg-purple-50 px-2.5 py-1 rounded-full">
          Live Ranking
        </span>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
          Loading top services...
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((srv, index) => (
            <div key={srv.id || index} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition">
                      {srv.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">{srv.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block">
                    ₹{srv.revenue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {srv.bookings} bookings
                  </span>
                </div>
              </div>

              {/* Popularity Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${srv.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
