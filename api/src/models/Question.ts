import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  projectId: mongoose.Types.ObjectId;
  text: string;
  options: string[];
  answerIndex: number;
}

const QuestionSchema = new Schema<IQuestion>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  text: { type: String, required: true },
  options: { type: [String], required: true },
  answerIndex: { type: Number, required: true }
}, { timestamps: true });

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);

