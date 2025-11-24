import mongoose, { Schema } from 'mongoose';
const ModuleReviewSchema = new Schema({
    moduleId: { type: Schema.Types.ObjectId, ref: 'InductionModule', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    type: { type: String, enum: ['induction'], default: 'induction' },
    data: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending', index: true },
    reason: { type: String },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
ModuleReviewSchema.index({ moduleId: 1, status: 1 });
export const ModuleReview = mongoose.model('ModuleReview', ModuleReviewSchema);
