import React, { useState } from 'react';
import {
  MoreVertical,
  UserPlus,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Search,
  Filter,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { IBooking, BookingStatus } from '../../types/index.ts';
import { StatusBadge } from '../common/StatusBadge.tsx';

interface RecentBookingsTableProps {
  bookings: IBooking[];
  loading?: boolean;
  onViewBooking: (booking: IBooking) => void;
  onAssignTechnician: (booking: IBooking) => void;
  onUpdateStatus: (booking: IBooking, newStatus: BookingStatus) => void;
  onViewInvoice: (booking: IBooking) => void;
}

export const RecentBookingsTable: React.FC<RecentBookingsTableProps> = ({
  bookings,
  loading,
  onViewBooking,
  onAssignTechnician,
  onUpdateStatus,
  onViewInvoice,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  // Filter and search
  const filtered = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const q = tableSearch.toLowerCase();
    const matchesSearch =
      !tableSearch ||
      b.customerName.toLowerCase().includes(q) ||
      b.serviceName.toLowerCase().includes(q) ||
      b.bookingNumber.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q) ||
      (b.technicianName && b.technicianName.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col overflow-hidden">
      {/* Header with Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">Recent Bookings</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7C3AED] text-xs font-bold">
              {filtered.length} total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Real-time dispatches and technician status</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Table Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter list..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium px-3 py-1.5 rounded-full focus:outline-hidden focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="TECHNICIAN_ASSIGNED">Tech Assigned</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="ON_THE_WAY">On The Way</option>
            <option value="ARRIVED">Arrived</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-slate-400 border-b border-slate-50 font-semibold uppercase tracking-wider">
              <th className="pb-3 px-4 pl-2">Customer</th>
              <th className="pb-3 px-4">Service</th>
              <th className="pb-3 px-4">Technician</th>
              <th className="pb-3 px-4">Location</th>
              <th className="pb-3 px-4">Scheduled</th>
              <th className="pb-3 px-4">Amount</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 px-4 pr-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 animate-pulse">
                  Loading bookings...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No bookings found matching the current criteria.
                </td>
              </tr>
            ) : (
              paginated.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group cursor-pointer"
                  onClick={() => onViewBooking(booking)}
                >
                  {/* Customer */}
                  <td className="py-4 px-4 pl-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
                        {booking.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-[#7C3AED] transition">
                          {booking.customerName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          #{booking.bookingNumber}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Service */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 block">{booking.serviceName}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {booking.serviceCategory}
                    </span>
                  </td>

                  {/* Technician */}
                  <td className="py-3.5 px-4">
                    {booking.technicianName ? (
                      <div className="flex items-center gap-1.5">
                        {booking.technicianAvatar ? (
                          <img
                            src={booking.technicianAvatar}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {booking.technicianName.charAt(0)}
                          </span>
                        )}
                        <span className="font-medium text-slate-700">{booking.technicianName}</span>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssignTechnician(booking);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 transition"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Smart Assign</span>
                      </button>
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[120px]">{booking.location}</span>
                    </div>
                  </td>

                  {/* Scheduled Date */}
                  <td className="py-3.5 px-4">
                    <div className="text-slate-700 font-medium">{booking.scheduledDate}</div>
                    <div className="text-[10px] text-slate-400">{booking.scheduledTimeSlot}</div>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4 font-bold text-slate-800">
                    <div>₹{(booking.totalAmount || booking.finalAmount || 0).toLocaleString('en-IN')}</div>
                    <span
                      className={`text-[10px] font-semibold ${
                        booking.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-600'
                      }`}
                    >
                      {booking.paymentStatus}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={booking.status} size="sm" />
                  </td>

                  {/* Actions 3-dot Menu */}
                  <td className="py-3.5 px-4 pr-5 text-right relative">
                    <button
                      onClick={(e) => toggleMenu(booking._id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      aria-label="Actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === booking._id && (
                      <div
                        className="absolute right-4 top-10 w-44 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-40 text-left"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onViewBooking(booking);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>View Details</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onAssignTechnician(booking);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-purple-700 hover:bg-purple-50 rounded-lg font-medium"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-purple-600" />
                          <span>Assign Technician</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onViewInvoice(booking);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>View Invoice</span>
                        </button>

                        {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                          <>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onUpdateStatus(booking, 'IN_PROGRESS');
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-blue-700 hover:bg-blue-50 rounded-lg"
                            >
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              <span>Mark In Progress</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onUpdateStatus(booking, 'COMPLETED');
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 rounded-lg"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Mark Completed</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onUpdateStatus(booking, 'CANCELLED');
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-500" />
                              <span>Cancel Booking</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-800 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
