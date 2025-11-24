import mongoose, { Schema } from 'mongoose';
const AssignmentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    role: { type: String, enum: ['manager', 'worker'], required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
AssignmentSchema.index({ user: 1, project: 1 }, { unique: true });
export const Assignment = mongoose.model('Assignment', AssignmentSchema);
