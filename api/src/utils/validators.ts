import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const ProjectCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().optional(),
  managers: z.array(z.string()).default([]),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
});

export const ProjectUpdateSchema = ProjectCreateSchema.partial();

const SlideItemSchema = z.object({
  key: z.string().min(1),
  title: z.string().optional(),
  fileKey: z.string().min(1),
  thumbKey: z.string().optional(),
  order: z.number().default(0),
});

const QuizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  answerIndex: z.number().nonnegative(),
});

const QuizConfigSchema = z.object({
  questions: z.array(QuizQuestionSchema).default([]),
});

const ModuleSettingsSchema = z.object({
  passMark: z.number().min(0).max(100).default(80),
  randomizeQuestions: z.boolean().default(false),
  allowRetry: z.boolean().default(true),
});

export const InductionModuleConfigSchema = z.object({
  steps: z.array(z.string()).default([]),
  slides: z.array(SlideItemSchema).default([]),
  quiz: QuizConfigSchema.default({ questions: [] }),
  settings: ModuleSettingsSchema.default({
    passMark: 80,
    randomizeQuestions: false,
    allowRetry: true,
  }),
});

export const InductionModuleCreateSchema = z.object({
  projectId: z.string().min(1),
  config: InductionModuleConfigSchema.optional(),
  reviewStatus: z.enum(['draft', 'pending', 'approved', 'declined']).optional(),
});

export const InductionModuleUpdateSchema = z.object({
  config: InductionModuleConfigSchema.optional(),
  reviewStatus: z.enum(['draft', 'pending', 'approved', 'declined']).optional(),
}).strict();

export const ModuleFieldCreateSchema = z.object({
  moduleId: z.string().min(1),
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'number', 'date', 'select', 'file', 'textarea', 'boolean']).default('text'),
  required: z.boolean().default(false),
  order: z.number().default(0),
  step: z.string().default('personal'),
  options: z.array(z.string()).optional(),
});

export const ModuleFieldUpdateSchema = ModuleFieldCreateSchema.partial().omit({ moduleId: true });

export const ModuleReviewCreateSchema = z.object({
  moduleId: z.string().min(1),
});

export const SubmissionCreateSchema = z.object({
  moduleId: z.string().min(1),
  payload: z.record(z.any()),
  uploads: z
    .array(
      z.object({
        key: z.string().min(1),
        type: z.string().min(1),
      })
    )
    .default([]),
  quiz: z.object({
    answers: z.array(z.any()).default([]),
    score: z.number(),
    passed: z.boolean(),
  }),
  signatureDataUrl: z.string().optional(),
});

export const UserCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'manager', 'worker']),
  password: z.string().min(6),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['admin', 'manager', 'worker']).optional(),
  password: z.string().min(6).optional(),
  disabled: z.boolean().optional(),
});
