import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentDocument extends Document {
  paymentId: string;
  orderId: string;
  bookingId: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  method: 'ONLINE' | 'CASH';
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  razorpaySignature?: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    paymentId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    bookingId: { type: String, required: true, index: true },
    bookingNumber: { type: String, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    method: { type: String, enum: ['ONLINE', 'CASH'], default: 'ONLINE' },
    status: { type: String, enum: ['SUCCESS', 'PENDING', 'FAILED'], default: 'SUCCESS' },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

export const PaymentModel =
  mongoose.models.Payment || mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
