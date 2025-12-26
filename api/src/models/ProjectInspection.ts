import mongoose, { Schema, Document, Types } from 'mongoose';

export type ProjectInspectionType = 'daily' | 'weekly' | 'adhoc';

export interface IProjectInspection extends Document {
  projectId: Types.ObjectId;
  templateId: Types.ObjectId;
  type: ProjectInspectionType;
  active: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectInspectionSchema = new Schema<IProjectInspection>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'InspectionTemplate', required: true },
    type: { type: String, enum: ['daily', 'weekly', 'adhoc'], default: 'daily' },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const ProjectInspection = mongoose.model<IProjectInspection>('ProjectInspection', ProjectInspectionSchema);
