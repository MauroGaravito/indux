import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { InductionModuleField } from '../models/InductionModuleField.js';
import { ModuleFieldCreateSchema, ModuleFieldUpdateSchema } from '../utils/validators.js';

const router = Router();

router.get('/modules/:moduleId/fields', requireAuth, async (req, res) => {
  const moduleId = req.params.moduleId;
  if (!Types.ObjectId.isValid(moduleId)) return res.status(400).json({ error: 'Invalid module id' });
  const fields = await InductionModuleField.find({ moduleId }).sort({ order: 1, createdAt: 1 });
  res.json(fields);
});

router.post('/modules/:moduleId/fields', requireAuth, requireRole('admin', 'manager'), async (req, res) => {
  const moduleId = req.params.moduleId;
  if (!Types.ObjectId.isValid(moduleId)) return res.status(400).json({ error: 'Invalid module id' });
  const parsed = ModuleFieldCreateSchema.safeParse({ ...req.body, moduleId });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const field = await InductionModuleField.create(parsed.data);
  res.status(201).json(field);
});

router.put('/module-fields/:id', requireAuth, requireRole('admin', 'manager'), async (req, res) => {
  const id = req.params.id;
  if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid field id' });
  const parsed = ModuleFieldUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const field = await InductionModuleField.findByIdAndUpdate(id, parsed.data, { new: true });
  res.json(field);
});

router.delete('/module-fields/:id', requireAuth, requireRole('admin', 'manager'), async (req, res) => {
  const id = req.params.id;
  if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid field id' });
  await InductionModuleField.findByIdAndDelete(id);
  res.json({ ok: true });
});

export default router;
