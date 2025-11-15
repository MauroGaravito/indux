import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as controller from '../controllers/projectFieldsController.js';

const router = Router();
const adminOnly = [requireAuth, requireRole('admin')] as const;

router.get('/projects/:projectId/fields', ...adminOnly, controller.list);
router.post('/projects/:projectId/fields', ...adminOnly, controller.create);
router.put('/fields/:id', ...adminOnly, controller.update);
router.delete('/fields/:id', ...adminOnly, controller.remove);

export default router;
