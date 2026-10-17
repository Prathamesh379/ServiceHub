import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceDocument extends Document {
  invoiceNumber: string;
  bookingId: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  technicianName: string;
  serviceName: string;
  serviceCategory: string;
  baseAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  issuedAt: Date;
}

const InvoiceSchema = new Schema<IInvoiceDocument>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    bookingId: { type: String, required: true, index: true },
    bookingNumber: { type: String, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    customerEmail: { type: String },
    customerAddress: { type: String },
    technicianName: { type: String },
    serviceName: { type: String, required: true },
    serviceCategory: { type: String },
    baseAmount: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'ONLINE' },
    paymentStatus: { type: String, default: 'PAID' },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const InvoiceModel =
  mongoose.models.Invoice || mongoose.model<IInvoiceDocument>('Invoice', InvoiceSchema);
