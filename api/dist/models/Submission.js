import mongoose, { Schema } from 'mongoose';
const UploadSchema = new Schema({
    key: { type: String, required: true },
    type: { type: String, default: 'file' },
}, { _id: false });
const SubmissionSchema = new Schema({
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
}, { timestamps: true });
SubmissionSchema.index({ moduleId: 1, userId: 1 }, { unique: false });
export const Submission = mongoose.model('Submission', SubmissionSchema);
