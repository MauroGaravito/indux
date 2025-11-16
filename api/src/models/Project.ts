import mongoose, { Schema, Document } from 'mongoose';

export interface IStepConfig {
  key: string;
  enabled: boolean;
  required: boolean;
  order: number;
  version: number;
  pass_mark?: number;
}

export interface IProject extends Document {
  name: string;
  description?: string;
  steps: IStepConfig[];
  config?: Record<string, any>;
  managers?: mongoose.Types.ObjectId[];
  editableByManagers?: boolean;
}

const StepSchema = new Schema<IStepConfig>({
  key: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  required: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  version: { type: Number, default: 1 },
  pass_mark: { type: Number }
}, { _id: false });

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  description: { type: String },
  steps: { type: [StepSchema], default: [] },
  config: { type: Schema.Types.Mixed, default: {} },
  managers: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  editableByManagers: { type: Boolean, default: true }
}, { timestamps: true });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
