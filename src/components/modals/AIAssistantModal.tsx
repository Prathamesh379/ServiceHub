import React from 'react';
import { X } from 'lucide-react';
import { AIAssistantView } from '../ai/AIAssistantView.tsx';
import { IBooking } from '../../types/index.ts';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings?: IBooking[];
  activeBooking?: IBooking | null;
  onBookService?: (serviceName: string, problem: string) => void;
  onTrackBooking?: (booking: IBooking) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  bookings = [],
  activeBooking = null,
  onBookService,
  onTrackBooking,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close Assistant"
        >
          <X className="w-5 h-5" />
        </button>

        <AIAssistantView
          bookings={bookings}
          activeBooking={activeBooking}
          onBookService={(srv, prob) => {
            onClose();
            if (onBookService) onBookService(srv, prob);
          }}
          onTrackBooking={(b) => {
            onClose();
            if (onTrackBooking) onTrackBooking(b);
          }}
          isModal={true}
        />
      </div>
    </div>
  );
};
