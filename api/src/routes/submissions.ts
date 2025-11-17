import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as controller from '../controllers/submissionsController.js';

const router = Router();

// Worker creates a submission (requires worker login)
router.post('/', requireAuth, requireRole('worker'), controller.create);

router.get('/', requireAuth, requireRole('admin', 'manager', 'worker'), controller.list);
router.get('/:id', requireAuth, requireRole('admin', 'manager', 'worker'), controller.getOne);

router.post('/:id/approve', requireAuth, requireRole('manager', 'admin'), controller.approve);

router.post('/:id/decline', requireAuth, requireRole('manager', 'admin'), controller.decline);

// Admin-only: delete a submission by ID
router.delete('/:id', requireAuth, requireRole('admin'), controller.remove);

export default router;
