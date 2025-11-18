import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ModuleReview } from '../models/ModuleReview.js';
import { InductionModule } from '../models/InductionModule.js';
import { InductionModuleField } from '../models/InductionModuleField.js';

const router = Router();

router.post('/modules/:moduleId/reviews', requireAuth, requireRole('admin'), async (req, res) => {
  const moduleId = req.params.moduleId;
  if (!Types.ObjectId.isValid(moduleId)) return res.status(400).json({ error: 'Invalid module id' });
  const mod = await InductionModule.findById(moduleId);
  if (!mod) return res.status(404).json({ error: 'Module not found' });

  const fields = await InductionModuleField.find({ moduleId }).sort({ order: 1, createdAt: 1 }).lean();
  const snapshot = { module: mod.toObject(), fields };

  const review = await ModuleReview.create({
    moduleId: mod._id,
    projectId: mod.projectId,
    type: 'induction',
    data: snapshot,
    status: 'pending',
    requestedBy: req.user!.sub as any,
  });

  // mark module as pending review
  mod.reviewStatus = 'pending';
  await mod.save();

  res.status(201).json(review);
});

router.get('/modules/:moduleId/reviews', requireAuth, requireRole('manager', 'admin'), async (req, res) => {
  const moduleId = req.params.moduleId;
  if (!Types.ObjectId.isValid(moduleId)) return res.status(400).json({ error: 'Invalid module id' });
  const reviews = await ModuleReview.find({ moduleId }).sort({ createdAt: -1 });
  res.json(reviews);
});

router.post('/modules/:moduleId/reviews/:reviewId/approve', requireAuth, requireRole('manager', 'admin'), async (req, res) => {
  const { moduleId, reviewId } = req.params;
  if (!Types.ObjectId.isValid(moduleId) || !Types.ObjectId.isValid(reviewId)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const review = await ModuleReview.findById(reviewId);
  if (!review) return res.status(404).json({ error: 'Not found' });
  if (String(review.moduleId) !== moduleId) return res.status(400).json({ error: 'Review does not belong to module' });

  review.status = 'approved';
  review.reviewedBy = req.user!.sub as any;
  await review.save();

  await InductionModule.findByIdAndUpdate(moduleId, { reviewStatus: 'approved' });

  res.json({ ok: true });
});

router.post('/modules/:moduleId/reviews/:reviewId/decline', requireAuth, requireRole('manager', 'admin'), async (req, res) => {
  const { moduleId, reviewId } = req.params;
  if (!Types.ObjectId.isValid(moduleId) || !Types.ObjectId.isValid(reviewId)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const review = await ModuleReview.findById(reviewId);
  if (!review) return res.status(404).json({ error: 'Not found' });
  if (String(review.moduleId) !== moduleId) return res.status(400).json({ error: 'Review does not belong to module' });

  review.status = 'declined';
  review.reason = (req.body && req.body.reason) || 'Not specified';
  review.reviewedBy = req.user!.sub as any;
  await review.save();

  await InductionModule.findByIdAndUpdate(moduleId, { reviewStatus: 'declined' });

  res.json({ ok: true });
});

export default router;
