import { z } from 'zod';

const ObjectIdString = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid object id');

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
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

// Accept both legacy array-of-strings (keys) and new array-of-objects
// and normalize to array of { key, type }
const UploadsUnion = z.union([
  z.array(z.object({ key: z.string(), type: z.string() })),
  z.array(z.string())
]).transform((val) => {
  if (Array.isArray(val) && typeof val[0] === 'string') {
    return (val as string[]).map((k) => ({ key: k, type: 'file' }))
  }
  return val as Array<{ key: string; type: string }>
});

export const SubmissionCreateSchema = z.object({
  projectId: z.string().min(1),
  personal: z.record(z.any()),
  uploads: UploadsUnion.default([]),
  quiz: z.object({
    total: z.number(),
    correct: z.number(),
    answers: z.array(z.number()).optional()
  }),
  signatureDataUrl: z.string().optional()
});

export const UserCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin','manager','worker']),
  password: z.string().min(6),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  avatarUrl: z.string().optional(),
  notes: z.string().optional()
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['admin','manager','worker']).optional(),
  password: z.string().min(6).optional(),
  disabled: z.boolean().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  avatarUrl: z.string().optional(),
  notes: z.string().optional()
});

export const UserStatusPatchSchema = z.object({
  status: z.enum(['pending','approved','disabled'])
});

const ProjectFieldTypeEnum = z.enum(['text','number','date','select','boolean','file']);
const KeySchema = z.string().min(1).regex(/^\S+$/, 'Key cannot contain spaces');
const OptionsArray = z.array(z.string());

export const ProjectFieldCreateSchema = z.object({
  projectId: ObjectIdString,
  key: KeySchema,
  label: z.string().min(1),
  type: ProjectFieldTypeEnum,
  required: z.boolean().default(false),
  order: z.number().default(0),
  helpText: z.string().optional(),
  options: OptionsArray.optional(),
  step: z.literal('personal')
}).superRefine((data, ctx) => {
  if (data.type === 'select') {
    if (!data.options || data.options.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Options are required for select fields', path: ['options'] });
    }
  } else if (typeof data.options !== 'undefined') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Options are only allowed for select fields', path: ['options'] });
  }
});

export const ProjectFieldUpdateSchema = z.object({
  projectId: ObjectIdString,
  key: KeySchema.optional(),
  label: z.string().min(1).optional(),
  type: ProjectFieldTypeEnum.optional(),
  required: z.boolean().optional(),
  order: z.number().optional(),
  helpText: z.string().optional(),
  options: OptionsArray.optional(),
  step: z.literal('personal').optional()
}).superRefine((data, ctx) => {
  if (data.type === 'select') {
    if (!data.options || data.options.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Options are required when type is select', path: ['options'] });
    }
  } else if (data.type && typeof data.options !== 'undefined') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Options are only allowed for select fields', path: ['options'] });
  } else if (!data.type && typeof data.options !== 'undefined') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Specify type=select when providing options', path: ['type'] });
  }
});
