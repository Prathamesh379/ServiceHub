import mongoose, { Schema, Document } from 'mongoose';

export interface ITechnicianDocument extends Document {
  userId: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  skills: string[];
  experienceYears: number;
  serviceAreas: string[];
  rating: number;
  reviewCount: number;
  completedJobs: number;
  activeJobs: number;
  isAvailable: boolean;
  latitude: number;
  longitude: number;
  todayEarnings: number;
  totalEarnings: number;
  createdAt: Date;
  updatedAt: Date;
}

const TechnicianSchema = new Schema<ITechnicianDocument>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, default: '' },
    skills: [{ type: String }],
    experienceYears: { type: Number, default: 1 },
    serviceAreas: [{ type: String }],
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    activeJobs: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    latitude: { type: Number, default: 18.559 },
    longitude: { type: Number, default: 73.7868 },
    todayEarnings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const TechnicianModel =
  mongoose.models.Technician || mongoose.model<ITechnicianDocument>('Technician', TechnicianSchema);
