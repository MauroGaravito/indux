import mongoose, { Schema, Document, Types } from 'mongoose';

export type InspectionExecutionStatus = 'draft' | 'submitted';

export interface IInspectionResultPhoto {
  key: string;
}

export interface IInspectionResult {
  itemKey: string;
  status: string;
  notes?: string;
  correctiveAction?: string;
  riskLevel?: string;
  photos?: IInspectionResultPhoto[];
}

export interface IInspectionExecution extends Document {
  projectInspectionId: Types.ObjectId;
  projectId: Types.ObjectId;
  templateSnapshot: Record<string, any>;
  executedBy?: Types.ObjectId;
  executedAt: Date;
  status: InspectionExecutionStatus;
  poiRef?: string;
  signatureDataUrl?: string;
  results: IInspectionResult[];
  submittedAt?: Date;
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
    results: {
      type: [
        {
          itemKey: { type: String, required: true },
          status: { type: String, required: true },
          notes: { type: String },
          correctiveAction: { type: String },
          riskLevel: { type: String },
          photos: {
            type: [
              {
                key: { type: String, required: true },
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
    },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

export const InspectionExecution = mongoose.model<IInspectionExecution>('InspectionExecution', InspectionExecutionSchema);
