import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'admin' | 'manager' | 'worker';

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, unique: true, required: true, index: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'worker'], required: true },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);

