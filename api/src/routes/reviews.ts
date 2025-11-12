import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as controller from '../controllers/reviewsController.js';
import { Assignment } from '../models/Assignment.js';

const router = Router();

// Admin creates a project review request (aka sendForReview)
router.post('/projects', requireAuth, requireRole('admin'), controller.requestProject);

// Manager/Admin list project reviews pending
router.get('/projects', requireAuth, requireRole('manager','admin'), controller.listProjects);

// Admin-only: delete a review document
router.delete('/:id', requireAuth, requireRole('admin'), controller.remove);

router.post('/projects/:id/approve', requireAuth, requireRole('manager','admin'), controller.approveProject);

router.post('/projects/:id/decline', requireAuth, requireRole('manager','admin'), controller.declineProject);

export default router;
