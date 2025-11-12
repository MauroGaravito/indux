import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { z } from 'zod';
import { ProjectReview } from '../models/ProjectReview.js';
import { Project } from '../models/Project.js';
import { Assignment } from '../models/Assignment.js';

const router = Router();

// Admin creates a project review request (aka sendForReview)
router.post('/projects', requireAuth, requireRole('admin'), async (req, res) => {
  // Only trust the projectId; always fetch latest data from DB
  const schema = z.object({ projectId: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { projectId } = parsed.data;

  // Load current project config from DB to ensure managers see up-to-date values
  const project = await Project.findById(projectId).lean();
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const latestData = project?.config || {};

  // If there is already a pending review, update it with latest data
  const existing = await ProjectReview.findOne({ projectId, status: 'pending' });
  if (existing) {
    existing.data = latestData;
    (existing as any).message = 'Updated with latest project data';
    existing.markModified('data');
    await existing.save();
    return res.status(200).json({ ok: true, message: 'Existing review updated with latest project data.' });
  }

  // Prevent duplicates when there is an approved review already
  const approved = await ProjectReview.findOne({ projectId, status: 'approved' }).lean();
  if (approved) {
    return res.status(409).json({ error: 'Project already approved. Delete or cancel the previous review to request a new one.' });
  }

  // Otherwise, create a new review with current project data
  const review = await ProjectReview.create({
    projectId,
    requestedBy: req.user!.sub as any,
    data: latestData,
    status: 'pending'
  });
  return res.status(201).json(review);
});

// Manager/Admin list project reviews pending
router.get('/projects', requireAuth, requireRole('manager','admin'), async (req, res) => {
  const raw = (req.query?.status as string | undefined) || 'pending';
  const allowed = new Set(['pending','approved','declined','cancelled','all']);
  const eff = allowed.has(raw) ? raw : 'pending';
  const filter: any = eff === 'all' ? {} : { status: eff };

  // Restrict managers to reviews of projects they manage
  if (req.user!.role === 'manager') {
    const managed = await Assignment.find({ user: req.user!.sub, role: 'manager' }).lean();
    const ids = managed.map(a => a.project);
    filter.projectId = { $in: ids };
  }

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
