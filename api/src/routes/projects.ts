import { Router } from 'express';
import { Project } from '../models/Project.js';
import { Assignment } from '../models/Assignment.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ProjectSchema } from '../utils/validators.js';

const router = Router();

// List projects
router.get('/', requireAuth, async (req, res) => {
  const role = req.user!.role;
  if (role === 'admin') {
    const projects = await Project.find().sort({ createdAt: -1 });
    return res.json(projects);
  }
  // manager/worker: only assigned projects
  const assignments = await Assignment.find({ user: req.user!.sub, $or: [{ endedAt: { $exists: false } }, { endedAt: null }] }).lean();
  const ids = assignments.map((a) => a.project);
  const projects = await Project.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
  return res.json(projects);
});

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = ProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const proj = await Project.create(parsed.data);
  res.status(201).json(proj);
});

router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = ProjectSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const proj = await Project.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  res.json(proj);
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
