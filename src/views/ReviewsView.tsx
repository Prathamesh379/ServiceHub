import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, ShieldCheck } from 'lucide-react';
import { IReview } from '../types/index.ts';
import { api } from '../services/api.ts';

export const ReviewsView: React.FC = () => {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      try {
        const res = await api.getReviews();
        if (res.data) setReviews(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '4.8';

  return (
    <div className="space-y-5">
      {/* Header & Rating Breakdown Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-100 min-w-[120px]">
            <span className="text-4xl font-black text-purple-700 block">{averageRating}</span>
            <div className="flex items-center justify-center gap-1 my-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[11px] text-slate-500 font-semibold">{reviews.length} Verified Reviews</span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Customer Satisfaction & Verified Reviews</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-lg leading-relaxed">
              Every review is verified directly against completed bookings and technician sign-offs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>98.2% Positive Sentiment</span>
          </span>
        </div>
      </div>

      {/* Grid of Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 animate-pulse">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            No customer reviews logged yet.
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          r.rating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic mb-3">"{r.comment}"</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{r.customerName}</span>
                  <span className="text-[11px] text-slate-400">{r.serviceName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Tech</span>
                  <span className="font-semibold text-purple-700">{r.technicianName}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
