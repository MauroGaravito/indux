import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { InductionTemplate } from '../models/InductionTemplate.js';
import {
  InductionTemplateCreateSchema,
  InductionTemplateUpdateSchema,
} from '../utils/validators.js';

const router = Router();

const DEFAULT_TEMPLATE_CONFIG = {
  steps: [],
  slides: [],
  quiz: { questions: [] },
  settings: { passMark: 80, randomizeQuestions: false, allowRetry: true },
};

function cloneConfig(source?: any) {
  return JSON.parse(JSON.stringify(source ?? DEFAULT_TEMPLATE_CONFIG));
}

router.get(
  '/summaries',
  requireAuth,
  requireRole('admin', 'manager'),
  async (_req, res) => {
    const templates = await InductionTemplate.find({}, 'name description')
      .sort({ name: 1 })
      .lean();
    res.json({ templates });
  },
);

router.get('/', requireAuth, requireRole('admin'), async (_req, res) => {
  const templates = await InductionTemplate.find().sort({ name: 1 }).lean();
  res.json({ templates });
});

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = InductionTemplateCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const template = await InductionTemplate.create({
    name: parsed.data.name.trim(),
    description: parsed.data.description,
    type: 'induction',
    config: cloneConfig(parsed.data.config),
    fields: parsed.data.fields ?? [],
    createdBy: req.user?.sub as any,
    updatedBy: req.user?.sub as any,
  });

  res.status(201).json(template);
});

router.get('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid template id' });
  }
  const template = await InductionTemplate.findById(id).lean();
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(template);
});

router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid template id' });
  }
  const parsed = InductionTemplateUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const update: any = {
    ...parsed.data,
    updatedBy: req.user?.sub as any,
  };
  if (typeof parsed.data.name === 'string') {
    update.name = parsed.data.name.trim();
  }

  const template = await InductionTemplate.findByIdAndUpdate(
    id,
    {
      ...update,
      ...(parsed.data.config ? { config: cloneConfig(parsed.data.config) } : {}),
      ...(parsed.data.fields ? { fields: parsed.data.fields } : {}),
    },
    { new: true },
  );
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(template);
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid template id' });
  }
  await InductionTemplate.findByIdAndDelete(id);
  res.json({ ok: true });
});

export default router;
