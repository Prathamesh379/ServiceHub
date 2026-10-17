import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  FileText,
  Star,
  AlertCircle,
  Phone,
  CreditCard,
  Plus,
  Navigation,
  Sparkles,
  Ban,
  ArrowRight,
  ShieldCheck,
  Headphones,
  User,
} from 'lucide-react';
import { IBooking, BookingStatus } from '../types/index.ts';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { CustomerServiceTracker } from '../components/customer/CustomerServiceTracker.tsx';
import { CancelBookingModal } from '../components/modals/CancelBookingModal.tsx';

interface CustomerPortalViewProps {
  bookings: IBooking[];
  onOpenNewBookingModal: () => void;
  onViewBooking: (b: IBooking) => void;
  onViewInvoice: (b: IBooking) => void;
  onOpenReviewModal: (b: IBooking) => void;
  onOpenComplaintModal: (b: IBooking) => void;
  onOpenPaymentModal: (b: IBooking) => void;
  onOpenAIAssistant?: (bookingId?: string) => void;
  onNavigateToMyServices?: () => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  bookings,
  onOpenNewBookingModal,
  onViewBooking,
  onViewInvoice,
  onOpenReviewModal,
  onOpenComplaintModal,
  onOpenPaymentModal,
  onOpenAIAssistant,
  onNavigateToMyServices,
}) => {
  // Determine primary active booking
  const activeBookings = bookings.filter(
    (b) =>
      b.status !== 'COMPLETED' &&
      b.status !== 'CANCELLED'
  );

  const [selectedTrackingBookingId, setSelectedTrackingBookingId] = useState<string | null>(
    activeBookings[0]?._id || bookings[0]?._id || null
  );

  const [cancellingBooking, setCancellingBooking] = useState<IBooking | null>(null);

  const trackingBooking =
    bookings.find((b) => b._id === selectedTrackingBookingId) || activeBookings[0] || bookings[0];

  // Booking Summary Counters
  const counters = {
    active: bookings.filter((b) =>
      ['TECHNICIAN_ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)
    ).length,
    upcoming: bookings.filter((b) => b.status === 'PENDING').length,
    completed: bookings.filter((b) => b.status === 'COMPLETED').length,
    cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  const handleTrackService = (b: IBooking) => {
    setSelectedTrackingBookingId(b._id);
    const elem = document.getElementById('customer-tracking-section');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-purple-200 block mb-1">
            ServiceHub Customer Portal
          </span>
          <h2 className="text-2xl font-black tracking-tight">Your Home Services Dashboard</h2>
          <p className="text-xs text-purple-100/90 mt-1 max-w-xl leading-relaxed">
            Track certified doorstep technicians in real-time, view verified status history, access
            invoices, and get instant AI diagnostics.
          </p>
        </div>

        <button
          onClick={onOpenNewBookingModal}
          className="px-6 py-3 bg-white text-purple-700 hover:bg-purple-50 rounded-full font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Book a New Service</span>
        </button>
      </div>

      {/* 3. Booking Summary Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Services
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {counters.active}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">In execution</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Upcoming Bookings
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {counters.upcoming}
            </span>
            <span className="text-[10px] text-amber-600 font-medium">Pending assignment</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Completed Services
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {counters.completed}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Under 30-day warranty</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Cancelled Services
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {counters.cancelled}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Terminated bookings</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Ban className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Quick Actions
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onOpenNewBookingModal}
            className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100/80 text-purple-800 transition flex items-center gap-3 text-left font-bold text-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <span>Book New Service</span>
          </button>

          <button
            onClick={() => {
              if (activeBookings[0]) {
                handleTrackService(activeBookings[0]);
              } else if (bookings[0]) {
                handleTrackService(bookings[0]);
              }
            }}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 transition flex items-center gap-3 text-left font-bold text-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <span>Track Service</span>
          </button>

          <button
            onClick={() => {
              const completedBooking = bookings.find((b) => b.status === 'COMPLETED') || bookings[0];
              if (completedBooking) onViewInvoice(completedBooking);
            }}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 transition flex items-center gap-3 text-left font-bold text-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <span>View Invoices</span>
          </button>

          <button
            onClick={() => {
              if (onOpenAIAssistant) onOpenAIAssistant(activeBookings[0]?._id);
            }}
            className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100/80 text-purple-800 transition flex items-center gap-3 text-left font-bold text-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 1. Active Services Card */}
      {activeBookings.length > 0 ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-sm font-bold text-slate-900">Active Service in Progress</h3>
            </div>
            {onNavigateToMyServices && (
              <button
                onClick={onNavigateToMyServices}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <span>View All Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.slice(0, 2).map((b) => (
              <div
                key={b._id}
                className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100/80 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono font-bold text-purple-700">
                      #{b.bookingNumber}
                    </span>
                    <StatusBadge status={b.status} size="sm" />
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{b.serviceName}</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Scheduled: {b.scheduledDate} ({b.scheduledTimeSlot})
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-700">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    <span>Specialist: <strong>{b.technicianName || 'Assigning nearest technician'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-purple-100">
                  <button
                    onClick={() => handleTrackService(b)}
                    className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Track Service</span>
                  </button>

                  <button
                    onClick={() => onViewBooking(b)}
                    className="py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full font-semibold text-xs transition"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">No active services right now</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                All your previous home service requests are complete or you haven't placed one today.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenNewBookingModal}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold transition shrink-0"
          >
            Book a Service
          </button>
        </div>
      )}

      {/* 4. Live Dedicated Service Tracking Section */}
      {trackingBooking && (
        <div id="customer-tracking-section" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Live Service Tracker
              </h3>
              <p className="text-xs text-slate-500">
                Tracking #{trackingBooking.bookingNumber} • {trackingBooking.serviceName}
              </p>
            </div>

            {bookings.length > 1 && (
              <select
                value={trackingBooking._id}
                onChange={(e) => setSelectedTrackingBookingId(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {bookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    #{b.bookingNumber} - {b.serviceName} ({b.status.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
            )}
          </div>

          <CustomerServiceTracker
            booking={trackingBooking}
            onViewInvoice={onViewInvoice}
            onOpenPaymentModal={onOpenPaymentModal}
            onOpenAIAssistant={onOpenAIAssistant}
            onStatusUpdated={(updated) => {
              Object.assign(trackingBooking, updated);
            }}
          />
        </div>
      )}

      {/* Recent Bookings List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Service Requests</h3>
          {onNavigateToMyServices && (
            <button
              onClick={onNavigateToMyServices}
              className="text-xs font-bold text-purple-600 hover:text-purple-700"
            >
              See All Bookings →
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100 text-xs">
            {bookings.slice(0, 5).map((b) => (
              <div
                key={b._id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] font-bold text-slate-400">
                      {b.bookingNumber}
                    </span>
                    <StatusBadge status={b.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{b.serviceName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {b.scheduledDate} at {b.scheduledTimeSlot} • {b.customerAddress}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className="font-black text-slate-900 text-sm mr-2">₹{b.totalAmount}</span>

                  <button
                    onClick={() => handleTrackService(b)}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full font-bold text-xs flex items-center gap-1 transition"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Track</span>
                  </button>

                  <button
                    onClick={() => onViewBooking(b)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-semibold text-xs transition"
                  >
                    Details
                  </button>

                  {b.status === 'COMPLETED' && (
                    <>
                      <button
                        onClick={() => onViewInvoice(b)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-semibold text-xs flex items-center gap-1 transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-purple-600" />
                        <span>Invoice</span>
                      </button>

                      <button
                        onClick={() => onOpenReviewModal(b)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-full font-semibold text-xs flex items-center gap-1 transition"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Rate</span>
                      </button>
                    </>
                  )}

                  {['PENDING', 'TECHNICIAN_ASSIGNED', 'ACCEPTED'].includes(b.status) && (
                    <button
                      onClick={() => setCancellingBooking(b)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-full font-semibold text-xs flex items-center gap-1 transition"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CancelBookingModal
        isOpen={!!cancellingBooking}
        booking={cancellingBooking}
        onClose={() => setCancellingBooking(null)}
        onSuccess={(updated) => {
          setCancellingBooking(null);
        }}
      />
    </div>
  );
};
