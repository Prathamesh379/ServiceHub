import { Server as SocketIOServer, Socket } from 'socket.io';
import { IBooking, INotification } from '../types/index.ts';

let ioInstance: SocketIOServer | null = null;

export function initSocketIO(io: SocketIOServer) {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    // Join user-specific room
    socket.on('join_user', (userId: string) => {
      socket.join(`user_${userId}`);
    });

    // Join role-specific room (e.g. 'ADMIN', 'TECHNICIAN', 'CUSTOMER')
    socket.on('join_role', (role: string) => {
      socket.join(`role_${role}`);
    });

    // Join specific booking room for real-time tracking
    socket.on('join_booking', (bookingId: string) => {
      socket.join(`booking_${bookingId}`);
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });
}

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

// Notification & Event Broadcasters
export function notifyBookingCreated(booking: IBooking) {
  if (!ioInstance) return;
  ioInstance.to('role_ADMIN').emit('booking_created', booking);
  ioInstance.to(`user_${booking.customerId}`).emit('booking_created', booking);
}

export function notifyTechnicianAssigned(booking: IBooking) {
  if (!ioInstance) return;
  ioInstance.to('role_ADMIN').emit('technician_assigned', booking);
  ioInstance.to(`user_${booking.customerId}`).emit('technician_assigned', booking);
  if (booking.technicianId) {
    ioInstance.to(`user_${booking.technicianId}`).emit('technician_assigned', booking);
  }
  ioInstance.to(`booking_${booking._id}`).emit('technician_assigned', booking);
}

export function notifyStatusChange(event: string, booking: IBooking) {
  if (!ioInstance) return;
  // Emit strictly to authorized private rooms, never global broadcast
  ioInstance.to(`booking_${booking._id}`).emit(event, booking);
  ioInstance.to(`user_${booking.customerId}`).emit(event, booking);
  if (booking.technicianId) {
    ioInstance.to(`user_${booking.technicianId}`).emit(event, booking);
  }
  ioInstance.to('role_ADMIN').emit(event, booking);
}

export function notifyNewNotification(notification: INotification) {
  if (!ioInstance) return;
  if (notification.userId) {
    ioInstance.to(`user_${notification.userId}`).emit('notification_new', notification);
  }
  if (notification.role && notification.role !== 'ALL') {
    ioInstance.to(`role_${notification.role}`).emit('notification_new', notification);
  } else {
    ioInstance.emit('notification_new', notification);
  }
}
