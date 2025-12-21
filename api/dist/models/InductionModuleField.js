import mongoose, { Schema } from 'mongoose';
const FieldSchema = new Schema({
    moduleId: { type: Schema.Types.ObjectId, ref: 'InductionModule', required: true, index: true },
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: { type: String, enum: ['text', 'number', 'date', 'select', 'file', 'photo', 'textarea', 'boolean'], default: 'text' },
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    step: { type: String, default: 'personal' },
    options: { type: [String] },
    visibleIf: {
        fieldKey: { type: String, trim: true },
        equals: { type: Schema.Types.Mixed },
    },
}, { timestamps: true });
FieldSchema.index({ moduleId: 1, key: 1 }, { unique: true });
export const InductionModuleField = mongoose.model('InductionModuleField', FieldSchema);
