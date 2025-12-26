import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { InspectionTemplate } from '../models/InspectionTemplate.js';

const router = Router();

router.get('/', requireAuth, requireRole('admin', 'manager'), async (_req, res) => {
  const templates = await InspectionTemplate.find().sort({ name: 1 }).lean();
  res.json({ templates });
});

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, description, requireSignature, requirePOI, categories, items } = req.body || {};
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const template = await InspectionTemplate.create({
    name: name.trim(),
    description: typeof description === 'string' ? description : '',
    requireSignature: !!requireSignature,
    requirePOI: !!requirePOI,
    categories: Array.isArray(categories) ? categories : [],
    items: Array.isArray(items) ? items : [],
    createdBy: req.user?.sub as any,
  });

  res.status(201).json(template);
});

export default router;
