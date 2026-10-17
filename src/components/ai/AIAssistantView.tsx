import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { IBooking } from '../../types/index.ts';

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionSuggestions?: string[];
  recommendedService?: string;
  bookingRef?: string;
}

interface AIAssistantViewProps {
  bookings?: IBooking[];
  activeBooking?: IBooking | null;
  onBookService?: (serviceName: string, problem: string) => void;
  onTrackBooking?: (booking: IBooking) => void;
  isModal?: boolean;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  bookings = [],
  activeBooking = null,
  onBookService,
  onTrackBooking,
  isModal = false,
}) => {
  const { user, isTechnician, isCustomer } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(activeBooking?._id || '');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const customerPromptChips = [
    'Why is my AC leaking water?',
    'What is included in Deep Kitchen Cleaning?',
    'How much does RO filter replacement cost?',
    'Track my active service status',
    'Can I cancel a booking and what is the policy?',
    'Washing machine not spinning troubleshooting',
  ];

  const technicianPromptChips = [
    'Split AC not cooling - checklist',
    'Washing machine error E2 troubleshooting',
    'Safety precautions for inverter PCB testing',
    'Capacitor testing guide & MFD ratings',
    'Water purifier low pressure diagnosis',
    'Standard tool checklist for electrical installation',
  ];

  const chips = isTechnician ? technicianPromptChips : customerPromptChips;

  // Initialize greeting on first load
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: MessageItem = {
        id: 'initial-greeting',
        sender: 'assistant',
        text: isTechnician
          ? `Hello ${user?.name || 'Technician'}! I am your Technician AI Copilot. I can assist you with step-by-step diagnostic checklists, safety rules, wiring schematics guidance, error code lookups, and job procedures. What issue are you troubleshooting today?`
          : `Hello ${user?.name || 'Customer'}! Welcome to ServiceHub Concierge AI. I can help recommend services, give upfront price estimates, troubleshoot home appliances, or assist with your active service bookings. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionSuggestions: isTechnician
          ? ['Split AC not cooling - checklist', 'Capacitor testing guide']
          : ['Why is my AC leaking water?', 'Track my active service status'],
      };
      setMessages([greeting]);
    }
  }, [isTechnician, user?.name]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.askAIAssistant(q, selectedBookingId || undefined);
      if (res.success && res.data) {
        const assistantMsg: MessageItem = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: res.data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionSuggestions: res.data.suggestedQuestions,
          recommendedService: res.data.recommendedService,
          bookingRef: res.data.bookingId,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('No response from AI assistant service');
      }
    } catch (err: any) {
      const errorMsg: MessageItem = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text:
          err.message ||
          'I am currently experiencing higher latency. Please verify your connection or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col bg-white ${
        isModal ? 'h-[75vh]' : 'h-[calc(100vh-140px)] rounded-3xl border border-slate-200/80 shadow-sm'
      } overflow-hidden`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 shadow-xs">
            {isTechnician ? <Wrench className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                {isTechnician ? 'Technician AI Copilot' : 'ServiceHub AI Assistant'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                {isTechnician ? 'FIELD DIAGNOSTICS' : 'CUSTOMER CONCIERGE'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isTechnician
                ? 'Technical diagnostics, safety checklists & job troubleshooting'
                : 'Instant repair guidance, pricing estimations & booking status'}
            </p>
          </div>
        </div>

        {/* Optional Booking Context Selector */}
        {bookings.length > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Context:</span>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">General Inquiries</option>
              {bookings.map((b) => (
                <option key={b._id} value={b._id}>
                  #{b.bookingNumber} • {b.serviceName} ({b.status.replace(/_/g, ' ')})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/40">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                m.sender === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-purple-200 text-purple-700 shadow-xs'
              }`}
            >
              {m.sender === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            <div className="max-w-2xl space-y-2">
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/80 shadow-xs whitespace-pre-wrap'
                }`}
              >
                {m.text}
              </div>

              {/* Action Buttons & Suggestions */}
              {m.sender === 'assistant' && (
                <div className="space-y-2 pt-1">
                  {m.recommendedService && onBookService && (
                    <button
                      onClick={() => onBookService(m.recommendedService!, m.text)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-xs font-bold transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Book Recommended Service: {m.recommendedService}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {m.bookingRef && onTrackBooking && (
                    <button
                      onClick={() => {
                        const matched = bookings.find((b) => b._id === m.bookingRef || b.bookingNumber === m.bookingRef);
                        if (matched) onTrackBooking(matched);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold transition ml-2"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Track Booking #{m.bookingRef}</span>
                    </button>
                  )}

                  {m.actionSuggestions && m.actionSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.actionSuggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 rounded-lg border border-slate-200 text-[11px] font-medium transition"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <span className="text-[10px] text-slate-400 block px-1">
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-purple-200 text-purple-700 flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs p-3 px-4 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>Analyzing query & generating expert guidance...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Starter Chips */}
      <div className="px-6 py-2.5 bg-white border-t border-slate-100 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Topics:
          </span>
          {chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              disabled={loading}
              className="px-3 py-1 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 rounded-full text-xs font-medium transition whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isTechnician
                ? 'Ask technical questions, error codes, tool checklists, or procedure steps...'
                : 'Ask about appliance problems, repair estimates, service bookings...'
            }
            disabled={loading}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs shadow-md transition disabled:opacity-40 flex items-center gap-1.5 active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
