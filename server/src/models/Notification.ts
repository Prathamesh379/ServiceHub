import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  userId?: string;
  role?: 'ADMIN' | 'TECHNICIAN' | 'CUSTOMER' | 'ALL';
  title: string;
  message: string;
  type: 'BOOKING' | 'TECHNICIAN' | 'PAYMENT' | 'COMPLAINT' | 'SYSTEM';
  bookingId?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: String, index: true },
    role: { type: String, enum: ['ADMIN', 'TECHNICIAN', 'CUSTOMER', 'ALL'], default: 'ALL' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['BOOKING', 'TECHNICIAN', 'PAYMENT', 'COMPLAINT', 'SYSTEM'], default: 'SYSTEM' },
    bookingId: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel =
  mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', NotificationSchema);
