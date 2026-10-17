import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { INotification } from '../types/index.ts';
import { api } from '../services/api.ts';
import { getSocket } from '../services/socket.ts';
import { CheckCircle2, AlertCircle, Info, Bell, X } from 'lucide-react';

export interface IToast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface NotificationContextType {
  notifications: INotification[];
  unreadCount: number;
  toasts: IToast[];
  showToast: (type: IToast['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [toasts, setToasts] = useState<IToast[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.data) setNotifications(res.data);
    } catch (e) {
      console.warn('Failed to fetch notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();

    const handleNewNotif = (notif: INotification) => {
      setNotifications((prev) => [notif, ...prev]);
      showToast('info', notif.title, notif.message);
    };

    const handleBookingCreated = (booking: any) => {
      showToast('success', 'New Booking Received', `Booking #${booking.bookingNumber} placed by ${booking.customerName}`);
      fetchNotifications();
    };

    const handleTechAssigned = (booking: any) => {
      showToast('info', 'Technician Assigned', `${booking.technicianName} assigned to #${booking.bookingNumber}`);
      fetchNotifications();
    };

    const handleTechOnWay = (booking: any) => {
      showToast('warning', 'Technician On The Way', `${booking.technicianName} is en route for #${booking.bookingNumber}`);
      fetchNotifications();
    };

    const handleServiceCompleted = (booking: any) => {
      showToast('success', 'Service Completed', `Booking #${booking.bookingNumber} completed successfully!`);
      fetchNotifications();
    };

    const handlePaymentReceived = (booking: any) => {
      showToast('success', 'Payment Received', `Payment of ₹${booking.totalAmount} confirmed for #${booking.bookingNumber}`);
      fetchNotifications();
    };

    socket.on('notification_new', handleNewNotif);
    socket.on('booking_created', handleBookingCreated);
    socket.on('technician_assigned', handleTechAssigned);
    socket.on('technician_on_way', handleTechOnWay);
    socket.on('service_completed', handleServiceCompleted);
    socket.on('payment_received', handlePaymentReceived);

    return () => {
      socket.off('notification_new', handleNewNotif);
      socket.off('booking_created', handleBookingCreated);
      socket.off('technician_assigned', handleTechAssigned);
      socket.off('technician_on_way', handleTechOnWay);
      socket.off('service_completed', handleServiceCompleted);
      socket.off('payment_received', handlePaymentReceived);
    };
  }, []);

  const showToast = (type: IToast['type'], title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: IToast = { id, type, title, message };
    setToasts((prev) => [...prev.slice(-4), newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        showToast,
        removeToast,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg rounded-xl p-3.5 flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-2"
          >
            <div className="mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
              {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-purple-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-900 leading-tight">{toast.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed truncate">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
