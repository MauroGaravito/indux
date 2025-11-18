import mongoose, { Schema, Document, Types } from 'mongoose';

export type ModuleReviewStatus = 'pending' | 'approved' | 'declined';

export interface IModuleReview extends Document {
  moduleId: Types.ObjectId;
  projectId: Types.ObjectId;
  type: 'induction';
  data: Record<string, any>;
  status: ModuleReviewStatus;
  reason?: string;
  requestedBy: Types.ObjectId;
  reviewedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleReviewSchema = new Schema<IModuleReview>(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: 'InductionModule', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    type: { type: String, enum: ['induction'], default: 'induction' },
    data: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending', index: true },
    reason: { type: String },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ModuleReviewSchema.index({ moduleId: 1, status: 1 });

export const ModuleReview = mongoose.model<IModuleReview>('ModuleReview', ModuleReviewSchema);
