import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  Circle,
  AlertCircle,
  CreditCard,
  FileText,
  Sparkles,
  Ban,
  Navigation,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { IBooking, BookingStatus } from '../../types/index.ts';
import { StatusBadge } from '../common/StatusBadge.tsx';
import { CancelBookingModal } from '../modals/CancelBookingModal.tsx';

interface CustomerServiceTrackerProps {
  booking: IBooking;
  onViewInvoice?: (booking: IBooking) => void;
  onOpenPaymentModal?: (booking: IBooking) => void;
  onOpenAIAssistant?: (bookingId?: string) => void;
  onStatusUpdated?: (updated: IBooking) => void;
}

interface MilestoneStep {
  key: BookingStatus;
  label: string;
  description: string;
}

export const CustomerServiceTracker: React.FC<CustomerServiceTrackerProps> = ({
  booking,
  onViewInvoice,
  onOpenPaymentModal,
  onOpenAIAssistant,
  onStatusUpdated,
}) => {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const milestones: MilestoneStep[] = [
    {
      key: 'PENDING',
      label: 'Booking Created',
      description: 'Service booked and submitted to dispatch system',
    },
    {
      key: 'TECHNICIAN_ASSIGNED',
      label: 'Technician Assigned',
      description: 'Certified expert matched and assigned to your order',
    },
    {
      key: 'ACCEPTED',
      label: 'Technician Accepted',
      description: 'Technician acknowledged schedule and confirmed assignment',
    },
    {
      key: 'ON_THE_WAY',
      label: 'Technician On The Way',
      description: 'Technician is en route to your service address',
    },
    {
      key: 'ARRIVED',
      label: 'Technician Arrived',
      description: 'Technician has reached your doorstep',
    },
    {
      key: 'IN_PROGRESS',
      label: 'Service Started',
      description: 'Diagnostic inspection and repair work in progress',
    },
    {
      key: 'COMPLETED',
      label: 'Service Completed',
      description: 'Work verified, parts recorded, and warranty active',
    },
  ];

  // Map order for linear progression
  const statusOrder: Record<string, number> = {
    PENDING: 0,
    TECHNICIAN_ASSIGNED: 1,
    ACCEPTED: 2,
    ON_THE_WAY: 3,
    ARRIVED: 4,
    IN_PROGRESS: 5,
    COMPLETED: 6,
    CANCELLED: -1,
  };

  const isCancelled = booking.status === 'CANCELLED';
  const currentLevel = statusOrder[booking.status] ?? 0;

  // Find historical records from statusHistory or timeline
  const historyList = (booking.statusHistory && booking.statusHistory.length > 0)
    ? booking.statusHistory
    : (booking.timeline || []);

  const getHistoryForStatus = (statusKey: BookingStatus) => {
    return historyList.find((h) => h.status === statusKey);
  };

  const canCancel = ['PENDING', 'TECHNICIAN_ASSIGNED', 'ACCEPTED'].includes(booking.status);

  return (
    <div className="space-y-6">
      {/* Cancellation Banner */}
      {isCancelled && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Ban className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-rose-900">This Service Booking Was Cancelled</h3>
            <p className="text-xs text-rose-700 leading-relaxed">
              Cancelled on {new Date(booking.cancelledAt || booking.updatedAt).toLocaleString()}
              {booking.cancelledBy ? ` by ${booking.cancelledBy}` : ''}.
            </p>
            {booking.cancellationReason && (
              <p className="text-xs text-rose-800 font-medium mt-1">
                Reason: "{booking.cancellationReason}"
              </p>
            )}
            <p className="text-[11px] text-rose-600 mt-2">
              If you wish to re-book this service, you can do so anytime from the catalog.
            </p>
          </div>
        </div>
      )}

      {/* Main Status & Quick Info Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            {!isCancelled && booking.status !== 'COMPLETED' ? (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            ) : null}
            <h3 className="text-base font-bold text-slate-900">
              {booking.serviceName}
            </h3>
            <StatusBadge status={booking.status} size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Booking ID: #{booking.bookingNumber} • Category: {booking.serviceCategory}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {canCancel && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-full text-xs font-bold transition flex items-center gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Cancel Booking</span>
            </button>
          )}

          {booking.paymentStatus === 'PENDING' && onOpenPaymentModal && (
            <button
              onClick={() => onOpenPaymentModal(booking)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay ₹{booking.totalAmount}</span>
            </button>
          )}

          {booking.status === 'COMPLETED' && onViewInvoice && (
            <button
              onClick={() => onViewInvoice(booking)}
              className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-full text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Invoice</span>
            </button>
          )}

          {onOpenAIAssistant && (
            <button
              onClick={() => onOpenAIAssistant(booking._id)}
              className="px-4 py-2 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 rounded-full text-xs font-bold transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Ask AI Assistant</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Vertical Timeline */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Service Progress Timeline</h4>
              <p className="text-xs text-slate-500">
                Accurate step-by-step audit of status events as they occur
              </p>
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
              LIVE TRACKING
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 pt-2">
            {/* Timeline Vertical Guide Line */}
            <div className="absolute left-[19px] sm:left-[27px] top-4 bottom-4 w-0.5 bg-slate-200" />

            {milestones.map((step, idx) => {
              const hist = getHistoryForStatus(step.key);
              const isPast = !isCancelled && currentLevel > idx;
              const isCurrent = !isCancelled && currentLevel === idx;
              const isFuture = isCancelled || currentLevel < idx;

              return (
                <div key={step.key} className="relative flex items-start gap-4">
                  {/* Timeline Node Bullet */}
                  <div
                    className={`absolute -left-[20px] sm:-left-[28px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                      isPast
                        ? 'bg-purple-600 text-white ring-4 ring-purple-100'
                        : isCurrent
                        ? 'bg-purple-600 text-white ring-4 ring-purple-200 animate-pulse'
                        : isCancelled && currentLevel === idx
                        ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    ) : (
                      <span className="text-[10px]">{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 bg-slate-50/60 rounded-2xl p-4 border border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h5
                        className={`text-xs font-bold ${
                          isPast || isCurrent ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </h5>

                      {hist?.timestamp && (
                        <span className="text-[11px] font-mono text-purple-700 font-medium">
                          {new Date(hist.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          • {new Date(hist.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {hist?.note || step.description}
                    </p>

                    {isCurrent && !isCancelled && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>Current Active Stage</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Cancelled Node if cancelled */}
            {isCancelled && (
              <div className="relative flex items-start gap-4">
                <div className="absolute -left-[20px] sm:-left-[28px] top-0.5 w-6 h-6 rounded-full bg-rose-600 text-white ring-4 ring-rose-100 flex items-center justify-center text-xs shadow-xs">
                  <Ban className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 bg-rose-50/70 rounded-2xl p-4 border border-rose-200">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-rose-900">Service Cancelled</h5>
                    <span className="text-[11px] font-mono text-rose-700">
                      {new Date(booking.cancelledAt || booking.updatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-rose-700 mt-1">
                    {booking.cancellationReason || 'Booking terminated prior to completion.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Service & Technician Details & Location Status */}
        <div className="space-y-6">
          {/* Assigned Technician Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Assigned Professional
            </h4>

            {booking.technicianName ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base shadow-xs">
                    {booking.technicianName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{booking.technicianName}</h5>
                    <p className="text-xs text-slate-500">Certified Doorstep Specialist</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-600 font-bold">
                      <span>★ 4.9 Rating</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-normal">Background Verified</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-purple-600" />
                    <span>+91 98201 45091</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Direct Contact
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                  <User className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-700">Matching with Field Expert</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  We are assigning the highest-rated available specialist in your locality.
                </p>
              </div>
            )}
          </div>

          {/* Realistic Location Status Card (strictly following constraints) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Transit & Location Status
              </h4>
              <Navigation className="w-4 h-4 text-purple-600" />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="truncate">{booking.customerAddress}</span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-slate-500 text-[11px] leading-relaxed">
                {booking.status === 'ON_THE_WAY' ? (
                  <div className="text-purple-700 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                    <span>Technician is currently en route to your location</span>
                  </div>
                ) : booking.status === 'ARRIVED' ? (
                  <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Technician has arrived at your doorstep</span>
                  </div>
                ) : (
                  <p className="italic text-slate-400">
                    Live location unavailable. Status updates will be shared as the technician moves en route.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Schedule & Pricing Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Service Appointment
            </h4>

            <div className="space-y-2 text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span>Date:</span>
                </span>
                <span className="font-semibold text-slate-800">{booking.scheduledDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Time Slot:</span>
                </span>
                <span className="font-semibold text-slate-800">{booking.scheduledTimeSlot}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span>Total Service Fee:</span>
                <span className="font-bold text-sm text-slate-900">₹{booking.totalAmount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    booking.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CancelBookingModal
        isOpen={cancelModalOpen}
        booking={booking}
        onClose={() => setCancelModalOpen(false)}
        onSuccess={(updated) => {
          if (onStatusUpdated) onStatusUpdated(updated);
        }}
      />
    </div>
  );
};
