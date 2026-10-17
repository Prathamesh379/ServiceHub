import React, { useState, useMemo } from 'react';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  FileText,
  Ban,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  Layers,
  Sparkles,
} from 'lucide-react';
import { IBooking, BookingStatus } from '../types/index.ts';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { CancelBookingModal } from '../components/modals/CancelBookingModal.tsx';

interface CustomerMyServicesViewProps {
  bookings: IBooking[];
  onTrackBooking: (booking: IBooking) => void;
  onViewBooking: (booking: IBooking) => void;
  onViewInvoice: (booking: IBooking) => void;
  onOpenPaymentModal: (booking: IBooking) => void;
  onOpenNewBookingModal: () => void;
  onBookingCancelled?: (cancelledBooking: IBooking) => void;
}

type FilterTab = 'ALL' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

export const CustomerMyServicesView: React.FC<CustomerMyServicesViewProps> = ({
  bookings,
  onTrackBooking,
  onViewBooking,
  onViewInvoice,
  onOpenPaymentModal,
  onOpenNewBookingModal,
  onBookingCancelled,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cancellingBooking, setCancellingBooking] = useState<IBooking | null>(null);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Search term match
      const matchesSearch =
        !searchTerm ||
        b.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.serviceCategory.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'ACTIVE') {
        return ['TECHNICIAN_ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(
          b.status
        );
      }
      if (activeFilter === 'UPCOMING') {
        return b.status === 'PENDING';
      }
      if (activeFilter === 'COMPLETED') {
        return b.status === 'COMPLETED';
      }
      if (activeFilter === 'CANCELLED') {
        return b.status === 'CANCELLED';
      }
      return true; // ALL
    });
  }, [bookings, activeFilter, searchTerm]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: bookings.length,
      active: bookings.filter((b) =>
        ['TECHNICIAN_ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)
      ).length,
      upcoming: bookings.filter((b) => b.status === 'PENDING').length,
      completed: bookings.filter((b) => b.status === 'COMPLETED').length,
      cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
    };
  }, [bookings]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">My Services & Bookings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your doorstep service requests, track technicians, and view receipts
          </p>
        </div>

        <button
          onClick={onOpenNewBookingModal}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold text-xs shadow-md shadow-purple-600/20 transition flex items-center gap-2 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Service</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All', count: counts.all },
            { id: 'ACTIVE', label: 'Active', count: counts.active },
            { id: 'UPCOMING', label: 'Upcoming', count: counts.upcoming },
            { id: 'COMPLETED', label: 'Completed', count: counts.completed },
            { id: 'CANCELLED', label: 'Cancelled', count: counts.cancelled },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as FilterTab)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700 font-semibold'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bookings or services..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Bookings List Cards */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No bookings found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm
                ? `No service bookings matched "${searchTerm}". Try a different search.`
                : `You do not have any ${activeFilter.toLowerCase()} service bookings right now.`}
            </p>
          </div>
          <button
            onClick={onOpenNewBookingModal}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold transition shadow-xs"
          >
            Explore & Book Service
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredBookings.map((booking) => {
            const canCancel = ['PENDING', 'TECHNICIAN_ASSIGNED', 'ACCEPTED'].includes(booking.status);

            return (
              <div
                key={booking._id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  {/* Service Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shrink-0 font-black text-sm">
                      {booking.serviceName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{booking.serviceName}</h4>
                        <StatusBadge status={booking.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        #{booking.bookingNumber} • {booking.serviceCategory}
                      </p>
                    </div>
                  </div>

                  {/* Price & Payment */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">
                        ₹{booking.totalAmount}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          booking.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {booking.paymentStatus === 'PAID' ? 'PAID' : 'PAYMENT PENDING'}
                      </span>
                    </div>

                    {booking.paymentStatus === 'PENDING' && (
                      <button
                        onClick={() => onOpenPaymentModal(booking)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-xs transition flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub details row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>
                      {booking.scheduledDate} ({booking.scheduledTimeSlot})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">{booking.customerAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Specialist:</span>
                    <span>{booking.technicianName || 'Assigning soon...'}</span>
                  </div>
                </div>

                {/* Cancellation Details if cancelled */}
                {booking.status === 'CANCELLED' && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    <p className="font-semibold">
                      Cancelled on {new Date(booking.cancelledAt || booking.updatedAt).toLocaleDateString()}
                    </p>
                    {booking.cancellationReason && (
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        Reason: {booking.cancellationReason}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onTrackBooking(booking)}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Track Service</span>
                    </button>

                    <button
                      onClick={() => onViewBooking(booking)}
                      className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Details</span>
                    </button>

                    {booking.status === 'COMPLETED' && (
                      <button
                        onClick={() => onViewInvoice(booking)}
                        className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-full text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    )}
                  </div>

                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => setCancellingBooking(booking)}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-full text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel Booking</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reusable Cancellation Modal */}
      <CancelBookingModal
        isOpen={!!cancellingBooking}
        booking={cancellingBooking}
        onClose={() => setCancellingBooking(null)}
        onSuccess={(updated) => {
          if (onBookingCancelled) onBookingCancelled(updated);
        }}
      />
    </div>
  );
};
