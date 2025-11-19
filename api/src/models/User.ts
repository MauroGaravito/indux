import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'admin' | 'manager' | 'worker';

export interface IUser extends Document {
  email: string;
  name: string;
  password: string; // hashed password
  role: UserRole;
  disabled?: boolean;
  position?: string;
  phone?: string;
  companyName?: string;
  avatarUrl?: string;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true },
    password: { type: String, required: true }, // renamed from passwordHash
    role: { type: String, enum: ['admin', 'manager', 'worker'], required: true },
    disabled: { type: Boolean, default: false },
    position: { type: String },
    phone: { type: String },
    companyName: { type: String },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
