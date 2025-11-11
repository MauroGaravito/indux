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
  // Prevent duplicate pending reviews for the same project
  const existing = await ProjectReview.findOne({ projectId: parsed.data.projectId, status: 'pending' }).lean();
  if (existing) return res.status(400).json({ error: 'This project is already under review.' });
  const review = await ProjectReview.create({
    projectId: parsed.data.projectId,
    requestedBy: req.user!.sub as any,
    data: parsed.data.data,
    status: 'pending'
  });
  res.status(201).json(review);
});

// Manager/Admin list project reviews pending
router.get('/projects', requireAuth, requireRole('manager','admin'), async (req, res) => {
  const raw = (req.query?.status as string | undefined) || 'pending';
  const allowed = new Set(['pending','approved','declined','cancelled','all']);
  const eff = allowed.has(raw) ? raw : 'pending';
  const filter = eff === 'all' ? {} : { status: eff };
  const list = await ProjectReview.find(filter)
    .populate('projectId', 'name')
    .sort({ createdAt: -1 });
  res.json(list);
});

// Admin-only: delete a review document
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const review = await ProjectReview.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    await review.deleteOne();
    return res.json({ ok: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    return res.status(500).json({ error: 'Failed to delete review' });
  }
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
