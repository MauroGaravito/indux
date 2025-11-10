import mongoose, { Schema, Document, Types } from 'mongoose';

export type AssignmentRole = 'manager' | 'worker';

export interface IAssignment extends Document {
  user: Types.ObjectId;
  project: Types.ObjectId;
  role: AssignmentRole;
  assignedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    role: { type: String, enum: ['manager', 'worker'], required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

AssignmentSchema.index({ user: 1, project: 1 }, { unique: true });

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);

