import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceDocument extends Document {
  name: string;
  description: string;
  category: string;
  price: number;
  durationMinutes: number;
  requiredSkills: string[];
  imageUrl: string;
  isActive: boolean;
  bookingsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IServiceDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, default: 60 },
    requiredSkills: [{ type: String }],
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    bookingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ServiceModel = mongoose.models.Service || mongoose.model<IServiceDocument>('Service', ServiceSchema);
