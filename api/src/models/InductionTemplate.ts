import mongoose, { Schema, Document, Types } from 'mongoose';
import { InductionModuleConfig } from './InductionModule.js';

export type TemplateFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'file'
  | 'photo'
  | 'textarea'
  | 'boolean';

export interface TemplateField {
  key: string;
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  order?: number;
  step?: string;
  options?: string[];
  visibleIf?: {
    fieldKey: string;
    equals: string | number | boolean;
  };
}

export interface IInductionTemplate extends Document {
  name: string;
  description?: string;
  type: 'induction';
  config: InductionModuleConfig;
  fields: TemplateField[];
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateFieldSchema = new Schema<TemplateField>(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'file', 'photo', 'textarea', 'boolean'],
      default: 'text',
    },
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    step: { type: String, default: 'personal' },
    options: { type: [String] },
    visibleIf: {
      fieldKey: { type: String, trim: true },
      equals: { type: Schema.Types.Mixed },
    },
  },
  { _id: false },
);

const InductionTemplateSchema = new Schema<IInductionTemplate>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    type: { type: String, enum: ['induction'], default: 'induction' },
    config: {
      steps: { type: [String], default: [] },
      slides: {
        type: [
          {
            key: { type: String, required: true },
            title: { type: String },
            fileKey: { type: String, required: true },
            thumbKey: { type: String },
            order: { type: Number, default: 0 },
          },
        ],
        default: [],
      },
      quiz: {
        questions: {
          type: [
            {
              question: { type: String, required: true },
              options: { type: [String], required: true },
              answerIndex: { type: Number, required: true },
            },
          ],
          default: [],
        },
      },
      settings: {
        passMark: { type: Number, default: 80 },
        randomizeQuestions: { type: Boolean, default: false },
        allowRetry: { type: Boolean, default: true },
      },
    },
    fields: { type: [TemplateFieldSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const InductionTemplate = mongoose.model<IInductionTemplate>('InductionTemplate', InductionTemplateSchema);
