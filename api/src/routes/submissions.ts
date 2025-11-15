import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as controller from '../controllers/submissionsController.js';
import { Submission } from '../models/Submission.js';

const router = Router();

// Worker creates a submission (requires worker login)
router.post('/', requireAuth, requireRole('worker'), controller.create);

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const user = req.user;
    if (user?.role === 'worker') {
      const items = await Submission.find({ userId: user.sub }).sort({ createdAt: -1 });
      return res.json(items);
    }
    return controller.list(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/approve', requireAuth, requireRole('manager', 'admin'), controller.approve);

router.post('/:id/decline', requireAuth, requireRole('manager', 'admin'), controller.decline);

// Admin-only: delete a submission by ID
router.delete('/:id', requireAuth, requireRole('admin'), controller.remove);

export default router;
