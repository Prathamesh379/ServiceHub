import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'TECHNICIAN' | 'CUSTOMER';
  phone?: string;
  avatar?: string;
  location?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'TECHNICIAN', 'CUSTOMER'], default: 'CUSTOMER' },
    phone: { type: String, default: '+91 98000 00000' },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
    location: { type: String, default: 'Pune, Maharashtra' },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (this: any, next: (err?: any) => void) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password || '');
};

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
