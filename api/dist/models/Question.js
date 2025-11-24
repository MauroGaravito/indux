import mongoose, { Schema } from 'mongoose';
const QuestionSchema = new Schema({
    moduleId: { type: Schema.Types.ObjectId, ref: 'InductionModule', required: true, index: true },
    text: { type: String, required: true },
    options: { type: [String], required: true },
    answerIndex: { type: Number, required: true },
}, { timestamps: true });
QuestionSchema.index({ moduleId: 1 });
export const Question = mongoose.model('Question', QuestionSchema);
