import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  personal: Record<string, any>;
  // Allow legacy string keys or new key/type objects
  uploads: Array<{ key: string; type: string } | string>;
  quiz: { total: number; correct: number };
  signatureDataUrl?: string;
  status: 'pending' | 'approved' | 'declined';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewReason?: string;
  certificateKey?: string;
}

const SubmissionSchema = new Schema<ISubmission>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  personal: { type: Schema.Types.Mixed, default: {} },
  // Be permissive to support legacy payloads and new structured items
  uploads: { type: [Schema.Types.Mixed], default: [] },
  quiz: { total: Number, correct: Number },
  signatureDataUrl: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewReason: { type: String },
  certificateKey: { type: String }
}, { timestamps: true });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
