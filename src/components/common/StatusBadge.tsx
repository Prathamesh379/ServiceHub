import React from 'react';
import { BookingStatus } from '../../types/index.ts';

interface StatusBadgeProps {
  status: BookingStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let label = status;

  switch (normalized) {
    case 'COMPLETED':
    case 'PAID':
    case 'RESOLVED':
      styles = 'bg-green-100 text-green-700 border-transparent font-bold';
      dotColor = 'bg-green-600';
      label = 'Completed';
      break;
    case 'PENDING':
    case 'OPEN':
      styles = 'bg-amber-100 text-amber-800 border-transparent font-bold';
      dotColor = 'bg-amber-600';
      label = 'Pending';
      break;
    case 'TECHNICIAN_ASSIGNED':
      styles = 'bg-purple-100 text-purple-700 border-transparent font-bold';
      dotColor = 'bg-purple-600';
      label = 'Tech Assigned';
      break;
    case 'ACCEPTED':
      styles = 'bg-indigo-100 text-indigo-700 border-transparent font-bold';
      dotColor = 'bg-indigo-600';
      label = 'Accepted';
      break;
    case 'ON_THE_WAY':
      styles = 'bg-blue-100 text-blue-700 border-transparent font-bold animate-pulse';
      dotColor = 'bg-blue-600';
      label = 'On The Way';
      break;
    case 'ARRIVED':
      styles = 'bg-cyan-100 text-cyan-700 border-transparent font-bold';
      dotColor = 'bg-cyan-600';
      label = 'Arrived';
      break;
    case 'IN_PROGRESS':
    case 'UNDER_REVIEW':
      styles = 'bg-blue-100 text-blue-700 border-transparent font-bold';
      dotColor = 'bg-blue-600';
      label = 'In Progress';
      break;
    case 'CANCELLED':
    case 'FAILED':
    case 'REJECTED':
      styles = 'bg-red-100 text-red-700 border-transparent font-bold';
      dotColor = 'bg-red-600';
      label = 'Cancelled';
      break;
  }

  const sizeClass =
    size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[10px] sm:text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styles} ${sizeClass} tracking-wide whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
};
