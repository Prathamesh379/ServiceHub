import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, MessageSquare, ShieldAlert } from 'lucide-react';
import { IComplaint } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useNotifications } from '../context/NotificationContext.tsx';

export const ComplaintsView: React.FC = () => {
  const { showToast } = useNotifications();
  const [complaints, setComplaints] = useState<IComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<IComplaint | null>(null);
  const [resolution, setResolution] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints();
      if (res.data) setComplaints(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleUpdateStatus = async (status: 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED') => {
    if (!selectedComplaint) return;
    setUpdating(true);
    try {
      await api.updateComplaint(selectedComplaint._id, {
        status,
        resolution: resolution || selectedComplaint.resolution || 'Resolved per customer agreement',
      });
      showToast('success', 'Ticket Updated', `Status updated to ${status}`);
      setSelectedComplaint(null);
      setResolution('');
      loadComplaints();
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Could not update complaint');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Complaints & Escalation Support</h2>
          <p className="text-xs text-slate-500">Customer dispute tickets, warranty claims, and resolution audits</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
          {complaints.filter((c) => c.status === 'OPEN').length} Open Tickets
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 animate-pulse">
            Loading complaints...
          </div>
        ) : complaints.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            No complaints currently logged. Customer satisfaction is 100%!
          </div>
        ) : (
          complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{c.complaintId}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.priority === 'HIGH' || c.priority === 'URGENT'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.priority} PRIORITY
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 mb-1">{c.category}</h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl mb-3">
                  "{c.description}"
                </p>

                <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                  <div>Customer: <strong className="text-slate-700">{c.customerName}</strong></div>
                  <div>Booking Reference: <strong className="font-mono text-purple-700">{c.bookingNumber}</strong></div>
                  {c.resolution && (
                    <div className="text-emerald-700 font-medium mt-1">
                      Resolution: {c.resolution}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    c.status === 'RESOLVED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : c.status === 'UNDER_REVIEW'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {c.status}
                </span>

                {c.status !== 'RESOLVED' && (
                  <button
                    onClick={() => setSelectedComplaint(c)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-[11px] font-bold transition"
                  >
                    Resolve Ticket
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolve Ticket Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Resolve Ticket: {selectedComplaint.complaintId}
              </h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="font-bold text-slate-800 block mb-0.5">{selectedComplaint.category}</span>
                <p className="text-slate-600">{selectedComplaint.description}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Resolution Summary</label>
                <textarea
                  rows={3}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="e.g. Dispatched replacement technician at zero charge and tested cooling efficiency..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                  className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100"
                >
                  Mark Under Review
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
