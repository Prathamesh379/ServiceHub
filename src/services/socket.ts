import { io, Socket } from 'socket.io-client';
import { IBooking } from '../types/index.ts';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function joinUserRoom(userId: string) {
  const s = getSocket();
  s.emit('join_user', userId);
}

export function joinRoleRoom(role: string) {
  const s = getSocket();
  s.emit('join_role', role);
}

export function joinBookingRoom(bookingId: string) {
  const s = getSocket();
  s.emit('join_booking', bookingId);
}

export const socketClient = {
  getSocket,
  joinUserRoom,
  joinRoleRoom,
  joinBookingRoom,

  onBookingCreated: (callback: (booking: IBooking) => void) => {
    const s = getSocket();
    s.on('booking_created', callback);
    return () => {
      s.off('booking_created', callback);
    };
  },

  onBookingUpdated: (callback: (booking: IBooking) => void) => {
    const s = getSocket();
    s.on('booking_updated', callback);
    return () => {
      s.off('booking_updated', callback);
    };
  },

  onBookingStatusChanged: (
    callback: (data: {
      bookingId: string;
      status: any;
      statusHistory?: any[];
      cancellationReason?: string;
      cancelledAt?: string;
      cancelledBy?: string;
    }) => void
  ) => {
    const s = getSocket();
    s.on('booking_status_changed', callback);
    return () => {
      s.off('booking_status_changed', callback);
    };
  },

  onTechnicianAssigned: (callback: (data: any) => void) => {
    const s = getSocket();
    s.on('technician_assigned', callback);
    return () => {
      s.off('technician_assigned', callback);
    };
  },
};
