import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Star,
  MapPin,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { IBooking, ITechnicianRecommendation } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';

interface SmartAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: IBooking | null;
  onAssignmentSuccess: (updatedBooking: IBooking) => void;
}

export const SmartAssignModal: React.FC<SmartAssignModalProps> = ({
  isOpen,
  onClose,
  booking,
  onAssignmentSuccess,
}) => {
  const { showToast } = useNotifications();
  const [recommendations, setRecommendations] = useState<ITechnicianRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecommendations() {
      if (!booking) return;
      setLoading(true);
      try {
        const res = await api.getRecommendedTechnicians(booking._id);
        if (res.data) {
          setRecommendations(res.data);
        }
      } catch (err: any) {
        showToast('error', 'Error', err.message || 'Failed to calculate smart recommendations');
      } finally {
        setLoading(false);
      }
    }

    if (isOpen && booking) {
      loadRecommendations();
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const handleAssign = async (technicianId: string) => {
    setAssigningId(technicianId);
    try {
      const res = await api.assignTechnician(booking._id, technicianId);
      if (res.data) {
        showToast(
          'success',
          'Technician Assigned',
          `Successfully assigned ${res.data.technicianName} to booking #${booking.bookingNumber}`
        );
        onAssignmentSuccess(res.data);
        onClose();
      }
    } catch (err: any) {
      showToast('error', 'Assignment Failed', err.message || 'Could not assign technician');
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Smart Technician Assignment
              </h3>
              <p className="text-xs text-slate-500">
                Booking #{booking.bookingNumber} • {booking.serviceName} in {booking.location}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Algorithm Factor Explanation Pill */}
        <div className="px-6 py-3 bg-purple-50/60 border-b border-purple-100/80 flex items-center justify-between text-[11px] text-purple-900">
          <span className="font-semibold">Algorithm Weights:</span>
          <span>Skills 40%</span>
          <span>•</span>
          <span>Availability 20%</span>
          <span>•</span>
          <span>Distance 20%</span>
          <span>•</span>
          <span>Rating 10%</span>
          <span>•</span>
          <span>Workload 10%</span>
        </div>

        {/* List of Recommended Technicians */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-3.5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <span>Running scoring algorithm for {booking.location} zone...</span>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No technicians currently found in database.
            </div>
          ) : (
            recommendations.map((item, idx) => {
              const tech = item.technician;
              const isBestMatch = idx === 0;

              return (
                <div
                  key={tech._id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isBestMatch
                      ? 'border-purple-300 bg-purple-50/30 shadow-xs ring-1 ring-purple-400/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Tech Bio */}
                    <div className="flex items-start gap-3">
                      <img
                        src={tech.avatar}
                        alt=""
                        className="w-12 h-12 rounded-2xl object-cover border border-purple-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{tech.name}</h4>
                          {isBestMatch && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider">
                              Top Match
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {tech.rating} ({tech.completedJobs} jobs)
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-slate-600">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.distanceKm} km away
                          </span>
                          <span>•</span>
                          <span className="text-slate-600">{tech.activeJobs} active jobs</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {tech.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Match Score & Assign Button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <div className="flex items-baseline gap-1 sm:justify-end">
                          <span className="text-xl font-extrabold text-purple-700">
                            {item.score}%
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            Match
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold block">
                          {tech.isAvailable ? 'Available Now' : 'Busy Today'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAssign(tech._id)}
                        disabled={assigningId !== null}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-full text-xs font-bold shadow-xs shadow-purple-600/30 transition flex items-center gap-1.5 active:scale-95"
                      >
                        {assigningId === tech._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Assign Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Auto-dispatch notifications are sent directly to customer and technician.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-slate-600 hover:text-slate-900 rounded-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
