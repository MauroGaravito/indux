import mongoose, { Schema, Document, Types } from 'mongoose';

export type InspectionExecutionStatus = 'draft' | 'submitted';

export interface IInspectionExecution extends Document {
  projectInspectionId: Types.ObjectId;
  projectId: Types.ObjectId;
  templateSnapshot: Record<string, any>;
  executedBy?: Types.ObjectId;
  executedAt: Date;
  status: InspectionExecutionStatus;
  poiRef?: string;
  signatureDataUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InspectionExecutionSchema = new Schema<IInspectionExecution>(
  {
    projectInspectionId: { type: Schema.Types.ObjectId, ref: 'ProjectInspection', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    templateSnapshot: { type: Schema.Types.Mixed, required: true },
    executedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    executedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
    poiRef: { type: String },
    signatureDataUrl: { type: String },
  },
  { timestamps: true }
);

export const InspectionExecution = mongoose.model<IInspectionExecution>('InspectionExecution', InspectionExecutionSchema);
