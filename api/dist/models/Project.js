import mongoose, { Schema } from 'mongoose';
const ProjectSchema = new Schema({
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
}, { timestamps: true });
ProjectSchema.index({ name: 1 }, { unique: true });
export const Project = mongoose.model('Project', ProjectSchema);
