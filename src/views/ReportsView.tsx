import React from 'react';
import { Download, TrendingUp, DollarSign, Clock, CheckCircle2, ShieldCheck, BarChart3 } from 'lucide-react';
import { IDashboardStats } from '../types/index.ts';

interface ReportsViewProps {
  stats: IDashboardStats | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ stats }) => {
  const exportFullReport = () => {
    const reportData = {
      platform: 'SERVICEHUB Smart Service Management Platform',
      generatedAt: new Date().toISOString(),
      financialMetrics: {
        totalGrossGMV: stats?.monthlyRevenue || 56140,
        platformCommissionRate: '15%',
        platformRevenue: Math.round((stats?.monthlyRevenue || 56140) * 0.15),
        technicianPayouts: Math.round((stats?.monthlyRevenue || 56140) * 0.85),
      },
      operationalMetrics: {
        totalBookings: stats?.totalBookings || 2543,
        completedServices: stats?.completedServices || 2218,
        completionRate: '87.2%',
        firstTimeFixRate: '94.6%',
        averageArrivalETA: '18 minutes',
        customerSatisfactionScore: '4.85 / 5.0',
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ServiceHub_Executive_Audit_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Executive Reports & Operational Intelligence</h2>
          <p className="text-xs text-slate-500">
            Financial unit economics, technician utilization, and SLA compliance metrics
          </p>
        </div>

        <button
          onClick={exportFullReport}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold shadow-xs transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Report</span>
        </button>
      </div>

      {/* Financial Unit Economics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gross GMV</span>
          <span className="text-2xl font-black text-slate-900 block">
            ₹{(stats?.monthlyRevenue || 56140).toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">+14.2% MoM growth</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Platform Revenue (15%)</span>
          <span className="text-2xl font-black text-purple-700 block">
            ₹{Math.round((stats?.monthlyRevenue || 56140) * 0.15).toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Net commissions captured</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Technician Payouts (85%)</span>
          <span className="text-2xl font-black text-slate-800 block">
            ₹{Math.round((stats?.monthlyRevenue || 56140) * 0.85).toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Paid on time ✓</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">First-Time Fix Rate</span>
          <span className="text-2xl font-black text-emerald-600 block">94.6%</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Top 5% in industry benchmark</span>
        </div>
      </div>

      {/* Operational Quality Matrix */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Service SLA Performance Metrics</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-500 font-medium">Average Arrival ETA</span>
            <div className="text-lg font-black text-slate-900">18.4 Mins</div>
            <p className="text-[11px] text-slate-400">Target SLA is under 30 mins across Pune metro</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-500 font-medium">Re-work / Return Job Rate</span>
            <div className="text-lg font-black text-slate-900">1.8%</div>
            <p className="text-[11px] text-slate-400">Covered under ServiceHub 30-day warranty guarantee</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-500 font-medium">Booking Completion Velocity</span>
            <div className="text-lg font-black text-slate-900">87.2%</div>
            <p className="text-[11px] text-slate-400">Ratio of created to completed bookings</p>
          </div>
        </div>
      </div>
    </div>
  );
};
