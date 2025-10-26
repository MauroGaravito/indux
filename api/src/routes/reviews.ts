import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { z } from 'zod';
import { ProjectReview } from '../models/ProjectReview.js';

const router = Router();

// Admin creates a project review request (aka sendForReview)
router.post('/projects', requireAuth, requireRole('admin'), async (req, res) => {
  const schema = z.object({ projectId: z.string().min(1), data: z.record(z.any()) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const review = await ProjectReview.create({
    projectId: parsed.data.projectId,
    requestedBy: req.user!.sub as any,
    data: parsed.data.data,
    status: 'pending'
  });
  res.status(201).json(review);
});

// Manager/Admin list project reviews pending
router.get('/projects', requireAuth, requireRole('manager','admin'), async (_req, res) => {
  const list = await ProjectReview.find({ status: 'pending' }).sort({ createdAt: -1 });
  res.json(list);
});

router.post('/projects/:id/approve', requireAuth, requireRole('manager','admin'), async (req, res) => {
  const rev = await ProjectReview.findById(req.params.id);
  if (!rev) return res.status(404).json({ error: 'Not found' });
  rev.status = 'approved';
  rev.reviewedBy = req.user!.sub as any;
  await rev.save();
  res.json({ ok: true });
});

router.post('/projects/:id/decline', requireAuth, requireRole('manager','admin'), async (req, res) => {
  const rev = await ProjectReview.findById(req.params.id);
  if (!rev) return res.status(404).json({ error: 'Not found' });
  rev.status = 'declined';
  rev.reason = (req.body && req.body.reason) || 'Not specified';
  rev.reviewedBy = req.user!.sub as any;
  await rev.save();
  res.json({ ok: true });
});

export default router;

