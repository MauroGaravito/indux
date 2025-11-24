import mongoose, { Schema } from 'mongoose';
const BrandConfigSchema = new Schema({
    companyName: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#1976d2' },
    secondaryColor: { type: String, default: '#0B132B' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
export const BrandConfig = mongoose.model('BrandConfig', BrandConfigSchema);
