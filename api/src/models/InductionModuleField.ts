import mongoose, { Schema, Document, Types } from 'mongoose';

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'file' | 'textarea' | 'boolean';

export interface IInductionModuleField extends Document {
  moduleId: Types.ObjectId;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  order: number;
  step: string;
  options?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FieldSchema = new Schema<IInductionModuleField>(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: 'InductionModule', required: true, index: true },
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: { type: String, enum: ['text', 'number', 'date', 'select', 'file', 'textarea', 'boolean'], default: 'text' },
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    step: { type: String, default: 'personal' },
    options: { type: [String] },
  },
  { timestamps: true }
);

FieldSchema.index({ moduleId: 1, key: 1 }, { unique: true });

export const InductionModuleField = mongoose.model<IInductionModuleField>('InductionModuleField', FieldSchema);
