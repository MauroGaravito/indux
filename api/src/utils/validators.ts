import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const ProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  steps: z.array(z.object({
    key: z.string(),
    enabled: z.boolean(),
    required: z.boolean(),
    order: z.number(),
    version: z.number(),
    pass_mark: z.number().optional()
  })).default([])
}).extend({
  config: z.record(z.any()).optional()
});

export const SubmissionCreateSchema = z.object({
  projectId: z.string().min(1),
  personal: z.record(z.any()),
  uploads: z.array(z.object({ docId: z.string(), type: z.string() })).default([]),
  quiz: z.object({ total: z.number(), correct: z.number() }),
  signatureDataUrl: z.string().optional()
});

export const UserCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin','manager','worker']),
  password: z.string().min(6)
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['admin','manager','worker']).optional(),
  password: z.string().min(6).optional(),
  disabled: z.boolean().optional()
});
