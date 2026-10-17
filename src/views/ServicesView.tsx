import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, Clock, IndianRupee, Trash2, Edit3 } from 'lucide-react';
import { IService } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useNotifications } from '../context/NotificationContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface ServicesViewProps {
  onOpenBookingForService?: (serviceName: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ onOpenBookingForService }) => {
  const { showToast } = useNotifications();
  const { isAdmin } = useAuth();

  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Service Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'AC Repair' | 'Plumbing' | 'Electrical' | 'Laptop Repair' | 'Cleaning' | 'Appliance' | 'Other'>('AC Repair');
  const [price, setPrice] = useState(699);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['All', 'AC Repair', 'Plumbing', 'Electrical', 'Laptop Repair', 'Cleaning', 'Appliance'];

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await api.getServices();
      if (res.data) setServices(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filtered = services.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const q = search.toLowerCase();
    const matchesQ = !search || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    return matchesCat && matchesQ;
  });

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createService({
        name,
        category,
        price: Number(price),
        durationMinutes: Number(durationMinutes),
        description,
        requiredSkills: [category],
      });
      showToast('success', 'Service Added', `${name} created successfully.`);
      setShowAddModal(false);
      setName('');
      setDescription('');
      loadServices();
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Could not add service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Services Catalog</h2>
          <p className="text-xs text-slate-500">Standardized service offerings, rate cards, and time benchmarks</p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === c ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid of Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 animate-pulse">
            Loading services...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            No services found matching category.
          </div>
        ) : (
          filtered.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between"
            >
              <div className="h-36 overflow-hidden relative">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-800 shadow-xs">
                  {service.category}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{service.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {service.durationMinutes} mins
                    </span>
                    <span>•</span>
                    <span>{service.bookingsCount} orders</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Rate</span>
                    <span className="text-base font-black text-slate-900">₹{service.price}</span>
                  </div>

                  <button
                    onClick={() => onOpenBookingForService?.(service.name)}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold shadow-xs transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Add New Service</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateService} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Microwave Oven Repair & Magnetron Check"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="AC Repair">AC Repair</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Laptop Repair">Laptop Repair</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Appliance">Appliance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Standard Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Service inclusions, warranty, diagnostic checklist..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 rounded-full">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 text-white rounded-full font-bold"
                >
                  {submitting ? 'Saving...' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
