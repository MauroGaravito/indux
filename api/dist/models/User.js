import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    email: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true },
    password: { type: String, required: true }, // renamed from passwordHash
    role: { type: String, enum: ['admin', 'manager', 'worker'], required: true },
    disabled: { type: Boolean, default: false },
    position: { type: String },
    phone: { type: String },
    companyName: { type: String },
    avatarUrl: { type: String },
}, { timestamps: true });
export const User = mongoose.model('User', UserSchema);
