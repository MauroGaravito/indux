import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Project } from '../models/Project.js';
import { InductionModule } from '../models/InductionModule.js';
import { InductionModuleField } from '../models/InductionModuleField.js';
import {
  InductionModuleCreateSchema,
  InductionModuleUpdateSchema,
} from '../utils/validators.js';

const router = Router();

// Create or return an induction module for a project
router.post('/projects/:projectId/modules/induction', requireAuth, requireRole('admin', 'manager'), async (req, res) => {
  const projectId = req.params.projectId;
  if (!Types.ObjectId.isValid(projectId)) return res.status(400).json({ error: 'Invalid project id' });
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const parsed = InductionModuleCreateSchema.safeParse({ ...req.body, projectId });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  let module = await InductionModule.findOne({ projectId, type: 'induction' });
  if (module) return res.json(module);

  module = await InductionModule.create({
    projectId,
    type: 'induction',
    reviewStatus: parsed.data.reviewStatus ?? 'draft',
    config: parsed.data.config ?? {
      steps: [],
      slides: [],
      quiz: { questions: [] },
      settings: { passMark: 80, randomizeQuestions: false, allowRetry: true },
    },
    createdBy: req.user?.sub,
    updatedBy: req.user?.sub,
  });

  res.status(201).json(module);
});

// Get induction module (with fields)
router.get('/projects/:projectId/modules/induction', requireAuth, async (req, res) => {
  const projectId = req.params.projectId;
  if (!Types.ObjectId.isValid(projectId)) return res.status(400).json({ error: 'Invalid project id' });
  const module = await InductionModule.findOne({ projectId, type: 'induction' }).lean();
  if (!module) return res.status(404).json({ error: 'Module not found' });
  const fields = await InductionModuleField.find({ moduleId: module._id }).sort({ order: 1, createdAt: 1 }).lean();
  res.json({ module, fields });
});

// Update module config/status (optionally replace fields)
router.put('/modules/:moduleId', requireAuth, requireRole('admin', 'manager'), async (req, res) => {
  const moduleId = req.params.moduleId;
  if (!Types.ObjectId.isValid(moduleId)) return res.status(400).json({ error: 'Invalid module id' });
  const parsed = InductionModuleUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const mod = await InductionModule.findById(moduleId);
  if (!mod) return res.status(404).json({ error: 'Not found' });

  if (parsed.data.config) mod.config = parsed.data.config;
  if (parsed.data.reviewStatus) mod.reviewStatus = parsed.data.reviewStatus;
  mod.updatedBy = req.user?.sub as any;
  await mod.save();

  // Optional bulk field replacement
  if (Array.isArray((req.body as any)?.fields)) {
    await InductionModuleField.deleteMany({ moduleId });
    const payloadFields = (req.body as any).fields as any[];
    const docs = payloadFields.map((f) => ({
      moduleId: mod._id,
      key: f.key,
      label: f.label,
      type: f.type || 'text',
      required: !!f.required,
      order: f.order ?? 0,
      step: f.step || 'personal',
      options: f.options || undefined,
    }));
    if (docs.length) {
      await InductionModuleField.insertMany(docs);
    }
  }

  const fields = await InductionModuleField.find({ moduleId }).sort({ order: 1, createdAt: 1 }).lean();
  res.json({ module: mod, fields });
});

export default router;
