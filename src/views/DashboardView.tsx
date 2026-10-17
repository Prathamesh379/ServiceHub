import React from 'react';
import {
  Users,
  IndianRupee,
  CalendarCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard.tsx';
import { RevenueChart } from '../components/dashboard/RevenueChart.tsx';
import { CategoryDonutChart } from '../components/dashboard/CategoryDonutChart.tsx';
import { AIAssistantCard } from '../components/dashboard/AIAssistantCard.tsx';
import { TopServicesCard } from '../components/dashboard/TopServicesCard.tsx';
import { RecentBookingsTable } from '../components/dashboard/RecentBookingsTable.tsx';
import {
  IDashboardStats,
  IBooking,
  BookingStatus,
} from '../types/index.ts';

interface DashboardViewProps {
  stats: IDashboardStats | null;
  revenueData: Array<{ month: string; revenue: number; bookings: number }>;
  categoryData: Array<{ name: string; value: number; color: string }>;
  topServicesData: Array<{
    id: string;
    name: string;
    category: string;
    bookings: number;
    revenue: number;
    percentage: number;
  }>;
  bookings: IBooking[];
  loadingStats: boolean;
  onViewBooking: (b: IBooking) => void;
  onAssignTechnician: (b: IBooking) => void;
  onUpdateBookingStatus: (b: IBooking, status: BookingStatus) => void;
  onViewInvoice: (b: IBooking) => void;
  onOpenBookingModalWithPrompt: (serviceName: string, problem: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  revenueData,
  categoryData,
  topServicesData,
  bookings,
  loadingStats,
  onViewBooking,
  onAssignTechnician,
  onUpdateBookingStatus,
  onViewInvoice,
  onOpenBookingModalWithPrompt,
}) => {
  return (
    <div className="space-y-6">
      {/* 4 KPI Cards Grid matching reference UI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers?.toLocaleString('en-IN') || '4,562'}
          growth={stats?.totalCustomersGrowth || '+12.5%'}
          icon={Users}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
          sparklineData={[30, 42, 38, 50, 48, 62, 70, 78, 85]}
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${stats?.monthlyRevenue?.toLocaleString('en-IN') || '56,140'}`}
          growth={stats?.monthlyRevenueGrowth || '+8.2%'}
          icon={IndianRupee}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          sparklineData={[45, 52, 49, 65, 58, 72, 80, 88, 94]}
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings?.toLocaleString('en-IN') || '2,543'}
          growth={stats?.totalBookingsGrowth || '+15.0%'}
          icon={CalendarCheck}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          sparklineData={[20, 32, 45, 42, 58, 65, 75, 82, 90]}
        />
        <StatCard
          title="Completed Services"
          value={stats?.completedServices?.toLocaleString('en-IN') || '2,218'}
          growth={stats?.completedServicesGrowth || '+11.3%'}
          icon={CheckCircle2}
          iconBgColor="bg-violet-50"
          iconColor="text-violet-600"
          sparklineData={[28, 36, 42, 50, 60, 68, 76, 84, 91]}
        />
      </div>

      {/* Main Analytics Row: Large Revenue Analytics & Right Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} loading={loadingStats} />
        </div>
        <div className="lg:col-span-1">
          <CategoryDonutChart data={categoryData} loading={loadingStats} />
        </div>
      </div>

      {/* Secondary Row: AI Assistant Diagnostics & Top Services Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <AIAssistantCard onBookService={onOpenBookingModalWithPrompt} />
        </div>
        <div className="lg:col-span-2">
          <TopServicesCard services={topServicesData} loading={loadingStats} />
        </div>
      </div>

      {/* Recent Service Bookings Table */}
      <div>
        <RecentBookingsTable
          bookings={bookings}
          loading={loadingStats}
          onViewBooking={onViewBooking}
          onAssignTechnician={onAssignTechnician}
          onUpdateStatus={onUpdateBookingStatus}
          onViewInvoice={onViewInvoice}
        />
      </div>
    </div>
  );
};
