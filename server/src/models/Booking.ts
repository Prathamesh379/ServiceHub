import mongoose, { Schema, Document } from 'mongoose';

export type BookingStatusType =
  | 'PENDING'
  | 'TECHNICIAN_ASSIGNED'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface IBookingDocument extends Document {
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  technicianAvatar?: string;
  location: string;
  address: {
    street: string;
    area: string;
    city: string;
    pincode: string;
    landmark?: string;
  };
  scheduledDate: string;
  scheduledTimeSlot: string;
  problemDescription: string;
  uploadedImages?: string[];
  amount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'ONLINE' | 'CASH';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  status: BookingStatusType;
  timeline: Array<{
    status: BookingStatusType;
    timestamp: Date;
    note?: string;
  }>;
  statusHistory?: Array<{
    status: string;
    timestamp: Date;
    updatedBy?: string;
    note?: string;
  }>;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  beforeImages?: string[];
  afterImages?: string[];
  serviceNotes?: string;
  partsUsed?: Array<{ name: string; cost: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBookingDocument>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, required: true },
    serviceId: { type: String, required: true },
    serviceName: { type: String, required: true },
    serviceCategory: { type: String, required: true },
    technicianId: { type: String, index: true },
    technicianName: { type: String },
    technicianPhone: { type: String },
    technicianAvatar: { type: String },
    location: { type: String, required: true },
    address: {
      street: { type: String, default: '' },
      area: { type: String, default: 'Baner' },
      city: { type: String, default: 'Pune' },
      pincode: { type: String, default: '411045' },
      landmark: { type: String },
    },
    scheduledDate: { type: String, required: true },
    scheduledTimeSlot: { type: String, required: true },
    problemDescription: { type: String, required: true },
    uploadedImages: [{ type: String }],
    amount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['ONLINE', 'CASH'], default: 'ONLINE' },
    paymentStatus: { type: String, enum: ['PAID', 'PENDING', 'REFUNDED'], default: 'PENDING' },
    status: {
      type: String,
      enum: [
        'PENDING',
        'TECHNICIAN_ASSIGNED',
        'ACCEPTED',
        'ON_THE_WAY',
        'ARRIVED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'PENDING',
      index: true,
    },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: String },
        note: { type: String },
      },
    ],
    cancelledAt: { type: String },
    cancelledBy: { type: String },
    cancellationReason: { type: String },
    beforeImages: [{ type: String }],
    afterImages: [{ type: String }],
    serviceNotes: { type: String },
    partsUsed: [{ name: { type: String }, cost: { type: Number } }],
  },
  { timestamps: true }
);

export const BookingModel =
  mongoose.models.Booking || mongoose.model<IBookingDocument>('Booking', BookingSchema);
