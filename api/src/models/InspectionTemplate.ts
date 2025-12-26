import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInspectionTemplateCategory {
  key: string;
  label: string;
  order?: number;
}

export interface IInspectionTemplateItem {
  key: string;
  categoryKey: string;
  label: string;
  photoRequired?: boolean;
  photoRequiredOnFail?: boolean;
  notesRequired?: boolean;
  notesRequiredOnFail?: boolean;
  enableRiskLevel?: boolean;
}

export interface IInspectionTemplate extends Document {
  name: string;
  description?: string;
  requireSignature: boolean;
  requirePOI: boolean;
  categories: IInspectionTemplateCategory[];
  items: IInspectionTemplateItem[];
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InspectionTemplateSchema = new Schema<IInspectionTemplate>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    requireSignature: { type: Boolean, default: false },
    requirePOI: { type: Boolean, default: false },
    categories: {
      type: [
        {
          key: { type: String, required: true },
          label: { type: String, required: true },
          order: { type: Number },
        },
      ],
      default: [],
    },
    items: {
      type: [
        {
          key: { type: String, required: true },
          categoryKey: { type: String, required: true },
          label: { type: String, required: true },
          photoRequired: { type: Boolean, default: false },
          photoRequiredOnFail: { type: Boolean, default: false },
          notesRequired: { type: Boolean, default: false },
          notesRequiredOnFail: { type: Boolean, default: false },
          enableRiskLevel: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const InspectionTemplate = mongoose.model<IInspectionTemplate>(
  'InspectionTemplate',
  InspectionTemplateSchema
);
