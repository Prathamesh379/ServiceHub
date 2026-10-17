import React, { useState } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  UserPlus,
  Eye,
  FileText,
  Download,
  Plus,
  MapPin,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { IBooking, BookingStatus } from '../types/index.ts';
import { StatusBadge } from '../components/common/StatusBadge.tsx';

interface BookingsViewProps {
  bookings: IBooking[];
  loading: boolean;
  onViewBooking: (b: IBooking) => void;
  onAssignTechnician: (b: IBooking) => void;
  onUpdateStatus: (b: IBooking, status: BookingStatus) => void;
  onViewInvoice: (b: IBooking) => void;
  onOpenNewBookingModal: () => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  loading,
  onViewBooking,
  onAssignTechnician,
  onUpdateStatus,
  onViewInvoice,
  onOpenNewBookingModal,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const tabs = [
    { id: 'ALL', label: 'All Bookings' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'TECHNICIAN_ASSIGNED', label: 'Assigned' },
    { id: 'ON_THE_WAY', label: 'In Transit' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  const filtered = bookings.filter((b) => {
    const matchesTab = selectedTab === 'ALL' || b.status === selectedTab;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      b.customerName.toLowerCase().includes(q) ||
      b.serviceName.toLowerCase().includes(q) ||
      b.bookingNumber.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q) ||
      (b.technicianName && b.technicianName.toLowerCase().includes(q));

    return matchesTab && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ['Booking ID', 'Customer', 'Service', 'Technician', 'Location', 'Amount', 'Status'];
    const rows = filtered.map((b) => [
      b.bookingNumber,
      `"${b.customerName}"`,
      `"${b.serviceName}"`,
      `"${b.technicianName || 'Unassigned'}"`,
      `"${b.location}"`,
      b.totalAmount,
      b.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ServiceHub_Bookings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Service Bookings Directory</h2>
          <p className="text-xs text-slate-500">Live operational dispatch and job lifecycles</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full text-xs font-semibold shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewBookingModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold shadow-sm shadow-purple-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedTab === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking #, customer, area..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-hidden focus:border-purple-500"
          />
        </div>
      </div>

      {/* Bookings Card Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 animate-pulse">
            Loading bookings...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            No bookings found for the selected criteria.
          </div>
        ) : (
          filtered.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {booking.bookingNumber}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {booking.serviceName}
                    </h3>
                  </div>
                  <StatusBadge status={booking.status} size="sm" />
                </div>

                <p className="text-slate-600 text-xs line-clamp-2 mb-3 bg-slate-50 p-2 rounded-xl">
                  {booking.problemDescription}
                </p>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Customer:</span>
                    <span className="font-bold text-slate-800">{booking.customerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-medium text-slate-700">{booking.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Scheduled:</span>
                    <span className="font-medium text-slate-700">{booking.scheduledDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Technician:</span>
                    <span className="font-bold text-slate-800">
                      {booking.technicianName || 'Pending Assignment'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-black text-slate-900">₹{booking.totalAmount}</span>

                <div className="flex items-center gap-1.5">
                  {!booking.technicianId && (
                    <button
                      onClick={() => onAssignTechnician(booking)}
                      className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-full text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Assign</span>
                    </button>
                  )}
                  <button
                    onClick={() => onViewBooking(booking)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-[11px] font-semibold transition"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onViewInvoice(booking)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                    title="Invoice"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
