import mongoose, { Schema, Document, Types } from 'mongoose';

export interface UploadItem {
  key: string;
  type: string;
}

export interface QuizPayload {
  answers: any[];
  score: number;
  passed: boolean;
}

export type SubmissionStatus = 'pending' | 'approved' | 'declined';

export interface ISubmission extends Document {
  moduleId: Types.ObjectId;
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  status: SubmissionStatus;
  payload: Record<string, any>;
  uploads: UploadItem[];
  quiz: QuizPayload;
  signatureDataUrl?: string;
  certificateKey?: string;
  reviewedBy?: Types.ObjectId;
  reviewReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UploadSchema = new Schema<UploadItem>(
  {
    key: { type: String, required: true },
    type: { type: String, default: 'file' },
  },
  { _id: false }
);

const SubmissionSchema = new Schema<ISubmission>(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: 'InductionModule', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
    payload: { type: Schema.Types.Mixed, default: {} },
    uploads: { type: [UploadSchema], default: [] },
    quiz: {
      answers: { type: [Schema.Types.Mixed], default: [] },
      score: { type: Number, default: 0 },
      passed: { type: Boolean, default: false },
    },
    signatureDataUrl: { type: String },
    certificateKey: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewReason: { type: String },
  },
  { timestamps: true }
);

SubmissionSchema.index({ moduleId: 1, userId: 1 }, { unique: false });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
