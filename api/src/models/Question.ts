import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IQuestion extends Document {
  moduleId: Types.ObjectId;
  text: string;
  options: string[];
  answerIndex: number;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: 'InductionModule', required: true, index: true },
    text: { type: String, required: true },
    options: { type: [String], required: true },
    answerIndex: { type: Number, required: true },
  },
  { timestamps: true }
);

QuestionSchema.index({ moduleId: 1 });

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);
