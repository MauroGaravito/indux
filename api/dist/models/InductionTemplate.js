import mongoose, { Schema } from 'mongoose';
const TemplateFieldSchema = new Schema({
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: {
        type: String,
        enum: ['text', 'number', 'date', 'select', 'file', 'photo', 'textarea', 'boolean'],
        default: 'text',
    },
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    step: { type: String, default: 'personal' },
    options: { type: [String] },
    visibleIf: {
        fieldKey: { type: String, trim: true },
        equals: { type: Schema.Types.Mixed },
    },
}, { _id: false });
const InductionTemplateSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String },
    type: { type: String, enum: ['induction'], default: 'induction' },
    config: {
        steps: { type: [String], default: [] },
        slides: {
            type: [
                {
                    key: { type: String, required: true },
                    title: { type: String },
                    fileKey: { type: String, required: true },
                    thumbKey: { type: String },
                    order: { type: Number, default: 0 },
                },
            ],
            default: [],
        },
        quiz: {
            questions: {
                type: [
                    {
                        question: { type: String, required: true },
                        options: { type: [String], required: true },
                        answerIndex: { type: Number, required: true },
                    },
                ],
                default: [],
            },
        },
        settings: {
            passMark: { type: Number, default: 80 },
            randomizeQuestions: { type: Boolean, default: false },
            allowRetry: { type: Boolean, default: true },
        },
    },
    fields: { type: [TemplateFieldSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
export const InductionTemplate = mongoose.model('InductionTemplate', InductionTemplateSchema);
