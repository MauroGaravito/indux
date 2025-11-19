import { Router } from 'express';
import { Types } from 'mongoose';
import { Project } from '../models/Project.js';
import { Assignment } from '../models/Assignment.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ProjectCreateSchema, ProjectUpdateSchema } from '../utils/validators.js';

const router = Router();

// List projects for caller
router.get('/', requireAuth, async (req, res) => {
  const role = req.user!.role;
  const includeArchived = role === 'admin' && (req.query.includeArchived === 'true' || req.query.includeArchived === '1');
  const statusFilter = includeArchived ? {} : { status: { $ne: 'archived' } };
  if (role === 'admin') {
    const projects = await Project.find(statusFilter).sort({ createdAt: -1 });
    return res.json(projects);
  }
  const assignments = await Assignment.find({ user: req.user!.sub }).lean();
  const ids = assignments.map((a) => a.project);
  const projects = await Project.find({ _id: { $in: ids }, ...statusFilter }).sort({ createdAt: -1 });
  return res.json(projects);
});

// List archived projects (admin only)
router.get('/archived', requireAuth, requireRole('admin'), async (_req, res) => {
  const projects = await Project.find({ status: 'archived' }).sort({ createdAt: -1 });
  res.json(projects);
});

// Create project
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = ProjectCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const proj = await Project.create({ ...parsed.data, createdBy: req.user!.sub });
  res.status(201).json(proj);
});

// Update project
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = req.params.id;
  if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid project id' });
  const parsed = ProjectUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const proj = await Project.findByIdAndUpdate(id, { ...parsed.data, updatedBy: req.user!.sub }, { new: true });
  res.json(proj);
});

// Archive project (soft delete)
router.put('/:id/archive', requireAuth, requireRole('admin'), async (req, res) => {
  const id = req.params.id;
  if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid project id' });
  const proj = await Project.findById(id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });
  proj.status = 'archived';
  proj.updatedBy = req.user!.sub;
  await proj.save();
  res.json(proj);
});

// Delete project
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = req.params.id;
  if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid project id' });
  const proj = await Project.findById(id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });
  proj.status = 'archived';
  proj.updatedBy = req.user!.sub;
  await proj.save();
  res.json(proj);
});

export default router;
