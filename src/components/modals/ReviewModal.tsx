import React, { useState } from 'react';
import { X, Star, CheckCircle2 } from 'lucide-react';
import { IBooking } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import confetti from 'canvas-confetti';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: IBooking | null;
  onReviewSubmitted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  onReviewSubmitted,
}) => {
  const { showToast } = useNotifications();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createReview({
        bookingId: booking._id,
        technicianId: booking.technicianId || 'tech_1',
        technicianName: booking.technicianName || 'Rahul Sharma',
        serviceName: booking.serviceName,
        rating,
        comment,
      });

      confetti({ particleCount: 60, spread: 60 });
      showToast('success', 'Review Submitted', 'Thank you for your rating and feedback!');
      onReviewSubmitted?.();
      onClose();
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Rate Your Service Experience</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="text-center py-2">
            <p className="font-semibold text-slate-800 text-sm">{booking.serviceName}</p>
            <p className="text-slate-500 mt-0.5">Technician: {booking.technicianName || 'Assigned Expert'}</p>

            {/* Interactive Stars */}
            <div className="flex items-center justify-center gap-1.5 my-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      rating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="font-bold text-amber-700 text-xs">
              {rating === 5 && 'Excellent! (5/5)'}
              {rating === 4 && 'Very Good (4/5)'}
              {rating === 3 && 'Average (3/5)'}
              {rating <= 2 && 'Needs Improvement'}
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Your Feedback</label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like best about the service? Punctuality, cleanliness, repair quality?"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-full font-bold shadow-xs transition"
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
