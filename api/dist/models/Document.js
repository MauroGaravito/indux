import mongoose, { Schema } from 'mongoose';
const DocumentSchema = new Schema({
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    type: { type: String, required: true },
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    s3Key: { type: String, required: true },
    expiresAt: { type: Date }
}, { timestamps: true });
export const DocModel = mongoose.model('Document', DocumentSchema);
