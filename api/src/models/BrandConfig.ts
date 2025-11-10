import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBrandConfig extends Document {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BrandConfigSchema = new Schema<IBrandConfig>({
  companyName: { type: String, required: true },
  logoUrl: { type: String, default: '' },
  primaryColor: { type: String, default: '#1976d2' },
  secondaryColor: { type: String, default: '#0B132B' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const BrandConfig = mongoose.model<IBrandConfig>('BrandConfig', BrandConfigSchema);

