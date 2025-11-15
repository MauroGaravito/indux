import mongoose, { Schema, Document } from 'mongoose';

export type ProjectFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean' | 'file';

export interface IProjectField extends Document {
  projectId: mongoose.Types.ObjectId;
  key: string;
  label: string;
  type: ProjectFieldType;
  required: boolean;
  order: number;
  helpText?: string;
  options?: string[];
  step: string;
}

const ProjectFieldSchema = new Schema<IProjectField>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['text','number','date','select','boolean','file'], required: true },
  required: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  helpText: { type: String },
  options: { type: [String], default: undefined },
  step: { type: String, default: 'personal' }
}, { timestamps: true });

ProjectFieldSchema.index({ projectId: 1, key: 1 }, { unique: true });

export const ProjectField = mongoose.model<IProjectField>('ProjectField', ProjectFieldSchema);
