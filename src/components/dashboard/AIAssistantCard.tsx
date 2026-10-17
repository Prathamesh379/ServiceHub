import React, { useState } from 'react';
import { Sparkles, Send, CheckCircle2, ArrowRight, Loader2, AlertTriangle, HelpCircle } from 'lucide-react';
import { api } from '../../services/api.ts';
import { IDiagnosisResult } from '../../types/index.ts';

interface AIAssistantCardProps {
  onBookService: (serviceName: string, problemDescription: string) => void;
}

export const AIAssistantCard: React.FC<AIAssistantCardProps> = ({ onBookService }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IDiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick prompt presets
  const samplePrompts = [
    'My AC is running but it is not cooling properly.',
    'Continuous water leakage behind bathroom wall pipe.',
    'Power tripping frequently when turning on water heater.',
    'Dell laptop screen flickering and turning black.',
  ];

  const handleDiagnose = async (textToSubmit?: string) => {
    const q = textToSubmit || query;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.diagnoseAI(q);
      if (res.data) {
        setResult(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to complete AI diagnosis');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (result) {
      onBookService(result.recommendedService || result.service, query || result.possibleProblem);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#7C3AED] rounded-full animate-pulse" />
            <h3 className="font-bold text-slate-800 text-sm">AI Assistant</h3>
          </div>
          <span className="text-[10px] uppercase font-bold text-[#7C3AED] bg-purple-50 px-2.5 py-0.5 rounded-full">
            Gemini 3.8
          </span>
        </div>

        {/* Diagnostic Results or Intelligence Insights Box */}
        {result ? (
          <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-100 space-y-2.5 mb-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#7C3AED] block">Recommended Service</span>
                <span className="text-xs font-bold text-slate-900">{result.recommendedService}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  result.priority === 'High' || result.priority === 'Emergency'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {result.priority}
              </span>
            </div>

            <div className="text-xs">
              <span className="text-slate-500 text-[11px] block">Possible Problem:</span>
              <span className="text-slate-800 font-medium">{result.possibleProblem}</span>
            </div>

            <div className="text-xs">
              <span className="text-slate-500 text-[11px] block">Recommended Action:</span>
              <span className="text-slate-800 font-medium">{result.recommendedAction}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1.5 border-t border-purple-100">
              <span>Category: <strong className="text-slate-900">{result.service}</strong></span>
              <span>Est: <strong className="text-[#7C3AED]">{result.estimatedCostRange}</strong></span>
            </div>

            {/* Book Recommended Service CTA */}
            <button
              onClick={handleBookNow}
              className="w-full mt-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-98 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-600/30 transition"
            >
              <span>Book This Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 mb-4 border border-slate-100">
            <p className="mb-2 font-semibold text-slate-800">Recent Intelligence Insights:</p>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span className="mt-1 w-1.5 h-1.5 bg-[#7C3AED] rounded-full shrink-0" />
                <span>AC repair demand is up 40% in Baner area. Allocate more field technicians.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="mt-1 w-1.5 h-1.5 bg-[#7C3AED] rounded-full shrink-0" />
                <span>Rahul Sharma holds top customer satisfaction rating (4.9★, 98% completion).</span>
              </li>
            </ul>

            {/* Quick Prompts */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-1.5">
              {samplePrompts.slice(0, 2).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(prompt);
                    handleDiagnose(prompt);
                  }}
                  className="text-left px-2 py-1 rounded-lg bg-white hover:bg-purple-50 text-[10px] text-slate-600 hover:text-[#7C3AED] border border-slate-200 transition truncate max-w-full"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-2.5 mb-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Input & Action Button */}
      <div className="relative mt-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleDiagnose()}
          placeholder="Ask AI anything about repairs..."
          disabled={loading}
          className="w-full bg-slate-100 border-none rounded-xl py-3 pl-4 pr-12 text-xs outline-none focus:ring-2 ring-purple-200 transition-all text-slate-800 placeholder-slate-400"
        />
        <button
          onClick={() => handleDiagnose()}
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 text-white p-2 rounded-lg transition shadow-xs"
          aria-label="Send Query"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
