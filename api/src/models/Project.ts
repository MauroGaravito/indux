import mongoose, { Schema, Document, Types } from 'mongoose';

export type ProjectStatus = 'draft' | 'active' | 'archived';

export interface IProject extends Document {
  name: string;
  description?: string;
  address?: string;
  managers: Types.ObjectId[];
  status: ProjectStatus;
  location: {
    lat: number;
    lng: number;
  };
  pointsOfInterest: {
    label: string;
    lat: number;
    lng: number;
  }[];
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    address: { type: String },
    managers: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    pointsOfInterest: {
      type: [
        {
          label: { type: String, required: true },
          lat: { type: Number, required: true },
          lng: { type: Number, required: true },
        },
      ],
      default: [],
    },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ProjectSchema.index({ name: 1 }, { unique: true });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
