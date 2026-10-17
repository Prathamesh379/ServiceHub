import React, { useState } from 'react';
import { X, AlertTriangle, Loader2, Ban } from 'lucide-react';
import { IBooking } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';

interface CancelBookingModalProps {
  isOpen: boolean;
  booking: IBooking | null;
  onClose: () => void;
  onSuccess: (cancelledBooking: IBooking) => void;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  booking,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useNotifications();
  const [reason, setReason] = useState<string>('Change of schedule / plans');
  const [customReason, setCustomReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const canCancel = ['PENDING', 'TECHNICIAN_ASSIGNED', 'ACCEPTED'].includes(booking.status);

  const handleConfirmCancel = async () => {
    if (!canCancel) {
      setErrorMessage('This booking can no longer be cancelled. Please contact support.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const finalReason = reason === 'Other' ? customReason.trim() || 'Other' : reason;
      const targetBookingId = booking._id || (booking as any).id || booking.bookingNumber;
      const res = await api.cancelBooking(targetBookingId, finalReason);
      if (res.success && res.data) {
        showToast(`Booking #${booking.bookingNumber} has been cancelled`, 'success');
        onSuccess(res.data);
        onClose();
      } else {
        setErrorMessage(res.message || 'Failed to cancel booking');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to cancel booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Cancel Booking</h3>
              <p className="text-xs text-slate-500 font-mono">#{booking.bookingNumber} • {booking.serviceName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!canCancel ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cancellation Notice</span>
            </div>
            <p className="leading-relaxed">
              This booking can no longer be cancelled because the service is already in state: <strong className="uppercase">{booking.status.replace(/_/g, ' ')}</strong>.
            </p>
            <p className="font-medium text-amber-800">
              Please contact support if you require emergency assistance.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel this booking? This action will immediately release your assigned technician and update the schedule.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Reason for Cancellation</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              >
                <option value="Change of schedule / plans">Change of schedule / plans</option>
                <option value="Booked by mistake">Booked by mistake</option>
                <option value="Found another service">Found another service</option>
                <option value="Issue resolved on its own">Issue resolved on its own</option>
                <option value="Technician delayed">Technician delayed</option>
                <option value="Other">Other reason...</option>
              </select>
            </div>

            {reason === 'Other' && (
              <div className="space-y-1">
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please specify why you are cancelling..."
                  disabled={submitting}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white resize-none h-20"
                />
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full transition"
          >
            {canCancel ? 'Cancel' : 'Close'}
          </button>
          {canCancel && (
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-full transition shadow-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <span>Confirm Cancellation</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
