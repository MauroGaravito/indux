import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as controller from '../controllers/projectFieldsController.js';

const router = Router();
router.get('/projects/:projectId/fields', requireAuth, requireRole('admin', 'manager'), controller.list);
router.post('/projects/:projectId/fields', requireAuth, requireRole('admin', 'manager'), controller.create);
router.put('/fields/:id', requireAuth, requireRole('admin', 'manager'), controller.update);
router.delete('/fields/:id', requireAuth, requireRole('admin', 'manager'), controller.remove);

export default router;
