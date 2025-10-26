import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  ownerUserId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  type: string; // e.g., id_front, id_back, license
  filename: string;
  contentType: string;
  s3Key: string;
  expiresAt?: Date;
}

const DocumentSchema = new Schema<IDocument>({
  ownerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  type: { type: String, required: true },
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  s3Key: { type: String, required: true },
  expiresAt: { type: Date }
}, { timestamps: true });

export const DocModel = mongoose.model<IDocument>('Document', DocumentSchema);

