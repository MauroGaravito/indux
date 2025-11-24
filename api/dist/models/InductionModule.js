import mongoose, { Schema } from 'mongoose';
const SlideSchema = new Schema({
    key: { type: String, required: true, trim: true },
    title: { type: String, default: '' },
    fileKey: { type: String, required: true },
    thumbKey: { type: String },
    order: { type: Number, default: 0 },
}, { _id: false });
const QuizQuestionSchema = new Schema({
    question: { type: String, required: true },
    options: { type: [String], required: true },
    answerIndex: { type: Number, required: true },
}, { _id: false });
const ModuleSchema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    type: { type: String, enum: ['induction'], default: 'induction' },
    reviewStatus: { type: String, enum: ['draft', 'pending', 'approved', 'declined'], default: 'draft', index: true },
    config: {
        steps: { type: [String], default: [] },
        slides: { type: [SlideSchema], default: [] },
        quiz: {
            questions: { type: [QuizQuestionSchema], default: [] },
        },
        settings: {
            passMark: { type: Number, default: 80 },
            randomizeQuestions: { type: Boolean, default: false },
            allowRetry: { type: Boolean, default: true },
        },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
ModuleSchema.index({ projectId: 1, type: 1 }, { unique: true });
export const InductionModule = mongoose.model('InductionModule', ModuleSchema);
