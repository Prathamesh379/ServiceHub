import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewDocument extends Document {
  bookingId: string;
  customerId: string;
  customerName: string;
  technicianId: string;
  technicianName: string;
  serviceName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    bookingId: { type: String, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    technicianId: { type: String, required: true, index: true },
    technicianName: { type: String, required: true },
    serviceName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export const ReviewModel =
  mongoose.models.Review || mongoose.model<IReviewDocument>('Review', ReviewSchema);
