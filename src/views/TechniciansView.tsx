import React, { useState } from 'react';
import {
  Wrench,
  Star,
  MapPin,
  Briefcase,
  Plus,
  Search,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { ITechnician } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useNotifications } from '../../src/context/NotificationContext.tsx';

interface TechniciansViewProps {
  technicians: ITechnician[];
  loading: boolean;
  onRefresh: () => void;
}

export const TechniciansView: React.FC<TechniciansViewProps> = ({
  technicians,
  loading,
  onRefresh,
}) => {
  const { showToast } = useNotifications();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Tech Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 98810 54321');
  const [email, setEmail] = useState('');
  const [skills, setSkills] = useState('AC Repair, Electrical');
  const [serviceAreas, setServiceAreas] = useState('Baner, Wakad');
  const [experienceYears, setExperienceYears] = useState(4);
  const [submitting, setSubmitting] = useState(false);

  const filtered = technicians.filter((t) => {
    const q = search.toLowerCase();
    return (
      !search ||
      t.name.toLowerCase().includes(q) ||
      t.skills.some((s) => s.toLowerCase().includes(q)) ||
      t.serviceAreas.some((a) => a.toLowerCase().includes(q))
    );
  });

  const handleToggleAvailability = async (tech: ITechnician) => {
    try {
      await api.updateTechnician(tech._id, { isAvailable: !tech.isAvailable });
      showToast(
        'info',
        'Status Updated',
        `${tech.name} is now marked ${!tech.isAvailable ? 'Available' : 'Busy'}`
      );
      onRefresh();
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to update availability');
    }
  };

  const handleCreateTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createTechnician({
        name,
        phone,
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@servicehub.com`,
        skills: skills.split(',').map((s) => s.trim()),
        serviceAreas: serviceAreas.split(',').map((a) => a.trim()),
        experienceYears: Number(experienceYears),
      });

      showToast('success', 'Technician Added', `${name} added to dispatch pool.`);
      setShowAddModal(false);
      setName('');
      setEmail('');
      onRefresh();
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Could not add technician');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Technicians Directory</h2>
          <p className="text-xs text-slate-500">
            Certified field experts, real-time availability & performance metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search technician or skill..."
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Technician</span>
          </button>
        </div>
      </div>

      {/* Grid of Technicians */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 animate-pulse">
            Loading technician profiles...
          </div>
        ) : (
          filtered.map((tech) => (
            <div
              key={tech._id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={tech.avatar}
                      alt=""
                      className="w-12 h-12 rounded-2xl object-cover border border-purple-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{tech.name}</h3>
                      <span className="text-[11px] text-slate-500 block">
                        {tech.experienceYears} Years Exp
                      </span>
                      <div className="flex items-center gap-1 mt-0.5 text-[11px] font-bold text-amber-600">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{tech.rating}</span>
                        <span className="text-slate-400 font-normal">({tech.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Availability Toggle */}
                  <button
                    onClick={() => handleToggleAvailability(tech)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                      tech.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {tech.isAvailable ? 'Available' : 'Busy'}
                  </button>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {tech.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Service Areas */}
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-3">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">Areas: {tech.serviceAreas.join(', ')}</span>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      Completed
                    </span>
                    <span className="font-extrabold text-slate-800">{tech.completedJobs}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      Active
                    </span>
                    <span className="font-extrabold text-purple-700">{tech.activeJobs}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      Earnings
                    </span>
                    <span className="font-extrabold text-emerald-700">₹{tech.todayEarnings}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{tech.phone}</span>
                </span>
                <span className="font-mono text-[11px]">Pune Zone</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Technician Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Onboard New Technician</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTechnician} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Joshi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="AC Repair, Jet Cleaning, Gas Refill"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Service Areas (comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={serviceAreas}
                  onChange={(e) => setServiceAreas(e.target.value)}
                  placeholder="Baner, Wakad, Hinjewadi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  min={1}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 text-white rounded-full font-bold transition"
                >
                  {submitting ? 'Saving...' : 'Create Technician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
