import React, { useState, useRef } from 'react';
import {
  CheckSquare,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Truck,
  Play,
  Camera,
  Plus,
  Star,
  IndianRupee,
  Navigation,
  FileCheck,
  Upload,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { IBooking, ITechnician } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useNotifications } from '../context/NotificationContext.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';

interface TechnicianPortalViewProps {
  bookings: IBooking[];
  currentTech: ITechnician | null;
  onRefresh: () => void;
  onViewBooking: (b: IBooking) => void;
  onOpenAIAssistant?: () => void;
}

export const TechnicianPortalView: React.FC<TechnicianPortalViewProps> = ({
  bookings,
  currentTech,
  onRefresh,
  onViewBooking,
  onOpenAIAssistant,
}) => {
  const { showToast } = useNotifications();

  // Completion modal state
  const [activeJobForCompletion, setActiveJobForCompletion] = useState<IBooking | null>(null);
  const [serviceNotes, setServiceNotes] = useState('Cleaned indoor coils, refilled gas pressure to 65 PSI.');
  const [partsUsed, setPartsUsed] = useState<Array<{ name: string; cost: number }>>([
    { name: 'Capacitor 45uF', cost: 350 },
  ]);
  const [beforeImages, setBeforeImages] = useState<string[]>([]);
  const [afterImages, setAfterImages] = useState<string[]>([]);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const [partName, setPartName] = useState('');
  const [partCost, setPartCost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Upload handler for before/after service photos
  const handleUploadPhotos = async (files: FileList | null, type: 'before' | 'after') => {
    if (!files || files.length === 0) return;
    const isBefore = type === 'before';
    if (isBefore) setUploadingBefore(true);
    else setUploadingAfter(true);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }
      const res = await api.uploadImages(formData);
      if (res.urls && res.urls.length > 0) {
        if (isBefore) setBeforeImages((prev) => [...prev, ...res.urls]);
        else setAfterImages((prev) => [...prev, ...res.urls]);
        showToast('Photos attached', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Photo upload failed', 'error');
    } finally {
      if (isBefore) setUploadingBefore(false);
      else setUploadingAfter(false);
    }
  };

  // Filter jobs assigned to this technician or relevant active jobs
  const myJobs = bookings.filter((b) =>
    currentTech ? b.technicianId === currentTech._id || b.technicianName === currentTech.name : true
  );

  const pendingAssignments = myJobs.filter((b) => b.status === 'TECHNICIAN_ASSIGNED');
  const activeJobs = myJobs.filter(
    (b) => b.status === 'ACCEPTED' || b.status === 'ON_THE_WAY' || b.status === 'ARRIVED' || b.status === 'IN_PROGRESS'
  );
  const completedJobs = myJobs.filter((b) => b.status === 'COMPLETED');

  const handleJobAction = async (bookingId: string, action: string, extra: any = {}) => {
    try {
      await api.technicianJobAction(bookingId, { action, ...extra });
      showToast(`Action: ${action.replace(/_/g, ' ')} completed.`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Could not update job', 'error');
    }
  };

  const handleCompleteService = async () => {
    if (!activeJobForCompletion) return;
    setSubmitting(true);
    try {
      await api.technicianJobAction(activeJobForCompletion._id, {
        action: 'COMPLETE',
        serviceNotes,
        partsUsed,
        beforeImages,
        afterImages,
      });

      showToast(`Booking #${activeJobForCompletion.bookingNumber} marked complete.`, 'success');
      setActiveJobForCompletion(null);
      setBeforeImages([]);
      setAfterImages([]);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPart = () => {
    if (!partName.trim() || !partCost) return;
    setPartsUsed([...partsUsed, { name: partName, cost: Number(partCost) }]);
    setPartName('');
    setPartCost('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Today's Earnings and Rating */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-purple-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={
              currentTech?.avatar ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
            }
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{currentTech?.name || 'Rahul Sharma'}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-200 text-[10px] font-bold">
                Certified Master Tech
              </span>
            </div>
            <p className="text-xs text-purple-200/80 mt-0.5">
              Service Areas: {currentTech?.serviceAreas.join(', ') || 'Baner, Wakad, Aundh'}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                {currentTech?.rating || 4.9} ({currentTech?.reviewCount || 38} reviews)
              </span>
              <span>•</span>
              <span className="text-purple-200">{currentTech?.completedJobs || 142} Jobs Completed</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onOpenAIAssistant && (
            <button
              onClick={onOpenAIAssistant}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-xs shadow-md border border-purple-400/40 flex items-center gap-2 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
              <span>AI Copilot</span>
            </button>
          )}

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-purple-300 block">
                Today's Earnings
              </span>
              <span className="text-2xl font-black text-white">
                ₹{currentTech?.todayEarnings?.toLocaleString('en-IN') || '2,400'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-600/60 flex items-center justify-center text-white">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* New Assignments Waiting for Accept / Reject */}
      {pendingAssignments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping" />
            <h3 className="text-sm font-bold text-slate-900">
              New Dispatches Waiting for Your Response ({pendingAssignments.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingAssignments.map((job) => (
              <div
                key={job._id}
                className="bg-purple-50/50 border-2 border-purple-400/50 rounded-2xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-purple-700">
                      {job.bookingNumber}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{job.serviceName}</h4>
                    <span className="text-xs text-slate-600">{job.location}</span>
                  </div>
                  <span className="text-sm font-extrabold text-purple-700">₹{job.totalAmount}</span>
                </div>

                <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-purple-100">
                  {job.problemDescription}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleJobAction(job._id, 'ACCEPT')}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Job</span>
                  </button>
                  <button
                    onClick={() => handleJobAction(job._id, 'REJECT')}
                    className="py-2 px-4 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Jobs in Progress */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Active Service Engagements ({activeJobs.length})
        </h3>

        {activeJobs.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border text-center text-xs text-slate-400">
            No active jobs currently in transit or execution. Accept new dispatches above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">{job.bookingNumber}</span>
                      <h4 className="text-sm font-bold text-slate-900">{job.serviceName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Customer: <strong className="text-slate-800">{job.customerName}</strong>
                      </p>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{job.address?.street}, {job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-purple-700">{job.customerPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Workflow Action Steps */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                    Dispatch Steps
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {job.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleJobAction(job._id, 'ON_THE_WAY')}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Truck className="w-4 h-4" />
                        <span>I Am On The Way</span>
                      </button>
                    )}

                    {job.status === 'ON_THE_WAY' && (
                      <button
                        onClick={() => handleJobAction(job._id, 'ARRIVED')}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Mark Arrived at Doorstep</span>
                      </button>
                    )}

                    {job.status === 'ARRIVED' && (
                      <button
                        onClick={() => handleJobAction(job._id, 'START_WORK')}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-4 h-4" />
                        <span>Start Work</span>
                      </button>
                    )}

                    {job.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => setActiveJobForCompletion(job)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete Service & Sign Off</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Services History */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Recently Completed Services ({completedJobs.length})
        </h3>
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="divide-y divide-slate-100 text-xs">
            {completedJobs.slice(0, 5).map((job) => (
              <div key={job._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900 block">{job.serviceName}</span>
                  <span className="text-slate-500 text-[11px]">
                    {job.customerName} • {job.scheduledDate}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900 block">₹{job.totalAmount}</span>
                  <span className="text-emerald-600 font-bold text-[10px]">Signed Off ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complete Service Modal */}
      {activeJobForCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Complete Job: #{activeJobForCompletion.bookingNumber}
              </h3>
              <button
                onClick={() => setActiveJobForCompletion(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Service Execution Notes
                </label>
                <textarea
                  rows={3}
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="Detail actions taken, pressure readings, parts installed, cleanup..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Parts / Spares Replaced
                </label>
                <div className="space-y-1.5 mb-2">
                  {partsUsed.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border text-slate-700"
                    >
                      <span>{p.name}</span>
                      <span className="font-bold">₹{p.cost}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    placeholder="Part Name (e.g. Copper Flare Nut)"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                  <input
                    type="number"
                    value={partCost}
                    onChange={(e) => setPartCost(e.target.value)}
                    placeholder="Cost (₹)"
                    className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddPart}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Before & After Service Photos */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-700">Before-Service Photos</label>
                    <input
                      type="file"
                      ref={beforeInputRef}
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadPhotos(e.target.files, 'before')}
                    />
                    <button
                      type="button"
                      onClick={() => beforeInputRef.current?.click()}
                      disabled={uploadingBefore}
                      className="text-[10px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      {uploadingBefore ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      <span>Add</span>
                    </button>
                  </div>
                  <div className="border border-dashed border-slate-200 rounded-xl p-2 min-h-[50px] flex items-center gap-1.5 flex-wrap bg-slate-50/50">
                    {beforeImages.length === 0 && (
                      <span className="text-[10px] text-slate-400">No before photos added</span>
                    )}
                    {beforeImages.map((url, i) => (
                      <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setBeforeImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0 right-0 p-0.5 bg-slate-900/80 text-white rounded-bl-sm"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-700">After-Service Photos</label>
                    <input
                      type="file"
                      ref={afterInputRef}
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadPhotos(e.target.files, 'after')}
                    />
                    <button
                      type="button"
                      onClick={() => afterInputRef.current?.click()}
                      disabled={uploadingAfter}
                      className="text-[10px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      {uploadingAfter ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      <span>Add</span>
                    </button>
                  </div>
                  <div className="border border-dashed border-slate-200 rounded-xl p-2 min-h-[50px] flex items-center gap-1.5 flex-wrap bg-slate-50/50">
                    {afterImages.length === 0 && (
                      <span className="text-[10px] text-slate-400">No after photos added</span>
                    )}
                    {afterImages.map((url, i) => (
                      <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setAfterImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0 right-0 p-0.5 bg-slate-900/80 text-white rounded-bl-sm"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveJobForCompletion(null)}
                  className="px-4 py-2 text-slate-600 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteService}
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-xs transition"
                >
                  {submitting ? 'Finalizing...' : 'Finalize & Sign Off'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
