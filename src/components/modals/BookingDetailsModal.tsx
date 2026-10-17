import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle2,
  FileText,
  Star,
  AlertCircle,
  CreditCard,
  Layers,
  ChevronRight,
  Ban,
  AlertTriangle,
} from 'lucide-react';
import { IBooking, BookingStatus } from '../../types/index.ts';
import { StatusBadge } from '../common/StatusBadge.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { CancelBookingModal } from './CancelBookingModal.tsx';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: IBooking | null;
  onOpenAssignModal: (booking: IBooking) => void;
  onOpenInvoiceModal: (booking: IBooking) => void;
  onOpenReviewModal: (booking: IBooking) => void;
  onOpenComplaintModal: (booking: IBooking) => void;
  onUpdateStatus: (booking: IBooking, status: BookingStatus) => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  onOpenAssignModal,
  onOpenInvoiceModal,
  onOpenReviewModal,
  onOpenComplaintModal,
  onUpdateStatus,
}) => {
  const { user, isAdmin } = useAuth();
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);

  if (!isOpen || !booking) return null;

  const canCancel = ['PENDING', 'TECHNICIAN_ASSIGNED', 'ACCEPTED'].includes(booking.status);
  const isPostArrival = ['ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Booking Details: {booking.bookingNumber}
              </h3>
              <StatusBadge status={booking.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Created on {new Date(booking.createdAt).toLocaleDateString()} at{' '}
              {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 text-xs">
          {/* Cancelled Banner */}
          {booking.status === 'CANCELLED' && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-700">
                <Ban className="w-4 h-4" />
                <span>Booking Cancelled</span>
              </div>
              <p className="text-xs text-rose-800">
                Cancelled on {new Date(booking.cancelledAt || booking.updatedAt).toLocaleString()}
                {booking.cancelledBy ? ` by ${booking.cancelledBy}` : ''}.
              </p>
              {booking.cancellationReason && (
                <p className="text-xs text-rose-700 mt-1">
                  <span className="font-semibold">Reason:</span> {booking.cancellationReason}
                </p>
              )}
            </div>
          )}

          {/* Service & Pricing Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-600 block">
                  {booking.serviceCategory}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{booking.serviceName}</h4>
                <p className="text-slate-600 mt-1">{booking.problemDescription}</p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-slate-900 block">
                  ₹{booking.totalAmount}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                    booking.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {booking.paymentStatus} ({booking.paymentMethod})
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-4 text-slate-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {booking.scheduledDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {booking.scheduledTimeSlot}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {booking.location}
              </span>
            </div>
          </div>

          {/* Customer & Technician Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Customer Details */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Customer Information
              </span>
              <h5 className="font-bold text-slate-900 text-xs">{booking.customerName}</h5>
              <div className="mt-2 space-y-1 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{booking.customerPhone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{booking.customerEmail}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {booking.address?.street}, {booking.address?.area}, {booking.address?.city} -{' '}
                    {booking.address?.pincode}
                  </span>
                </div>
              </div>
            </div>

            {/* Technician Details */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Assigned Expert
              </span>
              {booking.technicianName ? (
                <div>
                  <div className="flex items-center gap-2.5">
                    <img
                      src={booking.technicianAvatar}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">{booking.technicianName}</h5>
                      <span className="text-slate-500 text-[11px] block">{booking.technicianPhone}</span>
                      <span className="text-emerald-600 font-semibold text-[10px]">
                        Verified & Background Checked
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center">
                  <p className="text-slate-500 mb-2">No technician assigned yet</p>
                  <button
                    onClick={() => onOpenAssignModal(booking)}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-full font-bold text-[11px] hover:bg-purple-700 transition"
                  >
                    Smart Assign Technician
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Attached Photos Gallery */}
          {((booking.images && booking.images.length > 0) ||
            (booking.beforeImages && booking.beforeImages.length > 0) ||
            (booking.afterImages && booking.afterImages.length > 0)) && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Photo Documentation
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {booking.images && booking.images.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Diagnostic Photos</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {booking.images.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer" className="block w-14 h-14 rounded-lg overflow-hidden border border-slate-200 hover:opacity-80">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {booking.beforeImages && booking.beforeImages.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Before Service</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {booking.beforeImages.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer" className="block w-14 h-14 rounded-lg overflow-hidden border border-slate-200 hover:opacity-80">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {booking.afterImages && booking.afterImages.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">After Service</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {booking.afterImages.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer" className="block w-14 h-14 rounded-lg overflow-hidden border border-slate-200 hover:opacity-80">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parts Replaced & Service Execution Notes */}
          {(booking.serviceNotes || (booking.partsUsed && booking.partsUsed.length > 0)) && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Service Completion Report
              </h4>
              {booking.serviceNotes && (
                <p className="text-slate-700 text-xs italic">"{booking.serviceNotes}"</p>
              )}
              {booking.partsUsed && booking.partsUsed.length > 0 && (
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">Parts & Spares:</span>
                  <div className="space-y-1">
                    {booking.partsUsed.map((p, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-700">
                        <span>{p.name}</span>
                        <span className="font-semibold">₹{p.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Service Progress Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Service Execution Timeline
            </h4>
            <div className="relative pl-5 border-l-2 border-purple-200 space-y-3.5 ml-2">
              {booking.timeline?.map((item, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                  <div>
                    <span className="font-bold text-slate-800">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {item.note && <p className="text-slate-600 mt-0.5">{item.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenInvoiceModal(booking)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Invoice</span>
            </button>
            <button
              onClick={() => onOpenReviewModal(booking)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Review</span>
            </button>
            <button
              onClick={() => onOpenComplaintModal(booking)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Raise Ticket</span>
            </button>

            {/* Status Override dropdown (ADMIN ONLY) */}
            {isAdmin && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium">Override:</span>
                <select
                  value={booking.status}
                  onChange={(e) => onUpdateStatus(booking, e.target.value as BookingStatus)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="TECHNICIAN_ASSIGNED">TECHNICIAN_ASSIGNED</option>
                  <option value="ACCEPTED">ACCEPTED</option>
                  <option value="ON_THE_WAY">ON_THE_WAY</option>
                  <option value="ARRIVED">ARRIVED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
              canCancel ? (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-full font-bold text-xs transition border border-rose-200 flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel Booking</span>
                </button>
              ) : isPostArrival ? (
                <span className="text-[11px] text-slate-400 italic">
                  In-service cannot be cancelled online.
                </span>
              ) : null
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-purple-600 text-white rounded-full font-bold text-xs hover:bg-purple-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <CancelBookingModal
        isOpen={cancelModalOpen}
        booking={booking}
        onClose={() => setCancelModalOpen(false)}
        onSuccess={(updated) => {
          Object.assign(booking, updated);
          onUpdateStatus(updated, 'CANCELLED');
        }}
      />
    </div>
  );
};
