import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaintDocument extends Document {
  complaintId: string;
  bookingId: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  technicianId?: string;
  technicianName?: string;
  category: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';
  internalNotes?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaintDocument>(
  {
    complaintId: { type: String, required: true, unique: true },
    bookingId: { type: String, required: true },
    bookingNumber: { type: String, required: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    technicianId: { type: String },
    technicianName: { type: String },
    category: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    status: { type: String, enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED'], default: 'OPEN' },
    internalNotes: { type: String },
    resolution: { type: String },
  },
  { timestamps: true }
);

export const ComplaintModel =
  mongoose.models.Complaint || mongoose.model<IComplaintDocument>('Complaint', ComplaintSchema);
