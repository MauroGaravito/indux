import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectReview extends Document {
  projectId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  data: Record<string, any>;
  status: 'pending'|'approved'|'declined'|'cancelled';
  reviewedBy?: mongoose.Types.ObjectId;
  reason?: string;
  message?: string;
}

const ProjectReviewSchema = new Schema<IProjectReview>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['pending','approved','declined','cancelled'], default: 'pending' },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String },
  message: { type: String }
}, { timestamps: true });

export const ProjectReview = mongoose.model<IProjectReview>('ProjectReview', ProjectReviewSchema);
