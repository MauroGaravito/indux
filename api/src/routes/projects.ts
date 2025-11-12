import { Router } from 'express';
import { requireAuth, requireRole, requireProjectManagerOrAdmin } from '../middleware/auth.js';
import * as controller from '../controllers/projectsController.js';

const router = Router();

// List projects
router.get('/', requireAuth, controller.list);

router.post('/', requireAuth, requireRole('admin'), controller.create);

// Get single project (with managers populated)
router.get('/:id', requireAuth, controller.getOne);

router.put('/:id', requireAuth, requireProjectManagerOrAdmin, controller.update);

router.delete('/:id', requireAuth, requireRole('admin'), controller.remove);

export default router;
