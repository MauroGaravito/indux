import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  target?: string;
  meta?: Record<string, any>;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  target: { type: String },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

